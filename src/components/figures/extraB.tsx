import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

// ── B2 · Triangulation: two rays intersect at the 3D point ───────────────────
export function Triangulation() {
  const zh = useStore((s) => s.lang) === "zh";
  const [px, setPx] = useState(190);
  const [depth, setDepth] = useState(70);
  const C1 = { x: 80, y: 172 }, C2 = { x: 300, y: 172 };
  const P = { x: px, y: 178 - depth };
  const ext = (C: { x: number; y: number }) => {
    const dx = P.x - C.x, dy = P.y - C.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    let t = 240; // clip the ray to the frame so it never leaves the figure
    if (ux > 0) t = Math.min(t, (354 - C.x) / ux); else if (ux < 0) t = Math.min(t, (6 - C.x) / ux);
    if (uy > 0) t = Math.min(t, (190 - C.y) / uy); else if (uy < 0) t = Math.min(t, (6 - C.y) / uy);
    return { x: C.x + ux * t, y: C.y + uy * t };
  };
  const proj = (C: { x: number; y: number }) => {
    const planeY = C.y - 30, dx = P.x - C.x, dy = P.y - C.y;
    const x = C.x + (dx * (planeY - C.y)) / dy;
    return { x: Math.max(C.x - 26, Math.min(C.x + 26, x)), y: planeY }; // keep on the sensor
  };
  return (
    <FigureFrame
      title={{ en: "Triangulation", zh: "三角测量" }}
      caption={{
        en: "Two calibrated cameras each see the point along a ray; their intersection recovers its 3D position. Move the point — both image projections (■) update, and the rays still meet at P. A wider baseline pins depth more precisely.",
        zh: "两台已标定相机各沿一条射线看到该点；它们的交点恢复其 3D 位置。移动点——两个像投影（■）随之更新，射线仍交于 P。基线越宽，深度越精确。",
      }}
      onReset={() => { setPx(190); setDepth(70); }}
    >
      <svg viewBox="0 0 360 196" className="w-full">
        {[C1, C2].map((C, i) => {
          const e = ext(C), pr = proj(C);
          return (
            <g key={i}>
              <line x1={C.x} y1={C.y} x2={e.x} y2={e.y} stroke="#bdb8e8" strokeWidth={1.2} strokeDasharray="3 3" />
              <line x1={C.x - 26} y1={C.y - 30} x2={C.x + 26} y2={C.y - 30} stroke="#1d9e75" strokeWidth={2} />
              <rect x={pr.x - 3} y={pr.y - 3} width={6} height={6} fill="#1d9e75" />
              <path d={`M${C.x - 9} ${C.y + 8} L${C.x + 9} ${C.y + 8} L${C.x} ${C.y - 6} Z`} fill="currentColor" className="text-ink dark:text-stone-200" />
            </g>
          );
        })}
        <circle cx={P.x} cy={P.y} r={7} fill="#e0598b" />
        <text x={P.x + 11} y={P.y + 3} fontSize="11" fontWeight="600" fill="#e0598b">P</text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "点 x" : "point x"} value={px} min={70} max={310} onChange={setPx} />
        <Slider label={zh ? "点深度" : "point depth"} value={depth} min={30} max={130} onChange={setDepth} />
      </div>
    </FigureFrame>
  );
}

// ── B3 · Bundle adjustment minimizes total reprojection error ────────────────
const PTS = Array.from({ length: 7 }, (_, i) => ({
  x: 70 + i * 38, y: 70 + ((i * 53) % 70), ox: ((i * 31) % 40) - 20, oy: ((i * 17) % 36) - 18,
}));
export function BundleAdjust() {
  const zh = useStore((s) => s.lang) === "zh";
  const [prog, setProg] = useState(0);
  const k = 1 - prog;
  const err = PTS.reduce((s, p) => s + Math.hypot(p.ox, p.oy) * k, 0);
  return (
    <FigureFrame
      title={{ en: "Bundle adjustment", zh: "光束法平差" }}
      caption={{
        en: "BA jointly nudges all cameras and 3D points to minimize the total reprojection error — the gap between each observed pixel (○) and where the estimate projects (●). Drag the optimization forward and watch the residuals (red) collapse.",
        zh: "BA 联合微调所有相机与 3D 点，以最小化总重投影误差——每个观测像素（○）与估计投影位置（●）之间的差距。拖动优化进程，看残差（红）收缩。",
      }}
      onReset={() => setProg(0)}
    >
      <svg viewBox="0 0 360 184" className="w-full">
        {PTS.map((p, i) => (
          <g key={i}>
            <line x1={p.x + p.ox * k} y1={p.y + p.oy * k} x2={p.x} y2={p.y} stroke="#ef4444" strokeWidth={1.4} />
            <circle cx={p.x} cy={p.y} r={5} fill="none" stroke="#6a5ef0" strokeWidth={1.6} />
            <circle cx={p.x + p.ox * k} cy={p.y + p.oy * k} r={3.5} fill="#1d9e75" />
          </g>
        ))}
        <text x={20} y={172} fontSize="10" fill="#9ca3af">○ {zh ? "观测" : "observed"}</text>
        <text x={130} y={172} fontSize="10" fill="#1d9e75">● {zh ? "估计投影" : "estimate"}</text>
        <text x={340} y={20} textAnchor="end" fontSize="11" fontWeight="600" fill={err < 30 ? "#1d9e75" : "#ef4444"}>
          {zh ? "总误差" : "total error"} = {err.toFixed(0)}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "优化进程" : "optimization"} value={prog} min={0} max={1} step={0.02} onChange={setProg} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
    </FigureFrame>
  );
}

