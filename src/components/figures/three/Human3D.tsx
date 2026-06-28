import { useMemo, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";
import { Frame, Dot, tag, GROUND, GRID2, type V } from "./Geometry3D";

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const rx = (v: V, a: number): V => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const hn = (s: number) => (Math.sin(s * 127.1) * 43758.5) % 1;   // deterministic noise in [-1,1]
const lerp3 = (a: V, b: V, u: number): V => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

function Bone({ a, b, r = 0.055, c = "#6a5ef0" }: { a: V; b: V; r?: number; c?: string }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const len = Math.max(0.02, d.length());
    return { pos: A.clone().add(B).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len };
  }, [a, b]);
  return <mesh position={pos} quaternion={quat}><capsuleGeometry args={[r, Math.max(0.02, len - 2 * r), 6, 12]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>;
}

// a capsule skeleton posed by leg/arm swing phases; rightElbow overrides the right elbow angle
function Body({ H = 1.7, W = 1, leg = 0, arm = 0.15, color = "#6a5ef0", rElbow, reach }: { H?: number; W?: number; leg?: number; arm?: number; color?: string; rElbow?: number; reach?: V }) {
  const pelvis: V = [0, 0, 0], chest: V = [0, 0.46 * H, 0], neck: V = [0, 0.6 * H, 0], head: V = [0, 0.74 * H, 0];
  const hipL: V = [-0.09 * W, 0, 0], hipR: V = [0.09 * W, 0, 0];
  const kneeL = add(hipL, rx([0, -0.42 * H, 0], leg)), kneeR = add(hipR, rx([0, -0.42 * H, 0], -leg));
  const footL = add(kneeL, rx([0, -0.4 * H, 0], leg * 0.5)), footR = add(kneeR, rx([0, -0.4 * H, 0], -leg * 0.5));
  const shL: V = [-0.17 * W, 0.52 * H, 0], shR: V = [0.17 * W, 0.52 * H, 0];
  const elL = add(shL, rx([-0.02, -0.27 * H, 0], arm)), haL = add(elL, rx([-0.01, -0.24 * H, 0], arm * 1.2));
  let elR: V, haR: V;
  if (reach) { elR = [(shR[0] + reach[0]) / 2, (shR[1] + reach[1]) / 2 + 0.04, (shR[2] + reach[2]) / 2]; haR = reach; }
  else { const ae = rElbow ?? -arm; elR = add(shR, rx([0.02, -0.27 * H, 0], ae)); haR = add(elR, rx([0.01, -0.24 * H, 0], ae * 1.2)); }
  const J = [pelvis, chest, neck, hipL, hipR, kneeL, kneeR, footL, footR, shL, shR, elL, elR, haL, haR];
  return (
    <group position={[0, 0.83 * H, 0]}>
      <Bone a={pelvis} b={chest} r={0.075} c={color} /><Bone a={chest} b={neck} c={color} />
      <Bone a={shL} b={shR} c={color} /><Bone a={chest} b={shL} c={color} /><Bone a={chest} b={shR} c={color} />
      <Bone a={shL} b={elL} c={color} /><Bone a={elL} b={haL} c={color} />
      <Bone a={shR} b={elR} c={color} /><Bone a={elR} b={haR} c={color} />
      <Bone a={pelvis} b={hipL} c={color} /><Bone a={pelvis} b={hipR} c={color} />
      <Bone a={hipL} b={kneeL} c={color} /><Bone a={kneeL} b={footL} c={color} />
      <Bone a={hipR} b={kneeR} c={color} /><Bone a={kneeR} b={footR} c={color} />
      <mesh position={head}><sphereGeometry args={[0.13 * H, 20, 20]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      {J.map((p, i) => <Dot key={i} p={p} r={0.035} c="#c6ccff" />)}
    </group>
  );
}

// ── A1 · SMPL parametric body (shape β) ──────────────────────────────────────
export function SmplShape3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [h, setH] = useState(1.7); const [w, setW] = useState(1);
  useResizeKick();
  return (
    <FigureFrame
      title={{ en: "SMPL — a parametric body (3D)", zh: "SMPL——参数化人体（三维）" }}
      caption={{ en: "SMPL represents any body as a low-dimensional vector: shape (β) sets the build, pose (θ) sets the joint angles. Here the shape parameters morph height and build continuously — a few numbers describe a whole person. Orbit to inspect.", zh: "SMPL 用低维向量表示任意人体：形状参数（β）决定体型，姿态参数（θ）决定关节角度。这里形状参数连续地改变身高与体型——几个数字就能描述整个人。旋转查看。" }}
      onReset={() => { setH(1.7); setW(1); }}
    >
      <Frame cam={[3.8, 1.7, 4.4]} target={[0, 1.25, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <Body H={h} W={w} />
      </Frame>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "形状 β₁（身高）" : "shape β₁ (height)"} value={h} min={1.4} max={2} step={0.02} onChange={setH} format={(v) => `${v.toFixed(2)}m`} />
        <Slider label={zh ? "形状 β₂（体型）" : "shape β₂ (build)"} value={w} min={0.7} max={1.5} step={0.02} onChange={setW} format={(v) => v.toFixed(2)} />
      </div>
    </FigureFrame>
  );
}

// ── A3 · Motion as a sequence of poses ───────────────────────────────────────
export function MotionSeq3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.25);
  useResizeKick();
  const phase = Math.sin(t * Math.PI * 2) * 0.6;     // a walking gait cycle
  return (
    <FigureFrame
      title={{ en: "Human motion = a sequence of poses (3D)", zh: "人体运动 = 姿态序列（三维）" }}
      caption={{ en: "Motion is a time series of poses. Scrub time to step through a walking cycle — the legs and arms swing in anti-phase. A motion model predicts the next pose given the past ones; orbit to see the 3D gait.", zh: "运动是姿态随时间的序列。拖动时间，逐步浏览一个步行周期——腿与手臂反相摆动。运动模型根据过去的姿态预测下一帧；旋转查看三维步态。" }}
      onReset={() => setT(0.25)}
    >
      <Frame cam={[3.8, 1.7, 4.4]} target={[0, 1.25, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <Body H={1.7} W={1} leg={phase} arm={-phase} color="#5a8bd6" />
      </Frame>
      <div className="mt-3"><Slider label={zh ? "时间（步态周期）" : "time (gait cycle)"} value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}

// ── A5 · Parametric hand (articulated) ───────────────────────────────────────
function Finger({ base, dir, grasp, n = 3, len = 0.16 }: { base: V; dir: V; grasp: number; n?: number; len?: number }) {
  const segs: React.ReactNode[] = []; let p = base, ang = 0;
  for (let i = 0; i < n; i++) {
    ang += grasp * (i === 0 ? 0.7 : 1);
    const d = rx([dir[0] * len, dir[1] * len, dir[2] * len], ang);
    const q = add(p, d);
    segs.push(<Bone key={i} a={p} b={q} r={0.03} c="#e0a07a" />); p = q;
  }
  return <>{segs}</>;
}
export function Hand3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [grasp, setGrasp] = useState(0.3);
  useResizeKick();
  return (
    <FigureFrame
      title={{ en: "Parametric hand — articulated (3D)", zh: "参数化手——可关节运动（三维）" }}
      caption={{ en: "A hand model has ~20 joint angles. Each finger is a chain of segments that curl together; the thumb opposes. Drive the grasp to open/close — the same low-dimensional control behind hand pose estimation & dexterous manipulation. Orbit to inspect.", zh: "手部模型约有 20 个关节角。每根手指是一串可一起弯曲的关节段，拇指与之对置。拖动抓握以开合——这正是手部姿态估计与灵巧操作背后的低维控制。旋转查看。" }}
      onReset={() => setGrasp(0.3)}
    >
      <Frame cam={[1.6, 1.2, 1.8]} target={[0, 0.1, 0]}>
        <mesh><boxGeometry args={[0.34, 0.1, 0.36]} /><meshStandardMaterial color="#e0a07a" roughness={0.6} /></mesh>
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => <group key={i} position={[x, 0, 0.18]}><Finger base={[0, 0, 0]} dir={[0, 0, 1]} grasp={grasp} len={0.13 + (i === 0 || i === 3 ? -0.02 : 0.02)} /></group>)}
        <group position={[-0.17, 0, -0.02]}><Finger base={[0, 0, 0]} dir={[-0.5, 0, 0.5]} grasp={grasp * 0.8} n={2} len={0.12} /></group>
      </Frame>
      <div className="mt-3"><Slider label={zh ? "抓握" : "grasp"} value={grasp} min={0} max={1.2} step={0.02} onChange={setGrasp} format={(v) => v < 0.2 ? (zh ? "张开" : "open") : v > 0.9 ? (zh ? "握拳" : "fist") : (zh ? "半握" : "half")} /></div>
    </FigureFrame>
  );
}

