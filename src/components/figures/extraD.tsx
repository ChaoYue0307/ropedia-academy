import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

// ── D2 · SLAM tracking = PnP (pose from 3D↔2D) ───────────────────────────────
const LMK = [{ x: 70, y: 34 }, { x: 130, y: 56 }, { x: 195, y: 30 }, { x: 255, y: 52 }, { x: 305, y: 38 }];
export function PnpTracking() {
  const zh = useStore((s) => s.lang) === "zh";
  const trueX = 185;
  const [estX, setEstX] = useState(120);
  const camY = 165, plane = 118;
  const px = (cx: number, L: { x: number; y: number }) => cx + ((L.x - cx) * (plane - camY)) / (L.y - camY);
  const err = LMK.reduce((s, L) => s + Math.abs(px(trueX, L) - px(estX, L)), 0);
  return (
    <FigureFrame
      title={{ en: "Tracking = PnP", zh: "跟踪 = PnP" }}
      caption={{
        en: "SLAM is Track B's geometry run online. Each frame, tracking the camera is PnP: find the pose whose reprojection of known map points (●) matches the observed detections (○). Slide the pose estimate until the residuals vanish.",
        zh: "SLAM 就是 Track B 的几何在线运行。每一帧，跟踪相机即 PnP：找到使已知地图点（●）的重投影与观测检测（○）相符的位姿。滑动位姿估计，直到残差消失。",
      }}
      onReset={() => setEstX(120)}
    >
      <svg viewBox="0 0 360 188" className="w-full">
        <line x1={20} y1={plane} x2={340} y2={plane} stroke="#cbd5e1" strokeWidth={1.5} />
        <text x={24} y={plane - 5} fontSize="8" fill="#9ca3af">{zh ? "像平面" : "image plane"}</text>
        {LMK.map((L, i) => {
          const o = px(trueX, L), p = px(estX, L);
          return (
            <g key={i}>
              <line x1={estX} y1={camY} x2={L.x} y2={L.y} stroke="#bdb8e8" strokeWidth={0.8} strokeDasharray="2 2" />
              <circle cx={L.x} cy={L.y} r={4} fill="#378add" />
              <line x1={o} y1={plane} x2={p} y2={plane} stroke="#ef4444" strokeWidth={2} />
              <circle cx={o} cy={plane} r={3.5} fill="none" stroke="#9ca3af" strokeWidth={1.4} />
              <circle cx={p} cy={plane} r={2.6} fill="#1d9e75" />
            </g>
          );
        })}
        <path d={`M${estX - 10} ${camY + 8} L${estX + 10} ${camY + 8} L${estX} ${camY - 8} Z`} fill="#6a5ef0" />
        <text x={340} y={20} textAnchor="end" fontSize="11" fontWeight="600" fill={err < 12 ? "#1d9e75" : "#ef4444"}>
          {zh ? "重投影误差" : "reproj err"} = {err.toFixed(0)}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "位姿估计 x" : "pose estimate x"} value={estX} min={90} max={280} onChange={setEstX} />
      </div>
    </FigureFrame>
  );
}

