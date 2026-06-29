import { useState } from "react";
import type { CheckQuestion, LangMode } from "../lib/types";
import { BiText } from "./BiText";
import { t } from "../lib/i18n";
import { useStore } from "../lib/store";

export function CheckCard({
  check,
  mode,
  index,
}: {
  check: CheckQuestion;
  mode: LangMode;
  index: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [hinted, setHinted] = useState(false);
  const reviewing = useStore((s) => s.reviewing.includes(check.id));
  const addToReview = useStore((s) => s.addToReview);

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm transition dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-500">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-semibold text-white">
          {index}
        </span>
        {t("checkYourself", mode)}
      </div>

      <div className="text-[15px] font-medium text-ink dark:text-stone-100">
        <BiText value={check.prompt} mode={mode} />
      </div>

      {!revealed && (
        <p className="mt-2 text-sm italic text-ink/50 dark:text-stone-400">
          {t("yourTurn", mode)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setRevealed((r) => !r)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          {revealed ? t("hideAnswer", mode) : t("showAnswer", mode)}
        </button>
        {check.hint && !revealed && (
          <button
            onClick={() => setHinted((h) => !h)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/70 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:border-amber-400 hover:bg-amber-50/60 dark:border-amber-400/30 dark:text-amber-300 dark:hover:bg-amber-400/[0.08]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3.5 w-3.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {hinted ? t("hideHint", mode) : t("showHint", mode)}
          </button>
        )}
        <button
          onClick={() => addToReview(check.id)}
          disabled={reviewing}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-white/10 dark:text-stone-300 dark:hover:text-brand-200"
        >
          {reviewing ? `✓ ${t("inReview", mode)}` : `+ ${t("addToReview", mode)}`}
        </button>
      </div>

      {check.hint && hinted && !revealed && (
        <div className="mt-4 animate-fade-in rounded-xl border-l-2 border-amber-400 bg-amber-50/50 p-4 text-[15px] leading-relaxed text-ink/80 dark:border-amber-400/60 dark:bg-amber-400/[0.07] dark:text-stone-200">
          <span className="mr-1.5 font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">{t("hint", mode)}:</span>
          <BiText value={check.hint} mode={mode} />
        </div>
      )}

      {revealed && (
        <div className="mt-4 animate-fade-in rounded-xl border-l-2 border-brand-400 bg-brand-50/50 p-4 dark:border-brand-400/60 dark:bg-brand-500/[0.07]">
          <BiText value={check.answer} mode={mode} />
        </div>
      )}
    </div>
  );
}
