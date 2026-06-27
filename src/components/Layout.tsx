import { NavLink, useLocation } from "react-router-dom";
import { useStore } from "../lib/store";
import { t } from "../lib/i18n";
import { isSupabaseEnabled } from "../lib/supabase";
import type { LangMode } from "../lib/types";

const NAV = [
  { to: "/", key: "navDashboard", icon: "M3 11l9-8 9 8M5 10v10h14V10", end: true },
  { to: "/overview", key: "navOverview", icon: "M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2z" },
  { to: "/review", key: "navReview", icon: "M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-15-3M4 15a8 8 0 0015 3" },
  { to: "/graph", key: "navGraph", icon: "M6 6a2 2 0 100-.01M18 6a2 2 0 100-.01M12 18a2 2 0 100-.01M7.5 7.5l3 8M16.5 7.5l-3 8" },
  { to: "/glossary", key: "navGlossary", icon: "M4 6h16M4 12h10M4 18h7" },
  { to: "/settings", key: "navSettings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 00-1.7-1L14.5 2h-5l-.4 2.9a7 7 0 00-1.7 1l-2.3-1-2 3.4L2.9 11a7 7 0 000 2l-2 1.6 2 3.4 2.3-1a7 7 0 001.7 1l.4 2.9h5l.4-2.9a7 7 0 001.7-1l2.3 1 2-3.4-2-1.6a7 7 0 00.1-1z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={d} />
    </svg>
  );
}

function LangToggle({ mode }: { mode: LangMode }) {
  const setLang = useStore((s) => s.setLang);
  const opts: { v: LangMode; label: string }[] = [
    { v: "zh", label: "中" },
    { v: "both", label: "中/EN" },
    { v: "en", label: "EN" },
  ];
  return (
    <div className="flex rounded-lg border border-stone-200 p-0.5 text-xs dark:border-white/10">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setLang(o.v)}
          className={
            "rounded-md px-2 py-1 font-medium transition " +
            (mode === o.v
              ? "bg-brand-600 text-white"
              : "text-ink/60 hover:text-ink dark:text-stone-400 dark:hover:text-stone-200")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const mode = useStore((s) => s.lang);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const location = useLocation();

  return (
    <div className="min-h-full md:flex">
      <a href="#main-content" className="skip-link">
        {mode === "zh" ? "跳到内容" : "Skip to content"}
      </a>
      <aside className="z-10 border-b border-stone-200/70 bg-white/70 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r dark:border-white/[0.06] dark:bg-[#16141f]/70">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 font-display text-[17px] font-bold text-white shadow-glow">
            R
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold text-ink dark:text-stone-100">{t("appName", mode)}</div>
            <div className="flex items-center gap-1 text-[10px] text-ink/40 dark:text-stone-500">
              <span className={"inline-block h-1.5 w-1.5 rounded-full " + (isSupabaseEnabled ? "bg-emerald-400" : "bg-stone-300 dark:bg-stone-600")} />
              {isSupabaseEnabled ? "synced" : t("localMode", mode)}
            </div>
          </div>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
            className="flex w-full items-center gap-2 rounded-lg border border-stone-200/80 bg-stone-50/60 px-2.5 py-1.5 text-xs text-ink/45 transition hover:border-brand-300 hover:text-ink/70 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-500 dark:hover:text-stone-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <span className="flex-1 text-left">{mode === "zh" ? "搜索" : "Search"}</span>
            <kbd className="rounded border border-stone-300/70 px-1 font-mono text-[10px] dark:border-white/15">⌘K</kbd>
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition " +
                (isActive
                  ? "bg-gradient-to-r from-brand-50 to-brand-50/40 text-brand-700 ring-1 ring-brand-100 dark:from-brand-500/20 dark:to-brand-500/5 dark:text-brand-200 dark:ring-brand-400/20"
                  : "text-ink/60 hover:bg-stone-100/70 hover:text-ink dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-stone-200")
              }
            >
              <Icon d={n.icon} />
              <span>{t(n.key, mode)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-between gap-2 px-5 py-4 md:absolute md:bottom-0 md:flex md:w-64 md:border-t md:border-stone-200 dark:md:border-white/10">
          <LangToggle mode={mode} />
          <button
            onClick={toggleTheme}
            aria-label="toggle theme"
            className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-ink/60 transition hover:text-ink dark:border-white/10 dark:text-stone-400 dark:hover:text-stone-200"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" strokeLinejoin="round" /></svg>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-3 md:hidden">
          <LangToggle mode={mode} />
          <button onClick={toggleTheme} aria-label="toggle theme" className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-ink/60 dark:border-white/10 dark:text-stone-400">
            {theme === "dark" ? "☾" : "☀"}
          </button>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} key={location.pathname} className="min-w-0 flex-1 animate-fade-in focus:outline-none">
        <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
