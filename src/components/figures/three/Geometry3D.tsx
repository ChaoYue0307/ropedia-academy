import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";

type V = [number, number, number];
const GROUND = "#cbd5e1", GRID2 = "#e2e8f0";

function Frame({ children, h = "h-72", cam = [3.2, 2.2, 3.6] as V, target = [0, 0, 0] as V }: { children: React.ReactNode; h?: string; cam?: V; target?: V }) {
  return (
    <div className={`${h} w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-stone-100 dark:from-slate-800 dark:to-slate-900`}>
      <Canvas camera={{ position: cam, fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={1} />
        {children}
        <OrbitControls enablePan={false} target={target} minDistance={2.4} maxDistance={11} maxPolarAngle={Math.PI / 2.03} />
      </Canvas>
    </div>
  );
}
const Dot = ({ p, r = 0.09, c }: { p: V; r?: number; c: string }) => (
  <mesh position={p}><sphereGeometry args={[r, 20, 20]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>
);
function tag(c: string, text: string, p: V) {
  return <Html position={p} center distanceFactor={7}><div style={{ background: c, color: "#fff", padding: "1px 6px", borderRadius: 6, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</div></Html>;
}

// ── B1 · Pinhole projection (depth is discarded) ─────────────────────────────
export function Pinhole3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [depth, setDepth] = useState(2.2);
  const [f, setF] = useState(1.0);
  useResizeKick();
  const ix = 0.34, iy = -0.2;                       // the ray's image coordinates (x/z, y/z) — fixed
  const P: V = [ix * depth, iy * depth, depth];
  const ghost: V = [ix * depth * 0.6, iy * depth * 0.6, depth * 0.6];
  const pix: V = [ix * f, iy * f, f];               // where the ray crosses the image plane — independent of depth
  const planeCorners: V[] = [[-0.6, 0.6, f], [0.6, 0.6, f], [0.6, -0.6, f], [-0.6, -0.6, f]];
  return (
    <FigureFrame
      title={{ en: "Pinhole projection (in 3D)", zh: "针孔投影（三维）" }}
      caption={{
        en: "Drag depth: the world point P slides along the ray deeper into the scene, but its projection on the image plane never moves — projection discards depth. The hollow point sits at another depth on the same ray and lands on the very same pixel. Orbit to see the ray go into 3D.",
        zh: "拖动「深度」：世界点 P 沿射线滑入场景更深处，但它在像平面上的投影纹丝不动——投影丢弃了深度。空心点位于同一射线的另一深度处，却落在完全相同的像素上。旋转视角即可看到射线伸入三维。",
      }}
      onReset={() => { setDepth(2.2); setF(1.0); }}
    >
      <Frame cam={[3.2, 1.7, 3.4]} target={[0, 0, 1.2]}>
        <gridHelper args={[8, 16, GROUND, GRID2]} position={[0, -1.2, 1.4]} />
        {/* image plane + camera frustum */}
        <mesh position={[0, 0, f]}><planeGeometry args={[1.2, 1.2]} /><meshBasicMaterial color="#6a5ef0" transparent opacity={0.1} side={THREE.DoubleSide} /></mesh>
        <Line points={[...planeCorners, planeCorners[0]]} color="#6a5ef0" lineWidth={2} />
        {planeCorners.map((c, i) => <Line key={i} points={[[0, 0, 0], c]} color="#6a5ef0" lineWidth={1} transparent opacity={0.5} />)}
        {/* ray through P, extended */}
        <Line points={[[0, 0, 0], [ix * 3.4, iy * 3.4, 3.4]]} color="#94a3b8" lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} />
        <Dot p={[0, 0, 0]} r={0.08} c="#1c1b22" />{tag("#1c1b22", zh ? "相机" : "camera", [0, -0.28, 0])}
        <mesh position={ghost}><sphereGeometry args={[0.085, 18, 18]} /><meshStandardMaterial color="#e0598b" wireframe /></mesh>
        <Dot p={P} c="#1d9e75" />{tag("#1d9e75", "P", [P[0], P[1] + 0.28, P[2]])}
        <Dot p={pix} r={0.06} c="#6a5ef0" />{tag("#6a5ef0", zh ? "像素" : "pixel", [pix[0], pix[1] - 0.28, pix[2]])}
      </Frame>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "P 的深度" : "depth of P"} value={depth} min={1.2} max={3.2} step={0.05} onChange={setDepth} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "焦距 f" : "focal length f"} value={f} min={0.6} max={1.5} step={0.05} onChange={setF} format={(v) => v.toFixed(2)} />
      </div>
    </FigureFrame>
  );
}

// ── B2 · Triangulation (two rays meet in 3D) ─────────────────────────────────
export function Triangulation3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [pz, setPz] = useState(2.3);
  const [base, setBase] = useState(0.9);
  useResizeKick();
  const P: V = [0.25, 0.55, pz];
  const near = 0.55;
  const cams: V[] = [[-base, 0, 0], [base, 0, 0]];
  const pixel = (C: V): V => [C[0] + (P[0] - C[0]) * (near / pz), C[1] + (P[1] - C[1]) * (near / pz), near];
  return (
    <FigureFrame
      title={{ en: "Triangulation (in 3D)", zh: "三角测量（三维）" }}
      caption={{
        en: "Two calibrated cameras each see the point along a ray; the rays meet at its true 3D position P. Move the point and both image projections (□) update while the rays still intersect at P. A wider baseline makes the intersection angle sharper, pinning depth more precisely.",
        zh: "两台已标定相机各沿一条射线看到该点；两射线相交于其真实三维位置 P。移动点——两个像投影（□）随之更新，而射线仍交于 P。基线越宽，相交角越锐，深度越精确。",
      }}
      onReset={() => { setPz(2.3); setBase(0.9); }}
    >
      <Frame cam={[4.2, 2.8, 1.2]} target={[0, 0.4, 1.1]}>
        <gridHelper args={[8, 16, GROUND, GRID2]} position={[0, -0.6, 1.6]} />
        <Line points={[cams[0], cams[1]]} color="#94a3b8" lineWidth={1.5} />
        {cams.map((C, i) => {
          const px = pixel(C);
          return (
            <group key={i}>
              <mesh position={C}><boxGeometry args={[0.2, 0.16, 0.16]} /><meshStandardMaterial color="#1c1b22" /></mesh>
              <Line points={[C, [C[0] + (P[0] - C[0]) * 1.18, C[1] + (P[1] - C[1]) * 1.18, P[2] * 1.18]]} color="#f59e0b" lineWidth={2.5} />
              <mesh position={[C[0], C[1], near]}><planeGeometry args={[0.5, 0.4]} /><meshBasicMaterial color="#1d9e75" transparent opacity={0.16} side={THREE.DoubleSide} /></mesh>
              <mesh position={px}><boxGeometry args={[0.08, 0.08, 0.012]} /><meshStandardMaterial color="#1d9e75" /></mesh>
            </group>
          );
        })}
        {tag("#1c1b22", zh ? "相机 1" : "cam 1", [cams[0][0], -0.28, 0])}
        {tag("#1c1b22", zh ? "相机 2" : "cam 2", [cams[1][0], -0.28, 0])}
        <Dot p={P} r={0.11} c="#e0598b" />{tag("#e0598b", "P", [P[0], P[1] + 0.3, P[2]])}
      </Frame>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "点深度" : "point depth"} value={pz} min={1.4} max={3.4} step={0.05} onChange={setPz} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "基线宽度" : "baseline width"} value={base} min={0.4} max={1.6} step={0.05} onChange={setBase} format={(v) => v.toFixed(1)} />
      </div>
    </FigureFrame>
  );
}

