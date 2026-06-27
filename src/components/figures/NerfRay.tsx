import { useMemo, useState } from "react";
import { FigureFrame, Slider } from "./FigureFrame";
import { useStore } from "../../lib/store";

const TEAL = [29, 158, 117];
const CORAL = [216, 90, 48];
const gauss = (t: number, mu: number, s: number) => Math.exp(-((t - mu) ** 2) / (2 * s * s));

export function NerfRay() {
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const [n, setN] = useState(40);
  const [frontDensity, setFrontDensity] = useState(6);

  const { samples, color, transPath } = useMemo(() => {
    const delta = 1 / n;
    let T = 1;
    let acc = [0, 0, 0];
    const samples: { t: number; w: number }[] = [];
    const transPts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) * delta;
      const sigma = frontDensity * gauss(t, 0.42, 0.05) + 9 * gauss(t, 0.72, 0.05);
      const alpha = 1 - Math.exp(-sigma * delta * 6);
      const w = T * alpha;
      const f1 = frontDensity * gauss(t, 0.42, 0.05);
      const f2 = 9 * gauss(t, 0.72, 0.05);
      const mix = f1 + f2 > 1e-6 ? f1 / (f1 + f2) : 0.5;
      const c = TEAL.map((v, k) => v * mix + CORAL[k] * (1 - mix));
      acc = acc.map((v, k) => v + w * c[k]);
      samples.push({ t, w });
      transPts.push([t, T]);
      T *= 1 - alpha;
    }
    const wSum = samples.reduce((a, b) => a + b.w, 0) || 1;
    const color = acc.map((v) => Math.round(v / wSum));
    const transPath = transPts
      .map(([t, tv], i) => `${i === 0 ? "M" : "L"} ${30 + t * 300} ${120 - tv * 70}`)
      .join(" ");
    return { samples, color, transPath };
  }, [n, frontDensity]);

  const maxW = Math.max(...samples.map((s) => s.w), 0.001);

  return (
    <FigureFrame
      title={{ en: "NeRF volume rendering", zh: "NeRF 体渲染" }}
      caption={{
        en: "Color is integrated along the ray with accumulated transmittance T (top curve). Raise the front surface's density and it occludes the back one — weight concentrates where the ray first hits opaque matter. More samples → smoother integral.",
        zh: "颜色沿射线积分，并带累积透射率 T（上方曲线）。提高前表面密度，它会遮挡后表面——权重集中在射线最先撞上不透明物质处。采样越多，积分越平滑。",
      }}
      onReset={() => {
        setN(40);
        setFrontDensity(6);
      }}
    >
      <svg viewBox="0 0 360 175" className="w-full">
        <text x={30} y={20} fontSize="9" fill="currentColor" className="text-ink/50 dark:text-stone-400">
          T = 1
        </text>
        <line x1={30} y1={120} x2={330} y2={120} stroke="currentColor" strokeWidth={0.5} className="text-stone-300 dark:text-white/15" />
        {/* transmittance curve */}
        <path d={transPath} fill="none" stroke="#6a5ef0" strokeWidth={2} />
        {/* surfaces markers */}
        <rect x={30 + 0.42 * 300 - 3} y={128} width={6} height={30} fill="rgb(29,158,117)" opacity={0.5} />
        <rect x={30 + 0.72 * 300 - 3} y={128} width={6} height={30} fill="rgb(216,90,48)" opacity={0.7} />
        {/* ray + weighted samples */}
        <line x1={30} y1={145} x2={330} y2={145} stroke="currentColor" strokeWidth={1} className="text-ink/40 dark:text-stone-500" />
        {samples.map((s, i) => (
          <circle key={i} cx={30 + s.t * 300} cy={145} r={1 + (s.w / maxW) * 5} fill="#6a5ef0" opacity={0.5 + 0.5 * (s.w / maxW)} />
        ))}
        <text x={30} y={168} fontSize="8" fill="currentColor" className="text-ink/45 dark:text-stone-500">
          {zh ? "相机" : "camera"} →
        </text>
        {/* integrated color swatch */}
        <rect x={300} y={158} width={30} height={14} rx={3} fill={`rgb(${color[0]},${color[1]},${color[2]})`} stroke="#0003" />
        <text x={296} y={168} textAnchor="end" fontSize="8" fill="currentColor" className="text-ink/50 dark:text-stone-400">
          {zh ? "像素色" : "pixel"}
        </text>
      </svg>
      <div className="mt-2 space-y-2">
        <Slider label={zh ? "采样数 N" : "samples N"} value={n} min={8} max={96} onChange={(v) => setN(Math.round(v))} />
        <Slider label={zh ? "前表面密度" : "front density"} value={frontDensity} min={0} max={14} onChange={setFrontDensity} format={(v) => v.toFixed(0)} />
      </div>
    </FigureFrame>
  );
}
