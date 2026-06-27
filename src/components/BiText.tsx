import type { Bilingual, LangMode } from "../lib/types";
import { Markdown } from "./Markdown";

// Renders bilingual content according to the active language mode.
// In "both" mode, Chinese is shown first, then English, with a soft divider.
export function BiText({
  value,
  mode,
}: {
  value: Bilingual;
  mode: LangMode;
}) {
  if (mode === "en") return <Markdown>{value.en}</Markdown>;
  if (mode === "zh") return <Markdown>{value.zh}</Markdown>;
  return (
    <div className="space-y-3">
      <Markdown>{value.zh}</Markdown>
      <div className="border-t border-dashed border-stone-200 dark:border-white/10" />
      <div className="opacity-90">
        <Markdown>{value.en}</Markdown>
      </div>
    </div>
  );
}

// Compact inline bilingual string (no markdown blocks), for labels/terms.
export function BiInline({
  value,
  mode,
  className = "",
}: {
  value: Bilingual;
  mode: LangMode;
  className?: string;
}) {
  if (mode === "en") return <span className={className}>{value.en}</span>;
  if (mode === "zh") return <span className={className}>{value.zh}</span>;
  return (
    <span className={className}>
      {value.zh}
      <span className="mx-1.5 text-stone-300 dark:text-white/20">·</span>
      <span className="opacity-80">{value.en}</span>
    </span>
  );
}
