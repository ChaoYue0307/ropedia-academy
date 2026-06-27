import { Link } from "react-router-dom";
import { useStore, useCompletedSet } from "../lib/store";
import { tracks, totalLessons, getLesson, trackProgress } from "../lib/curriculum";
import { isDue } from "../lib/srs";
import { t, pick } from "../lib/i18n";
import { BiInline } from "../components/BiText";
import { ProgressRing } from "../components/ProgressRing";
import { MasteryHeatmap } from "../components/MasteryHeatmap";
import { LABS as ALL_LABS } from "../lib/labs";

export function Dashboard() {
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const lastLessonId = useStore((s) => s.lastLessonId);
  const srs = useStore((s) => s.srs);
  const reviewing = useStore((s) => s.reviewing);

  const overall = completed.size / totalLessons;
  const dueCount = reviewing.filter((id) => isDue(srs[id])).length;
  const last = lastLessonId ? getLesson(lastLessonId) : undefined;
  const firstUnseen = tracks[0].lessons.find((l) => !completed.has(l.id)) ?? tracks[0].lessons[0];

  return (
    <div className="space-y-8">
      <header className="pt-1">
        <Link to="/overview" className="group block overflow-hidden rounded-2xl border border-stone-200/60 shadow-card transition hover:shadow-card-hover dark:border-white/[0.06]">
          <img
            src={`${import.meta.env.BASE_URL}og.png`}
            alt={`${t("appName", mode)} — ${t("tagline", mode)}`}
            width={1200}
            height={630}
            className="block w-full"
          />
        </Link>
        <h1 className="sr-only">{t("appName", mode)}</h1>
      </header>

      {completed.size === 0 && (
        <div className="rounded-2xl border border-brand-200/60 bg-brand-50/40 p-4 dark:border-brand-400/15 dark:bg-brand-500/[0.06]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200">
            {mode === "zh" ? "怎么学" : "How it works"}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {[
              { en: "Read a bilingual lesson with live interactive demos", zh: "阅读双语课程，配实时交互演示" },
              { en: "Self-check with reveal-answer questions", zh: "用「揭晓答案」的自检题检验理解" },
              { en: "Add checks to spaced repetition to remember", zh: "把检验题加入间隔重复以记牢" },
              { en: "See how it all links on the concept map", zh: "在概念图上看一切如何关联" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-snug text-ink/70 dark:text-stone-300">{pick(step, mode)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-brand-200/40 pt-2.5 text-xs text-ink/50 dark:border-brand-400/10 dark:text-stone-400">
            {mode === "zh" ? "提示：按 ⌘K 随时跳转到任意课程或术语。" : "Tip — press ⌘K to jump to any lesson or term."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-ink/40 dark:text-stone-500">
                {t("overallProgress", mode)}
              </div>
              <div className="mt-1 text-2xl font-bold text-ink dark:text-stone-50">
                {completed.size}
                <span className="text-base font-medium text-ink/40 dark:text-stone-500">
                  {" "}/ {totalLessons}
                </span>
              </div>
              <div className="text-xs text-ink/40 dark:text-stone-500">{t("lessonsDone", mode)}</div>
            </div>
            <ProgressRing value={overall} size={56} stroke={5} />
          </div>
        </div>

        <Link
          to={last ? `/lesson/${last.lesson.id}` : `/lesson/${firstUnseen.id}`}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 shadow-glow transition hover:-translate-y-0.5"
        >
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="text-xs font-medium uppercase tracking-wide text-brand-100/90">
            {last ? t("resume", mode) : t("startHere", mode)}
          </div>
          <div className="mt-1 line-clamp-2 text-[15px] font-semibold text-white">
            <BiInline value={(last?.lesson ?? firstUnseen).title} mode={mode} />
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white group-hover:gap-2">
            {t("continue", mode)} <span className="transition-all">→</span>
          </div>
        </Link>

        <Link
          to="/review"
          className="rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("dueToday", mode)}
          </div>
          <div className="mt-1 text-2xl font-bold text-ink dark:text-stone-50">
            {dueCount}
            <span className="text-base font-medium text-ink/40 dark:text-stone-500"> {t("cards", mode)}</span>
          </div>
          <div className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-300">
            {dueCount > 0 ? `${t("reviewNow", mode)} →` : ""}
          </div>
        </Link>
      </div>

      <MasteryHeatmap />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
            {t("navTracks", mode)}
          </h2>
          <Link to="/overview" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
            {t("researchDirections", mode)} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tracks.map((track) => {
            const p = trackProgress(track.id, completed);
            return (
              <Link
                key={track.id}
                to={`/track/${track.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.04]"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white transition group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${track.accent}, ${track.accent}c0)`,
                    boxShadow: `0 8px 20px -8px ${track.accent}`,
                  }}
                >
                  {track.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink dark:text-stone-100">
                    {pick(track.title, mode)}
                  </div>
                  <div className="truncate text-xs text-ink/45 dark:text-stone-500">
                    {pick(track.subtitle, mode)}
                  </div>
                </div>
                <ProgressRing value={p} size={40} stroke={4} color={track.accent} />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Link
          to="/labs"
          className="group flex items-center gap-4 rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white to-stone-50/50 p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:from-white/[0.05] dark:to-transparent"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_8px_20px_-8px_#6366f1] transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v6.5L5.5 18a2 2 0 001.8 3h9.4a2 2 0 001.8-3L14 9.5V3M8 14h8" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-ink dark:text-stone-100">{t("trainingLabs", mode)}</div>
            <div className="text-xs text-ink/50 dark:text-stone-400">{ALL_LABS.length} {t("labsCount", mode)} · {t("trainingLabsDesc", mode)}</div>
          </div>
          <span className="shrink-0 text-sm font-medium text-brand-600 transition-all group-hover:translate-x-0.5 dark:text-brand-300">→</span>
        </Link>
      </section>
    </div>
  );
}
