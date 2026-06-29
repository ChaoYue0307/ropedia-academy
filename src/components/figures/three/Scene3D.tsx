import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";
import { Frame, Dot, tag, GROUND, GRID2, type V } from "./Geometry3D";

const h = (s: number) => (Math.sin(s * 127.1) * 43758.5) % 1;   // cheap deterministic noise in [-1,1]

// ── B3 · Bundle adjustment (jointly refine cameras + points) ─────────────────
export function BundleAdjust3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [iter, setIter] = useState(0.25);
  useResizeKick();
  const truePts: V[] = [[-0.6, 0.5, 0.2], [0.5, 0.8, -0.3], [0.2, 0.3, 0.6], [-0.3, 1.0, -0.5], [0.6, 0.4, 0.3]];
  const cams: V[] = [[-1.5, 0.6, 1.5], [1.5, 0.6, 1.5], [0, 0.7, -1.7]];
  const jig = (p: V, k: number): V => { const n = (1 - iter) * 0.45; return [p[0] + h(k + 1) * n, p[1] + h(k + 2) * n, p[2] + h(k + 3) * n]; };
  return (
    <FigureFrame
      title={{ en: "Bundle adjustment (3D)", zh: "光束法平差（三维）" }}
      caption={{ en: "Bundle adjustment jointly refines ALL camera poses and ALL 3D points at once to minimize the total reprojection error. Run the optimizer: the noisy points snap onto their true positions and the rays from every camera become consistent. Orbit to inspect.", zh: "光束法平差同时优化所有相机位姿与所有三维点，以最小化总重投影误差。运行优化器：带噪点收敛到真实位置，所有相机的射线变得一致。旋转查看。" }}
      onReset={() => setIter(0.25)}
    >
      <Frame cam={[3, 2, 3.6]} target={[0, 0.6, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {cams.map((c, i) => <mesh key={i} position={c}><boxGeometry args={[0.18, 0.14, 0.14]} /><meshStandardMaterial color="#1c1b22" /></mesh>)}
        {truePts.map((p, i) => { const q = jig(p, i * 3); return (
          <group key={i}>
            {cams.map((c, j) => <Line key={j} points={[c, q]} color="#94a3b8" lineWidth={0.8} transparent opacity={0.4} />)}
            <Dot p={q} r={0.07} c="#e0598b" />
          </group>); })}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "优化迭代" : "optimization"} value={iter} min={0} max={1} step={0.02} onChange={setIter} format={(v) => zh ? `误差 ${Math.round((1 - v) * 100)}` : `error ${Math.round((1 - v) * 100)}`} /></div>
    </FigureFrame>
  );
}

