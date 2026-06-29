import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FigureFrame, Slider } from "../FigureFrame";
import { useStore } from "../../../lib/store";
import { useResizeKick } from "./kick";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion";

const vert = `
varying vec3 vPos;
void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const frag = `
precision highp float;
uniform vec3 uCam;
uniform float uDensity;
varying vec3 vPos;
const vec3 BG = vec3(0.05,0.045,0.09);

float blob(vec3 p, vec3 c, float k){ vec3 d=p-c; return exp(-dot(d,d)*k); }
float dens(vec3 p){
  return uDensity*( 1.1*blob(p, vec3(-0.35,0.15,0.0), 6.0)
                  + 1.0*blob(p, vec3(0.35,-0.1,0.1), 7.0)
                  + 0.7*blob(p, vec3(0.0,0.25,-0.3), 8.0) );
}
vec3 fieldColor(vec3 p){
  float a=1.1*blob(p, vec3(-0.35,0.15,0.0),6.0);
  float b=1.0*blob(p, vec3(0.35,-0.1,0.1),7.0);
  float c=0.7*blob(p, vec3(0.0,0.25,-0.3),8.0);
  float s=a+b+c+1e-4;
  return (a*vec3(0.11,0.62,0.46) + b*vec3(0.85,0.35,0.19) + c*vec3(0.42,0.36,0.94))/s;
}
void main(){
  vec3 ro = uCam;
  vec3 rd = normalize(vPos - ro);
  vec3 pos = vPos;
  vec3 acc = vec3(0.0);
  float T = 1.0;
  for(int i=0;i<72;i++){
    pos += rd*0.045;
    if(abs(pos.x)>1.02||abs(pos.y)>1.02||abs(pos.z)>1.02) break;
    float d = dens(pos);
    float a = 1.0 - exp(-d*0.5);
    acc += T*a*fieldColor(pos);
    T *= (1.0-a);
    if(T<0.02) break;
  }
  gl_FragColor = vec4(acc + BG*T, 1.0);
}
`;

function Volume({ density }: { density: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uCam: { value: new THREE.Vector3() }, uDensity: { value: density } }), []);
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uCam.value.copy(state.camera.position);
      matRef.current.uniforms.uDensity.value = density;
    }
  });
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <shaderMaterial ref={matRef} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} side={THREE.FrontSide} />
    </mesh>
  );
}

export default function NerfVolume3D() {
  useResizeKick();
  const reduce = usePrefersReducedMotion();
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [density, setDensity] = useState(2.4);

  return (
    <FigureFrame
      title={{ en: "NeRF radiance field in 3D (live)", zh: "三维 NeRF 辐射场（实时）" }}
      caption={{
        en: "Drag to orbit. A fragment shader marches a ray through a 3D radiance field for every pixel — sampling density & colour and accumulating front-to-back, exactly NeRF's differentiable volume rendering. Notice it is genuinely view-consistent as you rotate.",
        zh: "拖动可环绕观察。一个片元着色器为每个像素在三维辐射场中行进射线——采样密度与颜色并从前到后累积，正是 NeRF 的可微体渲染。旋转时它是真正视角一致的。",
      }}
      onReset={() => setDensity(2.4)}
      predict={{ en: "Raise the field density — will the object look more solid, or more transparent?", zh: "提高场密度——物体会看起来更实，还是更透明？" }}
    >
      <div role="img" aria-label="Interactive 3D NeRF volume render, orbitable" className="h-64 overflow-hidden rounded-xl">
        <Canvas camera={{ position: [0, 0.3, 3.0], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={["#0d0b16"]} />
          <Volume density={density} />
          <OrbitControls enablePan={false} autoRotate={!reduce} autoRotateSpeed={1.0} minDistance={2} maxDistance={6} />
        </Canvas>
      </div>
      <div className="mt-2">
        <Slider label={zh ? "场密度" : "field density"} value={density} min={0.6} max={5} step={0.2} onChange={setDensity} format={(v) => v.toFixed(1)} hint={zh ? "体的光学密度——越高，每条射线吸收的光越多，物体看起来越实。" : "Optical density of the volume — higher absorbs more light along each ray, so the object looks more solid."} />
      </div>
    </FigureFrame>
  );
}
