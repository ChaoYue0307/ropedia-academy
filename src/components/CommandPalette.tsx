import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tracks } from "../lib/curriculum";
import { foundations } from "../lib/foundations";
import { useStore } from "../lib/store";
import { pick, t } from "../lib/i18n";

interface Item {
  kind: string;
  label: string;
  sub: string;
  to: string;
  hay: string;
}

export function CommandPalette() {
  const mode = useStore((s) => s.lang);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const pages: Item[] = [
      { kind: "page", label: t("navDashboard", mode), sub: "page", to: "/", hay: "dashboard 总览" },
      { kind: "page", label: t("researchDirections", mode), sub: "page", to: "/overview", hay: "research directions 研究方向 overview" },
      { kind: "page", label: t("navReview", mode), sub: "page", to: "/review", hay: "review spaced repetition 复习" },
      { kind: "page", label: t("navGraph", mode), sub: "page", to: "/graph", hay: "knowledge graph 知识图谱" },
      { kind: "page", label: t("navGlossary", mode), sub: "page", to: "/glossary", hay: "glossary terms 术语表" },
      { kind: "page", label: t("navSettings", mode), sub: "page", to: "/settings", hay: "settings 设置" },
    ];
    const trackItems: Item[] = tracks.map((tr) => ({
      kind: "track",
      label: `${tr.id}. ${pick(tr.title, mode)}`,
      sub: "track",
      to: `/track/${tr.id}`,
      hay: `${tr.id} ${tr.title.en} ${tr.title.zh}`.toLowerCase(),
    }));
    const lessonItems: Item[] = tracks.flatMap((tr) =>
      tr.lessons.map((l) => ({
        kind: "lesson",
        label: pick(l.title, mode),
        sub: `${tr.id}${l.index} · ${pick(tr.title, mode)}`,
        to: `/lesson/${l.id}`,
        hay: `${l.id} ${l.title.en} ${l.title.zh} ${l.summary.en}`.toLowerCase(),
      })),
    );
    const termItems: Item[] = tracks.flatMap((tr) =>
      tr.lessons.flatMap((l) =>
        (l.keyTerms ?? []).map((kt) => ({
          kind: "term",
          label: kt.term,
          sub: `${pick(l.title, mode)}`,
          to: `/lesson/${l.id}`,
          hay: `${kt.term} ${kt.def.en} ${kt.def.zh}`.toLowerCase(),
        })),
      ),
    );
    const foundationItems: Item[] = foundations.map((f) => ({
      kind: "term",
      label: f.term,
      sub: mode === "zh" ? "基础概念" : "foundation",
      to: "/glossary",
      hay: `${f.term} ${(f.aka ?? []).join(" ")} ${f.def.en} ${f.def.zh}`.toLowerCase(),
    }));
    return [...pages, ...trackItems, ...lessonItems, ...termItems, ...foundationItems];
  }, [mode]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items.slice(0, 8);
    return items.filter((it) => it.hay.includes(query) || it.label.toLowerCase().includes(query)).slice(0, 24);
  }, [q, items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const kindColor: Record<string, string> = {
    page: "text-stone-400",
    track: "text-brand-500",
    lesson: "text-emerald-500",
    term: "text-amber-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm animate-fade-in-fast"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1c1b27]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].to); }
          }}
          placeholder={t("cmdkPlaceholder", mode)}
          className="w-full border-b border-stone-200 bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-ink/35 dark:border-white/10 dark:text-stone-100"
        />
        <div className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-ink/40 dark:text-stone-500">{t("cmdkEmpty", mode)}</div>
          )}
          {results.map((it, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(it.to)}
              className={
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition " +
                (i === active ? "bg-brand-50 dark:bg-brand-500/15" : "")
              }
            >
              <span className={"text-[10px] font-bold uppercase " + (kindColor[it.kind] ?? "")}>{it.kind}</span>
              <span className="flex-1 truncate text-sm font-medium text-ink dark:text-stone-100">{it.label}</span>
              <span className="truncate text-[11px] text-ink/40 dark:text-stone-500">{it.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
