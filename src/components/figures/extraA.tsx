import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

// ── A2 · Pose heatmap → keypoint (soft-argmax) ───────────────────────────────
export function PoseHeatmap() {
  const zh = useStore((s) => s.lang) === "zh";
  const C = 18, R = 10, S = 18, X0 = 18, Y0 = 8;
  const [px, setPx] = useState(11);
  const [py, setPy] = useState(4);
  const [sig, setSig] = useState(1.6);
  const ax = Math.round(px), ay = Math.round(py);
  return (
    <FigureFrame
      title={{ en: "Heatmap → keypoint", zh: "热图 → 关键点" }}
      caption={{
        en: "A 2D pose head predicts a heatmap per joint, not raw (x,y). Its peak (✕, the soft-argmax) is the keypoint; a wide blob = high uncertainty. Drag the peak and its sharpness.",
        zh: "二维姿态头部为每个关节预测一张热图，而非直接回归 (x,y)。其峰值（✕，即 soft-argmax）就是关键点；越宽表示越不确定。拖动峰值与锐度。",
      }}
      onReset={() => { setPx(11); setPy(4); setSig(1.6); }}
    >
      <svg viewBox="0 0 360 188" className="w-full">
        {Array.from({ length: R }, (_, j) =>
          Array.from({ length: C }, (_, i) => {
            const v = Math.exp(-(((i - px) ** 2 + (j - py) ** 2) / (2 * sig * sig)));
            return (
              <rect key={`${i}-${j}`} x={X0 + i * S} y={Y0 + j * S} width={S - 1} height={S - 1} rx={2}
                fill="#6a5ef0" fillOpacity={0.06 + 0.9 * v} />
            );
          }),
        )}
        <g stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
          <line x1={X0 + ax * S + S / 2 - 5} y1={Y0 + ay * S + S / 2 - 5} x2={X0 + ax * S + S / 2 + 5} y2={Y0 + ay * S + S / 2 + 5} />
          <line x1={X0 + ax * S + S / 2 - 5} y1={Y0 + ay * S + S / 2 + 5} x2={X0 + ax * S + S / 2 + 5} y2={Y0 + ay * S + S / 2 - 5} />
        </g>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "峰值 x" : "peak x"} value={px} min={1} max={16} step={0.5} onChange={setPx} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "峰值 y" : "peak y"} value={py} min={1} max={8} step={0.5} onChange={setPy} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "锐度 (1/σ)" : "sharpness"} value={sig} min={0.8} max={4} step={0.1} onChange={setSig} format={(v) => v.toFixed(1)} />
      </div>
    </FigureFrame>
  );
}

// ── A3 · Motion = a sequence; velocity is translation-invariant ──────────────
export function MotionSequence() {
  const zh = useStore((s) => s.lang) === "zh";
  const [shift, setShift] = useState(0);
  const T = 48, X0 = 24, W = 320, mid = 96;
  const pos = (t: number) => 40 * Math.sin((t / T) * Math.PI * 3);
  const path = (fn: (t: number) => number, off: number) =>
    Array.from({ length: T + 1 }, (_, t) => `${X0 + (t / T) * W},${mid + off - fn(t)}`).join(" ");
  const posPts = path((t) => pos(t), -shift);
  const velPts = path((t) => (pos(t + 1) - pos(t - 1)) * 1.6, 40);
  return (
    <FigureFrame
      title={{ en: "Motion is a sequence", zh: "运动是一个序列" }}
      caption={{
        en: "A motion backbone encodes the whole sequence, not one frame. Shift the body in space: the position curve moves, but the velocity curve is unchanged — velocities are translation-invariant, so the same action anywhere looks identical.",
        zh: "运动骨干编码整段序列，而非单帧。把身体在空间中平移：位置曲线移动，但速度曲线不变——速度对平移不变，所以同一动作在任何位置看起来都一样。",
      }}
      onReset={() => setShift(0)}
    >
      <svg viewBox="0 0 360 172" className="w-full">
        <text x={X0} y={mid - 64} fontSize="9" fill="#a7a4c4">{zh ? "位置 (随平移移动)" : "position (moves with shift)"}</text>
        <polyline points={posPts} fill="none" stroke="#e0598b" strokeWidth={2} />
        <line x1={X0} y1={mid + 56} x2={X0 + W} y2={mid + 56} stroke="#d8d5ea" strokeWidth={1} strokeDasharray="2 3" />
        <text x={X0} y={mid + 18} fontSize="9" fill="#1d9e75">{zh ? "速度 (不变)" : "velocity (invariant)"}</text>
        <polyline points={velPts} fill="none" stroke="#1d9e75" strokeWidth={2.4} />
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "空间平移" : "spatial shift"} value={shift} min={-40} max={40} onChange={setShift} format={(v) => `${v}`} />
      </div>
    </FigureFrame>
  );
}

