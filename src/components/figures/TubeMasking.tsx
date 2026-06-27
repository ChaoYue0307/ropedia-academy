import { useMemo, useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const ROWS = 8;
const COLS = 8;
// fixed pseudo-random orders so masking is stable across renders
const rowOrder = [3, 6, 0, 5, 1, 7, 2, 4];
const cellOrder = Array.from({ length: ROWS * COLS }, (_, i) => (i * 37 + 11) % (ROWS * COLS));

export function TubeMasking() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [ratio, setRatio] = useState(0.9);
  const [tube, setTube] = useState(true);

  const masked = useMemo(() => {
    const set = new Set<number>();
    if (tube) {
      const k = Math.round(ratio * ROWS);
      for (let i = 0; i < k; i++) for (let c = 0; c < COLS; c++) set.add(rowOrder[i] * COLS + c);
    } else {
      const k = Math.round(ratio * ROWS * COLS);
      for (let i = 0; i < k; i++) set.add(cellOrder[i]);
    }
    return set;
  }, [ratio, tube]);

  const cell = 26;
  const gap = 3;
  const W = COLS * (cell + gap);

  return (
    <FigureFrame
      title={{ en: "VideoMAE masking", zh: "VideoMAE 掩码" }}
      caption={{
        en: "Columns are time, rows are spatial patches. Tube masking hides the same patch across all frames, so the model can't copy a missing patch from a neighbouring frame — forcing it to learn real spatio-temporal structure. Video's heavy redundancy is why ~90% masking is needed.",
        zh: "列是时间，行是空间块。管状掩码在所有帧上隐藏同一块，使模型无法从相邻帧复制缺失块——迫使它学习真正的时空结构。视频高度冗余，所以需要约 90% 的掩码。",
      }}
      onReset={() => {
        setRatio(0.9);
        setTube(true);
      }}
    >
      <svg viewBox={`0 0 ${W + 30} ${ROWS * (cell + gap) + 24}`} className="mx-auto block max-w-[300px]">
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const idx = r * COLS + c;
            const isMasked = masked.has(idx);
            return (
              <rect
                key={idx}
                x={28 + c * (cell + gap)}
                y={2 + r * (cell + gap)}
                width={cell}
                height={cell}
                rx={3}
                fill={isMasked ? "transparent" : `hsl(${250 - r * 6} 60% ${60 - c * 2}%)`}
                stroke={isMasked ? "currentColor" : "none"}
                strokeWidth={isMasked ? 1 : 0}
                strokeDasharray={isMasked ? "2 2" : undefined}
                className={isMasked ? "text-stone-300 dark:text-white/15" : ""}
              />
            );
          }),
        )}
        <text x={2} y={ROWS * (cell + gap) / 2} fontSize="8" fill="currentColor" transform={`rotate(-90 8 ${ROWS * (cell + gap) / 2})`} className="text-ink/50 dark:text-stone-400">
          {zh ? "空间块" : "space"}
        </text>
        <text x={28} y={ROWS * (cell + gap) + 18} fontSize="8" fill="currentColor" className="text-ink/50 dark:text-stone-400">
          {zh ? "时间 →" : "time →"}
        </text>
      </svg>
      <div className="mt-2 space-y-2.5">
        <Slider label={zh ? "掩码比例" : "mask ratio"} value={ratio} min={0} max={0.95} step={0.05} onChange={setRatio} format={(v) => `${Math.round(v * 100)}%`} />
        <div className="flex rounded-lg border border-stone-200 p-0.5 text-xs dark:border-white/10">
          {[
            { v: true, l: zh ? "管状掩码" : "tube" },
            { v: false, l: zh ? "随机掩码" : "random" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => setTube(o.v)}
              className={
                "flex-1 rounded-md px-2 py-1 font-medium transition " +
                (tube === o.v ? "bg-brand-600 text-white" : "text-ink/60 dark:text-stone-400")
              }
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
    </FigureFrame>
  );
}
