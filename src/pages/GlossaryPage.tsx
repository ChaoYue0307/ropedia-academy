import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tracks } from "../lib/curriculum";
import { useStore } from "../lib/store";
import { pick, t } from "../lib/i18n";
import type { Bilingual, TrackId } from "../lib/types";

interface Term {
  term: string;
  def: Bilingual;
  lessonId: string;
  lessonTitle: Bilingual;
  trackId: TrackId;
  accent: string;
}

const ALL_TERMS: Term[] = tracks
  .flatMap((track) =>
    track.lessons.flatMap((lesson) =>
      (lesson.keyTerms ?? []).map((kt) => ({
        term: kt.term,
        def: kt.def,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        trackId: track.id,
        accent: track.accent,
      })),
    ),
  )
  .sort((a, b) => a.term.localeCompare(b.term));

export function GlossaryPage() {
  const mode = useStore((s) => s.lang);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ALL_TERMS;
    return ALL_TERMS.filter(
      (x) =>
        x.term.toLowerCase().includes(query) ||
        x.def.en.toLowerCase().includes(query) ||
        x.def.zh.includes(q.trim()),
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">
          {t("navGlossary", mode)}
        </h1>
        <p className="mt-1 text-sm text-ink/50 dark:text-stone-400">
          {ALL_TERMS.length} {mode === "zh" ? "个术语，跨四条赛道" : "terms across the four tracks"}
        </p>
      </header>

      <div className="sticky top-2 z-10">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("glossarySearch", mode)}
          className="w-full rounded-xl border border-stone-200/70 bg-white/90 px-4 py-2.5 text-sm shadow-card outline-none backdrop-blur transition placeholder:text-ink/35 focus:border-brand-400 dark:border-white/10 dark:bg-[#1c1b27]/90 dark:text-stone-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {filtered.map((x, i) => (
          <Link
            key={i}
            to={`/lesson/${x.lessonId}`}
            className="group rounded-xl border border-stone-200/70 bg-white/70 p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-white/[0.07] dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-brand-700 dark:text-brand-300">{x.term}</span>
              <span
                className="grid h-4 w-4 shrink-0 place-items-center rounded text-[9px] font-bold text-white"
                style={{ backgroundColor: x.accent }}
                title={`${x.lessonId}`}
              >
                {x.trackId}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/70 dark:text-stone-300">
              {mode === "en" ? x.def.en : mode === "zh" ? x.def.zh : `${x.def.zh} · ${x.def.en}`}
            </p>
            <p className="mt-2 text-[11px] text-ink/40 dark:text-stone-500">{pick(x.lessonTitle, mode)} →</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-ink/45 dark:text-stone-500">
            {mode === "zh" ? "未找到匹配的术语。" : "No matching terms."}
          </p>
        )}
      </div>
    </div>
  );
}