// ── A5 · One parametric recipe (MANO/FLAME/SMPL); hand for contact ───────────
export function ParametricHand() {
  const zh = useStore((s) => s.lang) === "zh";
  const [curl, setCurl] = useState(0.25);
  const [wide, setWide] = useState(1);
  const [objY, setObjY] = useState(60);
  const cx = 150, palmY = 150, palmW = 46 * wide, palmH = 46;
  const knuckle = palmY - palmH;
  const fingers = [-1.6, -0.8, 0, 0.8, 1.6];
  const tips = fingers.map((f) => {
    const bx = cx + f * (palmW / 2.6);
    const len = 40 - Math.abs(f) * 4;
    const ang = -Math.PI / 2 + curl * 1.4 * (f === 0 ? 1 : 1);
    return { bx, tx: bx + Math.cos(ang) * len * 0.2, ty: knuckle + Math.sin(ang) * len };
  });
  const obj = { x: 250, y: objY };
  const dist = Math.min(...tips.map((t) => Math.hypot(t.tx - obj.x, t.ty - obj.y)));
  const contact = dist < 34;
  return (
    <FigureFrame
      title={{ en: "MANO / FLAME = SMPL, specialized", zh: "MANO / FLAME = SMPL 的特化" }}
      caption={{
        en: "Hands (MANO) and faces (FLAME) reuse SMPL's recipe — identity blendshapes (shape β) + articulation (pose θ). A 3D hand mesh (not a box) is what lets you reason about contact: move the object and watch the grasp distance.",
        zh: "手（MANO）与脸（FLAME）复用 SMPL 的配方——身份混合形变（形状 β）+ 关节运动（姿态 θ）。是 3D 手部网格（而非框）让你能推理接触：移动物体，观察抓取距离。",
      }}
      onReset={() => { setCurl(0.25); setWide(1); setObjY(60); }}
    >
      <svg viewBox="0 0 360 188" className="w-full">
        <rect x={cx - palmW / 2} y={knuckle} width={palmW} height={palmH} rx={10} fill="#e0598b" fillOpacity={0.85} />
        {tips.map((t, i) => (
          <g key={i}>
            <line x1={t.bx} y1={knuckle} x2={t.tx} y2={t.ty} stroke="#e0598b" strokeWidth={6} strokeLinecap="round" />
            <circle cx={t.tx} cy={t.ty} r={3.5} fill={contact ? "#1d9e75" : "#e0598b"} />
          </g>
        ))}
        <circle cx={obj.x} cy={obj.y} r={16} fill="#378add" fillOpacity={0.85} />
        <text x={obj.x} y={obj.y + 4} textAnchor="middle" fontSize="9" fill="#fff">{zh ? "物体" : "obj"}</text>
        <text x={20} y={24} fontSize="10" fontWeight="600" fill={contact ? "#1d9e75" : "#9ca3af"}>
          {contact ? (zh ? "✓ 接触" : "✓ contact") : (zh ? "无接触" : "no contact")} · d={dist.toFixed(0)}
        </text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "姿态 θ (弯曲)" : "pose θ (curl)"} value={curl} min={0} max={1} step={0.02} onChange={setCurl} format={(v) => v.toFixed(2)} />
        <Slider label={zh ? "形状 β (宽度)" : "shape β (width)"} value={wide} min={0.7} max={1.4} step={0.02} onChange={setWide} format={(v) => v.toFixed(2)} />
        <Slider label={zh ? "物体高度" : "object y"} value={objY} min={40} max={150} onChange={setObjY} />
      </div>
    </FigureFrame>
  );
}

