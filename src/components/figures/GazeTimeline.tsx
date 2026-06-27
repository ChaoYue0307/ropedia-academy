import { useEffect, useRef, useState } from "react";
import { FigureFrame } from "./FigureFrame";
import { useStore } from "../../lib/store";
import type { Bilingual } from "../../lib/types";
import { pick } from "../../lib/i18n";

interface Seg { label: Bilingual; s: number; e: number }
const GAZE: Seg[] = [
  { label: { en: "knife", zh: "刀" }, s: 0.1, e: 0.32 },
  { label: { en: "board", zh: "砧板" }, s: 0.44, e: 0.64 },
  { label: { en: "plate", zh: "盘子" }, s: 0.74, e: 0.94 },
];
const HAND: Seg[] = [
  { label: { en: "reach knife", zh: "伸向刀" }, s: 0.3, e: 0.46 },
  { label: { en: "cut", zh: "切" }, s: 0.6, e: 0.8 },
  { label: { en: "plate", zh: "装盘" }, s: 0.86, e: 0.99 },
];
const X0 = 30;
const W = 300;
const tx = (t: number) => X0 + t * W;

export function GazeTimeline() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [t, setT] = useState(0.22);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number>();

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const nx = prev + dt * 0.25;
        if (nx >= 1) { setPlaying(false); return 1; }
        return nx;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing]);

  const curGaze = GAZE.find((g) => t >= g.s && t <= g.e);
  const curHand = HAND.find((h) => t >= h.s && t <= h.e);

  const track = (segs: Seg[], y: number, color: string, cur?: Seg) =>
    segs.map((seg, i) => (
      <g key={i}>
        <rect x={tx(seg.s)} y={y} width={(seg.e - seg.s) * W} height={20} rx={5} fill={color} opacity={cur === seg ? 1 : 0.45} />
        <text x={tx(seg.s) + (seg.e - seg.s) * W / 2} y={y + 14} textAnchor="middle" fontSize="8.5" fill="#fff">
          {pick(seg.label, mode)}
        </text>
      </g>
    ));

  return (
    <FigureFrame
      title={{ en: "Gaze leads action", zh: "注视领先动作" }}
      caption={{
        en: "Play the clip: the eye fixates the next object a beat before the hand reaches it (the lead-time arrows). Gaze is a near-direct readout of intent — which is exactly why it's one of the strongest cues for action anticipation.",
        zh: "播放片段：眼睛在手伸过去之前的一拍，就已注视下一个物体（领先时间箭头）。注视几乎是意图的直接读数——这正是它成为动作预判最强线索之一的原因。",
      }}
      onReset={() => { setT(0.22); setPlaying(false); }}
    >
      <svg viewBox="0 0 360 150" className="w-full">
        <text x={X0} y={22} fontSize="9" fill="#6a5ef0">{zh ? "注视" : "gaze"}</text>
        {track(GAZE, 28, "#6a5ef0", curGaze)}
        <text x={X0} y={78} fontSize="9" fill="#e0598b">{zh ? "手" : "hand"}</text>
        {track(HAND, 84, "#e0598b", curHand)}
        {/* lead arrows from each gaze onset to the matching hand onset */}
        {GAZE.map((g, i) => HAND[i] && (
          <line key={i} x1={tx(g.s)} y1={50} x2={tx(HAND[i].s)} y2={82} stroke="#9b95c9" strokeWidth={1} strokeDasharray="2 2" markerEnd="url(#ar)" />
        ))}
        <defs>
          <marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 Z" fill="#9b95c9" /></marker>
        </defs>
        {/* playhead */}
        <line x1={tx(t)} y1={20} x2={tx(t)} y2={114} stroke="#1d9e75" strokeWidth={1.5} />
        <line x1={X0} y1={114} x2={X0 + W} y2={114} stroke="currentColor" strokeWidth={0.5} className="text-stone-300 dark:text-white/15" />
        <text x={X0} y={140} fontSize="9" fill="currentColor" className="text-ink/60 dark:text-stone-300">
          {zh ? "注视" : "gaze"}: {curGaze ? pick(curGaze.label, mode) : "—"} · {zh ? "手" : "hand"}: {curHand ? pick(curHand.label, mode) : "—"}
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-3">
        <button onClick={() => { if (t >= 1) setT(0); setPlaying((p) => !p); }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700">
          {playing ? (zh ? "暂停" : "pause") : zh ? "播放 ▶" : "play ▶"}
        </button>
        <input type="range" min={0} max={1} step={0.005} value={t} onChange={(e) => { setPlaying(false); setT(parseFloat(e.target.value)); }} className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-200 accent-brand-600 dark:bg-white/10" />
      </div>
    </FigureFrame>
  );
}
