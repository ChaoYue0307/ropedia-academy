import { useMemo, useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const GW = 30;
const GH = 18;
const CELL = 11;

export function SdfField() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [radius, setRadius] = useState(4);
  const [iso, setIso] = useState(0);

  const cells = useMemo(() => {
    const c1 = { x: 12, y: 9 };
    const c2 = { x: 19, y: 9 };
    const out: { x: number; y: number; sdf: number }[] = [];
    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const d1 = Math.hypot(gx - c1.x, gy - c1.y) - radius;
        const d2 = Math.hypot(gx - c2.x, gy - c2.y) - radius;
        out.push({ x: gx, y: gy, sdf: Math.min(d1, d2) - iso });
      }
    }
    return out;
  }, [radius, iso]);

  const colorFor = (sdf: number) => {
    if (Math.abs(sdf) < 0.6) return "#6a5ef0"; // surface band (zero level-set)
    if (sdf < 0) return `rgba(216,90,48,${Math.min(0.5, 0.12 + -sdf * 0.06)})`; // inside
    return `rgba(55,138,221,${Math.min(0.4, 0.06 + sdf * 0.04)})`; // outside
  };

  return (
    <FigureFrame
      title={{ en: "Signed distance field", zh: "符号距离场" }}
      caption={{
        en: "Each cell stores its signed distance to the surface — negative inside (coral), positive outside (blue). The surface is just the zero level-set (violet band). Shift the iso-level to dilate/erode the shape: the same field encodes a whole family of surfaces, and TSDF (Track D) reuses exactly this.",
        zh: "每个单元存储它到表面的有符号距离——内部为负（珊瑚），外部为正（蓝）。表面就是零等值面（紫带）。移动等值水平可膨胀/腐蚀形状：同一个场编码了一整族表面，Track D 的 TSDF 正是复用了这一点。",
      }}
      onReset={() => {
        setRadius(4);
        setIso(0);
      }}
    >
      <svg viewBox={`0 0 ${GW * CELL} ${GH * CELL}`} className="w-full rounded-lg">
        {cells.map((c, i) => (
          <rect key={i} x={c.x * CELL} y={c.y * CELL} width={CELL} height={CELL} fill={colorFor(c.sdf)} />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink/55 dark:text-stone-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#6a5ef0" }} /> {zh ? "表面 (sdf=0)" : "surface (sdf=0)"}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "rgba(216,90,48,0.5)" }} /> {zh ? "内部 (−)" : "inside (−)"}</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "rgba(55,138,221,0.4)" }} /> {zh ? "外部 (+)" : "outside (+)"}</span>
      </div>
      <div className="mt-2 space-y-2">
        <Slider label={zh ? "半径" : "radius"} value={radius} min={2} max={6} step={0.5} onChange={setRadius} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "等值水平" : "iso-level"} value={iso} min={-3} max={3} step={0.5} onChange={setIso} format={(v) => v.toFixed(1)} />
      </div>
    </FigureFrame>
  );
}