// ── A6 · Rotation representations: continuous vs discontinuous ────────────────
export function RotationContinuity() {
  const zh = useStore((s) => s.lang) === "zh";
  const [deg, setDeg] = useState(150);
  const rad = (deg * Math.PI) / 180;
  const ccx = 78, ccy = 96, r = 54;
  // plot box
  const PX = 168, PW = 176, PY = 36, PH = 120;
  const x = (d: number) => PX + (d / 360) * PW;
  const wrapY = (d: number) => { const w = ((d + 180) % 360) - 180; return PY + PH / 2 - (w / 180) * (PH / 2 - 4); };
  const cosY = (d: number) => PY + PH / 2 - Math.cos((d * Math.PI) / 180) * (PH / 2 - 4);
  const samples = Array.from({ length: 73 }, (_, i) => i * 5);
  const wrapSegs: string[][] = [[]];
  samples.forEach((d, i) => {
    if (i > 0 && Math.abs((((d + 180) % 360) - 180) - ((((d - 5) + 180) % 360) - 180)) > 180) wrapSegs.push([]);
    wrapSegs[wrapSegs.length - 1].push(`${x(d)},${wrapY(d)}`);
  });
  return (
    <FigureFrame
      title={{ en: "Why networks regress 6D rotations", zh: "为何网络回归 6D 旋转" }}
      caption={{
        en: "Spin the rotation. A low-dimensional angle (≤4D, e.g. Euler/quaternion) is discontinuous — it jumps at the seam (red), which networks learn badly. A continuous encoding like cos θ (a column of the matrix / the 6D rep) never jumps.",
        zh: "旋转一下。低维角度（≤4D，如欧拉角/四元数）是不连续的——会在接缝处跳变（红色），网络很难学。像 cos θ 这样的连续编码（旋转矩阵的一列 / 6D 表示）则永不跳变。",
      }}
      onReset={() => setDeg(150)}
    >
      <svg viewBox="0 0 360 184" className="w-full">
        {/* rotating frame */}
        <circle cx={ccx} cy={ccy} r={r} fill="none" stroke="#d8d5ea" strokeWidth={1.5} />
        <line x1={ccx} y1={ccy} x2={ccx + Math.cos(rad) * r} y2={ccy - Math.sin(rad) * r} stroke="#6a5ef0" strokeWidth={3} strokeLinecap="round" />
        <line x1={ccx} y1={ccy} x2={ccx - Math.sin(rad) * r * 0.7} y2={ccy - Math.cos(rad) * r * 0.7} stroke="#e0598b" strokeWidth={2} strokeLinecap="round" />
        <circle cx={ccx} cy={ccy} r={3} fill="currentColor" className="text-ink dark:text-stone-200" />
        {/* plot */}
        <rect x={PX} y={PY} width={PW} height={PH} rx={6} fill="currentColor" className="text-stone-100 dark:text-white/5" />
        {wrapSegs.map((seg, i) => <polyline key={i} points={seg.join(" ")} fill="none" stroke="#ef4444" strokeWidth={2} />)}
        <polyline points={samples.map((d) => `${x(d)},${cosY(d)}`).join(" ")} fill="none" stroke="#1d9e75" strokeWidth={2} />
        <line x1={x(deg)} y1={PY} x2={x(deg)} y2={PY + PH} stroke="#9ca3af" strokeWidth={1} strokeDasharray="2 2" />
        <text x={PX} y={PY - 6} fontSize="8.5" fill="#ef4444">{zh ? "角度 (跳变)" : "angle (jumps)"}</text>
        <text x={PX + PW} y={PY - 6} textAnchor="end" fontSize="8.5" fill="#1d9e75">cos θ {zh ? "(连续)" : "(continuous)"}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "旋转 θ" : "rotation θ"} value={deg} min={0} max={360} onChange={setDeg} format={(v) => `${v}°`} />
      </div>
    </FigureFrame>
  );
}

