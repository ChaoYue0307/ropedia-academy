import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";

function Splats({ count, size, opacity }: { count: number; size: number; opacity: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const points = useMemo(() => {
    const arr: { p: THREE.Vector3; c: THREE.Color }[] = [];
    const R = 1.15;
    const r = 0.45;
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const jr = r * (0.7 + Math.random() * 0.5);
      const p = new THREE.Vector3(
        (R + jr * Math.cos(v)) * Math.cos(u),
        (R + jr * Math.cos(v)) * Math.sin(u),
        jr * Math.sin(v),
      );
      const c = new THREE.Color().setHSL((u / (Math.PI * 2) + 0.55) % 1, 0.6, 0.6);
      arr.push({ p, c });
    }
    return arr;
  }, [count]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    points.forEach((pt, i) => {
      dummy.position.copy(pt.p);
      dummy.scale.set(size, size * 0.6, size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, pt.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [points, size]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={opacity} depthWrite={false} />
    </instancedMesh>
  );
}

export default function GaussianSplat3D() {
  useResizeKick();
  const reduce = usePrefersReducedMotion();
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [count, setCount] = useState(1400);
  const [size, setSize] = useState(0.12);
  const [opacity, setOpacity] = useState(0.55);

  return (
    <FigureFrame
      title={{ en: "3D Gaussian Splatting (live)", zh: "三维高斯泼溅（实时）" }}
      caption={{
        en: "Drag to orbit. The scene is nothing but a cloud of colored, semi-transparent 3D Gaussians (ellipsoids) — rasterized and alpha-blended, which is why 3DGS renders in real time. Fewer, larger splats stay smooth; more, smaller ones add detail.",
        zh: "拖动可环绕观察。整个场景不过是一团有色、半透明的 3D 高斯（椭球）——经光栅化与 alpha 混合，这正是 3DGS 能实时渲染的原因。更少更大的泼溅更平滑；更多更小的则增添细节。",
      }}
      onReset={() => {
        setCount(1400);
        setSize(0.12);
        setOpacity(0.55);
      }}
    >
      <div className="h-64 overflow-hidden rounded-xl bg-gradient-to-b from-[#0b0a14] to-[#1a1830]">
        <Canvas camera={{ position: [0, 1.2, 3.4], fov: 45 }} dpr={[1, 2]}>
          <Splats count={count} size={size} opacity={opacity} />
          <OrbitControls enablePan={false} autoRotate={!reduce} autoRotateSpeed={0.8} minDistance={2} maxDistance={6} />
        </Canvas>
      </div>
      <div className="mt-2 space-y-2">
        <Slider label={zh ? "高斯数量" : "# splats"} value={count} min={300} max={4000} step={100} onChange={(v) => setCount(Math.round(v))} />
        <Slider label={zh ? "泼溅大小" : "splat size"} value={size} min={0.05} max={0.22} step={0.01} onChange={setSize} format={(v) => v.toFixed(2)} />
        <Slider label={zh ? "不透明度" : "opacity"} value={opacity} min={0.2} max={1} step={0.05} onChange={setOpacity} format={(v) => v.toFixed(2)} />
      </div>
    </FigureFrame>
  );
}
