import { useState } from "react";
import type { Bilingual, LangMode } from "../lib/types";
import { pick, t } from "../lib/i18n";
import { Markdown } from "./Markdown";

// Read-only, syntax-highlighted Python/PyTorch snippet with a copy button and a
// bilingual one-line takeaway. Reuses the Markdown renderer (highlight.js) so the
// code matches the lesson prose exactly. The auto-linker already skips code.
export function CodeExample({
  code,
  note,
  mode,
  colabUrl,
  output,
  outputId,
}: {
  code: string;
  note: Bilingual;
  mode: LangMode;
  colabUrl?: string;
  output?: { stdout: string; image: boolean };
  outputId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasOutput = !!output && (!!output.stdout || output.image);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 px-4 py-2.5 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-stone-100">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-[#3776ab] to-[#1f4e79] text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="m8 6-5 6 5 6M16 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink/45 dark:text-stone-500">Python</span>
        </div>
        <div className="flex items-center gap-1">
          {colabUrl && (
            <a
              href={colabUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={t("runItYourself", mode)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink/55 transition hover:bg-[#f9ab00]/10 hover:text-[#e8710a] dark:text-stone-400 dark:hover:text-[#f9ab00]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-[#f9ab00]" aria-hidden="true">
                <circle cx="6" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="18" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
              </svg>
              {t("openInColab", mode)}
            </a>
          )}
          <button
            onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink/50 transition hover:bg-stone-100 hover:text-ink dark:text-stone-400 dark:hover:bg-white/5"
          aria-label={t("copyCode", mode)}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5 text-emerald-500"><path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
          )}
          {copied ? t("copiedCode", mode) : t("copyCode", mode)}
          </button>
        </div>
      </div>
      {/* The Markdown component renders the fenced block; .md pre supplies the dark theme. */}
      <div className="code-example-body p-4">
        <Markdown>{"```python\n" + code + "\n```"}</Markdown>
      </div>
      {/* Predict-then-reveal output: the snippet's actual printed text + figure. */}
      {hasOutput && (
        <div className="border-t border-stone-200/60 dark:border-white/[0.06]">
          <button
            onClick={() => setRevealed((v) => !v)}
            aria-expanded={revealed}
            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-xs font-semibold text-ink/60 transition hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/[0.03]"
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="m4 7 5 5-5 5M12 19h8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {t("output", mode)}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-300">
              {revealed ? t("hideOutput", mode) : t("revealOutput", mode)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={"h-3.5 w-3.5 transition-transform " + (revealed ? "rotate-180" : "")}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </button>
          {!revealed ? (
            <p className="px-4 pb-3 text-[11px] italic text-ink/40 dark:text-stone-500">{t("predictHint", mode)}</p>
          ) : (
            <div className="space-y-3 px-4 pb-4">
              {output!.stdout && (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink/35 dark:text-stone-500">{t("printedLabel", mode)}</div>
                  <pre className="overflow-x-auto rounded-lg bg-[#11101a] px-3 py-2.5 font-mono text-[12px] leading-relaxed text-emerald-200/90">{output!.stdout}</pre>
                </div>
              )}
              {output!.image && outputId && (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink/35 dark:text-stone-500">{t("figureLabel", mode)}</div>
                  <img
                    src={`${import.meta.env.BASE_URL}code-output/${outputId}.png`}
                    alt={`${outputId} output figure`}
                    loading="lazy"
                    className="w-full rounded-lg border border-stone-200/70 bg-white dark:border-white/10"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <figcaption className="border-t border-stone-200/60 bg-stone-50/50 px-4 py-2.5 text-xs leading-relaxed text-ink/60 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-stone-400">
        {pick(note, mode)}
      </figcaption>
    </figure>
  );
}