// ── D4 · Semantic mapping: Bayesian multi-frame label fusion ─────────────────
const OBSV = [2, 1, 2, 2, 0, 2, 3, 2, 2, 1, 2, 2, 0, 2, 2, 2]; // noisy per-frame votes, true = 2
const CLS = [{ en: "floor", zh: "地面" }, { en: "wall", zh: "墙" }, { en: "chair", zh: "椅子" }, { en: "table", zh: "桌子" }];
export function SemanticFusion() {
  const zh = useStore((s) => s.lang) === "zh";
  const [n, setN] = useState(3);
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) counts[OBSV[i]]++;
  const probs = counts.map((c) => c / n);
  const arg = probs.indexOf(Math.max(...probs));
  const BASE = 120, X0 = 50, BW = 70;
  return (
    <FigureFrame
      title={{ en: "Bayesian label fusion", zh: "贝叶斯标签融合" }}
      caption={{
        en: "2D segmentation flickers frame to frame. Fusing labels into 3D as a per-element probability distribution — updated across many views — votes down the errors and converges on the true class. Add frames and watch the belief sharpen.",
        zh: "2D 分割逐帧闪烁。把标签作为每个元素的概率分布融合进 3D——跨多视角更新——可投票压制错误并收敛到真实类别。增加帧数，看信念变锐利。",
      }}
      onReset={() => setN(3)}
    >
      <svg viewBox="0 0 360 152" className="w-full">
        <line x1={30} y1={BASE} x2={340} y2={BASE} stroke="#cbd5e1" strokeWidth={1} />
        {probs.map((p, i) => {
          const h = p * 96, x = X0 + i * BW, isMax = i === arg;
          return (
            <g key={i}>
              <rect x={x} y={BASE - h} width={44} height={h} rx={3} fill={isMax ? "#1d9e75" : "#94a3b8"} />
              <text x={x + 22} y={BASE - h - 5} textAnchor="middle" fontSize="9" fill={isMax ? "#1d9e75" : "#9ca3af"}>{(p * 100).toFixed(0)}%</text>
              <text x={x + 22} y={BASE + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{zh ? CLS[i].zh : CLS[i].en}</text>
            </g>
          );
        })}
        <text x={30} y={18} fontSize="10" fontWeight="600" fill="#1d9e75">
          {zh ? `融合 ${n} 帧 → ${CLS[arg].zh}` : `fused ${n} frames → ${CLS[arg].en}`}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "帧数" : "# frames"} value={n} min={1} max={16} onChange={(v) => setN(Math.round(v))} />
      </div>
    </FigureFrame>
  );
}

// ── D6 · Object-centric vs space-centric maps ────────────────────────────────
export function MapParadigms() {
  const zh = useStore((s) => s.lang) === "zh";
  const [space, setSpace] = useState(true);
  const GX = 30, GY = 14, C = 9, R = 5, cell = 30;
  const wall = new Set(["3,1", "3,2", "3,3", "4,3", "5,3"]);
  return (
    <FigureFrame
      title={{ en: "Space-centric vs object-centric", zh: "空间中心 vs 物体中心" }}
      caption={{
        en: "Two ways to carve a scene. A space-centric map (occupancy/TSDF) tiles space — great for ‘where can I go / collide?’. An object-centric map (scene graph) organizes around things — great for ‘what is it & how do they relate?’. No single map does both, so mature systems keep both.",
        zh: "划分场景的两种方式。空间中心地图（占据/TSDF）平铺空间——擅长「我能去哪/会不会撞」。物体中心地图（场景图）围绕事物组织——擅长「它是什么、彼此如何关联」。没有单一地图能兼顾，故成熟系统两者都保留。",
      }}
    >
      <svg viewBox="0 0 360 190" className="w-full">
        {space ? (
          <g>
            {Array.from({ length: R }, (_, j) => Array.from({ length: C }, (_, i) => {
              const occ = wall.has(`${i},${j}`);
              return <rect key={`${i},${j}`} x={GX + i * cell} y={GY + j * cell} width={cell - 2} height={cell - 2} rx={2}
                fill={occ ? "#378add" : "#1d9e75"} fillOpacity={occ ? 0.85 : 0.14} />;
            }))}
            <circle cx={GX + 0.5 * cell} cy={GY + 4.5 * cell} r={7} fill="#e0598b" />
            <circle cx={GX + 8.5 * cell} cy={GY + 0.5 * cell} r={7} fill="#f59e0b" />
            <text x={GX} y={GY + R * cell + 16} fontSize="10" fill="#1d9e75">{zh ? "空间查询：能否到达？→ 路径规划" : "query: can I reach it? → free-space path"}</text>
          </g>
        ) : (
          <g fontSize="11">
            {[["kitchen", 180, 30], ["table", 180, 95], ["mug", 95, 150], ["kettle", 265, 150]].map(([n, x, y]) => (
              <g key={n as string}>
                <circle cx={x as number} cy={y as number} r={26} fill="#6a5ef0" fillOpacity={0.85} />
                <text x={x as number} y={(y as number) + 4} textAnchor="middle" fill="#fff" fontSize="10">{n as string}</text>
              </g>
            ))}
            <line x1={180} y1={56} x2={180} y2={69} stroke="#94a3b8" strokeWidth={1.5} /><text x={186} y={66} fill="#94a3b8">in</text>
            <line x1={120} y1={135} x2={158} y2={108} stroke="#94a3b8" strokeWidth={1.5} /><text x={120} y={122} fill="#94a3b8">on</text>
            <line x1={240} y1={135} x2={202} y2={108} stroke="#94a3b8" strokeWidth={1.5} /><text x={224} y={122} fill="#94a3b8">on</text>
            <text x={20} y={172} fontSize="10" fill="#6a5ef0">{zh ? "物体查询：杯子在厨房吗？→ 图可达" : "query: is the mug in the kitchen? → graph reachability"}</text>
          </g>
        )}
      </svg>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setSpace(true)} className={"rounded-md px-3 py-1.5 text-xs font-medium transition " + (space ? "bg-emerald-600 text-white" : "border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400")}>{zh ? "空间中心 (占据)" : "space-centric (occupancy)"}</button>
        <button onClick={() => setSpace(false)} className={"rounded-md px-3 py-1.5 text-xs font-medium transition " + (!space ? "bg-brand-600 text-white" : "border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400")}>{zh ? "物体中心 (图)" : "object-centric (graph)"}</button>
      </div>
    </FigureFrame>
  );
}

