import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { allChecks, getLesson } from "../lib/curriculum";
import { isDue, type Grade } from "../lib/srs";
import { pick, t } from "../lib/i18n";
import { BiText } from "../components/BiText";
import { ReviewForecast } from "../components/ReviewForecast";

function findCheck(checkId: string) {
  const meta = allChecks.find((c) => c.checkId === checkId);
  if (!meta) return undefined;
  const found = getLesson(meta.lessonId);
  if (!found) return undefined;
  const check = found.lesson.checks.find((c) => c.id === checkId);
  if (!check) return undefined;
  return { check, lesson: found.lesson, track: found.track };
}

export function ReviewPage() {
  const mode = useStore((s) => s.lang);
  const reviewing = useStore((s) => s.reviewing);
  const srs = useStore((s) => s.srs);
  const gradeCheck = useStore((s) => s.gradeCheck);
  const [revealed, setRevealed] = useState(false);

  const dueIds = useMemo(
    () => reviewing.filter((id) => isDue(srs[id])),
    [reviewing, srs],
  );
  const current = dueIds[0];

  useEffect(() => {
    setRevealed(false);
  }, [current]);

  const grades: { g: Grade; key: string; cls: string }[] = [
    { g: "again", key: "gradeAgain", cls: "bg-red-500 hover:bg-red-600" },
    { g: "hard", key: "gradeHard", cls: "bg-amber-500 hover:bg-amber-600" },
    { g: "good", key: "gradeGood", cls: "bg-brand-600 hover:bg-brand-700" },
    { g: "easy", key: "gradeEasy", cls: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">
          {t("reviewTitle", mode)}
        </h1>
        {reviewing.length > 0 && (
          <span className="text-sm text-ink/45 dark:text-stone-500">
            {dueIds.length} {t("remaining", mode)}
          </span>
        )}
      </header>

      <ReviewForecast />

      {reviewing.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center dark:border-white/15">
          <p className="font-medium text-ink/70 dark:text-stone-300">{t("reviewEmpty", mode)}</p>
          <p className="mt-1 text-sm text-ink/45 dark:text-stone-500">{t("reviewEmptyHint", mode)}</p>
          <Link to="/" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            {t("navTracks", mode)} →
          </Link>
        </div>
      ) : !current ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="text-3xl">✓</div>
          <p className="mt-2 font-medium text-ink/70 dark:text-stone-300">{t("reviewDone", mode)}</p>
        </div>
      ) : (
        (() => {
          const data = findCheck(current);
          if (!data) return null;
          return (
            <div className="space-y-4">
              <Link
                to={`/lesson/${data.lesson.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/45 hover:text-ink dark:text-stone-500"
              >
                <span className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: data.track.accent }}>
                  {data.track.id}
                </span>
                {pick(data.lesson.title, mode)}
              </Link>

              <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
                <div className="text-[15px] font-medium text-ink dark:text-stone-100">
                  <BiText value={data.check.prompt} mode={mode} />
                </div>

                {revealed && (
                  <div className="mt-4 animate-fade-in rounded-xl border-l-2 border-brand-400 bg-brand-50/50 p-4 dark:border-brand-400/60 dark:bg-brand-500/[0.07]">
                    <BiText value={data.check.answer} mode={mode} />
                  </div>
                )}
              </div>

              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  {t("reveal", mode)}
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {grades.map((gr) => (
                    <button
                      key={gr.g}
                      onClick={() => gradeCheck(current, gr.g)}
                      className={"rounded-xl py-3 text-sm font-semibold text-white transition " + gr.cls}
                    >
                      {t(gr.key, mode)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