// ── A7 · Motion diffusion: denoise noise into coherent motion ────────────────
const NOISE = Array.from({ length: 49 }, (_, i) => Math.sin(i * 2.3) * 0.6 + Math.cos(i * 5.1) * 0.4);
export function MotionDiffusion() {
  const zh = useStore((s) => s.lang) === "zh";
  const [step, setStep] = useState(0.7); // 1 = pure noise, 0 = clean
  const T = 48, X0 = 24, W = 320, mid = 92;
  const pts = Array.from({ length: T + 1 }, (_, t) => {
    const clean = 46 * Math.sin((t / T) * Math.PI * 2);
    const y = mid - (clean + NOISE[t] * 70 * step);
    return `${X0 + (t / T) * W},${y}`;
  }).join(" ");
  return (
    <FigureFrame
      title={{ en: "Motion diffusion", zh: "运动扩散" }}
      caption={{
        en: "A motion prior generates by denoising: start from random noise and iteratively remove it until a coherent motion remains. Drag the denoising step from noise (right) toward a clean, plausible trajectory.",
        zh: "运动先验通过去噪来生成：从随机噪声出发，迭代地去除噪声，直到剩下一段连贯运动。把去噪步从噪声（右）拖向干净、合理的轨迹。",
      }}
      onReset={() => setStep(0.7)}
    >
      <svg viewBox="0 0 360 168" className="w-full">
        <line x1={X0} y1={mid} x2={X0 + W} y2={mid} stroke="#d8d5ea" strokeWidth={1} strokeDasharray="2 3" />
        <polyline points={pts} fill="none" stroke={step > 0.5 ? "#9ca3af" : "#e0598b"} strokeWidth={2.4} />
        <text x={X0} y={20} fontSize="10" fontWeight="600" fill={step > 0.5 ? "#9ca3af" : "#1d9e75"}>
          {step > 0.85 ? (zh ? "纯噪声" : "pure noise") : step < 0.15 ? (zh ? "连贯运动 ✓" : "coherent motion ✓") : (zh ? "去噪中…" : "denoising…")}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "噪声 ← → 去噪" : "noise ← → clean"} value={1 - step} min={0} max={1} step={0.02} onChange={(v) => setStep(1 - v)} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
    </FigureFrame>
  );
}

// ── A8 · Human–scene: contact + non-penetration ──────────────────────────────
export function ContactScene() {
  const zh = useStore((s) => s.lang) === "zh";
  const [h, setH] = useState(96); // hip y
  const floor = 170, legLen = 34;
  const feetY = h + legLen + 10;
  const gap = feetY - floor; // 0 = on floor
  const obs = { x: 206, y: 116, w: 64, h: 54 };
  const bodyX = 120;
  const pen = Math.max(0, (h + 30) - obs.y) > 0 && bodyX + 18 > obs.x ? Math.max(0, feetY - obs.y) : 0;
  return (
    <FigureFrame
      title={{ en: "Contact & non-penetration", zh: "接触与非穿插" }}
      caption={{
        en: "A recovered body must obey physics: feet supported on the floor, and no interpenetration with the scene. These constraints are free supervision (no labels) and resolve depth the image alone can't. Raise/lower the body.",
        zh: "恢复出的身体必须遵守物理：脚被地面支撑，且不与场景穿插。这些约束是免费的监督（无需标注），并能消解图像本身无法确定的深度。上下移动身体。",
      }}
      onReset={() => setH(96)}
    >
      <svg viewBox="0 0 360 196" className="w-full">
        <line x1={20} y1={floor} x2={340} y2={floor} stroke="#9ca3af" strokeWidth={2} />
        <rect x={obs.x} y={obs.y} width={obs.w} height={obs.h} rx={6} fill="#378add" fillOpacity={pen > 0 ? 0.5 : 0.28} stroke="#378add" />
        <text x={obs.x + obs.w / 2} y={obs.y + 30} textAnchor="middle" fontSize="9" fill="#378add">{zh ? "场景" : "scene"}</text>
        {/* body */}
        <circle cx={bodyX} cy={h - 22} r={12} fill="#e0598b" />
        <line x1={bodyX} y1={h - 10} x2={bodyX} y2={h + 30} stroke="#e0598b" strokeWidth={5} strokeLinecap="round" />
        <line x1={bodyX} y1={h + 30} x2={bodyX - 12} y2={feetY} stroke="#e0598b" strokeWidth={4} strokeLinecap="round" />
        <line x1={bodyX} y1={h + 30} x2={bodyX + 12} y2={feetY} stroke="#e0598b" strokeWidth={4} strokeLinecap="round" />
        <text x={20} y={22} fontSize="10" fontWeight="600" fill={Math.abs(gap) < 6 ? "#1d9e75" : "#9ca3af"}>
          {Math.abs(gap) < 6 ? (zh ? "✓ 脚在地面" : "✓ feet on floor") : gap < 0 ? (zh ? "悬空" : "floating") : (zh ? "穿地" : "below floor")}
        </text>
        <text x={340} y={22} textAnchor="end" fontSize="10" fontWeight="600" fill={pen > 0 ? "#ef4444" : "#1d9e75"}>
          {pen > 0 ? (zh ? "✗ 穿插场景" : "✗ penetrating") : (zh ? "✓ 无穿插" : "✓ no penetration")}
        </text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "身体高度" : "body height"} value={h} min={70} max={150} onChange={setH} />
      </div>
    </FigureFrame>
  );
}

