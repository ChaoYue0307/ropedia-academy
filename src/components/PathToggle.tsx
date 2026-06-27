import { useStore } from "../lib/store";
import { t } from "../lib/i18n";

// Segmented control for the learning path (Guided concepts-only vs Full).
export function PathToggle({ className = "" }: { className?: string }) {
  const mode = useStore((s) => s.lang);
  const path = useStore((s) => s.path);
  const setPath = useStore((s) => s.setPath);
  return (
    <div className={"inline-flex rounded-lg border border-stone-200 p-0.5 text-xs dark:border-white/10 " + className}>
      {(["guided", "full"] as const).map((p) => (
        <button
          key={p}
          onClick={() => setPath(p)}
          aria-pressed={path === p}
          className={
            "rounded-md px-2.5 py-1 font-medium transition " +
            (path === p
              ? "bg-brand-600 text-white"
              : "text-ink/60 hover:text-ink dark:text-stone-400 dark:hover:text-stone-200")
          }
        >
          {t(p === "guided" ? "pathGuided" : "pathFull", mode)}
        </button>
      ))}
    </div>
  );
}
