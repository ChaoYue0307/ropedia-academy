import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";

type V = [number, number, number];
const rotX = (down: number, ang: number): V => [0, down * Math.cos(ang), down * -Math.sin(ang)];
const addv = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scal = (v: V, s: number): V => [v[0] * s, v[1] * s, v[2] * s];

function Bone({ a, b, r, color }: { a: V; b: V; r: number; color: string }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const len = Math.max(0.02, dir.length());
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: mid, quat, len };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <capsuleGeometry args={[r, Math.max(0.02, len - 2 * r), 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

function Joint({ p, r }: { p: V; r: number }) {
  return (
    <mesh position={p}>
      <sphereGeometry args={[r, 16, 16]} />
      <meshStandardMaterial color="#c6ccff" roughness={0.3} />
    </mesh>
  );
}

function Body({ height: h, build: b, arm, leg }: { height: number; build: number; arm: number; leg: number }) {
  const aR = (arm * Math.PI) / 180;
  const lR = (leg * Math.PI) / 180;
  const pelvis: V = [0, 0, 0];
  const chest: V = [0, 0.5 * h, 0];
  const neck: V = [0, 0.68 * h, 0];
  const head: V = [0, 0.86 * h, 0];
  const shL: V = [-0.18 * b, 0.62 * h, 0];
  const shR: V = [0.18 * b, 0.62 * h, 0];
  const elL = addv(shL, scal(rotX(-1, aR), 0.28 * h));
  const elR = addv(shR, scal(rotX(-1, -aR), 0.28 * h));
  const haL = addv(elL, scal(rotX(-1, aR * 1.3), 0.24 * h));
  const haR = addv(elR, scal(rotX(-1, -aR * 1.3), 0.24 * h));
  const hipL: V = [-0.1 * b, 0, 0];
  const hipR: V = [0.1 * b, 0, 0];
  const knL = addv(hipL, scal(rotX(-1, lR), 0.36 * h));
  const knR = addv(hipR, scal(rotX(-1, -lR), 0.36 * h));
  const ftL = addv(knL, scal(rotX(-1, lR * 0.4), 0.32 * h));
  const ftR = addv(knR, scal(rotX(-1, -lR * 0.4), 0.32 * h));
  const C = "#6a5ef0";
  const tw = 0.07 * b;

  return (
    <group position={[0, -0.15, 0]}>
      <Bone a={pelvis} b={chest} r={tw * 1.6} color={C} />
      <Bone a={chest} b={neck} r={tw} color={C} />
      <Bone a={shL} b={shR} r={tw * 0.9} color={C} />
      <mesh position={head}>
        <sphereGeometry args={[0.12 * h, 24, 24]} />
        <meshStandardMaterial color="#534ab7" roughness={0.4} />
      </mesh>
      <Bone a={shL} b={elL} r={tw * 0.6} color={C} />
      <Bone a={elL} b={haL} r={tw * 0.5} color={C} />
      <Bone a={shR} b={elR} r={tw * 0.6} color={C} />
      <Bone a={elR} b={haR} r={tw * 0.5} color={C} />
      <Bone a={hipL} b={knL} r={tw * 0.8} color={C} />
      <Bone a={knL} b={ftL} r={tw * 0.7} color={C} />
      <Bone a={hipR} b={knR} r={tw * 0.8} color={C} />
      <Bone a={knR} b={ftR} r={tw * 0.7} color={C} />
      {[chest, neck, shL, shR, elL, elR, hipL, hipR, knL, knR].map((p, i) => (
        <Joint key={i} p={p} r={tw * 0.55} />
      ))}
    </group>
  );
}

export default function SmplBody3D() {
  useResizeKick();
  const reduce = usePrefersReducedMotion();
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [height, setHeight] = useState(1);
  const [build, setBuild] = useState(1);
  const [arm, setArm] = useState(35);
  const [leg, setLeg] = useState(18);

  return (
    <FigureFrame
      title={{ en: "SMPL body in 3D (live)", zh: "三维 SMPL 人体（实时）" }}
      caption={{
        en: "Drag to orbit a real 3D articulated body. Shape sliders (β) change proportions; pose sliders (θ) rotate joints — exactly the compact parameters a mesh-recovery network predicts, here rendered live in three.js.",
        zh: "拖动可环绕观察一个真实的三维关节人体。形状滑块（β）改变比例；姿态滑块（θ）旋转关节——正是网格恢复网络所预测的紧凑参数，这里用 three.js 实时渲染。",
      }}
      onReset={() => {
        setHeight(1);
        setBuild(1);
        setArm(35);
        setLeg(18);
      }}
    >
      <div className="h-64 overflow-hidden rounded-xl bg-gradient-to-b from-[#0c0b16] to-[#1c1a30]">
        <Canvas camera={{ position: [0, 0.3, 2.6], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.1} />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#a3a8ff" />
          <Body height={height} build={build} arm={arm} leg={leg} />
          <OrbitControls enablePan={false} autoRotate={!reduce} autoRotateSpeed={0.9} target={[0, 0.25, 0]} minDistance={1.6} maxDistance={5} />
        </Canvas>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Slider label={`β · ${zh ? "身高" : "height"}`} value={height} min={0.8} max={1.2} step={0.02} onChange={setHeight} format={(v) => v.toFixed(2)} />
        <Slider label={`β · ${zh ? "体型" : "build"}`} value={build} min={0.7} max={1.4} step={0.02} onChange={setBuild} format={(v) => v.toFixed(2)} />
        <Slider label={`θ · ${zh ? "臂摆" : "arm"}`} value={arm} min={-20} max={150} onChange={setArm} format={(v) => `${v}°`} />
        <Slider label={`θ · ${zh ? "腿摆" : "leg"}`} value={leg} min={-30} max={60} onChange={setLeg} format={(v) => `${v}°`} />
      </div>
    </FigureFrame>
  );
}
