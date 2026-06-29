import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { bigIdeas } from "../lib/curriculum/bigIdeas";
import { getLesson } from "../lib/curriculum";
import { useStore } from "../lib/store";
import { pick, t } from "../lib/i18n";

export function BigIdeasPage() {
  const mode = useStore((s) => s.lang);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-ink dark:text-stone-50">
          {t("bigIdeasTitle", mode)}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink/55 dark:text-stone-400">
          {t("bigIdeasIntro", mode)}
        </p>
      </header>

      <div className="space-y-4">
        {bigIdeas.map((idea) => (
          <section
            key={idea.id}
            id={idea.id}
            className="scroll-mt-20 rounded-2xl border border-stone-200/70 bg-white/70 p-5 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.03]"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                  <path d={idea.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold text-ink dark:text-stone-100">{pick(idea.name, mode)}</h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink/75 dark:text-stone-300">{pick(idea.blurb, mode)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-medium text-ink/40 dark:text-stone-500">{t("appearsIn", mode)}:</span>
                  {idea.lessons.map((lid) => {
                    const target = getLesson(lid);
                    if (!target) return null;
                    return (
                      <Link
                        key={lid}
                        to={`/lesson/${lid}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                      >
                        <span className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: target.track.accent }}>
                          {target.track.id}
                        </span>
                        {pick(target.lesson.title, mode)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
