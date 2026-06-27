// A rehype plugin that wraps the first mention of each foundational term in an
// <abbr> carrying its definition as a hover tooltip. Case-insensitive (so "Mesh"
// at a sentence start matches), with non-alphanumeric boundaries. Skips code,
// links, math, and existing <abbr>. Sibling of rehypeAutolink; the two term sets
// are disjoint, so they never fight over the same text.
const SKIP_TAGS = new Set(["a", "code", "pre", "script", "style", "abbr"]);

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// map: surface form -> resolved (single-language) definition string.
export function rehypeGlossary(map: Record<string, string>) {
  const lower: Record<string, string> = {};
  for (const k in map) lower[k.toLowerCase()] = map[k];
  const terms = Object.keys(map).sort((a, b) => b.length - a.length).map(esc);
  const re = new RegExp(`(?<![A-Za-z0-9])(${terms.join("|")})(?![A-Za-z0-9])`, "gi");

  return (tree: any) => {
    const used = new Set<string>();

    const annotate = (value: string): any[] => {
      const nodes: any[] = [];
      let last = 0;
      let hit = false;
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(value)) !== null) {
        const term = m[1];
        const def = lower[term.toLowerCase()];
        if (!def || used.has(def)) continue;
        used.add(def);
        hit = true;
        if (m.index > last) nodes.push({ type: "text", value: value.slice(last, m.index) });
        nodes.push({
          type: "element",
          tagName: "abbr",
          properties: { title: def, className: ["glossary-term"] },
          children: [{ type: "text", value: term }],
        });
        last = m.index + term.length;
      }
      if (!hit) return [{ type: "text", value }];
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
          out.push(...annotate(child.value));
        } else {
          out.push(child);
        }
      }
      node.children = out;
    };

    walk(tree, false);
  };
}
