import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTrack } from "../lib/curriculum";
import { useStore } from "../lib/store";
import { pick, t } from "../lib/i18n";
import { BiText } from "../components/BiText";
import { McqCard } from "../components/McqCard";
import { lessonQuiz } from "../lib/curriculum/lessonQuiz";
import type { CheckQuestion, Lesson, McqItem } from "../lib/types";

type QItem =
  | { kind: "check"; check: CheckQuestion; lesson: Lesson }
  | { kind: "mcq"; mcq: McqItem; lesson: Lesson };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizPage() {
  const { id } = useParams();
  const mode = useStore((s) => s.lang);
  const addToReview = useStore((s) => s.addToReview);
  const track = getTrack(id ?? "");

  const [nonce, setNonce] = useState(0);
  const questions = useMemo<QItem[]>(() => {
    if (!track) return [];
    return shuffle(
      track.lessons.flatMap((l): QItem[] => [
        ...(lessonQuiz[l.id] ? [{ kind: "mcq" as const, mcq: lessonQuiz[l.id], lesson: l }] : []),
        ...l.checks.map((c) => ({ kind: "check" as const, check: c, lesson: l })),
      ]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, nonce]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mcqAnswered, setMcqAnswered] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ q: QItem; knew: boolean }[]>([]);

  if (!track) return <div className="text-ink/60">Track not found.</div>;

  const restart = () => {
    setNonce((n) => n + 1);
    setIdx(0);
    setRevealed(false);
    setMcqAnswered(null);
    setResults([]);
  };

  const answer = (knew: boolean) => {
    setResults((r) => [...r, { q: questions[idx], knew }]);
    setRevealed(false);
    setMcqAnswered(null);
    setIdx((i) => i + 1);
  };

  const done = idx >= questions.length;

  if (done) {
    const knew = results.filter((r) => r.knew).length;
    const missed = results.filter((r) => !r.knew);
    const pct = Math.round((knew / Math.max(1, results.length)) * 100);
    const missedLessons = [...new Map(missed.map((m) => [m.q.lesson.id, m.q.lesson])).values()];
    return (
      <div className="space-y-6">
        <Link to={`/track/${track.id}`} className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink dark:text-stone-400">
          ← {pick(track.title, mode)}
        </Link>
        <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-8 text-center shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
          <div className="font-display text-5xl font-bold" style={{ color: track.accent }}>{pct}%</div>
          <p className="mt-2 text-sm text-ink/60 dark:text-stone-400">
            {t("quizScore", mode)} {knew} / {results.length}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {missed.length > 0 && (
              <button
                onClick={() => missed.forEach((m) => m.q.kind === "check" && addToReview(m.q.check.id))}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                {t("addMissedToReview", mode)} ({missed.length})
              </button>
            )}
            <button onClick={restart} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-brand-300 dark:border-white/10 dark:text-stone-300">
              {t("restartQuiz", mode)}
            </button>
          </div>
        </div>
        {missedLessons.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-stone-500">
              {mode === "zh" ? "建议复习" : "Worth reviewing"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {missedLessons.map((l) => (
                <Link key={l.id} to={`/lesson/${l.id}`} className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-ink/70 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-stone-300">
                  {pick(l.title, mode)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const cur = questions[idx];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to={`/track/${track.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink dark:text-stone-400">
          <span className="grid h-5 w-5 place-items-center rounded text-[11px] font-bold text-white" style={{ backgroundColor: track.accent }}>{track.id}</span>
          {pick(track.title, mode)}
        </Link>
        <span className="text-sm text-ink/45 dark:text-stone-500">{idx + 1} / {questions.length}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${(idx / questions.length) * 100}%`, backgroundColor: track.accent }} />
      </div>

      <div className="text-[11px] font-medium uppercase tracking-wide">
        <Link to={`/lesson/${cur.lesson.id}`} className="text-brand-500">
          {cur.lesson.id} · {pick(cur.lesson.title, mode)}
        </Link>
      </div>

      {cur.kind === "mcq" ? (
        <>
          <McqCard key={cur.mcq.id} mcq={cur.mcq} mode={mode} onAnswered={(c) => setMcqAnswered(c)} />
          {mcqAnswered !== null && (
            <button onClick={() => answer(mcqAnswered)} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
              {t("nextQuestion", mode)}
            </button>
          )}
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-stone-200/70 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
            <div className="text-[15px] font-medium text-ink dark:text-stone-100">
              <BiText value={cur.check.prompt} mode={mode} />
            </div>
            {revealed && (
              <div className="mt-4 animate-fade-in rounded-xl border-l-2 border-brand-400 bg-brand-50/50 p-4 dark:border-brand-400/60 dark:bg-brand-500/[0.07]">
                <BiText value={cur.check.answer} mode={mode} />
              </div>
            )}
          </div>

          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
              {t("reveal", mode)}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => answer(false)} className="rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
                {t("missedIt", mode)}
              </button>
              <button onClick={() => answer(true)} className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                {t("knewIt", mode)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
