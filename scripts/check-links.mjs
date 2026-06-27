// Pings every external URL referenced by the course (the autolink dictionary,
// per-lesson resource links, and paper links) and reports dead ones, so the
// curriculum doesn't quietly rot. Run: npm run check-links
// Exits non-zero if any link is dead (4xx/5xx/unreachable).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "src/lib/autolinkTerms.ts",
  "src/lib/curriculum/resources.ts",
  "src/lib/curriculum/trackA.ts",
  "src/lib/curriculum/trackB.ts",
  "src/lib/curriculum/trackC.ts",
  "src/lib/curriculum/trackD.ts",
];

const urls = new Set();
for (const f of files) {
  const txt = fs.readFileSync(path.join(root, f), "utf8");
  for (const m of txt.match(/https?:\/\/[^\s"'`)\]]+/g) || []) {
    const u = m.replace(/[.,;]+$/, "");
    if (u.includes("${")) continue; // dynamic template (e.g. wiki helper), not a real URL
    urls.add(u);
  }
  // resolve the wiki helper:  W("Some_Slug", ...) -> en.wikipedia.org/wiki/Some_Slug
  for (const m of txt.match(/\bW\("([^"]+)"/g) || []) {
    urls.add("https://en.wikipedia.org/wiki/" + m.slice(3, -1));
  }
}
const list = [...urls].sort();
const UA = "Mozilla/5.0 (compatible; RopediaLinkCheck/1.0)";

async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA } });
      clearTimeout(tm);
      if (res.ok || (res.status >= 300 && res.status < 400)) return { url, status: res.status, ok: true };
      if (method === "HEAD" && (res.status === 403 || res.status === 405 || res.status === 400)) continue; // retry with GET
      return { url, status: res.status, ok: false };
    } catch (e) {
      if (method === "HEAD") continue;
      return { url, status: 0, ok: false, err: e.name || "error" };
    }
  }
  return { url, status: 0, ok: false, err: "error" };
}

// limited concurrency
const CONC = 8;
const results = [];
for (let i = 0; i < list.length; i += CONC) {
  results.push(...(await Promise.all(list.slice(i, i + CONC).map(check))));
}

const bad = results.filter((r) => !r.ok);
console.log(`Checked ${results.length} unique URLs — ${results.length - bad.length} ok, ${bad.length} failing.`);
if (bad.length) {
  console.log("\nFailing links:");
  for (const b of bad) console.log(`  [${b.status || b.err}] ${b.url}`);
  process.exit(1);
}
console.log("All links healthy. ✓");
