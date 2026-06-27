import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { rehypeAutolink } from "../lib/rehypeAutolink";
import { autolinkTerms } from "../lib/autolinkTerms";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, [rehypeAutolink, autolinkTerms]]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
