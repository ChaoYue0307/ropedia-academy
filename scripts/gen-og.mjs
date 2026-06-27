// Generates public/og.png (1200x630) — the project hero / social share image.
// Run: node scripts/gen-og.mjs  (or: npm run gen-og)
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../public/og.png");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tracks = [
  { id: "A", name: "Human Modeling", color: "#e0598b" },
  { id: "B", name: "3D / Neural Rendering", color: "#1d9e75" },
  { id: "C", name: "Egocentric Vision", color: "#6a5ef0" },
  { id: "D", name: "Scene + World Models", color: "#378add" },
];

const chips = tracks
  .map((t, i) => {
    const x = 80 + i * 268;
    return `
      <g transform="translate(${x},452)">
        <rect width="248" height="86" rx="18" fill="#ffffff" fill-opacity="0.05" stroke="${t.color}" stroke-opacity="0.55"/>
        <rect x="20" y="23" width="40" height="40" rx="11" fill="${t.color}"/>
        <text x="40" y="51" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" fill="#ffffff" text-anchor="middle">${t.id}</text>
        <text x="76" y="49" font-family="Arial, Helvetica, sans-serif" font-size="18.5" font-weight="600" fill="#e7e6f3">${esc(t.name)}</text>
      </g>`;
  })
  .join("");

// concept-map motif (top-right): 4 rows of nodes with a few connecting edges
const DX = 742, DY = 108, CW = 44, RH = 33;
const dotPos = (i) => [DX + (i % 9) * CW, DY + Math.floor(i / 9) * RH];
const edgePairs = [[0, 14], [3, 20], [5, 28], [9, 25], [11, 33], [16, 30], [2, 21], [7, 24], [13, 27], [22, 31], [1, 19]];
const edges = edgePairs
  .map(([a, b]) => {
    const [x1, y1] = dotPos(a);
    const [x2, y2] = dotPos(b);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8b86c9" stroke-opacity="0.28" stroke-width="1.4"/>`;
  })
  .join("");
const dots = Array.from({ length: 36 }, (_, i) => {
  const [cx, cy] = dotPos(i);
  const c = tracks[Math.floor(i / 9)].color;
  return `<circle cx="${cx}" cy="${cy}" r="6.5" fill="${c}" fill-opacity="0.92"/>`;
}).join("");

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0e0c17"/>
      <stop offset="1" stop-color="#1b1733"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.12" cy="-0.05" r="0.75">
      <stop offset="0" stop-color="#6a5ef0" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#6a5ef0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.95" cy="1.05" r="0.6">
      <stop offset="0" stop-color="#378add" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#378add" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#827ef9"/>
      <stop offset="1" stop-color="#4c37b0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  ${edges}
  ${dots}
  <g transform="translate(80,86)">
    <rect width="92" height="92" rx="24" fill="url(#logo)"/>
    <text x="46" y="64" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#ffffff" text-anchor="middle">R</text>
  </g>
  <text x="198" y="124" font-family="Arial, Helvetica, sans-serif" font-size="33" font-weight="600" fill="#c6ccff">Ropedia Academy</text>
  <text x="200" y="158" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" fill="#7f77dd" letter-spacing="0.5">INTERACTIVE · BILINGUAL · OPEN</text>
  <text x="80" y="266" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="700" fill="#ffffff">Learn embodied spatial AI</text>
  <text x="80" y="324" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#a7a4c4">Egocentric vision · 3D reconstruction · human motion · world models</text>
  <text x="80" y="380" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="600" fill="#7f77dd">4 tracks · 36 lessons · live 3D demos · spaced repetition · 中 / EN</text>
  ${chips}
  <text x="80" y="598" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#6b6a86">chaoyue0307.github.io/ropedia-academy</text>
</svg>`;

mkdirSync(resolve(__dirname, "../public"), { recursive: true });
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, font: { loadSystemFonts: true } }).render().asPng();
writeFileSync(out, png);
console.log("wrote", out, png.length, "bytes");