// ── D7 · Spatial reasoning needs a reference frame ───────────────────────────
export function ReferenceFrames() {
  const zh = useStore((s) => s.lang) === "zh";
  const [deg, setDeg] = useState(30);
  const a = (deg * Math.PI) / 180;
  const Cx = 165, Cy = 96, P = { x: 270, y: 96 };
  const front = { x: Math.cos(a), y: -Math.sin(a) };
  const rel = { x: P.x - Cx, y: P.y - Cy };
  const cross = front.x * rel.y - front.y * rel.x; // screen y-down
  const localLeft = cross > 0;
  return (
    <FigureFrame
      title={{ en: "‘Left of the chair’ — which frame?", zh: "「椅子左边」——哪个参照系？" }}
      caption={{
        en: "Spatial words depend on a reference frame. The point is fixed (east of the chair in the world), but ‘left/right of the chair’ flips as the chair turns — so a spatial reasoner must commit to a frame. Rotate the chair and watch the answer flip.",
        zh: "空间词依赖参照系。点是固定的（在世界中位于椅子东侧），但「椅子的左/右」会随椅子转动而翻转——所以空间推理器必须确定一个参照系。旋转椅子，观察答案翻转。",
      }}
      onReset={() => setDeg(30)}
    >
      <svg viewBox="0 0 360 184" className="w-full">
        <circle cx={Cx} cy={Cy} r={50} fill="none" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="3 3" />
        {/* chair */}
        <rect x={Cx - 13} y={Cy - 13} width={26} height={26} rx={5} fill="#8b5a2b" />
        <line x1={Cx} y1={Cy} x2={Cx + front.x * 46} y2={Cy + front.y * 46} stroke="#1d9e75" strokeWidth={3} markerEnd="url(#fa)" />
        <text x={Cx + front.x * 56} y={Cy + front.y * 56 + 3} textAnchor="middle" fontSize="8.5" fill="#1d9e75">{zh ? "前" : "front"}</text>
        <defs><marker id="fa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#1d9e75" /></marker></defs>
        <circle cx={P.x} cy={P.y} r={8} fill="#e0598b" />
        <text x={P.x + 12} y={P.y + 3} fontSize="10" fill="#e0598b">P</text>
        <text x={20} y={22} fontSize="10" fontWeight="600" fill="#6a5ef0">
          {zh ? `椅子参照系：P 在椅子的${localLeft ? "左" : "右"}侧` : `chair frame: P is to the chair's ${localLeft ? "left" : "right"}`}
        </text>
        <text x={20} y={172} fontSize="9.5" fill="#9ca3af">{zh ? "世界参照系：P 始终在东侧（不变）" : "world frame: P is always east (fixed)"}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "椅子朝向" : "chair orientation"} value={deg} min={0} max={360} onChange={setDeg} format={(v) => `${v}°`} />
      </div>
    </FigureFrame>
  );
}

