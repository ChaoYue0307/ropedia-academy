import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useStore } from "./lib/store";
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

export default function App() {
  const theme = useStore((s) => s.theme);
  const zh = useStore((s) => s.lang) === "zh";
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

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
    </Layout>
  );
}
