import { Link, useParams } from "react-router-dom";
import { getTrack, trackProgress } from "../lib/curriculum";
import { useStore, useCompletedSet } from "../lib/store";
import { pick, t } from "../lib/i18n";
import { readingMinutes } from "../lib/reading";
import { ProgressRing } from "../components/ProgressRing";

export function TrackPage() {
  const { id } = useParams();
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const track = getTrack(id ?? "");

  if (!track) return <div className="text-ink/60">Track not found.</div>;
  const p = trackProgress(track.id, completed);

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink dark:text-stone-400">
        ← {t("navDashboard", mode)}
      </Link>

      <header className="flex items-start gap-4">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${track.accent}, ${track.accent}bb)`,
            boxShadow: `0 10px 26px -10px ${track.accent}`,
          }}
        >
          {track.id}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">
            {pick(track.title, mode)}
          </h1>
          <p className="mt-1 text-sm text-ink/55 dark:text-stone-400">{pick(track.blurb, mode)}</p>
        </div>
        <ProgressRing value={p} size={48} stroke={5} color={track.accent} />
      </header>

      <Link
        to={`/quiz/${track.id}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("quizTrack", mode)} · {track.lessons.reduce((n, l) => n + l.checks.length, 0)} {mode === "zh" ? "题" : "questions"}
      </Link>

      <ol className="space-y-2">
        {track.lessons.map((lesson) => {
          const done = completed.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              to={`/lesson/${lesson.id}`}
              className="group flex items-center gap-4 rounded-xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
            >
              <div
                className={
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition " +
                  (done
                    ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow"
                    : "border border-stone-300 text-ink/50 group-hover:border-brand-300 dark:border-white/15 dark:text-stone-400")
                }
              >
                {done ? "✓" : lesson.index}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-medium text-ink dark:text-stone-100">
                  {pick(lesson.title, mode)}
                </div>
                <div className="truncate text-xs text-ink/45 dark:text-stone-500">
                  {pick(lesson.summary, mode)}
                </div>
              </div>
              <span className="hidden shrink-0 text-[11px] text-ink/35 dark:text-stone-600 sm:inline">
                ~{readingMinutes(lesson, mode)} {mode === "zh" ? "分钟" : "min"}
              </span>
              <span className="text-ink/30 dark:text-stone-600">→</span>
            </Link>
          );
        })}
      </ol>
    </div>
  );
}
