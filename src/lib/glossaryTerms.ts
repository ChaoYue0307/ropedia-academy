import type { Bilingual } from "./types";
import { tracks } from "./curriculum";
import { foundationDefs } from "./foundations";
import { autolinkTerms } from "./autolinkTerms";

// The full set of inline hover-definitions = foundational basics + every clean
// technical key term from the lessons (reusing their existing bilingual defs).
// We skip symbol-laden names (β, →, /, parentheses) and terms that already get an
// external autolink, so a term shows EITHER a definition tooltip or a link, never
// fights itself. This is what powers the dotted-underline hover/tap tooltips.
const BLOCK = new Set(["integration"]); // too generic to match safely
const CLEAN = /^[A-Za-z0-9][A-Za-z0-9 .'-]+$/;

export const glossaryDefs: Record<string, Bilingual> = (() => {
  const m: Record<string, Bilingual> = { ...foundationDefs };
  const have = new Set(Object.keys(m).map((k) => k.toLowerCase()));
  const autolink = new Set(Object.keys(autolinkTerms).map((k) => k.toLowerCase()));
  for (const tr of tracks) {
    for (const lesson of tr.lessons) {
      for (const kt of lesson.keyTerms ?? []) {
        const name = kt.term.trim();
        const lower = name.toLowerCase();
        if (name.length < 4 || !CLEAN.test(name)) continue;
        if (BLOCK.has(lower) || autolink.has(lower) || have.has(lower)) continue;
        m[name] = kt.def;
        have.add(lower);
      }
    }
  }
  return m;
})();
