import { useEffect } from "react";
import { useStore } from "../lib/store";
import { t } from "../lib/i18n";
import { Logo } from "./Logo";

// One-time, dismissible welcome that surfaces the app's key features for newcomers.
// Re-openable from Settings ("Show intro again").
const FEATURES = [
  { key: "welcomeF1", path: "M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18" },
  { key: "welcomeF2", path: "M12 16v-4M12 8h.01M12 3a9 9 0 100 18 9 9 0 000-18z" },
  { key: "welcomeF3", path: "m8 6-5 6 5 6M16 6l5 6-5 6" },
  { key: "welcomeF4", path: "M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-15-3M4 15a8 8 0 0015 3" },
  { key: "welcomeF5", path: "M6 4a2 2 0 100 .01M18 20a2 2 0 100 .01M6 6v6a4 4 0 004 4h4" },
];

export function WelcomeModal() {
  const mode = useStore((s) => s.lang);
  const welcomed = useStore((s) => s.welcomed);
  const setWelcomed = useStore((s) => s.setWelcomed);

  useEffect(() => {
    if (welcomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setWelcomed(true); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [welcomed, setWelcomed]);

  if (welcomed) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={t("welcomeTitle", mode)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWelcomed(true)} />
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200/70 bg-white p-6 shadow-card-hover dark:border-white/10 dark:bg-[#17151f]">
        <div className="flex items-center gap-3">
          <Logo size={40} className="shrink-0 rounded-[9px] shadow-glow" />
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-ink dark:text-stone-50">{t("welcomeTitle", mode)}</h2>
            <p className="text-xs text-ink/50 dark:text-stone-400">{t("tagline", mode)}</p>
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-ink/70 dark:text-stone-300">{t("welcomeIntro", mode)}</p>
        <ul className="mt-3 space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f.key} className="flex items-start gap-2.5 text-sm text-ink/75 dark:text-stone-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeLinecap="round" strokeLinejoin="round"><path d={f.path} /></svg>
              <span>{t(f.key, mode)}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setWelcomed(true)}
          autoFocus
          className="mt-5 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {t("welcomeCta", mode)}
        </button>
      </div>
    </div>
  );
}
