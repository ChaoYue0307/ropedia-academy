import { useMemo } from "react";
import { useStore } from "../lib/store";
import { t } from "../lib/i18n";

const DAY = 24 * 60 * 60 * 1000;

export function ReviewForecast() {
  const mode = useStore((s) => s.lang);
  const srs = useStore((s) => s.srs);
  const reviewing = useStore((s) => s.reviewing);

  const { buckets, max, hasData } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    const buckets = new Array(7).fill(0);
    let hasData = false;
    reviewing.forEach((id) => {
      const card = srs[id];
      if (!card) return;
      hasData = true;
      let off = Math.floor((card.due - startMs) / DAY);
      if (off < 0) off = 0;
      if (off <= 6) buckets[off] += 1;
    });
    return { buckets, max: Math.max(1, ...buckets), hasData };
  }, [srs, reviewing]);

  const labels = useMemo(() => {
    const start = new Date();
    return new Array(7).fill(0).map((_, i) => {
      if (i === 0) return t("todayLabel", mode);
      const d = new Date(start.getTime() + i * DAY);
      return d.toLocaleDateString(mode === "zh" ? "zh-CN" : "en-US", { weekday: "short" });
    });
  }, [mode]);

  if (!hasData) return null;

  const W = 320;
  const H = 92;
  const bw = W / 7;

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-4 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">{t("forecastTitle", mode)}</h2>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full">
        {buckets.map((c, i) => {
          const h = (c / max) * H;
          return (
            <g key={i}>
              <rect x={i * bw + 6} y={H - h} width={bw - 12} height={h} rx={4} fill={i === 0 ? "#6a5ef0" : "#a3a8ff"} opacity={i === 0 ? 1 : 0.7} />
              {c > 0 && (
                <text x={i * bw + bw / 2} y={H - h - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" className="text-ink/70 dark:text-stone-300">
                  {c}
                </text>
              )}
              <text x={i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="9" fill="currentColor" className="text-ink/45 dark:text-stone-500">
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
