import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tracks, getLesson } from "../lib/curriculum";
import { useStore, useCompletedSet } from "../lib/store";
import { pick, t } from "../lib/i18n";

const W = 720;
const COLS = 4;

export function GraphPage() {
  const mode = useStore((s) => s.lang);
  const completed = useCompletedSet();
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);

  const { pos, edges, adj, H } = useMemo(() => {
    const pos: Record<string, { x: number; y: number; accent: string; index: number }> = {};
    const colGap = (W - 120) / (COLS - 1);
    const rowGap = 56;
    tracks.forEach((track, ti) => {
      track.lessons.forEach((lesson, li) => {
        pos[lesson.id] = { x: 60 + ti * colGap, y: 70 + li * rowGap, accent: track.accent, index: lesson.index };
      });
    });
    const seen = new Set<string>();
    const edges: { a: string; b: string; cross: boolean }[] = [];
    const adj: Record<string, string[]> = {};
    tracks.forEach((track) =>
      track.lessons.forEach((lesson) => {
        (lesson.links ?? []).forEach((to) => {
          if (!pos[to]) return;
          const key = [lesson.id, to].sort().join("-");
          if (seen.has(key)) return;
          seen.add(key);
          edges.push({ a: lesson.id, b: to, cross: lesson.id[0] !== to[0] });
          (adj[lesson.id] ??= []).push(to);
          (adj[to] ??= []).push(lesson.id);
        });
      }),
    );
    const H = 70 + 8 * rowGap + 40;
    return { pos, edges, adj, H };
  }, []);

  const hoverLesson = hover ? getLesson(hover) : undefined;
  const neighbors = hover ? adj[hover] ?? [] : [];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">{t("graphTitle", mode)}</h1>
        <p className="mt-1 text-sm text-ink/50 dark:text-stone-400">{t("graphHint", mode)}</p>
      </header>

      <div className="rounded-2xl border border-stone-200/70 bg-white/70 p-2 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.03]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
          <defs>
            <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {tracks.map((track, ti) => (
            <text key={track.id} x={60 + ti * ((W - 120) / (COLS - 1))} y={36} textAnchor="middle" className="fill-ink/50 dark:fill-stone-400" style={{ fontSize: 13, fontWeight: 600 }}>
              {track.id} · {pick(track.title, mode).split(/[&（]/)[0].trim().slice(0, 14)}
            </text>
          ))}

          {edges.map((e, i) => {
            const a = pos[e.a];
            const b = pos[e.b];
            const active = hover === e.a || hover === e.b;
            const dim = hover && !active;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "#6a5ef0" : e.cross ? "#9b95c9" : "#d8d5e6"}
                strokeWidth={active ? 2.2 : e.cross ? 1.1 : 0.7}
                strokeOpacity={dim ? 0.07 : active ? 0.9 : e.cross ? 0.5 : 0.35}
              />
            );
          })}

          {Object.entries(pos).map(([id, p]) => {
            const done = completed.has(id);
            const isHover = hover === id;
            const isNeighbor = !!hover && neighbors.includes(id);
            const dim = !!hover && !isHover && !isNeighbor;
            const lesson = getLesson(id);
            return (
              <g
                key={id}
                transform={`translate(${p.x},${p.y})`}
                opacity={dim ? 0.2 : 1}
                onMouseEnter={() => setHover(id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate(`/lesson/${id}`)}
                style={{ cursor: "pointer" }}
              >
                <title>{lesson ? `${id} · ${pick(lesson.lesson.title, mode)}` : id}</title>
                <circle
                  r={isHover ? 15 : isNeighbor ? 13 : 12}
                  fill={done ? p.accent : "white"}
                  stroke={p.accent}
                  strokeWidth={isHover ? 2.5 : 2}
                  filter={isHover ? "url(#nodeGlow)" : undefined}
                  className={done ? "" : "dark:fill-[#1b1a24]"}
                />
                <text textAnchor="middle" dy="0.32em" style={{ fontSize: 10, fontWeight: 600 }} fill={done ? "white" : p.accent}>
                  {p.index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="min-h-[4rem] rounded-xl border border-stone-200/60 bg-white/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
        {hoverLesson ? (
          <div>
            <button onClick={() => navigate(`/lesson/${hoverLesson.lesson.id}`)} className="flex w-full items-center gap-2 text-left">
              <span className="grid h-5 w-7 shrink-0 place-items-center rounded text-[10px] font-bold text-white" style={{ backgroundColor: hoverLesson.track.accent }}>
                {hoverLesson.lesson.id}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink dark:text-stone-100">{pick(hoverLesson.lesson.title, mode)}</span>
            </button>
            {neighbors.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-ink/45 dark:text-stone-500">{mode === "zh" ? "连接到：" : "connects to:"}</span>
                {neighbors.map((nid) => {
                  const nl = getLesson(nid);
                  if (!nl) return null;
                  return (
                    <Link key={nid} to={`/lesson/${nid}`} onMouseEnter={() => setHover(nid)} className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-stone-300">
                      <span className="grid h-3.5 w-5 place-items-center rounded text-[8px] font-bold text-white" style={{ backgroundColor: nl.track.accent }}>{nid}</span>
                      {pick(nl.lesson.title, mode)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-ink/40 dark:text-stone-500">{t("graphHint", mode)}</p>
        )}
      </div>
    </div>
  );
}