// ── D7 · Reference frames ('left of the chair' flips with the chair) ──────────
export function ReferenceFrames3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [deg, setDeg] = useState(30);
  useResizeKick();
  const a = (deg * Math.PI) / 180;
  const front = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
  const P: V = [1.5, 0, 0];                                   // fixed in the WORLD (east, +x)
  const rel = new THREE.Vector3(P[0], 0, P[2]);
  const cross = front.clone().cross(rel);                     // up-component tells left vs right
  const right = cross.y > 0;
  return (
    <FigureFrame
      title={{ en: "‘Left of the chair’ — which frame? (3D)", zh: "「椅子左边」——哪个参照系？（三维）" }}
      caption={{
        en: "Spatial words depend on a reference frame. The point P is fixed in the world (east of the chair), but ‘left/right of the chair’ flips as the chair turns — so a spatial reasoner must commit to a frame. Rotate the chair and watch the answer flip; orbit to see both frames in 3D.",
        zh: "空间词依赖参照系。点 P 在世界中固定（位于椅子东侧），但「椅子的左/右」会随椅子转动而翻转——所以空间推理器必须确定一个参照系。旋转椅子，观察答案翻转；旋转视角可在三维中看到两个参照系。",
      }}
      onReset={() => setDeg(30)}
    >
      <Frame cam={[3.4, 3, 3.4]}>
        <gridHelper args={[8, 16, GROUND, GRID2]} />
        {/* world axes: +x = east (red), +z = north (blue) */}
        <Line points={[[0, 0.01, 0], [2.2, 0.01, 0]]} color="#ef4444" lineWidth={2} />
        <Line points={[[0, 0.01, 0], [0, 0.01, 2.2]]} color="#3b82f6" lineWidth={2} />
        {tag("#ef4444", zh ? "东" : "east", [2.4, 0.05, 0])}
        {/* chair: seat + back + a 'front' arrow, rotated by deg */}
        <group rotation={[0, a, 0]}>
          <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#8b5a2b" /></mesh>
          <mesh position={[0, 0.55, -0.21]}><boxGeometry args={[0.5, 0.5, 0.08]} /><meshStandardMaterial color="#a06a36" /></mesh>
          {[[-0.2, 0.14, -0.2], [0.2, 0.14, -0.2], [-0.2, 0.14, 0.2], [0.2, 0.14, 0.2]].map((p, i) =>
            <mesh key={i} position={p as V}><boxGeometry args={[0.05, 0.28, 0.05]} /><meshStandardMaterial color="#6b4423" /></mesh>)}
          <Line points={[[0, 0.3, 0], [0, 0.3, 1.2]]} color="#1d9e75" lineWidth={3} />
          <mesh position={[0, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.08, 0.2, 16]} /><meshStandardMaterial color="#1d9e75" /></mesh>
          {tag("#1d9e75", zh ? "前" : "front", [0, 0.3, 1.45])}
        </group>
        <Dot p={[1.5, 0.12, 0]} r={0.12} c="#e0598b" />{tag("#e0598b", "P", [1.5, 0.45, 0])}
        <Html position={[0, 1.7, 0]} center distanceFactor={8}>
          <div style={{ background: "#6a5ef0", color: "#fff", padding: "2px 8px", borderRadius: 7, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", textAlign: "center" }}>
            {zh ? `椅子参照系：P 在椅子${right ? "右" : "左"}侧` : `chair frame: P is on the chair's ${right ? "RIGHT" : "LEFT"}`}
            <div style={{ opacity: .85, fontWeight: 500 }}>{zh ? "世界参照系：P 始终在东侧" : "world frame: P is always east"}</div>
          </div>
        </Html>
      </Frame>
      <div className="mt-3">
        <Slider label={zh ? "椅子朝向" : "chair orientation"} value={deg} min={0} max={360} onChange={setDeg} format={(v) => `${v}°`} />
      </div>
    </FigureFrame>
  );
}

// ── A6 · 6D vs Euler rotation (the discontinuity is in the representation) ────
export function RotationContinuity3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.5);
  useResizeKick();
  const yawDeg = -170 + t * 360;                       // sweeps past ±180 (the wrap)
  const yaw = (yawDeg * Math.PI) / 180;
  const euler = (((yawDeg + 180) % 360) + 360) % 360 - 180;   // wrapped → jumps at ±180
  return (
    <FigureFrame
      title={{ en: "6D vs Euler rotation (in 3D)", zh: "6D 与欧拉角旋转（三维）" }}
      caption={{
        en: "Drag the angle: the object rotates perfectly smoothly, yet the Euler angle JUMPS as it wraps past ±180° — a discontinuity a network can't fit. The 6D representation (the rotation matrix's first two columns, the red & green arrows) stays continuous, which is why it's far easier to regress.",
        zh: "拖动角度：物体平滑旋转，但欧拉角越过 ±180° 时会跳变——这种不连续网络无法拟合。6D 表示（旋转矩阵前两列，红、绿箭头）始终连续，所以更易回归。",
      }}
      onReset={() => setT(0.5)}
    >
      <Frame cam={[2.6, 1.7, 2.9]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} position={[0, -1, 0]} />
        <group rotation={[0, yaw, 0]}>
          <mesh><boxGeometry args={[0.95, 0.6, 0.6]} /><meshStandardMaterial color="#6a5ef0" roughness={0.5} /></mesh>
          <mesh position={[0.49, 0, 0]}><boxGeometry args={[0.05, 0.64, 0.64]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          <Line points={[[0, 0, 0], [1.4, 0, 0]]} color="#ef4444" lineWidth={3} />
          <Line points={[[0, 0, 0], [0, 1.3, 0]]} color="#1d9e75" lineWidth={3} />
        </group>
      </Frame>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-red-300/50 bg-red-50/60 px-2 py-1.5 dark:border-red-400/20 dark:bg-red-500/10">
          <b className="text-red-500">Euler</b><div className="font-mono text-ink/70 dark:text-stone-300">{euler.toFixed(0)}° {Math.abs(euler) > 168 ? (zh ? "← 即将跳变" : "← about to jump") : ""}</div>
        </div>
        <div className="rounded-lg border border-emerald-300/50 bg-emerald-50/60 px-2 py-1.5 dark:border-emerald-400/20 dark:bg-emerald-500/10">
          <b className="text-emerald-600">6D</b><div className="font-mono text-ink/70 dark:text-stone-300">[{Math.cos(yaw).toFixed(2)}, {Math.sin(yaw).toFixed(2)}] {zh ? "连续" : "continuous"} ✓</div>
        </div>
      </div>
      <div className="mt-2"><Slider label={zh ? "旋转" : "rotation"} value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => `${(-170 + v * 360).toFixed(0)}°`} /></div>
    </FigureFrame>
  );
}

