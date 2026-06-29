import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";

type V = [number, number, number];

// the head-mounted camera's view frustum: apex at the eye, a far rectangle toward the table
function Frustum({ reach }: { reach: number }) {
  const { apex, corners } = useMemo(() => {
    const apex: V = [0, 0, 0];
    const cz = -reach, cy = -0.55 * reach, hw = 0.42 * reach, hh = 0.3 * reach;
    const corners: V[] = [
      [-hw, cy + hh, cz], [hw, cy + hh, cz], [hw, cy - hh, cz], [-hw, cy - hh, cz],
    ];
    return { apex, corners };
  }, [reach]);
  return (
    <group>
      {corners.map((c, i) => <Line key={i} points={[apex, c]} color="#6a5ef0" lineWidth={1.5} />)}
      <Line points={[...corners, corners[0]]} color="#6a5ef0" lineWidth={2} />
      <mesh position={[0, -0.55 * reach, -reach]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.84 * reach, 0.6 * reach]} />
        <meshBasicMaterial color="#6a5ef0" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Hand({ from, to, color }: { from: V; to: V; color: string }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to);
    const dir = B.clone().sub(A), len = Math.max(0.05, dir.length());
    return { pos: A.clone().add(B).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()), len };
  }, [from, to]);
  return (
    <>
      <mesh position={pos} quaternion={quat}>
        <capsuleGeometry args={[0.05, len, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={to}><sphereGeometry args={[0.075, 16, 16]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
    </>
  );
}

// objects on the table (fixed in the WORLD — they don't move when the head turns)
function TableObject({ p, kind, color }: { p: V; kind: "plate" | "cup" | "knife"; color: string }) {
  if (kind === "plate") return <mesh position={p}><cylinderGeometry args={[0.22, 0.22, 0.03, 28]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>;
  if (kind === "cup") return <mesh position={p}><cylinderGeometry args={[0.1, 0.08, 0.18, 20]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>;
  return <mesh position={p} rotation={[0, 0.5, 0]}><boxGeometry args={[0.3, 0.02, 0.05]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.3} /></mesh>;
}

function Scene({ yaw, reach }: { yaw: number; reach: number }) {
  const zh = useStore((s) => s.lang) === "zh";
  const yr = (yaw * Math.PI) / 180;
  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow />
      {/* ground + table (WORLD frame, fixed) */}
      <gridHelper args={[8, 16, "#cbd5e1", "#e2e8f0"]} position={[0, 0, 0]} />
      <mesh position={[0, 0.72, 0]}><boxGeometry args={[1.8, 0.06, 1.05]} /><meshStandardMaterial color="#b08968" roughness={0.7} /></mesh>
      {([[-0.8, 0.36, -0.45], [0.8, 0.36, -0.45], [-0.8, 0.36, 0.45], [0.8, 0.36, 0.45]] as V[]).map((p, i) =>
        <mesh key={i} position={p}><boxGeometry args={[0.06, 0.72, 0.06]} /><meshStandardMaterial color="#8a6d52" /></mesh>)}
      <TableObject p={[-0.4, 0.78, 0.05]} kind="plate" color="#e2e8f0" />
      <TableObject p={[0.45, 0.84, 0.15]} kind="cup" color="#f59e0b" />
      <TableObject p={[0.05, 0.76, -0.25]} kind="knife" color="#cbd5e1" />

      {/* the WEARER: head + head-mounted camera + frustum + own hands — rotates as a unit (ego-motion) */}
      <group position={[0, 1.55, 1.95]} rotation={[0, yr, 0]}>
        <mesh><sphereGeometry args={[0.17, 24, 24]} /><meshStandardMaterial color="#f1c8a6" roughness={0.6} /></mesh>
        <mesh position={[0, 0.14, 0.08]}><boxGeometry args={[0.12, 0.07, 0.07]} /><meshStandardMaterial color="#0e9aa7" metalness={0.4} roughness={0.3} /></mesh>
        <mesh position={[0, 0.14, 0.13]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.03, 16]} /><meshStandardMaterial color="#67e8f9" /></mesh>
        <Frustum reach={reach} />
        <Hand from={[-0.12, -0.18, -0.05]} to={[-0.28, -0.5 * reach, -0.8 * reach]} color="#e0598b" />
        <Hand from={[0.12, -0.18, -0.05]} to={[0.3, -0.5 * reach, -0.8 * reach]} color="#e0598b" />
        <Html position={[0, 0.34, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div style={{ background: "#0e9aa7", color: "#fff", padding: "1px 5px", borderRadius: 5, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(0,0,0,.28)" }}>{zh ? "头戴相机" : "head-mounted camera"}</div>
        </Html>
      </group>
    </group>
  );
}

export function EgoView3D() {
  const zh = useStore((s) => s.lang) === "zh";
  const [yaw, setYaw] = useState(0);
  const [reach, setReach] = useState(2.1);
  useResizeKick();
  return (
    <FigureFrame
      title={{ en: "What makes egocentric different", zh: "第一人称的不同之处" }}
      caption={{
        en: "A head-mounted camera moves WITH the wearer — so when you turn your head, the whole world sweeps across the frame: that global (ego-)motion encodes attention, not just nuisance. And the wearer's own hands + the objects they manipulate enter from the bottom of the view (the manipulation zone). Drag to orbit; turn the head and watch the camera frustum sweep over the fixed table.",
        zh: "头戴相机随佩戴者一起移动——所以当你转头时，整个世界都会扫过画面：这种全局（自我）运动编码的是注意力，而非单纯干扰。而佩戴者自己的手与被操作物体从视野底部进入（操作区）。拖动可旋转视角；转动头部，观察相机视锥扫过固定的桌面。",
      }}
      onReset={() => { setYaw(0); setReach(2.1); }}
    >
      <div className="h-72 w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
        <Canvas camera={{ position: [3.4, 2.6, 4.2], fov: 42 }} dpr={[1, 2]}>
          <Scene yaw={yaw} reach={reach} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={9} maxPolarAngle={Math.PI / 2.05} />
        </Canvas>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#6a5ef0" }} />{zh ? "相机视锥（注视区）" : "camera frustum (gaze)"}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#e0598b" }} />{zh ? "自有手（从底部进入）" : "own hands (enter from below)"}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#0e9aa7" }} />{zh ? "头戴相机" : "head camera"}</span>
      </div>
      <div className="mt-2 space-y-2">
        <Slider label={zh ? "转头（自我运动）" : "head turn (ego-motion)"} value={yaw} min={-40} max={40} onChange={setYaw} format={(v) => `${v}°`} />
        <Slider label={zh ? "注视距离" : "gaze reach"} value={reach} min={1.4} max={2.6} step={0.05} onChange={setReach} format={(v) => v.toFixed(1)} />
      </div>
    </FigureFrame>
  );
}

export default EgoView3D;
