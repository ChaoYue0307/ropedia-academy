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
        <button
          onClick={() => addToReview(check.id)}
          disabled={reviewing}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-white/10 dark:text-stone-300 dark:hover:text-brand-200"
        >
          {reviewing ? `✓ ${t("inReview", mode)}` : `+ ${t("addToReview", mode)}`}
        </button>
      </div>

      {revealed && (
        <div className="mt-4 animate-fade-in rounded-xl border-l-2 border-brand-400 bg-brand-50/50 p-4 dark:border-brand-400/60 dark:bg-brand-500/[0.07]">
          <BiText value={check.answer} mode={mode} />
        </div>
      )}
    </div>
  );
}
