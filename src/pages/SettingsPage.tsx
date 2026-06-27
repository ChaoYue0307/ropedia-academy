import { useStore } from "../lib/store";
import { isSupabaseEnabled } from "../lib/supabase";
import { t } from "../lib/i18n";
import type { LangMode } from "../lib/types";
import type { Theme } from "../lib/store";

export function SettingsPage() {
  const mode = useStore((s) => s.lang);
  const theme = useStore((s) => s.theme);
  const setLang = useStore((s) => s.setLang);
  const setTheme = useStore((s) => s.setTheme);
  const resetAll = useStore((s) => s.resetAll);

  const langs: { v: LangMode; key: string }[] = [
    { v: "zh", key: "langZh" },
    { v: "both", key: "langBoth" },
    { v: "en", key: "langEn" },
  ];
  const themes: { v: Theme; key: string }[] = [
    { v: "light", key: "themeLight" },
    { v: "dark", key: "themeDark" },
  ];

  return (
    <div className="space-y-7">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-stone-50">{t("navSettings", mode)}</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink dark:text-stone-200">{t("settingsLanguage", mode)}</h2>
        <div className="flex gap-2">
          {langs.map((l) => (
            <button
              key={l.v}
              onClick={() => setLang(l.v)}
              className={
                "rounded-lg border px-4 py-2 text-sm font-medium transition " +
                (mode === l.v
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "border-stone-200 text-ink/60 hover:text-ink dark:border-white/10 dark:text-stone-400")
              }
            >
              {t(l.key, mode)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink dark:text-stone-200">{t("settingsTheme", mode)}</h2>
        <div className="flex gap-2">
          {themes.map((th) => (
            <button
              key={th.v}
              onClick={() => setTheme(th.v)}
              className={
                "rounded-lg border px-4 py-2 text-sm font-medium transition " +
                (theme === th.v
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                  : "border-stone-200 text-ink/60 hover:text-ink dark:border-white/10 dark:text-stone-400")
              }
            >
              {t(th.key, mode)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-ink dark:text-stone-200">{t("settingsData", mode)}</h2>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
          <span className="mr-2 rounded bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-ink/70 dark:bg-white/10 dark:text-stone-300">
            {isSupabaseEnabled ? "Supabase" : t("localMode", mode)}
          </span>
          {t("dataLocal", mode)}
        </div>
        <button
          onClick={() => {
            if (window.confirm(t("resetConfirm", mode))) resetAll();
          }}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          {t("resetData", mode)}
        </button>
      </section>
    </div>
  );
}
