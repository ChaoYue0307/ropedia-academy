import type { Lesson, LangMode } from "./types";

// Rough reading-time estimate. English ~200 wpm; Chinese ~340 cpm.
// For bilingual mode we assume the reader reads one language, so take the max.
function minutesFor(text: string, lang: "en" | "zh"): number {
  if (lang === "zh") {
    const chars = (text.match(/[一-鿿]/g) || []).length;
    return chars / 340;
  }
  const words = (text.trim().match(/\S+/g) || []).length;
  return words / 200;
}

export function readingMinutes(lesson: Lesson, mode: LangMode): number {
  const en = minutesFor(lesson.body.en, "en");
  const zh = minutesFor(lesson.body.zh, "zh");
  // a little overhead for key terms + checks
  const base = mode === "en" ? en : mode === "zh" ? zh : Math.max(en, zh);
  return Math.max(1, Math.round(base + 0.6));
}
