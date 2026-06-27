import { Suspense, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getLesson, lessonNeighbors } from "../lib/curriculum";
import { useStore, useCompletedSet } from "../lib/store";
import { pick, t } from "../lib/i18n";
import { readingMinutes } from "../lib/reading";
import { BiText, BiInline } from "../components/BiText";
import { CheckCard } from "../components/CheckCard";
import { ReadingProgress } from "../components/ReadingProgress";
import { lessonFigures } from "../components/figures/registry";
import { lessonCode, colabUrl } from "../lib/curriculum/lessonCode";
import { codeOutputs } from "../lib/curriculum/codeOutputs";
import { lessonIntuition } from "../lib/curriculum/lessonIntuition";
import { CodeExample } from "../components/CodeExample";
import { ResourceLinks } from "../components/ResourceLinks";

export function LessonPage() {
  const { id } = useParams();
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const markComplete = useStore((s) => s.markComplete);
  const markIncomplete = useStore((s) => s.markIncomplete);
  const setLastLesson = useStore((s) => s.setLastLesson);

  const navigate = useNavigate();
  const found = getLesson(id ?? "");
  const { prev, next } = lessonNeighbors(id ?? "");

  useEffect(() => {
    if (id && found) setLastLesson(id);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) navigate(`/lesson/${next.id}`);
      else if (e.key === "ArrowLeft" && prev) navigate(`/lesson/${prev.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev?.id, next?.id, navigate]);

  if (!found) return <div className="text-ink/60">Lesson not found.</div>;
  const { lesson, track } = found;
  const done = completed.has(lesson.id);
  const minutes = readingMinutes(lesson, mode);

  return (
    <article className="space-y-7">
      <ReadingProgress />
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink/45 dark:text-stone-500">
        <Link to={`/track/${track.id}`} className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-stone-300">
          <span className="grid h-5 w-5 place-items-center rounded text-[11px] font-bold text-white" style={{ backgroundColor: track.accent }}>
            {track.id}
          </span>
          {pick(track.title, mode)}
        </Link>
        <span>·</span>
        <span>
          {mode === "zh" ? `第 ${lesson.index} 课` : `Lesson ${lesson.index}`} {t("ofN", mode)} {track.lessons.length}
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
          ~{minutes} {mode === "zh" ? "分钟" : "min"}
        </span>
      </div>

      <header>
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-ink dark:text-stone-50">
          {pick(lesson.title, mode)}
        </h1>
        <p className="mt-2 text-[15px] text-ink/55 dark:text-stone-400">{pick(lesson.summary, mode)}</p>
      </header>

      {lessonIntuition[lesson.id] && (
        <aside className="rounded-2xl border border-amber-300/50 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-3.5 w-3.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.1V16h6v-.4c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 3z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t("inPlainWords", mode)}
          </div>
          <div className="text-[15px] leading-relaxed text-ink/80 dark:text-stone-200">
            <BiText value={lessonIntuition[lesson.id]} mode={mode} />
          </div>
        </aside>
      )}

      <BiText value={lesson.body} mode={mode} />

      {lessonFigures[lesson.id] && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
            {t("interactive", mode)}
          </h2>
          {lessonFigures[lesson.id].map((Fig, i) => (
            <Suspense
              key={i}
              fallback={<div className="h-72 animate-pulse rounded-2xl border border-stone-200/70 bg-white/60 dark:border-white/[0.07] dark:bg-white/[0.04]" />}
            >
              <Fig />
            </Suspense>
          ))}
        </section>
      )}

      {lessonCode[lesson.id] && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="m8 6-5 6 5 6M16 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {t("implementation", mode)}
          </h2>
          <CodeExample code={lessonCode[lesson.id].code} note={lessonCode[lesson.id].note} mode={mode} colabUrl={colabUrl(lesson.id)} output={codeOutputs[lesson.id]} outputId={lesson.id} />
        </section>
      )}

      {lesson.keyTerms && lesson.keyTerms.length > 0 && (
        <section className="rounded-2xl border border-stone-200/70 bg-white/60 p-5 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.03]">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">
            {t("keyTerms", mode)}
          </h2>
          <dl className="space-y-2.5">
            {lesson.keyTerms.map((kt) => (
              <div key={kt.term} className="text-sm">
                <dt className="font-semibold text-brand-700 dark:text-brand-300">{kt.term}</dt>
                <dd className="text-ink/70 dark:text-stone-300">
                  <BiInline value={kt.def} mode={mode} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="space-y-3">
        {lesson.checks.map((c, i) => (
          <CheckCard key={c.id} check={c} mode={mode} index={i + 1} />
        ))}
      </section>

      <ResourceLinks lesson={lesson} />

      {lesson.links && lesson.links.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">
            {t("related", mode)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {lesson.links.map((lid) => {
              const target = getLesson(lid);
              if (!target) return null;
              return (
                <Link
                  key={lid}
                  to={`/lesson/${lid}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <span className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: target.track.accent }}>
                    {target.track.id}
                  </span>
                  {pick(target.lesson.title, mode)}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between border-t border-stone-200 pt-5 dark:border-white/10">
        <button
          onClick={() => (done ? markIncomplete(lesson.id) : markComplete(lesson.id))}
          className={
            "rounded-lg px-4 py-2 text-sm font-medium transition " +
            (done
              ? "border border-stone-200 text-ink/60 hover:text-ink dark:border-white/10 dark:text-stone-400"
              : "bg-brand-600 text-white hover:bg-brand-700")
          }
        >
          {done ? `✓ ${t("completed", mode)}` : t("markComplete", mode)}
        </button>
      </div>

      <nav className="flex items-stretch justify-between gap-3">
        {prev ? (
          <Link to={`/lesson/${prev.id}`} className="min-w-0 flex-1 rounded-xl border border-stone-200 p-3 text-left transition hover:border-brand-300 dark:border-white/10">
            <div className="text-[10px] uppercase tracking-wide text-ink/40 dark:text-stone-500">← {t("prev", mode)}</div>
            <div className="truncate text-sm font-medium text-ink dark:text-stone-200">{pick(prev.title, mode)}</div>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link to={`/lesson/${next.id}`} className="min-w-0 flex-1 rounded-xl border border-stone-200 p-3 text-right transition hover:border-brand-300 dark:border-white/10">
            <div className="text-[10px] uppercase tracking-wide text-ink/40 dark:text-stone-500">{t("next", mode)} →</div>
            <div className="truncate text-sm font-medium text-ink dark:text-stone-200">{pick(next.title, mode)}</div>
          </Link>
        ) : <div className="flex-1" />}
      </nav>

      <p className="hidden text-center text-[11px] text-ink/35 dark:text-stone-600 sm:block">
        {mode === "zh" ? "提示：用 ← → 方向键在课程间快速切换" : "Tip — use ← → arrow keys to move between lessons"}
      </p>
    </article>
  );
}
