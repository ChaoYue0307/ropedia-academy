import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";

// Whether the device can hover (desktop). On touch screens this is false, so we
// switch from hover to tap — the cross-device best practice for tooltips.
const HOVERABLE =
  typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;

// An inline foundational term that reveals its definition:
//  - desktop: on hover or keyboard focus
//  - mobile: on tap (and dismiss on outside tap / Esc / scroll)
// The popover is position:fixed and clamped to the viewport so it never clips.
export function GlossaryTerm({ def, children }: { def: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Position the popover within the viewport. A first pass runs before paint; a
  // second (rAF) pass re-clamps once it has rendered at its true width.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!btnRef.current || !popRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      // width is fixed by CSS (keep this formula in sync) -> deterministic centering.
      const w = Math.min(280, vw - 24);
      const h = popRef.current.offsetHeight;
      const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12));
      // place below if there's room (or more room) there, else above — then clamp.
      const below = vh - r.bottom >= h + 10 || vh - r.bottom >= r.top;
      let top = below ? r.bottom + 8 : r.top - 8 - h;
      top = Math.max(8, Math.min(top, vh - h - 8));
      setStyle({ left, top });
    };
    place();
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Dismiss on outside tap, Escape, or scroll/resize.
  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => {
      const tgt = e.target as Node;
      if (!wrapRef.current?.contains(tgt) && !popRef.current?.contains(tgt)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const hoverHandlers = HOVERABLE
    ? { onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false) }
    : {};
  const focusHandlers = HOVERABLE
    ? { onFocus: () => setOpen(true), onBlur: () => setOpen(false) }
    : {};

  return (
    <span ref={wrapRef} className="glossary-wrap" {...hoverHandlers}>
      <button
        ref={btnRef}
        type="button"
        className="glossary-term"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => { e.preventDefault(); if (!HOVERABLE) setOpen((o) => !o); }}
        {...focusHandlers}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <span
            ref={popRef}
            id={id}
            role="tooltip"
            className="glossary-pop"
            style={style ?? { left: 0, top: 0, visibility: "hidden" }}
          >
            {def}
          </span>,
          document.body,
        )}
    </span>
  );
}
