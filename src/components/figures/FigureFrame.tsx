import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import type { Bilingual } from "../../lib/types";
import { useStore } from "../../lib/store";
import { pick } from "../../lib/i18n";

export function FigureFrame({
  title,
  caption,
  children,
  onReset,
}: {
  title: Bilingual;
  caption: Bilingual;
  children: ReactNode;
  onReset?: () => void;
}) {
  const mode = useStore((s) => s.lang);
  // Make the chart legible to screen readers: label the SVG as a single image
  // using the (rich, bilingual) caption. Interactive controls are left untouched.
  const desc = pick(caption, mode);
  const a11yChildren = Children.map(children, (child) =>
    isValidElement(child) && child.type === "svg"
      ? cloneElement(child as any, { role: "img", "aria-label": desc })
      : child,
  );
  return (
    <figure className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white/80 shadow-card backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 px-4 py-2.5 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-stone-100">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
              <path d="M5 3v18M5 8h14M19 3v18" strokeLinecap="round" />
            </svg>
          </span>
          {pick(title, mode)}
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-md px-2 py-1 text-xs font-medium text-ink/50 transition hover:bg-stone-100 hover:text-ink dark:text-stone-400 dark:hover:bg-white/5"
          >
            {mode === "zh" ? "重置" : "Reset"}
          </button>
        )}
      </div>
      <div className="p-4">{a11yChildren}</div>
      <figcaption className="border-t border-stone-200/60 bg-stone-50/50 px-4 py-2.5 text-xs leading-relaxed text-ink/55 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-stone-400">
        {pick(caption, mode)}
      </figcaption>
    </figure>
  );
}

// Shared small control: a labeled range slider.
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs">
      <span className="w-28 shrink-0 font-medium text-ink/70 dark:text-stone-300">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-200 accent-brand-600 dark:bg-white/10"
      />
      <span className="w-12 shrink-0 text-right font-mono text-brand-700 dark:text-brand-300">
        {format ? format(value) : value}
      </span>
    </label>
  );
}