// ── A9 · SMPLify: the pose prior breaks depth ambiguity ──────────────────────
export function SmplifyPrior() {
  const zh = useStore((s) => s.lang) === "zh";
  const [prior, setPrior] = useState(0.8);
  const S = { x: 110, y: 60 }, H = { x: 250, y: 150 }; // shoulder, observed hand (2D)
  const L1 = 78, L2 = 78;
  const dx = H.x - S.x, dy = H.y - S.y, D = Math.hypot(dx, dy);
  const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D);
  const hgt = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const mx = S.x + (a * dx) / D, my = S.y + (a * dy) / D;
  const ex = mx - (hgt * dy) / D, ey = my + (hgt * dx) / D; // "down/out" (natural)
  const ex2 = mx + (hgt * dy) / D, ey2 = my - (hgt * dx) / D; // flipped
  const natural = prior >= 0.5;
  const E = natural ? { x: ex, y: ey } : { x: ex2, y: ey2 };
  const G = natural ? { x: ex2, y: ey2 } : { x: ex, y: ey };
  return (
    <FigureFrame
      title={{ en: "SMPLify: why a pose prior?", zh: "SMPLify：为何要姿态先验？" }}
      caption={{
        en: "Both elbow solutions reproject onto the SAME 2D keypoints (error ≈ 0), so reprojection alone is depth-ambiguous. The pose prior selects the plausible pose; drop its weight and the fit flips to an unnatural elbow.",
        zh: "两种肘部解都重投影到相同的 2D 关键点（误差 ≈ 0），所以仅靠重投影是深度歧义的。姿态先验挑出合理姿态；调低其权重，拟合就会翻到不自然的肘部。",
      }}
      onReset={() => setPrior(0.8)}
    >
      <svg viewBox="0 0 360 196" className="w-full">
        {/* ghost (rejected) solution */}
        <line x1={S.x} y1={S.y} x2={G.x} y2={G.y} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
        <line x1={G.x} y1={G.y} x2={H.x} y2={H.y} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
        {/* chosen solution */}
        <line x1={S.x} y1={S.y} x2={E.x} y2={E.y} stroke={natural ? "#1d9e75" : "#ef4444"} strokeWidth={5} strokeLinecap="round" />
        <line x1={E.x} y1={E.y} x2={H.x} y2={H.y} stroke={natural ? "#1d9e75" : "#ef4444"} strokeWidth={5} strokeLinecap="round" />
        <circle cx={S.x} cy={S.y} r={6} fill="#e0598b" /><text x={S.x - 10} y={S.y} textAnchor="end" fontSize="9" fill="#e0598b">{zh ? "肩" : "shoulder"}</text>
        <circle cx={H.x} cy={H.y} r={6} fill="#6a5ef0" /><text x={H.x + 10} y={H.y + 4} fontSize="9" fill="#6a5ef0">{zh ? "手 (2D)" : "hand (2D)"}</text>
        <circle cx={E.x} cy={E.y} r={5} fill={natural ? "#1d9e75" : "#ef4444"} />
        <text x={20} y={22} fontSize="10" fontWeight="600" fill={natural ? "#1d9e75" : "#ef4444"}>
          {natural ? (zh ? "✓ 合理姿态" : "✓ plausible pose") : (zh ? "✗ 不自然 (翻转)" : "✗ implausible (flipped)")}
        </text>
        <text x={340} y={22} textAnchor="end" fontSize="9" fill="#9ca3af">{zh ? "重投影误差 ≈ 0 (两者)" : "reproj err ≈ 0 (both)"}</text>
      </svg>
      <div className="mt-3">
        <Slider label={zh ? "先验权重" : "prior weight"} value={prior} min={0} max={1} step={0.02} onChange={setPrior} format={(v) => v.toFixed(2)} />
      </div>
    </FigureFrame>
  );
}