// ── A8 · Contact: hand-on-object + foot-on-ground ────────────────────────────
export function ContactScene3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [reach, setReach] = useState(0.55);
  useResizeKick();
  const box: V = [0.55, 0.75, 0.35];
  const hand: V = [0.32 + reach * 0.0, 0.75 - (0.55 - reach) * 0.6, 0.35];   // hand y meets box top as reach→
  const contact = Math.abs(hand[1] - 0.78) < 0.06;
  return (
    <FigureFrame
      title={{ en: "Contact constraints (3D)", zh: "接触约束（三维）" }}
      caption={{ en: "Real human-scene interaction obeys contact: feet rest ON the floor (not floating or sunk), and a reaching hand should TOUCH the object, not pass through it. Plausible reconstruction enforces these contacts. Move the hand to make/break contact with the box.", zh: "真实的人-场景交互遵守接触约束：脚踩在地面上（既不悬空也不陷入），伸出的手应当触碰物体而非穿过它。合理的重建会强制这些接触。移动手，与方块接触或断开。" }}
      onReset={() => setReach(0.55)}
    >
      <Frame cam={[3.8, 1.7, 4.4]} target={[0.1, 1.2, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <mesh position={[box[0], box[1] / 2, box[2]]}><boxGeometry args={[0.4, box[1], 0.4]} /><meshStandardMaterial color="#b08968" roughness={0.7} /></mesh>
        <Body H={1.6} W={1} reach={hand} color="#5aa86a" />
        <Dot p={[-0.144, 0.02, 0]} r={0.05} c="#1d9e75" /><Dot p={[0.144, 0.02, 0]} r={0.05} c="#1d9e75" />
        <Dot p={hand} r={0.06} c={contact ? "#1d9e75" : "#ef4444"} />
        {tag(contact ? "#1d9e75" : "#ef4444", contact ? (zh ? "接触 ✓" : "contact ✓") : (zh ? "未接触" : "no contact"), [hand[0], hand[1] + 0.25, hand[2]])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "伸手高度" : "hand height"} value={reach} min={0.2} max={0.9} step={0.02} onChange={setReach} format={(v) => v.toFixed(2)} /></div>
    </FigureFrame>
  );
}

// ── A9 · SMPLify: a pose prior pulls fits toward plausible poses ──────────────
export function SmplifyPrior3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [prior, setPrior] = useState(0.7);
  useResizeKick();
  const implausibleElbow = 2.4;                       // hyper-extended (impossible)
  const natural = -0.5;
  const ae = implausibleElbow + (natural - implausibleElbow) * prior;
  const ok = prior > 0.6;
  return (
    <FigureFrame
      title={{ en: "SMPLify — a pose prior (3D)", zh: "SMPLify——姿态先验（三维）" }}
      caption={{ en: "Fitting a body to 2D keypoints alone is ambiguous — many 3D poses reproject to the same points, including impossible ones (hyper-extended joints). A learned pose prior penalizes implausible angles, pulling the fit toward natural poses. Increase the prior weight and watch the arm settle.", zh: "仅凭 2D 关键点拟合人体是有歧义的——许多 3D 姿态会投影到相同的点，包括不可能的姿态（关节过度伸展）。学习到的姿态先验会惩罚不合理的角度，把拟合拉向自然姿态。增大先验权重，观察手臂回到自然。" }}
      onReset={() => setPrior(0.7)}
    >
      <Frame cam={[3.8, 1.7, 4.4]} target={[0, 1.25, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        <Body H={1.7} W={1} rElbow={ae} color={ok ? "#5aa86a" : "#d06a6a"} />
      </Frame>
      <div className="mt-3 space-y-2">
        <div className={"text-xs font-semibold " + (ok ? "text-emerald-600" : "text-red-500")}>{ok ? (zh ? "✓ 合理姿态" : "✓ plausible pose") : (zh ? "✗ 不可能的关节角" : "✗ impossible joint angle")}</div>
        <Slider label={zh ? "先验权重" : "prior weight"} value={prior} min={0} max={1} step={0.02} onChange={setPrior} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
    </FigureFrame>
  );
}

// ── A7 · Motion diffusion — denoise pure noise into a coherent pose ───────────
export function MotionDiffusion3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [t, setT] = useState(0.5);
  useResizeKick();
  const H = 1.7, off = 0.83 * H, leg = 0.18, arm = 0.22;
  const clean = useMemo<V[]>(() => {
    const pelvis: V = [0, 0, 0], chest: V = [0, 0.46 * H, 0], neck: V = [0, 0.6 * H, 0], head: V = [0, 0.74 * H, 0];
    const hipL: V = [-0.09, 0, 0], hipR: V = [0.09, 0, 0];
    const kneeL = add(hipL, rx([0, -0.42 * H, 0], leg)), kneeR = add(hipR, rx([0, -0.42 * H, 0], -leg));
    const footL = add(kneeL, rx([0, -0.4 * H, 0], leg * 0.5)), footR = add(kneeR, rx([0, -0.4 * H, 0], -leg * 0.5));
    const shL: V = [-0.17, 0.52 * H, 0], shR: V = [0.17, 0.52 * H, 0];
    const elL = add(shL, rx([-0.02, -0.27 * H, 0], arm)), elR = add(shR, rx([0.02, -0.27 * H, 0], -arm));
    const haL = add(elL, rx([-0.01, -0.24 * H, 0], arm * 1.2)), haR = add(elR, rx([0.01, -0.24 * H, 0], -arm * 1.2));
    return [pelvis, chest, neck, head, hipL, hipR, kneeL, kneeR, footL, footR, shL, shR, elL, elR, haL, haR].map((p) => [p[0], p[1] + off, p[2]] as V);
  }, []);
  const noise = useMemo<V[]>(() => clean.map((_, i) => [hn(i + 1) * 1.3, off + 0.2 + hn(i + 6) * 1.3, hn(i + 11) * 1.3]), [clean]);
  const cur = clean.map((p, i) => lerp3(noise[i], p, t));
  const bones = [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [4, 6], [6, 8], [5, 7], [7, 9], [1, 10], [1, 11], [10, 12], [12, 14], [11, 13], [13, 15], [10, 11]];
  return (
    <FigureFrame
      title={{ en: "Motion diffusion — denoise into a pose (3D)", zh: "运动扩散——去噪生成姿态（三维）" }}
      caption={{ en: "Diffusion models generate motion by starting from pure noise and iteratively DENOISING it into a plausible pose (and, over a window, a whole sequence) — the same DDPM recipe as image diffusion, applied to human motion (MDM). Scrub the denoising steps: a cloud of random joints organizes into a coherent body. Orbit to inspect.", zh: "扩散模型从纯噪声出发，迭代去噪，生成合理的姿态（在一个时间窗内则是整段序列）——与图像扩散相同的 DDPM 方法，用于人体运动（MDM）。拖动去噪步数：随机关节云逐渐组织成连贯的人体。旋转查看。" }}
      onReset={() => setT(0.5)}
    >
      <Frame cam={[3.8, 1.7, 4.4]} target={[0, 1.25, 0]}>
        <gridHelper args={[6, 12, GROUND, GRID2]} />
        {bones.map(([a, b], i) => <Line key={i} points={[cur[a], cur[b]]} color="#6a5ef0" lineWidth={4} transparent opacity={0.15 + 0.85 * t} />)}
        {cur.map((p, i) => <Dot key={i} p={p} r={0.055} c={t > 0.5 ? "#6a5ef0" : "#a3a8ff"} />)}
        {tag("#6a5ef0", t < 0.15 ? (zh ? "噪声" : "noise") : t > 0.85 ? (zh ? "姿态 ✓" : "pose ✓") : (zh ? "去噪中…" : "denoising…"), [0, 2.7, 0])}
      </Frame>
      <div className="mt-3"><Slider label={zh ? "去噪步数" : "denoising steps"} value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => `${Math.round(v * 100)}%`} /></div>
    </FigureFrame>
  );
}
