import type { Lesson, Track, TrackId } from "../types";
import { trackA } from "./trackA";
import { trackB } from "./trackB";
import { trackC } from "./trackC";
import { trackD } from "./trackD";

// Canonical order A, B, C, D (egocentric vision is C, third).
export const tracks: Track[] = [trackA, trackB, trackC, trackD];

export const tracksById: Record<TrackId, Track> = {
  A: trackA,
  B: trackB,
  C: trackC,
  D: trackD,
};

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

// All lessons in global presentation order.
export const allLessons: Lesson[] = tracks.flatMap((t) => t.lessons);

export function getLesson(id: string): { lesson: Lesson; track: Track } | undefined {
  for (const track of tracks) {
    const lesson = track.lessons.find((l) => l.id === id);
    if (lesson) return { lesson, track };
  }
  return undefined;
}

export function lessonNeighbors(id: string): { prev?: Lesson; next?: Lesson } {
  const idx = allLessons.findIndex((l) => l.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? allLessons[idx - 1] : undefined,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : undefined,
  };
}

export interface ReviewItem {
  checkId: string;
  lessonId: string;
  trackId: TrackId;
}

// Every check across the curriculum, flattened with its lesson context.
export const allChecks: ReviewItem[] = tracks.flatMap((t) =>
  t.lessons.flatMap((l) =>
    l.checks.map((c) => ({ checkId: c.id, lessonId: l.id, trackId: t.id })),
  ),
);

export const totalLessons = allLessons.length;
export const totalChecks = allChecks.length;

export function trackProgress(trackId: TrackId, completed: Set<string>): number {
  const track = tracksById[trackId];
  if (!track) return 0;
  const done = track.lessons.filter((l) => completed.has(l.id)).length;
  return done / track.lessons.length;
}
