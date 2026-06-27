import { useMemo, useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const N = 60;
const CX = 180;
const CY = 100;
const R = 66;

export function SlamLoop() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [drift, setDrift] = useState(1.2);
  const [closed, setClosed] = useState(false);

  const { gt, shown, gapMag, fit } = useMemo(() => {
    const gt: [number, number][] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / (N - 1)) * 2 * Math.PI - Math.PI / 2;
      gt.push([CX + R * Math.cos(a), CY + R * Math.sin(a)]);
    }
    const est: [number, number][] = [gt[0]];
    let theta = 0;
    for (let i = 0; i < N - 1; i++) {
      const dx = gt[i + 1][0] - gt[i][0];
      const dy = gt[i + 1][1] - gt[i][1];
      theta += (drift * Math.PI) / 180;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const last = est[est.length - 1];
      est.push([last[0] + dx * c - dy * s, last[1] + dx * s + dy * c]);
    }
    const gap: [number, number] = [est[N - 1][0] - gt[0][0], est[N - 1][1] - gt[0][1]];
    const corr: [number, number][] = est.map((p, i) => [p[0] - (i / (N - 1)) * gap[0], p[1] - (i / (N - 1)) * gap[1]]);
    const shown = closed ? corr : est;

    // fit every drawn point into a safe box so nothing leaves the frame
    const all = [...gt, ...shown];
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const bw = Math.max(1, maxX - minX), bh = Math.max(1, maxY - minY);
    const TW = 288, TH = 150, TX = 36, TY = 22;
    const s = Math.min(TW / bw, TH / bh, 1.25);
    const offX = TX + (TW - bw * s) / 2 - minX * s;
    const offY = TY + (TH - bh * s) / 2 - minY * s;
    const fit = `translate(${offX.toFixed(2)} ${offY.toFixed(2)}) scale(${s.toFixed(3)})`;
    return { gt, shown, gapMag: Math.hypot(gap[0], gap[1]), fit };
  }, [drift, closed]);

  const toPath = (pts: [number, number][]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <FigureFrame
      title={{ en: "SLAM drift & loop closure", zh: "SLAM 漂移与回环" }}
      caption={{
        en: "Visual odometry integrates noisy step-to-step motion, so small errors accumulate without bound — the estimated loop (coral) never returns to start. Loop closure adds a constraint that redistributes the gap, snapping the trajectory back to global consistency (violet).",
        zh: "视觉里程计逐帧累积含噪运动，小误差无界累加——估计轨迹（橙）回不到起点。回环检测加入约束，把闭合误差重新分配，将轨迹拉回全局一致（紫）。",
      }}
      onReset={() => {
        setDrift(1.2);
        setClosed(false);
      }}
    >
      <svg viewBox="0 0 360 196" className="w-full">
        <g transform={fit}>
          <path d={toPath(gt)} fill="none" stroke="#1d9e75" strokeWidth={2} vectorEffect="non-scaling-stroke" opacity={0.85} />
          <path d={toPath(shown)} fill="none" stroke={closed ? "#6a5ef0" : "#d85a30"} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <circle cx={gt[0][0]} cy={gt[0][1]} r={4} fill="#1d9e75" vectorEffect="non-scaling-stroke" />
        </g>
        <text x={20} y={188} fontSize="9" fill="#1d9e75">
          ● {zh ? "真实轨迹" : "ground truth"}
        </text>
        <text x={188} y={188} fontSize="9" fill={closed ? "#6a5ef0" : "#d85a30"}>
          ● {closed ? (zh ? "回环校正后" : "after loop closure") : `${zh ? "漂移，闭合误差 " : "drift, gap "}${gapMag.toFixed(0)}px`}
        </text>
      </svg>
      <div className="mt-2 space-y-2.5">
        <Slider label={zh ? "每步漂移" : "drift / step"} value={drift} min={0} max={3} step={0.1} onChange={(v) => { setDrift(v); setClosed(false); }} format={(v) => `${v.toFixed(1)}°`} />
        <button
          onClick={() => setClosed((c) => !c)}
          className={
            "w-full rounded-lg px-3 py-1.5 text-xs font-medium transition " +
            (closed ? "border border-stone-200 text-ink/70 dark:border-white/10 dark:text-stone-300" : "bg-brand-600 text-white hover:bg-brand-700")
          }
        >
          {closed ? (zh ? "撤销回环" : "undo loop closure") : zh ? "闭合回环 ↺" : "close the loop ↺"}
        </button>
      </div>
    </FigureFrame>
  );
}
