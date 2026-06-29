import { useState } from "react";
import type { McqItem, LangMode } from "../lib/types";
import { BiInline } from "./BiText";
import { pick, t } from "../lib/i18n";

export function McqCard({ mcq, mode, onAnswered }: { mcq: McqItem; mode: LangMode; onAnswered?: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const isCorrect = picked === mcq.correct;

  const pick_ = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswered?.(i === mcq.correct);
  };

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {t("quickCheck", mode)}
      </div>

      <div className="text-[15px] font-medium text-ink dark:text-stone-100">
        <BiInline value={mcq.prompt} mode={mode} />
      </div>

      <ul className="mt-3 space-y-2">
        {mcq.options.map((opt, i) => {
          const isAnswer = i === mcq.correct;
          const isPick = i === picked;
          let cls =
            "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition ";
          if (!answered) {
            cls += "border-stone-200 text-ink/80 hover:border-brand-300 hover:bg-brand-50/40 dark:border-white/10 dark:text-stone-200 dark:hover:bg-white/5";
          } else if (isAnswer) {
            cls += "border-emerald-400/70 bg-emerald-50/60 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/[0.1] dark:text-emerald-100";
          } else if (isPick) {
            cls += "border-rose-400/70 bg-rose-50/60 text-rose-900 dark:border-rose-400/40 dark:bg-rose-400/[0.1] dark:text-rose-100";
          } else {
            cls += "border-stone-200 text-ink/40 dark:border-white/10 dark:text-stone-500";
          }
          return (
            <li key={i}>
              <button type="button" disabled={answered} onClick={() => pick_(i)} className={cls}>
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current text-[9px] font-bold">
                  {answered && isAnswer ? "✓" : answered && isPick ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <BiInline value={opt} mode={mode} />
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className={"mt-3 animate-fade-in rounded-xl border-l-2 p-3 text-sm " + (isCorrect ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-400/60 dark:bg-emerald-400/[0.07]" : "border-rose-400 bg-rose-50/50 dark:border-rose-400/60 dark:bg-rose-400/[0.07]")}>
          <span className={"mr-1.5 font-semibold " + (isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
            {isCorrect ? t("correctFeedback", mode) : t("incorrectFeedback", mode)} ·
          </span>
          <span className="text-ink/80 dark:text-stone-200"><BiInline value={mcq.explain} mode={mode} /></span>
        </div>
      )}
    </div>
  );
}