// ── B6 · Multi-resolution hash grid (Instant-NGP) ────────────────────────────
const PALETTE = ["#6a5ef0", "#1d9e75", "#e0598b", "#378add", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];
export function HashGrid() {
  const zh = useStore((s) => s.lang) === "zh";
  const [lvl, setLvl] = useState(2);
  const [tbl, setTbl] = useState(16);
  const res = [4, 8, 12, 20][lvl];
  const SZ = 168, X0 = 18, Y0 = 8, cell = SZ / res;
  const counts: Record<number, number> = {};
  const cells: { i: number; j: number; h: number }[] = [];
  for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
    const h = ((i * 2654435761) ^ (j * 805459861)) % tbl;
    counts[h] = (counts[h] || 0) + 1;
    cells.push({ i, j, h });
  }
  const collisions = Object.values(counts).filter((c) => c > 1).length;
  return (
    <FigureFrame
      title={{ en: "Multi-resolution hash grid", zh: "多分辨率哈希网格" }}
      caption={{
        en: "Instant-NGP stores learnable features in hashed grids across resolutions, read by a tiny MLP — so training drops from days to seconds. Cells sharing a colour collide to the same table slot; a small table causes more collisions, which the MLP disambiguates.",
        zh: "Instant-NGP 把可学习特征存进跨分辨率的哈希网格，由一个极小 MLP 读取——训练从数天降到数秒。同色单元映射到同一表槽（冲突）；表越小冲突越多，由 MLP 消歧。",
      }}
      onReset={() => { setLvl(2); setTbl(16); }}
    >
      <svg viewBox="0 0 360 188" className="w-full">
        {cells.map((c, k) => (
          <rect key={k} x={X0 + c.i * cell} y={Y0 + c.j * cell} width={cell - 1} height={cell - 1}
            fill={PALETTE[c.h % PALETTE.length]} fillOpacity={0.85} rx={1.5} />
        ))}
        <text x={X0 + SZ + 16} y={40} fontSize="11" fill="currentColor" className="text-ink/70 dark:text-stone-300">{zh ? "分辨率" : "resolution"} = {res}²</text>
        <text x={X0 + SZ + 16} y={64} fontSize="11" fill="currentColor" className="text-ink/70 dark:text-stone-300">{zh ? "表大小" : "table"} = {tbl}</text>
        <text x={X0 + SZ + 16} y={88} fontSize="11" fontWeight="600" fill={collisions > 0 ? "#f59e0b" : "#1d9e75"}>
          {collisions} {zh ? "处冲突" : "collisions"}
        </text>
      </svg>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-ink/60 dark:text-stone-400">{zh ? "层级" : "level"}</span>
        {[0, 1, 2, 3].map((l) => (
          <button key={l} onClick={() => setLvl(l)}
            className={"rounded-md px-2.5 py-1 text-xs font-medium transition " + (lvl === l ? "bg-brand-600 text-white" : "border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400")}>
            {[4, 8, 12, 20][l]}²
          </button>
        ))}
      </div>
      <Slider label={zh ? "表大小 T" : "table size T"} value={tbl} min={6} max={64} onChange={(v) => setTbl(Math.round(v))} />
    </FigureFrame>
  );
}

