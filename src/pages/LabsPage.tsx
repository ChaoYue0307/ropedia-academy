import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { pick, t } from "../lib/i18n";
import {
  LABS, TRACK_LABEL, TRACK_ACCENT, LEVEL_LABEL, colabHref, githubDir,
  type LabLevel, type LabTrack,
} from "../lib/labs";

const TRACKS: LabTrack[] = ["A", "B", "C", "D", "LM", "AG"];
const LEVELS: LabLevel[] = ["scratch", "foundation", "advanced"];

export function LabsPage() {
  const mode = useStore((s) => s.lang);
  const [track, setTrack] = useState<LabTrack | "all">("all");
  const [level, setLevel] = useState<LabLevel | "all">("all");

  const labs = useMemo(
    () =>
      LABS.filter(
        (l) =>
          (track === "all" || l.track === track || (l.links?.includes(track as LabTrack) ?? false)) &&
          (level === "all" || l.level === level),
      ),
    [track, level],
  );

  const chip = (active: boolean) =>
    "rounded-full border px-3 py-1 text-xs font-medium transition " +
    (active
      ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
      : "border-stone-200 text-ink/55 hover:text-ink dark:border-white/10 dark:text-stone-400");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">{t("navLabs", mode)}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/55 dark:text-stone-400">{t("labsIntro", mode)}</p>
      </header>

      {/* Filters — track and level tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setTrack("all")} className={chip(track === "all")}>{t("labsAll", mode)}</button>
          {TRACKS.map((tr) => (
            <button key={tr} onClick={() => setTrack(tr)} className={chip(track === tr)}>{pick(TRACK_LABEL[tr], mode)}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setLevel("all")} className={chip(level === "all")}>{t("labsAll", mode)}</button>
          {LEVELS.map((lv) => (
            <button key={lv} onClick={() => setLevel(lv)} className={chip(level === lv)}>{pick(LEVEL_LABEL[lv], mode)}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink/45 dark:text-stone-500">
        {labs.length} {t("labsCount", mode)}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {labs.map((lab) => {
          const advanced = lab.level === "advanced";
          return (
            <div
              key={lab.file}
              className={
                "group flex flex-col rounded-2xl border p-4 shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card-hover " +
                (advanced
                  ? "border-amber-300/50 bg-amber-50/40 dark:border-amber-400/15 dark:bg-amber-500/[0.05]"
                  : "border-stone-200/70 bg-white/80 dark:border-white/[0.07] dark:bg-white/[0.04]")
              }
            >
              <a href={colabHref(lab)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3">
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-white transition group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${TRACK_ACCENT[lab.track]}, ${TRACK_ACCENT[lab.track]}c0)`,
                    boxShadow: `0 8px 20px -8px ${TRACK_ACCENT[lab.track]}`,
                  }}
                >
                  {lab.track}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-ink dark:text-stone-100">{pick(lab.title, mode)}</div>
                  <div className="mt-0.5 truncate text-xs text-ink/45 dark:text-stone-500">{lab.note ?? t("openInColab", mode)}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                      {pick(lab.action, mode)}
                    </span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                        (advanced
                          ? "bg-amber-200/70 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          : lab.level === "foundation"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")
                      }
                    >
                      {pick(LEVEL_LABEL[lab.level], mode)}
                    </span>
                  </div>
                </div>
              </a>

              {/* Track links — outside the Colab link; click to filter by that track */}
              {lab.links && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-stone-200/60 pt-2.5 dark:border-white/10">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-ink/40 dark:text-stone-500">{t("appliesTo", mode)}</span>
                  {lab.links.map((tk) => (
                    <button
                      key={tk}
                      onClick={() => setTrack(tk)}
                      title={pick(TRACK_LABEL[tk], mode)}
                      className="rounded px-2 py-0.5 text-[11px] font-bold text-white transition hover:scale-105"
                      style={{ backgroundColor: TRACK_ACCENT[tk] }}
                    >
                      {tk}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-1 text-xs">
        <a href={githubDir("training")} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">notebooks/training →</a>
        <a href={githubDir("advanced")} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">notebooks/advanced →</a>
      </div>
    </div>
  );
}
