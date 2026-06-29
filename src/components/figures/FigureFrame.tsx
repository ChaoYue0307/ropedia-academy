import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import type { Bilingual } from "../../lib/types";
import { useStore } from "../../lib/store";
import { pick } from "../../lib/i18n";

// Animate a normalized (0..1) slider value over time, looping. Returns a play/pause toggle.
// Used by the time-based figures so the *process* can play out instead of being scrubbed by hand.
export function useTimelinePlay(value: number, setValue: (v: number) => void, speed = 0.34) {
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | undefined>(undefined);
  const last = useRef(0);
  const valRef = useRef(value);
  valRef.current = value;
  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      let v = valRef.current + speed * dt;
      if (v >= 1) v -= 1; // loop back to the start
      setValue(parseFloat(v.toFixed(3)));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, speed, setValue]);
  return { playing, toggle: () => setPlaying((p) => !p) };
}

// A small play/pause button to sit next to a timeline slider.
export function PlayPause({ playing, onToggle, mode }: { playing: boolean; onToggle: () => void; mode: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? (mode === "zh" ? "暂停动画" : "Pause animation") : (mode === "zh" ? "播放动画" : "Play animation")}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stone-200 text-ink/60 transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:text-stone-400 dark:hover:text-brand-200"
    >
      {playing
        ? <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        : <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5z" /></svg>}
    </button>
  );
}

// A compact live "key-quantity" readout chip — the principle, quantified as you drag.
export function Readout({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "emerald" | "amber" | "rose" | "slate" }) {
  const tones: Record<string, string> = {
    brand: "border-brand-200/70 bg-brand-50/50 text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/[0.08] dark:text-brand-300",
    emerald: "border-emerald-300/60 bg-emerald-50/50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
    amber: "border-amber-300/60 bg-amber-50/50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300",
    rose: "border-rose-300/60 bg-rose-50/50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.08] dark:text-rose-300",
    slate: "border-stone-200 bg-stone-50/60 text-ink/70 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300",
  };
  return <div className={"inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium leading-tight " + tones[tone]}>{children}</div>;
}

// Small "ⓘ" that explains a parameter — shows on hover (desktop) and tap (touch/keyboard).
function Hint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={text}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        onBlur={() => setOpen(false)}
        className="grid h-3.5 w-3.5 place-items-center rounded-full border border-current text-[8px] font-bold leading-none text-ink/35 transition hover:text-brand-600 dark:text-stone-500 dark:hover:text-brand-300"
      >
        i
      </button>
      {open && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 w-52 max-w-[60vw] rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-normal leading-snug text-white shadow-lg dark:bg-stone-700">
          {text}
        </span>
      )}
    </span>
  );
}

export function FigureFrame({
  title,
  caption,
  children,
  onReset,
  predict,
}: {
  title: Bilingual;
  caption: Bilingual;
  children: ReactNode;
  onReset?: () => void;
  predict?: Bilingual;
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
      <div className="p-4">
        {predict && (
          <div className="mb-3 flex items-start gap-1.5 rounded-lg border border-amber-300/40 bg-amber-50/40 px-2.5 py-1.5 text-[11px] leading-snug text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-3 w-3 shrink-0"><path d="M9.5 16.5a4 4 0 1 1 5 0c-.6.4-1 1-1 1.7V19h-3v-.8c0-.7-.4-1.3-1-1.7zM10 21h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span><span className="font-semibold uppercase tracking-wide">{mode === "zh" ? "先猜再拖" : "Predict, then drag"}</span> · {pick(predict, mode)}</span>
          </div>
        )}
        {a11yChildren}
      </div>
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
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="flex w-28 shrink-0 items-center gap-1 font-medium text-ink/70 dark:text-stone-300">
        {label}
        {hint && <Hint text={hint} />}
      </span>
      <input
        type="range"
        aria-label={label}
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
    </div>
  );
}