// ── D8 · World model: plan by imagining rollouts ─────────────────────────────
const PLANS = [
  { pts: [[40, 150], [110, 120], [190, 80], [300, 64]], hitsObs: false },
  { pts: [[40, 150], [120, 150], [210, 130], [300, 64]], hitsObs: true },
  { pts: [[40, 150], [90, 100], [160, 150], [300, 64]], hitsObs: true },
  { pts: [[40, 150], [130, 96], [220, 72], [300, 64]], hitsObs: false },
];
const GOAL = { x: 300, y: 64 };
export function WorldModelRollout() {
  const zh = useStore((s) => s.lang) === "zh";
  const [hz, setHz] = useState(1);
  const ret = PLANS.map((p) => {
    const end = p.pts[p.pts.length - 1];
    return -Math.hypot(end[0] - GOAL.x, end[1] - GOAL.y) / 30 - (p.hitsObs ? 6 : 0);
  });
  const best = ret.indexOf(Math.max(...ret));
  const upTo = (pts: number[][]) => {
    const last = 1 + hz * (pts.length - 1);
    return pts.slice(0, Math.max(2, Math.round(last))).map((q) => q.join(",")).join(" ");
  };
  return (
    <FigureFrame
      title={{ en: "World model: plan by imagining", zh: "世界模型：以想象来规划" }}
      caption={{
        en: "A world model predicts the future, so the agent can roll candidate action plans forward internally, score their return, and pick the best — planning by imagination instead of trial-and-error in the real world. Extend the rollout; the chosen plan is green.",
        zh: "世界模型预测未来，于是智能体可在内部把候选动作方案向前滚动、评估回报、择优——以想象来规划，而非在真实世界里试错。延长滚动；被选中的方案为绿色。",
      }}
      onReset={() => setHz(1)}
    >
      <svg viewBox="0 0 360 184" className="w-full">
        <rect x={150} y={110} width={70} height={40} rx={4} fill="#ef4444" fillOpacity={0.25} stroke="#ef4444" />
        <text x={185} y={134} textAnchor="middle" fontSize="9" fill="#ef4444">{zh ? "障碍" : "obstacle"}</text>
        <circle cx={GOAL.x} cy={GOAL.y} r={20} fill="#1d9e75" fillOpacity={0.25} stroke="#1d9e75" />
        <text x={GOAL.x} y={GOAL.y + 3} textAnchor="middle" fontSize="9" fill="#1d9e75">{zh ? "目标" : "goal"}</text>
        {PLANS.map((p, i) => (
          <polyline key={i} points={upTo(p.pts)} fill="none" strokeWidth={i === best ? 3 : 1.8}
            stroke={i === best ? "#1d9e75" : "#94a3b8"} strokeOpacity={i === best ? 1 : 0.6} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <circle cx={40} cy={150} r={6} fill="#6a5ef0" />
        <text x={40} y={170} textAnchor="middle" fontSize="9" fill="#6a5ef0">{zh ? "起点" : "start"}</text>
        <text x={340} y={20} textAnchor="end" fontSize="10" fontWeight="600" fill="#1d9e75">{zh ? `选中方案 #${best + 1}` : `chosen plan #${best + 1}`}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "滚动步长" : "rollout horizon"} value={hz} min={0} max={1} step={0.02} onChange={setHz} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
    </FigureFrame>
  );
}

// ── D9 · Capstone pipeline: pixels → world memory ────────────────────────────
const STAGES = [
  { en: "RGB-D frames", zh: "RGB-D 帧", c: "#94a3b8" },
  { en: "poses (SLAM)", zh: "位姿 (SLAM)", c: "#378add" },
  { en: "TSDF fusion", zh: "TSDF 融合", c: "#1d9e75" },
  { en: "semantics", zh: "语义", c: "#f59e0b" },
  { en: "scene graph", zh: "场景图", c: "#6a5ef0" },
];
export function Pipeline() {
  const zh = useStore((s) => s.lang) === "zh";
  const [stage, setStage] = useState(0);
  const note = [
    { en: "A stream of posed RGB-D frames — the raw input.", zh: "一串带位姿的 RGB-D 帧——原始输入。" },
    { en: "Estimate camera poses online (PnP + bundle adjustment).", zh: "在线估计相机位姿（PnP + 光束法平差）。" },
    { en: "Fuse depth into a clean surface (truncated SDF).", zh: "把深度融合成干净表面（截断 SDF）。" },
    { en: "Bayes-fuse 2D labels (+ CLIP) into the 3D map.", zh: "把 2D 标签（+ CLIP）贝叶斯融合进 3D 地图。" },
    { en: "Cluster objects + relations → a queryable scene graph.", zh: "聚类物体 + 关系 → 可查询的场景图。" },
  ];
  return (
    <FigureFrame
      title={{ en: "Capstone: pixels → world memory", zh: "终极项目：像素 → 世界记忆" }}
      caption={{
        en: "The whole curriculum is one pipeline: posed frames → geometry → semantics → structure → a queryable world memory. Each stage reuses earlier tracks (bundle adjustment ↔ SLAM, SDF ↔ TSDF, CLIP ↔ open-vocabulary). Step through it.",
        zh: "整门课程就是一条流水线：带位姿的帧 → 几何 → 语义 → 结构 → 可查询的世界记忆。每个阶段复用先前赛道（光束法平差 ↔ SLAM、SDF ↔ TSDF、CLIP ↔ 开放词汇）。逐步走一遍。",
      }}
      onReset={() => setStage(0)}
    >
      <svg viewBox="0 0 360 96" className="w-full">
        {STAGES.map((s, i) => {
          const x = 14 + i * 68, on = i <= stage;
          return (
            <g key={i}>
              {i > 0 && <line x1={x - 14} y1={40} x2={x} y2={40} stroke={i <= stage ? STAGES[i].c : "#cbd5e1"} strokeWidth={2} markerEnd="url(#pa)" />}
              <rect x={x} y={22} width={54} height={36} rx={8} fill={s.c} fillOpacity={on ? 0.9 : 0.18} />
              <text x={x + 27} y={44} textAnchor="middle" fontSize="7.5" fill={on ? "#fff" : "#9ca3af"}>{(zh ? s.zh : s.en).split(" ")[0]}</text>
            </g>
          );
        })}
        <defs><marker id="pa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#94a3b8" /></marker></defs>
        <text x={14} y={84} fontSize="10" fontWeight="600" fill={STAGES[stage].c}>{stage + 1}. {zh ? STAGES[stage].zh : STAGES[stage].en}</text>
      </svg>
      <p className="mt-1 text-xs text-ink/65 dark:text-stone-300">{zh ? note[stage].zh : note[stage].en}</p>
      <div className="mt-3">
        <Slider label={zh ? "阶段" : "stage"} value={stage} min={0} max={4} onChange={(v) => setStage(Math.round(v))} format={(v) => `${Math.round(v) + 1}/5`} />
      </div>
    </FigureFrame>
  );
}
