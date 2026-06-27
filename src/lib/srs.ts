// A compact SM-2-style spaced-repetition scheduler.
// Each reviewable check becomes a card with an ease factor and an interval.

export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsCard {
  ease: number; // ~1.3 (hard) .. 2.5+ (easy)
  interval: number; // days until next review
  reps: number; // successful reviews in a row
  lapses: number; // times forgotten
  due: number; // epoch ms when next due
  last?: number; // epoch ms of last review
}

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

export function newCard(now = Date.now()): SrsCard {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: undefined };
}

export function schedule(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  let { ease, interval, reps, lapses } = card;

  if (grade === "again") {
    reps = 0;
    lapses += 1;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
    return { ease, interval, reps, lapses, due: now + 10 * MIN, last: now };
  }

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = interval <= 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
  } else if (grade === "good") {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * ease);
  } else {
    // easy
    ease = ease + 0.15;
    if (reps === 0) interval = 2;
    else if (reps === 1) interval = 5;
    else interval = Math.round(interval * ease * 1.3);
  }

  reps += 1;
  interval = Math.max(1, interval);
  return { ease, interval, reps, lapses, due: now + interval * DAY, last: now };
}

export function isDue(card: SrsCard | undefined, now = Date.now()): boolean {
  if (!card) return false;
  return card.due <= now;
}

export function dueLabel(card: SrsCard | undefined, now = Date.now()): string {
  if (!card) return "new";
  const ms = card.due - now;
  if (ms <= 0) return "due";
  const days = Math.round(ms / DAY);
  if (days >= 1) return `${days}d`;
  const hrs = Math.max(1, Math.round(ms / (60 * MIN)));
  return `${hrs}h`;
}