// ── B8 · 4D = canonical model + deformation field over time ───────────────────
export function Deformation4D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.3);
  const N = 13, X0 = 30, W = 300, baseY = 110;
  const pts = Array.from({ length: N }, (_, i) => {
    const x = X0 + (i / (N - 1)) * W;
    const dy = Math.sin((i / (N - 1)) * Math.PI * 2 + t * Math.PI * 2) * 34 * Math.sin(t * Math.PI);
    return { x, cy: baseY, dy };
  });
  return (
    <FigureFrame
      title={{ en: "4D: canonical + deformation", zh: "四维：标准模型 + 形变" }}
      caption={{
        en: "A dynamic scene is one shared canonical model (rest state, grey) plus a deformation field that warps it at each time t (arrows → coloured shape). Appearance is shared across time; only the motion varies. Scrub time.",
        zh: "动态场景 = 一个共享的标准模型（静止态，灰）+ 一个在每个时刻 t 扭曲它的形变场（箭头 → 彩色形状）。外观跨时间共享，只有运动在变。拖动时间。",
      }}
      onReset={() => setT(0.3)}
    >
      <svg viewBox="0 0 360 184" className="w-full">
        <polyline points={pts.map((p) => `${p.x},${p.cy}`).join(" ")} fill="none" stroke="#cbd5e1" strokeWidth={2.5} />
        <text x={X0} y={baseY - 44} fontSize="9" fill="#9ca3af">{zh ? "标准模型 (静止)" : "canonical (rest)"}</text>
        {pts.map((p, i) => (
          <line key={i} x1={p.x} y1={p.cy} x2={p.x} y2={p.cy + p.dy} stroke="#378add" strokeOpacity={0.5} strokeWidth={1.2} />
        ))}
        <polyline points={pts.map((p) => `${p.x},${p.cy + p.dy}`).join(" ")} fill="none" stroke="#1d9e75" strokeWidth={2.6} />
        <text x={X0} y={baseY + 60} fontSize="9" fill="#1d9e75">{zh ? "时刻 t 的形状" : "shape at time t"}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "时间 t" : "time t"} value={t} min={0} max={1} step={0.02} onChange={setT} format={(v) => v.toFixed(2)} />
      </div>
    </FigureFrame>
  );
}

// ── B9 · NeRF reproduction: views & density regularization vs floaters ────────
const FLOATERS = [{ x: 90, y: 60, r: 13 }, { x: 250, y: 70, r: 10 }, { x: 150, y: 130, r: 11 }, { x: 280, y: 140, r: 9 }];
export function NerfFloaters() {
  const zh = useStore((s) => s.lang) === "zh";
  const [views, setViews] = useState(4);
  const [reg, setReg] = useState(false);
  const floaterOp = Math.max(0, (12 - views) / 10) * (reg ? 0.25 : 1);
  return (
    <FigureFrame
      title={{ en: "NeRF floaters", zh: "NeRF 漂浮物" }}
      caption={{
        en: "‘Floaters’ are spurious semi-transparent blobs the optimizer parks in empty space when density is under-constrained — too few views. Add views, or switch on density (sparsity) regularization, to clear them while the real object stays.",
        zh: "「漂浮物」是密度欠约束时优化器停在空白处的虚假半透明团块——视角太少所致。增加视角，或开启密度（稀疏）正则，即可清除它们，而真实物体保留。",
      }}
      onReset={() => { setViews(4); setReg(false); }}
    >
      <svg viewBox="0 0 360 178" className="w-full">
        <rect x={10} y={10} width={340} height={158} rx={10} fill="currentColor" className="text-stone-100 dark:text-white/5" />
        {/* the real reconstructed object */}
        <circle cx={185} cy={92} r={40} fill="#1d9e75" fillOpacity={0.85} />
        <text x={185} y={96} textAnchor="middle" fontSize="10" fill="#fff">{zh ? "物体" : "object"}</text>
        {FLOATERS.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#ef4444" fillOpacity={floaterOp} />
        ))}
        <text x={24} y={158} fontSize="10" fontWeight="600" fill={floaterOp < 0.1 ? "#1d9e75" : "#ef4444"}>
          {floaterOp < 0.1 ? (zh ? "干净重建 ✓" : "clean ✓") : (zh ? "出现漂浮物" : "floaters present")}
        </text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "视角数" : "# views"} value={views} min={2} max={12} onChange={(v) => setViews(Math.round(v))} />
        <label className="flex items-center gap-2 text-xs font-medium text-ink/70 dark:text-stone-300">
          <input type="checkbox" checked={reg} onChange={(e) => setReg(e.target.checked)} className="accent-brand-600" />
          {zh ? "密度正则化" : "density regularization"}
        </label>
      </div>
    </FigureFrame>
  );
}
