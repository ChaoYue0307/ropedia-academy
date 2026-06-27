import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tracks } from "../lib/curriculum";
import { useStore, useCompletedSet } from "../lib/store";
import { pick, t } from "../lib/i18n";
import type { Lesson, Track } from "../lib/types";

export function MasteryHeatmap() {
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const reviewing = useStore((s) => s.reviewing);
  const navigate = useNavigate();
  const reviewingSet = new Set(reviewing);
  const [hover, setHover] = useState<{ lesson: Lesson; track: Track; status: string } | null>(null);

  const statusLabel = (done: boolean, inReview: boolean) =>
    done
      ? mode === "zh" ? "已完成" : "completed"
      : inReview
        ? mode === "zh" ? "复习中" : "in review"
        : mode === "zh" ? "未学" : "not started";

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40 dark:text-stone-500">
          {mode === "zh" ? "学习地图" : "Your progress map"}
        </h2>
        <div className="flex items-center gap-3 text-[10px] text-ink/45 dark:text-stone-500">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-500" /> {t("completed", mode)}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm border border-amber-400 bg-amber-400/30" /> {mode === "zh" ? "复习中" : "in review"}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm border border-stone-300 dark:border-white/15" /> {mode === "zh" ? "未学" : "new"}</span>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
        <div className="space-y-1.5">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-2">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: track.accent }}
              >
                {track.id}
              </span>
              <div className="flex flex-1 gap-1.5">
                {track.lessons.map((lesson) => {
                  const done = completed.has(lesson.id);
                  const inReview = lesson.checks.some((c) => reviewingSet.has(c.id));
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                      onMouseEnter={() => setHover({ lesson, track, status: statusLabel(done, inReview) })}
                      onFocus={() => setHover({ lesson, track, status: statusLabel(done, inReview) })}
                      aria-label={pick(lesson.title, mode)}
                      className="group relative h-7 flex-1 rounded-md border transition hover:z-10 hover:scale-110"
                      style={{
                        backgroundColor: done ? track.accent : inReview ? "rgba(245,158,11,0.28)" : "transparent",
                        borderColor: done ? track.accent : inReview ? "rgb(245,158,11)" : "transparent",
                      }}
                    >
                      <span className={"absolute inset-0 grid place-items-center text-[10px] font-semibold " + (done ? "text-white" : "text-ink/40 dark:text-stone-500")}>
                        {lesson.index}
                      </span>
                      {!done && !inReview && <span className="absolute inset-0 rounded-md border border-stone-300 dark:border-white/15" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 min-h-[2.25rem] border-t border-stone-200/60 pt-2.5 dark:border-white/[0.06]" onMouseLeave={() => setHover(null)}>
          {hover ? (
            <button onClick={() => navigate(`/lesson/${hover.lesson.id}`)} className="flex w-full items-center gap-2 text-left">
              <span className="grid h-5 w-7 shrink-0 place-items-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: hover.track.accent }}>
                {hover.lesson.id}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink dark:text-stone-100">
                {pick(hover.lesson.title, mode)}
              </span>
              <span className="shrink-0 text-xs text-ink/45 dark:text-stone-500">{hover.status}</span>
            </button>
          ) : (
            <p className="text-xs text-ink/40 dark:text-stone-500">
              {mode === "zh" ? "悬停方块查看课程，点击进入。" : "Hover a square to see the lesson · click to open."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
