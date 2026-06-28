// Validates every notebook under notebooks/ is well-formed JSON with cells.
// Run: node scripts/check-notebooks.mjs   (used in CI)
import fs from "node:fs";
import path from "node:path";
const dirs = ["notebooks/training", "notebooks/advanced", "notebooks"];
let n = 0, bad = 0;
const seen = new Set();
for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".ipynb")) continue;
    const p = path.join(d, f);
    if (seen.has(p)) continue; seen.add(p); n++;
    try {
      const nb = JSON.parse(fs.readFileSync(p, "utf8"));
      if (!Array.isArray(nb.cells) || nb.cells.length === 0) throw new Error("no cells");
      if (!nb.nbformat) throw new Error("no nbformat");
    } catch (e) { console.error("INVALID", p, "-", e.message); bad++; }
  }
}
console.log(`checked ${n} notebooks, ${bad} invalid`);
process.exit(bad ? 1 : 0);
