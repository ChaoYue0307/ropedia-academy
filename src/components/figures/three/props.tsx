import { type V } from "./Geometry3D";

// Small reusable 3D props for the table scenes. Each is centered on `p` so it can
// drop in where a plain primitive used to sit without shifting any distance/contact
// logic. `color` tints the main body (callers pass amber to mark an active/focused
// object); fixed accent colors stay put.

export function Cup({ p, color = "#cbd5e1" }: { p: V; color?: string }) {
  return (
    <group position={p}>
      <mesh><cylinderGeometry args={[0.1, 0.08, 0.17, 24]} /><meshStandardMaterial color={color} roughness={0.45} /></mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.093, 0.011, 10, 24]} /><meshStandardMaterial color={color} roughness={0.45} /></mesh>
      <mesh position={[0.118, -0.01, 0]}><torusGeometry args={[0.05, 0.013, 10, 20]} /><meshStandardMaterial color={color} roughness={0.45} /></mesh>
    </group>
  );
}

export function Plate({ p, color = "#e2e8f0" }: { p: V; color?: string }) {
  return (
    <group position={p}>
      <mesh><cylinderGeometry args={[0.19, 0.15, 0.03, 32]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
      <mesh position={[0, 0.017, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.16, 0.014, 12, 36]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
    </group>
  );
}

export function Knife({ p, color = "#cbd5e1" }: { p: V; color?: string }) {
  return (
    <group position={p} rotation={[0, 0.5, 0]}>
      <mesh position={[0.08, 0, 0]}><boxGeometry args={[0.26, 0.012, 0.055]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.25} /></mesh>
      <mesh position={[-0.12, 0, 0]}><boxGeometry args={[0.13, 0.032, 0.038]} /><meshStandardMaterial color="#3f3a44" roughness={0.6} /></mesh>
    </group>
  );
}

export function Bottle({ p, color = "#1d9e75" }: { p: V; color?: string }) {
  return (
    <group position={p}>
      <mesh position={[0, -0.04, 0]}><cylinderGeometry args={[0.07, 0.07, 0.2, 20]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.032, 0.06, 0.12, 16]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.03, 0.03, 0.04, 14]} /><meshStandardMaterial color="#2a2433" roughness={0.5} /></mesh>
    </group>
  );
}

export function Phone({ p, color = "#334155" }: { p: V; color?: string }) {
  return (
    <group position={p} rotation={[0, 0.3, 0]}>
      <mesh><boxGeometry args={[0.1, 0.014, 0.19]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
      <mesh position={[0, 0.009, 0]}><boxGeometry args={[0.086, 0.004, 0.17]} /><meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.3} /></mesh>
    </group>
  );
}

export function Chair({ p, color = "#8b5a2b" }: { p: V; color?: string }) {
  const legs: V[] = [[-0.1, -0.14, -0.1], [0.1, -0.14, -0.1], [-0.1, -0.14, 0.1], [0.1, -0.14, 0.1]];
  return (
    <group position={p}>
      <mesh><boxGeometry args={[0.27, 0.05, 0.27]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0, 0.19, -0.11]}><boxGeometry args={[0.27, 0.32, 0.05]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      {legs.map((l, i) => <mesh key={i} position={l}><boxGeometry args={[0.04, 0.28, 0.04]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>)}
    </group>
  );
}

// a pendant/hanging lamp — a cord runs up off-frame, so it reads naturally even when the node floats
export function Lamp({ p, color = "#67e8f9" }: { p: V; color?: string }) {
  return (
    <group position={p}>
      <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.13, 0.15, 22]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      <mesh position={[0, 0.02, 0]}><sphereGeometry args={[0.03, 12, 12]} /><meshStandardMaterial color="#fff7cc" emissive="#fde68a" emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.006, 0.006, 0.22, 8]} /><meshStandardMaterial color="#64748b" /></mesh>
    </group>
  );
}

export function TableProp({ p, color = "#b08968" }: { p: V; color?: string }) {
  const legs: V[] = [[-0.21, -0.12, -0.14], [0.21, -0.12, -0.14], [-0.21, -0.12, 0.14], [0.21, -0.12, 0.14]];
  return (
    <group position={p}>
      <mesh><boxGeometry args={[0.5, 0.04, 0.36]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      {legs.map((l, i) => <mesh key={i} position={l}><boxGeometry args={[0.04, 0.22, 0.04]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>)}
    </group>
  );
}

// a wooden crate (box + edge beams) — a more characterful 'object' than a plain cube
export function Crate({ p, size = 0.4, h = 0.75, color = "#b08968" }: { p: V; size?: number; h?: number; color?: string }) {
  const s = size / 2, edge = "#8a6d52";
  const verts: V[] = [[-s, 0, -s], [s, 0, -s], [-s, 0, s], [s, 0, s]];
  return (
    <group position={p}>
      <mesh><boxGeometry args={[size, h, size]} /><meshStandardMaterial color={color} roughness={0.78} /></mesh>
      {verts.map((v, i) => <mesh key={i} position={[v[0], 0, v[2]]}><boxGeometry args={[0.04, h + 0.006, 0.04]} /><meshStandardMaterial color={edge} roughness={0.7} /></mesh>)}
      <mesh position={[0, h / 2, 0]}><boxGeometry args={[size + 0.012, 0.04, size + 0.012]} /><meshStandardMaterial color={edge} roughness={0.7} /></mesh>
      <mesh position={[0, -h / 2, 0]}><boxGeometry args={[size + 0.012, 0.04, size + 0.012]} /><meshStandardMaterial color={edge} roughness={0.7} /></mesh>
    </group>
  );
}
