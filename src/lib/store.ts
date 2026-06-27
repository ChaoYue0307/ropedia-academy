import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LangMode } from "./types";
import { type Grade, type SrsCard, newCard, schedule } from "./srs";

export type Theme = "light" | "dark";

interface State {
  lang: LangMode;
  theme: Theme;
  completed: string[]; // lesson ids
  lastLessonId?: string;
  srs: Record<string, SrsCard>; // checkId -> card
  reviewing: string[]; // checkIds added to the review queue

  setLang: (l: LangMode) => void;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  setLastLesson: (lessonId: string) => void;
  addToReview: (checkId: string) => void;
  removeFromReview: (checkId: string) => void;
  gradeCheck: (checkId: string, grade: Grade) => void;
  resetAll: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: "both",
      theme:
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      completed: [],
      lastLessonId: undefined,
      srs: {},
      reviewing: [],

      setLang: (lang) => set({ lang }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setTheme: (theme) => set({ theme }),

      markComplete: (lessonId) =>
        set((s) =>
          s.completed.includes(lessonId)
            ? { lastLessonId: lessonId }
            : { completed: [...s.completed, lessonId], lastLessonId: lessonId },
        ),

      markIncomplete: (lessonId) =>
        set((s) => ({ completed: s.completed.filter((id) => id !== lessonId) })),

      setLastLesson: (lessonId) => set({ lastLessonId: lessonId }),

      addToReview: (checkId) =>
        set((s) => {
          if (s.reviewing.includes(checkId)) return s;
          return {
            reviewing: [...s.reviewing, checkId],
            srs: { ...s.srs, [checkId]: s.srs[checkId] ?? newCard() },
          };
        }),

      removeFromReview: (checkId) =>
        set((s) => {
          const srs = { ...s.srs };
          delete srs[checkId];
          return { reviewing: s.reviewing.filter((id) => id !== checkId), srs };
        }),

      gradeCheck: (checkId, grade) =>
        set((s) => {
          const card = s.srs[checkId] ?? newCard();
          const reviewing = s.reviewing.includes(checkId)
            ? s.reviewing
            : [...s.reviewing, checkId];
          return { srs: { ...s.srs, [checkId]: schedule(card, grade) }, reviewing };
        }),

      resetAll: () =>
        set({ completed: [], lastLessonId: undefined, srs: {}, reviewing: [] }),
    }),
    {
      name: "ropedia-academy",
      version: 1,
    },
  ),
);

// Selectors / helpers
export function useCompletedSet(): Set<string> {
  const completed = useStore((s) => s.completed);
  return new Set(completed);
}