// ── B4 · Neural SDF — the surface is a level set ─────────────────────────────
function torusSDF(p: V, R: number, r: number) {
  const qx = Math.hypot(p[0], p[2]) - R;
  return Math.hypot(qx, p[1]) - r;
}
export function SdfField3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [iso, setIso] = useState(0);
  useResizeKick();
  const R = 0.7, r = 0.24 + iso * 0.16;
  const samples = useMemo<V[]>(() => [[0, 0, 0], [1.1, 0.2, 0], [0.7, 0, 0.7], [-0.9, 0.4, 0.3], [0, 0.9, -0.2], [0.45, -0.1, 0]], []);
  return (
    <FigureFrame
      title={{ en: "Neural SDF — the surface is a level set (3D)", zh: "神经 SDF——表面是一个等值面（三维）" }}
      caption={{
        en: "A signed-distance field stores, at every 3D point, the distance to the surface (− inside, + outside). The shape is its zero level set. Raise the level and the surface inflates to the SDF = c offset surface. Dots show the sign at sample points; orbit to inspect.",
        zh: "有符号距离场在每个三维点存储到表面的距离（内部为负，外部为正）。形状就是它的零等值面。提高水平值，表面膨胀为 SDF = c 的偏移面。圆点显示采样点的符号；旋转查看。",
      }}
      onReset={() => setIso(0)}
    >
      <Frame cam={[2.3, 1.7, 2.4]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} position={[0, -1, 0]} />
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[R, r, 28, 56]} /><meshStandardMaterial color="#6a5ef0" roughness={0.35} metalness={0.1} transparent opacity={0.92} /></mesh>
        {samples.map((p, i) => { const d = torusSDF(p, R, r); return <Dot key={i} p={p} r={0.07} c={d < 0 ? "#ef4444" : "#3b82f6"} />; })}
        {tag("#ef4444", zh ? "内部 (−)" : "inside (−)", [1.6, 1.0, 0])}
        {tag("#3b82f6", zh ? "外部 (+)" : "outside (+)", [1.6, 0.6, 0])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "等值面水平 c" : "level set c"} value={iso} min={-0.5} max={1} step={0.05} onChange={setIso} format={(v) => v.toFixed(2)} /></div>
    </FigureFrame>
  );
}

