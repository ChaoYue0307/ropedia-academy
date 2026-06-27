import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { rehypeAutolink } from "../lib/rehypeAutolink";
import { autolinkTerms } from "../lib/autolinkTerms";
import { rehypeGlossary } from "../lib/rehypeGlossary";
import { foundationDefs } from "../lib/foundations";
import { useStore } from "../lib/store";

export function Markdown({ children }: { children: string }) {
  const mode = useStore((s) => s.lang);

  // Resolve each foundational definition to the active language for the tooltip.
  const tips = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k in foundationDefs) {
      const d = foundationDefs[k];
      m[k] = mode === "zh" ? d.zh : mode === "en" ? d.en : `${d.en} — ${d.zh}`;
    }
    return m;
  }, [mode]);

  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeHighlight,
          [rehypeAutolink, autolinkTerms],
          [rehypeGlossary, tips],
        ]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
