// A small rehype plugin: links the first mention of each known term per render,
// skipping <a>, <code>, <pre>, and KaTeX/math nodes. Case-sensitive, with
// non-alphanumeric boundaries so "CLIP" != "clip" and "SDF" != "TSDF".
const SKIP_TAGS = new Set(["a", "code", "pre", "script", "style"]);

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function rehypeAutolink(map: Record<string, string>) {
  const terms = Object.keys(map).sort((a, b) => b.length - a.length).map(esc);
  const re = new RegExp(`(?<![A-Za-z0-9-])(${terms.join("|")})(?![A-Za-z0-9-])`, "g");

  return (tree: any) => {
    const used = new Set<string>();

    const linkify = (value: string): any[] => {
      const nodes: any[] = [];
      let last = 0;
      let linked = false;
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        const term = m[1];
        const url = map[term];
        if (!url || used.has(url)) continue;
        used.add(url);
        linked = true;
        if (m.index > last) nodes.push({ type: "text", value: value.slice(last, m.index) });
        nodes.push({
          type: "element",
          tagName: "a",
          properties: { href: url, target: "_blank", rel: "noopener noreferrer", className: ["autolink"] },
          children: [{ type: "text", value: term }],
        });
        last = m.index + term.length;
      }
      if (!linked) return [{ type: "text", value }];
      if (last < value.length) nodes.push({ type: "text", value: value.slice(last) });
      return nodes;
    };

    const walk = (node: any, skip: boolean) => {
      if (!node || !node.children) return;
      const out: any[] = [];
      for (const child of node.children) {
        if (child.type === "element") {
          const cls = ([] as string[]).concat(child.properties?.className || []).join(" ");
          const childSkip = skip || SKIP_TAGS.has(child.tagName) || /katex|math/.test(cls);
          walk(child, childSkip);
          out.push(child);
        } else if (child.type === "text" && !skip) {
          out.push(...linkify(child.value));
        } else {
          out.push(child);
        }
      }
      node.children = out;
    };

    walk(tree, false);
  };
}
