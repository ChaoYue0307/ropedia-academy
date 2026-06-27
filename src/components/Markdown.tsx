import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { rehypeAutolink } from "../lib/rehypeAutolink";
import { autolinkTerms } from "../lib/autolinkTerms";
import { rehypeGlossary } from "../lib/rehypeGlossary";
import { glossaryDefs } from "../lib/glossaryTerms";
import { GlossaryTerm } from "./GlossaryTerm";
import { useStore } from "../lib/store";

export function Markdown({ children }: { children: string }) {
  const mode = useStore((s) => s.lang);

  // Resolve each foundational definition to the active language for the tooltip.
  const tips = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k in glossaryDefs) {
      const d = glossaryDefs[k];
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
        components={{
          // Render foundational terms as an interactive, cross-device tooltip.
          abbr({ node, className, title, children, ...props }) {
            void node;
            if (typeof className === "string" && className.includes("glossary-term") && typeof title === "string") {
              return <GlossaryTerm def={title}>{children}</GlossaryTerm>;
            }
            return <abbr className={className} title={title} {...props}>{children}</abbr>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
