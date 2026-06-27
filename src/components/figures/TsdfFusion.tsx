import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const TRUE_X = 205;

export function TsdfFusion() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [noise, setNoise] = useState(34);
  const [frames, setFrames] = useState<number[]>([]);

  const addFrames = (k: number) => {
    const next = [...frames];
    for (let i = 0; i < k; i++) {
      // box-muller-ish noise
      const g = (Math.random() + Math.random() + Math.random() - 1.5) * noise;
      next.push(TRUE_X + g);
    }
    setFrames(next);
  };
  const estimate = frames.length ? frames.reduce((a, b) => a + b, 0) / frames.length : null;
  const error = estimate != null ? Math.abs(estimate - TRUE_X) : null;

  return (
    <FigureFrame
      title={{ en: "TSDF fusion — multi-frame denoising", zh: "TSDF 融合 — 多帧去噪" }}
      caption={{
        en: "Each depth frame is noisy (orange ticks). Weighted-averaging signed distances across frames cancels independent noise — the fused surface (violet) converges to the true surface (green) as ~1/√N. The shaded band is the truncation region.",
        zh: "每个深度帧都有噪声（橙色刻度）。跨帧对符号距离做加权平均会抵消独立噪声——融合表面（紫）以约 1/√N 收敛到真实表面（绿）。阴影带是截断区域。",
      }}
      onReset={() => setFrames([])}
    >
      <svg viewBox="0 0 360 150" className="w-full">
        {/* truncation band around estimate (or true if none) */}
        <rect x={(estimate ?? TRUE_X) - 26} y={20} width={52} height={92} fill="#6a5ef0" opacity={0.07} />
        {/* true surface */}
        <line x1={TRUE_X} y1={18} x2={TRUE_X} y2={114} stroke="#1d9e75" strokeWidth={2} />
        <text x={TRUE_X} y={12} textAnchor="middle" fontSize="8" fill="#1d9e75">
          {zh ? "真实表面" : "true surface"}
        </text>
        {/* measurements */}
        {frames.map((f, i) => (
          <line key={i} x1={f} y1={28 + ((i * 7) % 78)} x2={f} y2={34 + ((i * 7) % 78)} stroke="#d85a30" strokeWidth={1.4} opacity={0.6} />
        ))}
        {/* fused estimate */}
        {estimate != null && (
          <>
            <line x1={estimate} y1={20} x2={estimate} y2={112} stroke="#6a5ef0" strokeWidth={2.5} />
            <text x={estimate} y={126} textAnchor="middle" fontSize="8" fill="#6a5ef0">
              {zh ? "融合估计" : "fused"}
            </text>
          </>
        )}
        {/* axis */}
        <line x1={30} y1={114} x2={330} y2={114} stroke="currentColor" strokeWidth={0.5} className="text-stone-300 dark:text-white/15" />
        <text x={30} y={146} fontSize="9" fill="currentColor" className="text-ink/55 dark:text-stone-400">
          {zh ? "帧数" : "frames"}: {frames.length}
        </text>
        {error != null && (
          <text x={330} y={146} textAnchor="end" fontSize="9" fill="currentColor" className="text-ink/55 dark:text-stone-400">
            {zh ? "误差" : "error"}: {error.toFixed(1)} px
          </text>
        )}
      </svg>
      <div className="mt-2 space-y-2.5">
        <Slider label={zh ? "传感器噪声" : "sensor noise"} value={noise} min={8} max={55} onChange={setNoise} format={(v) => v.toFixed(0)} />
        <div className="flex gap-2">
          <button
            onClick={() => addFrames(1)}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-stone-300"
          >
            +1 {zh ? "帧" : "frame"}
          </button>
          <button
            onClick={() => addFrames(20)}
            className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
          >
            +20 {zh ? "帧" : "frames"}
          </button>
        </div>
      </div>
    </FigureFrame>
  );
}
