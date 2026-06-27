import { useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const camX = 54;
const camY = 112;

export function PinholeProjection() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [angle, setAngle] = useState(-8);
  const [depth, setDepth] = useState(6);
  const [focal, setFocal] = useState(78);

  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const planeX = camX + focal;
  const t = 108 + depth * 16; // 124 .. 268 — stays in bounds
  const P = { x: camX + cos * t, y: camY + sin * t };
  const ghostT = t * 0.5; // a point at a different (closer) depth on the same ray
  const ghost = { x: camX + cos * ghostT, y: camY + sin * ghostT };
  const tPlane = (planeX - camX) / cos;
  const proj = { x: planeX, y: camY + sin * tPlane };

  return (
    <FigureFrame
      title={{ en: "Pinhole projection", zh: "针孔投影" }}
      caption={{
        en: "Drag depth: the world point P slides along the ray, but its projection on the image plane never moves — projection discards depth. The hollow point sits at a different depth on the same ray and lands on the very same pixel.",
        zh: "拖动「深度」：世界点 P 沿射线滑动，但它在像平面上的投影纹丝不动——投影丢弃了深度。空心点位于同一射线的另一深度处，却落在完全相同的像素上。",
      }}
      onReset={() => {
        setAngle(-8);
        setDepth(6);
        setFocal(78);
      }}
    >
      <svg viewBox="0 0 360 224" className="w-full">
        {/* image plane */}
        <line x1={planeX} y1={34} x2={planeX} y2={196} stroke="#6a5ef0" strokeWidth={2} />
        <text x={planeX} y={26} textAnchor="middle" fontSize="9" fill="#6a5ef0">
          {zh ? "像平面" : "image plane"}
        </text>
        {/* ray from camera through P */}
        <line x1={camX} y1={camY} x2={P.x} y2={P.y} stroke="#bdb8e8" strokeWidth={1.2} strokeDasharray="3 3" />
        {/* ghost point (different depth, same ray) */}
        <circle cx={ghost.x} cy={ghost.y} r={5} fill="none" stroke="#e0598b" strokeWidth={1.6} />
        <text x={ghost.x} y={ghost.y - 9} textAnchor="middle" fontSize="8" fill="#e0598b">
          {zh ? "另一深度" : "other depth"}
        </text>
        {/* world point P */}
        <circle cx={P.x} cy={P.y} r={6} fill="#1d9e75" />
        <text x={P.x + 10} y={P.y + 3} fontSize="10" fontWeight="600" fill="#1d9e75">
          P
        </text>
        {/* projection point on the image plane */}
        <circle cx={proj.x} cy={proj.y} r={4.5} fill="#6a5ef0" />
        <text x={proj.x - 8} y={proj.y + 3} textAnchor="end" fontSize="8" fill="#6a5ef0">
          {zh ? "像素" : "pixel"}
        </text>
        {/* camera */}
        <circle cx={camX} cy={camY} r={5} fill="currentColor" className="text-ink dark:text-stone-100" />
        <text x={camX} y={camY + 18} textAnchor="middle" fontSize="8" fill="currentColor" className="text-ink/60 dark:text-stone-400">
          {zh ? "相机" : "camera"}
        </text>
      </svg>
      <div className="mt-3 space-y-2">
        <Slider label={zh ? "深度 P" : "depth of P"} value={depth} min={1} max={10} step={0.5} onChange={setDepth} format={(v) => v.toFixed(1)} />
        <Slider label={zh ? "射线方向" : "ray angle"} value={angle} min={-16} max={10} onChange={setAngle} format={(v) => `${v}°`} />
        <Slider label={zh ? "焦距 f" : "focal length f"} value={focal} min={55} max={95} onChange={setFocal} />
      </div>
    </FigureFrame>
  );
}
