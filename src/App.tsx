import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useStore } from "./lib/store";
import { getLesson, tracksById } from "./lib/curriculum";
import { pick, t } from "./lib/i18n";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotFound } from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { OverviewPage } from "./pages/OverviewPage";
import { TrackPage } from "./pages/TrackPage";
import { LessonPage } from "./pages/LessonPage";
import { QuizPage } from "./pages/QuizPage";
import { ReviewPage } from "./pages/ReviewPage";
import { GraphPage } from "./pages/GraphPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CommandPalette } from "./components/CommandPalette";
import { WelcomeModal } from "./components/WelcomeModal";

export default function App() {
  const theme = useStore((s) => s.theme);
  const mode = useStore((s) => s.lang);
  const zh = mode === "zh";
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Per-route document title + meta description (tabs, history, bookmarks, SEO).
  useEffect(() => {
    const p = location.pathname.replace(import.meta.env.BASE_URL, "/").replace("//", "/");
    let title = "";
    let desc = "Interactive, bilingual course on embodied & spatial AI: egocentric vision, 3D reconstruction, human motion, and world models.";
    const seg = p.split("/").filter(Boolean);
    if (p === "/") title = "";
    else if (p === "/overview") title = t("researchDirections", mode);
    else if (seg[0] === "lesson") {
      const f = getLesson(seg[1] ?? "");
      if (f) { title = pick(f.lesson.title, mode); desc = pick(f.lesson.summary, mode); }
    } else if (seg[0] === "track") {
      const tr = tracksById[seg[1] as keyof typeof tracksById];
      if (tr) title = pick(tr.title, mode);
    } else if (seg[0] === "quiz") {
      const tr = tracksById[seg[1] as keyof typeof tracksById];
      title = `${tr ? pick(tr.title, mode) + " " : ""}${t("quiz", mode)}`;
    } else if (p === "/review") title = t("navReview", mode);
    else if (p === "/graph") title = t("navGraph", mode);
    else if (p === "/glossary") title = t("navGlossary", mode);
    else if (p === "/settings") title = t("navSettings", mode);
    else title = zh ? "页面不存在" : "Page not found";

    document.title = title ? `${title} · Ropedia Academy` : "Ropedia Academy — learn embodied spatial AI";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, [location.pathname, mode, zh]);

  return (
    <Layout>
      <ErrorBoundary resetKey={location.pathname} zh={zh}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/track/:id" element={<TrackPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <CommandPalette />
      <WelcomeModal />
    </Layout>
  );
}
