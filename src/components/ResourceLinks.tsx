import { lessonResources } from "../lib/curriculum/resources";
import { useStore } from "../lib/store";
import { t } from "../lib/i18n";
import type { Lesson, ResourceKind } from "../lib/types";

const KIND: Record<ResourceKind, { label: string; color: string; path: string }> = {
  wiki: { label: "Wiki", color: "#888780", path: "M4 4h12a2 2 0 012 2v14H6a2 2 0 01-2-2V4z M8 8h8M8 12h8M8 16h5" },
  paper: { label: "Paper", color: "#6a5ef0", path: "M6 2h8l4 4v16H6zM14 2v4h4" },
  video: { label: "Video", color: "#e24b4a", path: "M3 5h18v14H3z M10 9l5 3-5 3z" },
  dataset: { label: "Data", color: "#1d9e75", path: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" },
  model: { label: "Model", color: "#ba7517", path: "M12 2l9 5v10l-9 5-9-5V7z M12 12l9-5M12 12v10M12 12L3 7" },
  code: { label: "Code", color: "#639922", path: "M8 6l-5 6 5 6M16 6l5 6-5 6" },
  web: { label: "Web", color: "#378add", path: "M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18" },
};

function LinkPill({ kind, label, url }: { kind: ResourceKind; label: string; url: string }) {
  const k = KIND[kind];
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink/75 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:text-brand-200"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke={k.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
        <path d={k.path} />
      </svg>
      <span className="min-w-0 truncate">{label}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 shrink-0 opacity-40">
        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function ResourceLinks({ lesson }: { lesson: Lesson }) {
  const mode = useStore((s) => s.lang);
  const res = lessonResources[lesson.id] ?? [];
  const papers = lesson.papers ?? [];
  const ytQuery = encodeURIComponent(`${lesson.title.en} computer vision explained`);
  const ytUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;

  if (res.length === 0 && papers.length === 0) {
    return (
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">{t("learnMore", mode)}</h2>
        <div className="flex flex-wrap gap-2">
          <LinkPill kind="video" label={t("watchTalks", mode)} url={ytUrl} />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">{t("learnMore", mode)}</h2>
      <div className="flex flex-wrap gap-2">
        {res.map((r, i) => (
          <LinkPill key={`r${i}`} kind={r.kind} label={r.label} url={r.url} />
        ))}
        {papers.map((p, i) => (
          <LinkPill
            key={`p${i}`}
            kind="paper"
            label={p.year ? `${p.title.split(/[:(]/)[0].trim()} (${p.year})` : p.title.split(/[:(]/)[0].trim()}
            url={p.url ?? `https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`}
          />
        ))}
        <LinkPill kind="video" label={t("watchTalks", mode)} url={ytUrl} />
      </div>
    </section>
  );
}
