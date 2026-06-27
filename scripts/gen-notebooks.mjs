// Generate one Colab-ready Jupyter notebook per lesson from the SINGLE source of
// truth (src/lib/curriculum/lessonCode.ts), so the notebook code, the lesson
// page, and the snippet never drift. Run:  npm run gen-notebooks
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const REPO = "ChaoYue0307/ropedia-academy";
const BRANCH = "main";
const SITE = "https://chaoyue0307.github.io/ropedia-academy";

// --- load the code map by stripping the few TS-only bits, then importing ---
const codePath = path.join(root, "src/lib/curriculum/lessonCode.ts");
let src = fs.readFileSync(codePath, "utf8");
src = src.replace(/^import type .*$/m, "");
src = src.replace(/export const colabUrl[\s\S]*?;\n/, "");   // defined locally below
src = src.replace(/export const lessonCode\s*:[^=]*=/, "export const lessonCode =");
const tmp = path.join(os.tmpdir(), `lessonCode.${Date.now()}.mjs`);
fs.writeFileSync(tmp, src);
const { lessonCode } = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

// --- pull lesson titles from the track files (regex; best-effort) ---
const titles = {};
for (const tr of ["A", "B", "C", "D"]) {
  const txt = fs.readFileSync(path.join(root, `src/lib/curriculum/track${tr}.ts`), "utf8");
  const re = /id:\s*"([A-D]\d)"[\s\S]*?title:\s*{\s*en:\s*"((?:[^"\\]|\\.)*)"\s*,\s*zh:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(txt))) titles[m[1]] = { en: m[2], zh: m[3] };
}

const colabUrl = (id) =>
  `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/notebooks/${id}.ipynb`;

const mdCell = (source) => ({ cell_type: "markdown", metadata: {}, source });
const codeCell = (source) => ({
  cell_type: "code",
  metadata: {},
  execution_count: null,
  outputs: [],
  source,
});

const outDir = path.join(root, "notebooks");
fs.mkdirSync(outDir, { recursive: true });

const ids = Object.keys(lessonCode);
for (const id of ids) {
  const { code, note } = lessonCode[id];
  const title = titles[id]?.en ? `${id} · ${titles[id].en}` : id;

  const intro =
    `# Ropedia Academy — ${title}\n\n` +
    `[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](${colabUrl(id)})\n\n` +
    `> **${note.en}**\n>\n> ${note.zh}\n\n` +
    `This is the lesson's core example — **self-contained and runnable end to end**. ` +
    `It builds toy tensors, performs the lesson's key computation, and prints a real ` +
    `result, so you learn the concept by executing it.\n\n` +
    `Colab's default runtime already includes \`torch\`, \`numpy\`, and \`networkx\`, so just ` +
    `press **Run all** — every cell should go green. Sizes are shrunk to run on CPU; ` +
    `swap in a real batch and the same code scales up.\n\n` +
    `🔗 Full lesson (with the interactive demo & key terms): ${SITE}/lesson/${id}`;

  const footer =
    `### Where to go next\n\n` +
    `- Swap the toy tensors for a real batch and watch the shapes flow through.\n` +
    `- Open the matching lesson for the math and an interactive figure: ${SITE}/lesson/${id}\n` +
    `- Browse every notebook: https://github.com/${REPO}/tree/${BRANCH}/notebooks`;

  const nb = {
    cells: [mdCell(intro), codeCell(code), mdCell(footer)],
    metadata: {
      colab: { name: `Ropedia ${id}`, provenance: [], toc_visible: true },
      kernelspec: { name: "python3", display_name: "Python 3" },
      language_info: { name: "python" },
    },
    nbformat: 4,
    nbformat_minor: 0,
  };
  fs.writeFileSync(path.join(outDir, `${id}.ipynb`), JSON.stringify(nb, null, 1) + "\n");
}

// --- index README for the notebooks folder ---
const byTrack = { A: [], B: [], C: [], D: [] };
for (const id of ids) byTrack[id[0]]?.push(id);
const trackName = {
  A: "Human Modeling",
  B: "3D & Neural Rendering",
  C: "Egocentric Vision",
  D: "Scene & World Models",
};
let readme =
  `# Ropedia Academy — runnable notebooks\n\n` +
  `One Colab-ready notebook per lesson, generated from ` +
  `[\`src/lib/curriculum/lessonCode.ts\`](../src/lib/curriculum/lessonCode.ts) ` +
  `(\`npm run gen-notebooks\`). Click any badge to open it in Google Colab — ` +
  `no setup, no login to read; one click to run.\n\n`;
for (const tr of ["A", "B", "C", "D"]) {
  readme += `## Track ${tr} — ${trackName[tr]}\n\n`;
  for (const id of byTrack[tr]) {
    const t = titles[id]?.en ?? id;
    readme += `- **${id}** ${t} — [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](${colabUrl(id)})\n`;
  }
  readme += `\n`;
}
fs.writeFileSync(path.join(outDir, "README.md"), readme);

console.log(`Generated ${ids.length} notebooks + index in notebooks/`);
