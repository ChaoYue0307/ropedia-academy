import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tracks } from "../lib/curriculum";
import { foundations } from "../lib/foundations";
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

const FOUNDATIONS = [...foundations].sort((a, b) => a.term.localeCompare(b.term));

function matches(q: string, term: string, def: Bilingual) {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    term.toLowerCase().includes(query) ||
    def.en.toLowerCase().includes(query) ||
    def.zh.includes(q.trim())
  );
}

export function GlossaryPage() {
  const mode = useStore((s) => s.lang);
  const [q, setQ] = useState("");

  const foundFiltered = useMemo(
    () => FOUNDATIONS.filter((f) => matches(q, f.term, f.def)),
    [q],
  );
  const termFiltered = useMemo(
    () => ALL_TERMS.filter((x) => matches(q, x.term, x.def)),
    [q],
  );

  // Always show both languages so the glossary is fully bilingual in any mode.
  const defText = (def: Bilingual) => `${def.en} — ${def.zh}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">
          {t("navGlossary", mode)}
        </h1>
        <p className="mt-1 text-sm text-ink/50 dark:text-stone-400">
          {mode === "zh"
            ? `${FOUNDATIONS.length} 个基础概念 + ${ALL_TERMS.length} 个赛道术语`
            : `${FOUNDATIONS.length} foundations + ${ALL_TERMS.length} track terms`}
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

      {/* Foundations — the basic terms every track assumes you know. */}
      {foundFiltered.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">
            {mode === "zh" ? "基础概念" : "Foundations"}
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-ink/50 dark:bg-white/10 dark:text-stone-400">
              {mode === "zh" ? "先掌握这些" : "start here"}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {foundFiltered.map((f) => (
              <div
                key={f.term}
                className="rounded-xl border border-stone-200/70 bg-white/70 p-4 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink dark:text-stone-100">{f.term}</span>
                  <span className="grid h-4 shrink-0 place-items-center rounded bg-stone-200/70 px-1.5 text-[9px] font-bold uppercase tracking-wide text-ink/55 dark:bg-white/10 dark:text-stone-400">
                    {mode === "zh" ? "基础" : "basics"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/70 dark:text-stone-300">{defText(f.def)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Track terms — the lesson-specific key terms. */}
      {termFiltered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">
            {mode === "zh" ? "赛道术语" : "Across the tracks"}
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {termFiltered.map((x, i) => (
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
                <p className="mt-1 text-sm text-ink/70 dark:text-stone-300">{defText(x.def)}</p>
                <p className="mt-2 text-[11px] text-ink/40 dark:text-stone-500">{pick(x.lessonTitle, mode)} →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {foundFiltered.length === 0 && termFiltered.length === 0 && (
        <p className="py-8 text-center text-sm text-ink/45 dark:text-stone-500">
          {mode === "zh" ? "未找到匹配的术语。" : "No matching terms."}
        </p>
      )}
    </div>
  );
}
