import { Link } from "react-router-dom";
import { tracksById, trackProgress } from "../lib/curriculum";
import { useStore, useCompletedSet, visibleLessons } from "../lib/store";
import { pick, t } from "../lib/i18n";
import { ProgressRing } from "../components/ProgressRing";
import { PathToggle } from "../components/PathToggle";
import type { TrackId } from "../lib/types";

const ORDER: TrackId[] = ["A", "B", "C", "D"];

export function OverviewPage() {
  const mode = useStore((s) => s.lang);
  const path = useStore((s) => s.path);
  const completed = useCompletedSet();

  return (
    <div className="space-y-7">
      <header>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-200/70 bg-brand-50/60 px-2.5 py-1 text-[11px] font-medium text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
          A · B · C · D
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-stone-50">
          {t("researchDirections", mode)}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink/55 dark:text-stone-400">
          {t("overviewIntro", mode)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-ink/45 dark:text-stone-500">{t("learningPath", mode)}</span>
          <PathToggle />
        </div>
      </header>

      <div className="space-y-7">
        {ORDER.map((id, i) => {
          const track = tracksById[id];
          const p = trackProgress(id, completed);
          const lessons = visibleLessons(track.lessons, path);
          return (
            <div key={id} className="space-y-2.5">
              <div className="flex items-center gap-3 px-0.5">
                <span className="font-mono text-xs font-semibold tabular-nums text-ink/45 dark:text-stone-500">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px flex-1 bg-stone-200/80 dark:bg-white/10" />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/35 dark:text-stone-600">Track {track.id}</span>
              </div>
              <section className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${track.accent}, ${track.accent}40)` }} />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-xl font-bold text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${track.accent}, ${track.accent}bb)`,
                      boxShadow: `0 8px 22px -8px ${track.accent}`,
                    }}
                  >
                    {track.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-semibold text-ink dark:text-stone-50">
                      {track.id}. {pick(track.title, mode)}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink/45 dark:text-stone-500">{pick(track.subtitle, mode)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <ProgressRing value={p} size={44} stroke={4} color={track.accent} />
                  </div>
                </div>

                <dl className="mt-4 text-sm">
                  <div className="sm:flex sm:gap-3">
                    <dt className="shrink-0 font-semibold text-ink/80 dark:text-stone-200" style={{ minWidth: "5rem" }}>
                      {t("focus", mode)}
                    </dt>
                    <dd className="text-ink/70 dark:text-stone-300">{pick(track.focus, mode)}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
                    {t("coveredIn", mode)} · {lessons.length} {t("lessonsCount", mode)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lessons.map((lesson) => {
                      const done = completed.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          to={`/lesson/${lesson.id}`}
                          className={
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition " +
                            (done
                              ? "border-transparent text-white"
                              : "border-stone-200 text-ink/70 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-stone-300 dark:hover:text-brand-200")
                          }
                          style={done ? { backgroundColor: track.accent } : undefined}
                        >
                          <span className="opacity-70">{lesson.index}</span>
                          {pick(lesson.title, mode)}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/track/${track.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium transition hover:gap-2"
                    style={{ color: track.accent }}
                  >
                    {t("exploreTrack", mode)} →
                  </Link>
                </div>
              </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