// ── D2 · PnP — solve camera pose from 3D↔2D correspondences ──────────────────
export function Pnp3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [yaw, setYaw] = useState(-32);
  useResizeKick();
  const pts: V[] = [[-0.4, 0.4, 0], [0.4, 0.6, 0.1], [0, 0.2, 0.4], [0.2, 0.7, -0.3]];
  const a = (yaw * Math.PI) / 180, R = 2.2;
  const estCam: V = [Math.sin(a) * R, 0.7, Math.cos(a) * R];
  const trueCam: V = [0, 0.7, R];
  const err = Math.abs(yaw), ok = err < 6;
  return (
    <FigureFrame
      title={{ en: "PnP — camera pose from 3D↔2D (3D)", zh: "PnP——由 3D↔2D 求相机位姿（三维）" }}
      caption={{ en: "Perspective-n-Point: given known 3D points and where they appear in the image, solve for the camera's pose. Rotate the estimate — when the back-projected rays line up with the true viewpoint (green), the reprojection residual hits zero. This is how a camera localizes against a known map.", zh: "PnP（n 点透视）：已知三维点及其在图像中的位置，求相机位姿。旋转估计值——当反投影射线与真实视点对齐（绿色）时，重投影残差归零。这就是相机在已知地图中定位的方式。" }}
      onReset={() => setYaw(-32)}
    >
      <Frame cam={[3.2, 2, 3.2]} target={[0, 0.4, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {pts.map((p, i) => <Dot key={i} p={p} r={0.07} c="#6a5ef0" />)}
        <mesh position={estCam}><boxGeometry args={[0.2, 0.16, 0.16]} /><meshStandardMaterial color={ok ? "#1d9e75" : "#d06a6a"} /></mesh>
        {pts.map((p, i) => <Line key={i} points={[estCam, p]} color={ok ? "#1d9e75" : "#d06a6a"} lineWidth={1.2} transparent opacity={0.7} />)}
        <mesh position={trueCam}><boxGeometry args={[0.22, 0.18, 0.18]} /><meshStandardMaterial color="#1d9e75" transparent opacity={0.18} /></mesh>
        {tag(ok ? "#1d9e75" : "#d06a6a", ok ? (zh ? "已求解 ✓" : "solved ✓") : (zh ? `残差 ${err.toFixed(0)}°` : `residual ${err.toFixed(0)}°`), [estCam[0], estCam[1] + 0.3, estCam[2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "估计相机朝向" : "estimated pose"} value={yaw} min={-60} max={60} step={1} onChange={setYaw} format={(v) => `${v}°`} /></div>
    </FigureFrame>
  );
}

// ── B6 · Multiresolution hash grid (Instant-NGP) ─────────────────────────────
export function HashGrid3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [level, setLevel] = useState(1);
  useResizeKick();
  const q: V = [0.32, 0.46, 0.6];
  const levels = [1, 2, 4];
  const cubeAt = (res: number, active: boolean) => {
    const s = 2 / res;                                  // grid spans [-1,1]
    const cell = (v: number) => Math.floor((v + 1) / s);
    const c0 = (i: number) => -1 + cell(q[i]) * s + s / 2;
    return <mesh position={[c0(0), c0(1), c0(2)]}><boxGeometry args={[s, s, s]} /><meshStandardMaterial color="#6a5ef0" transparent opacity={active ? 0.32 : 0.06} wireframe={!active} /></mesh>;
  };
  return (
    <FigureFrame
      title={{ en: "Multiresolution hash grid (3D)", zh: "多分辨率哈希网格（三维）" }}
      caption={{ en: "Instant-NGP encodes a point by looking it up in several grids of increasing resolution at once, then concatenating the features. Here a query point sits inside its enclosing cell at each level — coarse cells capture smooth structure, fine cells add detail. Step through the levels.", zh: "Instant-NGP 通过在多个分辨率递增的网格中同时查找一个点、再拼接特征来编码它。这里查询点位于每个层级的所属单元内——粗网格捕捉平滑结构，细网格补充细节。逐层查看。" }}
      onReset={() => setLevel(1)}
    >
      <Frame cam={[2.6, 2, 2.8]} target={[0, 0, 0]}>
        <Line points={[[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, -1]]} color="#94a3b8" lineWidth={1} />
        {levels.map((res, i) => <group key={i}>{cubeAt(res, i === level)}</group>)}
        <Dot p={q} r={0.07} c="#e0598b" />
        {tag("#e0598b", zh ? "查询点" : "query", [q[0], q[1] + 0.25, q[2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "分辨率层级" : "resolution level"} value={level} min={0} max={2} step={1} onChange={(v) => setLevel(Math.round(v))} format={(v) => `${["粗", "中", "细"][Math.round(v)] && (zh ? ["粗", "中", "细"][Math.round(v)] : ["coarse", "medium", "fine"][Math.round(v)])} (${levels[Math.round(v)]}³)`} /></div>
    </FigureFrame>
  );
}

// ── B8 · 4D deformation (a canonical shape deforms over time) ─────────────────
export function Deform3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.5);
  useResizeKick();
  const N = 13, bend = 0.5;
  const xs = Array.from({ length: N }, (_, i) => -1.2 + (2.4 * i) / (N - 1));
  return (
    <FigureFrame
      title={{ en: "4D = a shape deforming over time (3D)", zh: "4D = 随时间形变的形状（三维）" }}
      caption={{ en: "A dynamic (4D) scene is a canonical 3D shape plus a deformation field that warps it over time. The faint row is the canonical shape; the solid row is where each part moves to at time t. A model learns the canonical geometry once and the time-varying warp separately. Scrub time.", zh: "动态（4D）场景 = 一个标准三维形状 + 随时间扭曲它的形变场。浅色行是标准形状；实色行是每个部分在时刻 t 移动到的位置。模型分别学习一次标准几何与随时间变化的形变。拖动时间。" }}
      onReset={() => setT(0.5)}
    >
      <Frame cam={[0.2, 1.6, 3.4]} target={[0, 0, 0]}>
        {xs.map((x, i) => <mesh key={`c${i}`} position={[x, 0, 0]}><boxGeometry args={[0.14, 0.14, 0.14]} /><meshStandardMaterial color="#94a3b8" transparent opacity={0.18} /></mesh>)}
        {xs.map((x, i) => { const y = bend * Math.sin(x * 2.2 + t * Math.PI * 2); const z = 0.35 * bend * Math.cos(x * 1.6 + t * Math.PI * 2); return <mesh key={`d${i}`} position={[x, y, z]}><boxGeometry args={[0.17, 0.17, 0.17]} /><meshStandardMaterial color="#6a5ef0" roughness={0.5} /></mesh>; })}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "时间" : "time"} value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── B9 · NeRF floaters + a regularizer that removes them ─────────────────────
export function Floaters3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [reg, setReg] = useState(0.2);
  useResizeKick();
  const floaters = useMemo<V[]>(() => Array.from({ length: 14 }, (_, i) => [h(i + 1) * 1.6, 0.5 + h(i + 5) * 0.9, h(i + 9) * 1.6]), []);
  return (
    <FigureFrame
      title={{ en: "NeRF floaters & a regularizer (3D)", zh: "NeRF 漂浮物与正则项（三维）" }}
      caption={{ en: "A NeRF can explain training views by inventing spurious semi-transparent blobs floating in empty space — ‘floaters’ that ruin novel views. A regularizer (e.g. a distortion / sparsity loss) penalizes density off the real surface. Raise the regularization and watch the floaters dissolve while the real object stays.", zh: "NeRF 可能通过在空白处编造半透明斑块来解释训练视角——这些「漂浮物」会破坏新视角。正则项（如失真/稀疏损失）惩罚真实表面之外的密度。增大正则强度，观察漂浮物消散而真实物体保留。" }}
      onReset={() => setReg(0.2)}
    >
      <Frame cam={[2.8, 1.8, 3]} target={[0, 0.5, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.4, 24, 24]} /><meshStandardMaterial color="#6a5ef0" roughness={0.4} /></mesh>
        {floaters.map((p, i) => { const op = Math.max(0, (1 - reg * 1.3)) * 0.5; return op < 0.02 ? null : <mesh key={i} position={p}><sphereGeometry args={[0.07 + h(i) * 0.04, 12, 12]} /><meshStandardMaterial color="#e0598b" transparent opacity={op} /></mesh>; })}
        {tag("#6a5ef0", zh ? "真实物体" : "real object", [0, 1.1, 0])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "正则强度" : "regularization"} value={reg} min={0} max={1} step={0.02} onChange={setReg} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── D1 · SLAM loop closure (drift → corrected loop) ──────────────────────────
export function SlamLoop3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [close, setClose] = useState(0);
  useResizeKick();
  const N = 40;
  const path = useMemo(() => Array.from({ length: N }, (_, i) => i / (N - 1)), []);
  const pts: V[] = path.map((u) => {
    const ang = u * Math.PI * 2;
    const drift = (1 - close) * 0.5 * u;                 // accumulates → end misses start
    return [Math.cos(ang) * 1.2 + drift, 0.1 + drift * 0.6, Math.sin(ang) * 1.2 + drift * 0.4];
  });
  const gap = Math.hypot(pts[N - 1][0] - pts[0][0], pts[N - 1][1] - pts[0][1], pts[N - 1][2] - pts[0][2]);
  const ok = gap < 0.15;
  return (
    <FigureFrame
      title={{ en: "SLAM loop closure (3D)", zh: "SLAM 回环闭合（三维）" }}
      caption={{ en: "As a camera explores, small pose errors accumulate — the estimated trajectory DRIFTS, so returning to the start doesn't line up (a gap). Recognizing a revisited place adds a loop-closure constraint that redistributes the error and snaps the trajectory into a consistent loop. Close the loop.", zh: "相机探索时，微小的位姿误差会累积——估计轨迹发生漂移，回到起点时对不上（出现缺口）。识别到重访的地点会加入回环约束，把误差重新分配，使轨迹闭合为一致的环。闭合回环。" }}
      onReset={() => setClose(0)}
    >
      <Frame cam={[3, 2.4, 3]} target={[0, 0.3, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <Line points={pts} color={ok ? "#1d9e75" : "#d06a6a"} lineWidth={3} />
        <Dot p={pts[0]} r={0.09} c="#1d9e75" /><Dot p={pts[N - 1]} r={0.09} c={ok ? "#1d9e75" : "#d06a6a"} />
        {tag(ok ? "#1d9e75" : "#d06a6a", ok ? (zh ? "已闭合 ✓" : "closed ✓") : (zh ? `漂移缺口 ${gap.toFixed(2)}` : `drift gap ${gap.toFixed(2)}`), [pts[N - 1][0], pts[N - 1][1] + 0.3, pts[N - 1][2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "回环闭合" : "loop closure"} value={close} min={0} max={1} step={0.02} onChange={setClose} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── D4 · Semantic fusion (multi-frame labels converge) ───────────────────────
const CLASSES = ["#6a5ef0", "#1d9e75", "#f59e0b", "#e0598b"];
export function SemanticFusion3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [frames, setFrames] = useState(2);
  useResizeKick();
  const pts = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ p: [h(i + 1) * 1.6, 0.05 + Math.abs(h(i + 7)) * 0.9, h(i + 3) * 1.6] as V, cls: Math.floor(Math.abs(h(i + 2)) * 4) % 4 })), []);
  const wrongP = Math.max(0, 0.6 - frames * 0.1);                 // mislabel probability shrinks with frames
  let correct = 0;
  const shown = pts.map((o, i) => { const bad = Math.abs(h(i + 50)) < wrongP; if (!bad) correct++; return { ...o, shownCls: bad ? (o.cls + 1) % 4 : o.cls }; });
  return (
    <FigureFrame
      title={{ en: "Semantic fusion (3D)", zh: "语义融合（三维）" }}
      caption={{ en: "Per-frame segmentation is noisy. Fusing many views into one 3D map — accumulating class votes per point/voxel — averages out the per-frame mistakes, so the map's labels converge to the correct class. Add frames and watch the accuracy climb. Colors = semantic classes.", zh: "单帧分割是有噪声的。把多视角融合进一个三维地图——为每个点/体素累积类别投票——会平均掉单帧错误，使地图标签收敛到正确类别。增加帧数，观察准确率上升。颜色 = 语义类别。" }}
      onReset={() => setFrames(2)}
    >
      <Frame cam={[2.8, 2, 3]} target={[0, 0.4, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {shown.map((o, i) => <mesh key={i} position={o.p}><boxGeometry args={[0.11, 0.11, 0.11]} /><meshStandardMaterial color={CLASSES[o.shownCls]} roughness={0.5} /></mesh>)}
        {tag("#1c1b22", `${zh ? "准确率" : "accuracy"} ${Math.round((correct / pts.length) * 100)}%`, [0, 1.3, 0])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "融合帧数" : "frames fused"} value={frames} min={1} max={8} step={1} onChange={(v) => setFrames(Math.round(v))} format={(v) => `${Math.round(v)}`} /></div>
    </FigureFrame>
  );
}

// ── D8 · World-model rollout + planning (CEM) ────────────────────────────────
export function WorldRollout3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [iter, setIter] = useState(0.3);
  useResizeKick();
  const start: V = [-1.4, 0.1, -1.1], goal: V = [1.3, 0.1, 1.0];
  const K = 7;
  const paths = useMemo(() => Array.from({ length: K }, (_, k) => k), []);
  const curve = (k: number): V[] => {
    const spread = (1 - iter) * 1.3, off = h(k + 1) * spread, off2 = h(k + 4) * spread;
    return Array.from({ length: 16 }, (_, i) => {
      const u = i / 15, mx = (start[0] + goal[0]) / 2 + off, mz = (start[2] + goal[2]) / 2 + off2;
      const x = (1 - u) * (1 - u) * start[0] + 2 * (1 - u) * u * mx + u * u * goal[0];
      const z = (1 - u) * (1 - u) * start[2] + 2 * (1 - u) * u * mz + u * u * goal[2];
      return [x, 0.1 + Math.sin(u * Math.PI) * 0.3, z] as V;
    });
  };
  return (
    <FigureFrame
      title={{ en: "World-model planning (CEM, 3D)", zh: "世界模型规划（CEM，三维）" }}
      caption={{ en: "A world model lets an agent imagine the future without acting. Planning samples many candidate action sequences, rolls each out in imagination, scores them, and refits toward the best (the Cross-Entropy Method). Run iterations: the cloud of imagined trajectories concentrates on the path that reaches the goal (green).", zh: "世界模型让智能体无需真实行动即可想象未来。规划会采样许多候选动作序列，在想象中各自推演、打分，并向最优者重新拟合（交叉熵方法 CEM）。运行迭代：想象轨迹的云团逐渐集中到能到达目标的路径（绿色）。" }}
      onReset={() => setIter(0.3)}
    >
      <Frame cam={[3.2, 2.6, 3.2]} target={[0, 0.2, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {paths.map((k) => <Line key={k} points={curve(k)} color="#a3a8ff" lineWidth={1} transparent opacity={0.45} />)}
        <Line points={curve(0).map((p, i) => [(start[0] + (goal[0] - start[0]) * i / 15), 0.1 + Math.sin(i / 15 * Math.PI) * 0.3, (start[2] + (goal[2] - start[2]) * i / 15)] as V)} color="#1d9e75" lineWidth={3} />
        <Dot p={start} r={0.1} c="#1c1b22" /><Dot p={goal} r={0.12} c="#1d9e75" />
        {tag("#1c1b22", zh ? "起点" : "start", [start[0], start[1] + 0.3, start[2]])}
        {tag("#1d9e75", zh ? "目标" : "goal", [goal[0], goal[1] + 0.3, goal[2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "规划迭代" : "planning iterations"} value={iter} min={0} max={1} step={0.02} onChange={setIter} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── C6 · Active object (closest in-contact object to the hand) ────────────────
const OBJS3D: { p: V; en: string; zh: string; c: string }[] = [
  { p: [-0.6, 0.8, 0.1], en: "plate", zh: "盘子", c: "#94a3b8" },
  { p: [0.1, 0.82, -0.3], en: "knife", zh: "刀", c: "#94a3b8" },
  { p: [0.6, 0.84, 0.2], en: "cup", zh: "杯子", c: "#94a3b8" },
];
export function ActiveObject3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [hx, setHx] = useState(0.1);
  useResizeKick();
  const hand: V = [hx, 0.82, 0.1];
  const d = OBJS3D.map((o) => Math.hypot(o.p[0] - hand[0], o.p[1] - hand[1], o.p[2] - hand[2]));
  const active = d.indexOf(Math.min(...d));
  const contact = d[active] < 0.45;
  return (
    <FigureFrame
      title={{ en: "The active object (3D)", zh: "活动物体（三维）" }}
      caption={{ en: "A cluttered table holds many objects, but only one is being acted on. The ‘active object’ is the one the hand is closest to / in contact with — that filter turns a busy scene into the single noun that matters for recognizing the action. Move the hand across the table.", zh: "杂乱的桌面有许多物体，但只有一个正被作用。「活动物体」就是手最接近/接触的那一个——这个过滤器把繁忙场景化简为对识别动作真正重要的那个名词。在桌面上移动手。" }}
      onReset={() => setHx(0.1)}
    >
      <Frame cam={[2.4, 2, 2.6]} target={[0, 0.6, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <mesh position={[0, 0.7, 0]}><boxGeometry args={[1.8, 0.06, 1.1]} /><meshStandardMaterial color="#b08968" roughness={0.7} /></mesh>
        {OBJS3D.map((o, i) => (
          <group key={i}>
            {i === active && contact && <Line points={[hand, o.p]} color="#f59e0b" lineWidth={1.6} dashed dashSize={0.06} gapSize={0.05} />}
            <mesh position={o.p}><cylinderGeometry args={[0.16, 0.16, 0.12, 20]} /><meshStandardMaterial color={i === active && contact ? "#f59e0b" : "#94a3b8"} roughness={0.5} /></mesh>
            {tag(i === active && contact ? "#f59e0b" : "#64748b", zh ? o.zh : o.en, [o.p[0], o.p[1] + 0.22, o.p[2]])}
          </group>
        ))}
        <Dot p={hand} r={0.1} c="#e0598b" />{tag("#e0598b", zh ? "手" : "hand", [hand[0], hand[1] - 0.28, hand[2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "手的位置" : "hand position"} value={hx} min={-0.8} max={0.8} step={0.02} onChange={setHx} format={() => contact ? (zh ? `活动：${OBJS3D[active].zh}` : `active: ${OBJS3D[active].en}`) : (zh ? "无接触" : "no contact")} /></div>
    </FigureFrame>
  );
}

// ── C7 · Gaze scanpath (a 3D sequence of fixations over time) ─────────────────
const FIX: { p: V; en: string; zh: string }[] = [
  { p: [-0.82, 0.86, 0.1], en: "cup", zh: "杯子" },
  { p: [0.85, 1.05, 0.3], en: "bottle", zh: "瓶子" },
  { p: [0.2, 0.82, -0.5], en: "plate", zh: "盘子" },
  { p: [-0.35, 0.8, 0.6], en: "phone", zh: "手机" },
];
export function GazeScanpath3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.35);
  useResizeKick();
  const eye: V = [0, 1.65, 2.2];
  const order = [0, 1, 2, 3], n = order.length;
  const idx = Math.min(n - 1, Math.floor(t * n));
  const cur = FIX[order[idx]];
  const visited = order.slice(0, idx + 1).map((i) => FIX[i].p);
  return (
    <FigureFrame
      title={{ en: "Gaze scanpath over time (3D)", zh: "随时间的注视扫描路径（三维）" }}
      caption={{ en: "Egocentric gaze isn't random: it hops between task-relevant objects in a sequence of fixations (a scanpath), with quick saccades between them. The fixated object is a strong cue for the action. Scrub time to follow where the eye looks next; orbit to inspect the 3D scene.", zh: "第一人称的注视并非随机：它在与任务相关的物体间以一连串注视（扫描路径）跳转，其间是快速扫视。被注视的物体是动作的强线索。拖动时间，跟随视线下一步看向何处；旋转查看三维场景。" }}
      onReset={() => setT(0.35)}
    >
      <Frame cam={[2.8, 2, 3.2]} target={[0, 0.7, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <mesh position={[0, 0.7, 0]}><boxGeometry args={[1.8, 0.06, 1.1]} /><meshStandardMaterial color="#b08968" roughness={0.7} /></mesh>
        <mesh position={eye}><sphereGeometry args={[0.1, 20, 20]} /><meshStandardMaterial color="#1c1b22" /></mesh>
        {tag("#1c1b22", zh ? "眼睛" : "eye", [eye[0], eye[1] + 0.25, eye[2]])}
        {FIX.map((o, i) => <group key={i}><mesh position={o.p}><sphereGeometry args={[0.1, 18, 18]} /><meshStandardMaterial color={o === cur ? "#f59e0b" : "#94a3b8"} roughness={0.5} /></mesh>{tag(o === cur ? "#f59e0b" : "#64748b", zh ? o.zh : o.en, [o.p[0], o.p[1] + 0.22 + (i % 2) * 0.2, o.p[2]])}</group>)}
        {visited.length > 1 && <Line points={visited} color="#e0598b" lineWidth={2} dashed dashSize={0.08} gapSize={0.06} />}
        <Line points={[eye, cur.p]} color="#f59e0b" lineWidth={2.5} />
      </Frame>
      <div className="mt-3"><Slider label={zh ? "时间（注视序列）" : "time (fixation sequence)"} value={t} min={0} max={1} step={0.01} onChange={setT} format={() => zh ? `注视：${cur.zh}` : `looking at: ${cur.en}`} /></div>
    </FigureFrame>
  );
}

// ── D5 · Scene graph grounded in a 3D scene (objects + spatial relations) ─────
const SG: { p: V; en: string; zh: string; c: string; r: number }[] = [
  { p: [0, 0.36, 0], en: "table", zh: "桌子", c: "#b08968", r: 0.22 },
  { p: [0.08, 1.05, 0.05], en: "cup", zh: "杯子", c: "#f59e0b", r: 0.12 },
  { p: [0.95, 0.3, 0.2], en: "chair", zh: "椅子", c: "#8b5a2b", r: 0.16 },
  { p: [-0.85, 1.35, -0.1], en: "lamp", zh: "灯", c: "#67e8f9", r: 0.14 },
];
const SGREL: [number, number, string, string][] = [[1, 0, "on", "在…上"], [2, 0, "next to", "紧挨"], [3, 0, "above-left", "左上"]];
export function SceneGraph3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [focus, setFocus] = useState(1);
  useResizeKick();
  const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return (
    <FigureFrame
      title={{ en: "Scene graph — objects + relations (3D)", zh: "场景图——物体 + 关系（三维）" }}
      caption={{ en: "A scene graph turns a 3D scene into nodes (objects) and edges (spatial relations: on, next-to, above). It's the structured, symbolic layer a language model can reason over — ‘the cup on the table’. Pick a node to highlight its relations; orbit to see them grounded in 3D.", zh: "场景图把三维场景转化为节点（物体）与边（空间关系：在…上、紧挨、上方）。这是语言模型可以推理的结构化符号层——「桌上的杯子」。选择一个节点高亮其关系；旋转可看到它们在三维中的落位。" }}
      onReset={() => setFocus(1)}
    >
      <Frame cam={[2.8, 2, 3]} target={[0, 0.7, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {SG.map((o, i) => <group key={i}><mesh position={o.p}><sphereGeometry args={[o.r, 22, 22]} /><meshStandardMaterial color={o.c} roughness={0.5} metalness={0.1} /></mesh>{tag(i === focus ? "#6a5ef0" : "#64748b", zh ? o.zh : o.en, [o.p[0], o.p[1] + o.r + 0.12, o.p[2]])}</group>)}
        {SGREL.map(([a, b, en, zhr], i) => { const on = a === focus || b === focus; return (
          <group key={i}>
            <Line points={[SG[a].p, SG[b].p]} color={on ? "#6a5ef0" : "#cbd5e1"} lineWidth={on ? 2.5 : 1} transparent opacity={on ? 1 : 0.5} />
            {on && tag("#6a5ef0", zh ? zhr : en, (([mx, my, mz]) => [mx + 0.28, my, mz] as V)(mid(SG[a].p, SG[b].p)))}
          </group>); })}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "聚焦节点" : "focus node"} value={focus} min={0} max={3} step={1} onChange={(v) => setFocus(Math.round(v))} format={(v) => zh ? SG[Math.round(v)].zh : SG[Math.round(v)].en} /></div>
    </FigureFrame>
  );
}
