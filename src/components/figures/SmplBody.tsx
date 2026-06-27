import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

type P = [number, number];
const rot = (p: P, deg: number): P => {
  const r = (deg * Math.PI) / 180;
  return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)];
};
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];

export function SmplBody() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [height, setHeight] = useState(1);
  const [build, setBuild] = useState(1);
  const [arm, setArm] = useState(15);
  const [leg, setLeg] = useState(8);

  const h = height;
  const b = build;
  const pelvis: P = [180, 148];
  const neck: P = add(pelvis, [0, -58 * h]);
  const head: P = add(neck, [0, -15 * h]);
  const shoulderL: P = add(neck, [-20 * b, 4]);
  const shoulderR: P = add(neck, [20 * b, 4]);
  const elbowL = add(shoulderL, rot([0, 30 * h], -arm));
  const elbowR = add(shoulderR, rot([0, 30 * h], arm));
  const handL = add(elbowL, rot([0, 26 * h], -arm * 1.3));
  const handR = add(elbowR, rot([0, 26 * h], arm * 1.3));
  const hipL: P = add(pelvis, [-12 * b, 0]);
  const hipR: P = add(pelvis, [12 * b, 0]);
  const kneeL = add(hipL, rot([0, 34 * h], leg));
  const kneeR = add(hipR, rot([0, 34 * h], -leg));
  const footL = add(kneeL, rot([0, 30 * h], leg * 0.5));
  const footR = add(kneeR, rot([0, 30 * h], -leg * 0.5));

  const limb = (a: P, c: P, w: number) => (
    <line x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} stroke="#6a5ef0" strokeWidth={w} strokeLinecap="round" />
  );

  return (
    <FigureFrame
      title={{ en: "SMPL: shape β + pose θ", zh: "SMPL：形状 β + 姿态 θ" }}
      caption={{
        en: "A real SMPL body is ~6890 vertices, but you never predict those directly — you predict ~80 numbers: a low-dimensional shape vector β (height, build) and pose θ (joint rotations). Every setting is a valid human. That compact, differentiable space is what mesh-recovery networks regress.",
        zh: "真实 SMPL 身体约 6890 个顶点，但你从不直接预测它们——你预测约 80 个数：低维形状向量 β（身高、体型）与姿态 θ（关节旋转）。每种设置都是有效的人体。这个紧凑、可微的空间，正是网格恢复网络所回归的。",
      }}
      onReset={() => {
        setHeight(1);
        setBuild(1);
        setArm(15);
        setLeg(8);
      }}
    >
      <svg viewBox="0 0 360 250" className="mx-auto block max-w-[260px]">
        {/* legs */}
        {limb(hipL, kneeL, 9 * b)}
        {limb(kneeL, footL, 8 * b)}
        {limb(hipR, kneeR, 9 * b)}
        {limb(kneeR, footR, 8 * b)}
        {/* torso */}
        <line x1={neck[0]} y1={neck[1]} x2={pelvis[0]} y2={pelvis[1]} stroke="#6a5ef0" strokeWidth={20 * b} strokeLinecap="round" />
        {/* arms */}
        {limb(shoulderL, elbowL, 7 * b)}
        {limb(elbowL, handL, 6 * b)}
        {limb(shoulderR, elbowR, 7 * b)}
        {limb(elbowR, handR, 6 * b)}
        {/* head */}
        <circle cx={head[0]} cy={head[1]} r={13 * h} fill="#534ab7" />
        {/* joints */}
        {[neck, shoulderL, shoulderR, elbowL, elbowR, hipL, hipR, kneeL, kneeR].map((j, i) => (
          <circle key={i} cx={j[0]} cy={j[1]} r={2.4} fill="#fff" stroke="#372d71" strokeWidth={1} />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Slider label={`β · ${zh ? "身高" : "height"}`} value={height} min={0.78} max={1.22} step={0.02} onChange={setHeight} format={(v) => v.toFixed(2)} />
        <Slider label={`β · ${zh ? "体型" : "build"}`} value={build} min={0.7} max={1.4} step={0.02} onChange={setBuild} format={(v) => v.toFixed(2)} />
        <Slider label={`θ · ${zh ? "肩" : "arm"}`} value={arm} min={-20} max={80} onChange={setArm} format={(v) => `${v}°`} />
        <Slider label={`θ · ${zh ? "髋" : "leg"}`} value={leg} min={-12} max={32} onChange={setLeg} format={(v) => `${v}°`} />
      </div>
    </FigureFrame>
  );
}