// ── C3 · VideoMAE tube masking (a space-time cube) ───────────────────────────
export function TubeMasking3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [ratio, setRatio] = useState(0.6);
  useResizeKick();
  const SX = 4, SY = 4, T = 6;
  const order = useMemo(() => {
    const a = Array.from({ length: SX * SY }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, []);
  const nMask = Math.round(ratio * SX * SY);
  const masked = new Set(order.slice(0, nMask));
  const cubes: React.ReactNode[] = [];
  for (let sy = 0; sy < SY; sy++) for (let sx = 0; sx < SX; sx++) {
    const tube = sy * SX + sx, isM = masked.has(tube);
    for (let ti = 0; ti < T; ti++) {
      const pos: V = [sx - 1.5, ti * 0.34 - 0.85, sy - 1.5];
      cubes.push(isM
        ? <mesh key={`${tube}-${ti}`} position={pos}><boxGeometry args={[0.28, 0.28, 0.28]} /><meshStandardMaterial color="#94a3b8" transparent opacity={0.12} /></mesh>
        : <mesh key={`${tube}-${ti}`} position={pos}><boxGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color={`hsl(${250 - ti * 18}, 70%, 62%)`} roughness={0.5} /></mesh>);
    }
  }
  return (
    <FigureFrame
      title={{ en: "VideoMAE tube masking (3D)", zh: "VideoMAE 管状掩码（三维）" }}
      caption={{
        en: "A video is a space-time cube (height × width × time). Tube masking hides whole spatio-temporal tubes — the same spatial patches across ALL frames (the vertical = time axis) — so the model can't cheat by copying an adjacent frame; it must learn real motion. Raise the mask ratio.",
        zh: "视频是一个时空立方体（高 × 宽 × 时间）。管状掩码遮挡整条时空管——在所有帧上遮挡相同的空间块（竖直方向 = 时间轴）——所以模型无法靠复制相邻帧作弊，必须学习真实运动。调高掩码比例。",
      }}
      onReset={() => setRatio(0.6)}
    >
      <Frame cam={[4.4, 3.2, 4.4]}>
        {cubes}
        {tag("#6a5ef0", zh ? "时间 →" : "time →", [-2.1, 0.3, -1.5])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "掩码比例" : "mask ratio"} value={ratio} min={0} max={0.9} step={0.05} onChange={setRatio} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── D3 · TSDF fusion — multi-view depth completes a surface ───────────────────
export function TsdfFusion3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [views, setViews] = useState(3);
  useResizeKick();
  const pts = useMemo<V[]>(() => {
    const out: V[] = [], N = 220, gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i; out.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    return out;
  }, []);
  const camDirs = useMemo<V[]>(() => Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2; return [Math.cos(a), 0.25, Math.sin(a)]; }), []);
  const seen = (n: V) => camDirs.slice(0, views).some((c) => { const L = Math.hypot(...c); return (n[0] * c[0] + n[1] * c[1] + n[2] * c[2]) / L > 0.35; });
  return (
    <FigureFrame
      title={{ en: "TSDF fusion — depth → surface (3D)", zh: "TSDF 融合——深度 → 表面（三维）" }}
      caption={{
        en: "Each depth camera sees only the surface facing it. TSDF fusion averages many views into one volume, and the surface emerges where the signed distance crosses zero. Add views and watch the shell complete — more views convert a partial scan into a closed surface.",
        zh: "每个深度相机只能看到朝向它的表面。TSDF 融合把多视角平均进一个体素体，表面在有符号距离过零处浮现。增加视角，观察外壳逐渐补全——更多视角把局部扫描变成闭合表面。",
      }}
      onReset={() => setViews(3)}
    >
      <Frame cam={[2.8, 2.0, 2.8]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} position={[0, -1.2, 0]} />
        {pts.map((p, i) => seen(p)
          ? <mesh key={i} position={p}><boxGeometry args={[0.1, 0.1, 0.1]} /><meshStandardMaterial color="#e2e8f0" roughness={0.4} /></mesh>
          : <mesh key={i} position={p}><boxGeometry args={[0.07, 0.07, 0.07]} /><meshStandardMaterial color="#6a5ef0" transparent opacity={0.12} /></mesh>)}
        {camDirs.slice(0, views).map((c, i) => { const L = Math.hypot(...c); const p: V = [c[0] / L * 2, c[1] / L * 2, c[2] / L * 2]; return <Dot key={i} p={p} r={0.09} c="#1d9e75" />; })}
        {tag("#1d9e75", zh ? "深度相机" : "depth cams", [0, 2.3, 0])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "融合的视角数" : "views fused"} value={views} min={1} max={6} step={1} onChange={setViews} format={(v) => `${v}`} /></div>
    </FigureFrame>
  );
}
