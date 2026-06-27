import type { Bilingual, LangMode } from "./types";

// UI chrome uses a single language: Chinese when lang is "zh", English otherwise.
export function uiLang(mode: LangMode): "en" | "zh" {
  return mode === "zh" ? "zh" : "en";
}

export function pick(b: Bilingual, mode: LangMode): string {
  return b[uiLang(mode)];
}

type Dict = Record<string, Bilingual>;

export const S: Dict = {
  appName: { en: "Ropedia Academy", zh: "Ropedia 学院" },
  tagline: {
    en: "Egocentric vision · 3D reconstruction · human motion · world models",
    zh: "第一人称视觉 · 三维重建 · 人体运动 · 世界模型",
  },
  navDashboard: { en: "Dashboard", zh: "总览" },
  navOverview: { en: "Research directions", zh: "研究方向" },
  navTracks: { en: "Tracks", zh: "赛道" },
  navReview: { en: "Review", zh: "复习" },
  navGraph: { en: "Concept map", zh: "概念图" },
  navGlossary: { en: "Glossary", zh: "术语表" },
  navSettings: { en: "Settings", zh: "设置" },
  glossarySearch: { en: "Search terms…", zh: "搜索术语…" },
  cmdkPlaceholder: { en: "Search lessons, terms, tracks…", zh: "搜索课程、术语、赛道…" },
  cmdkHint: { en: "to search", zh: "快速搜索" },
  cmdkEmpty: { en: "No results", zh: "无结果" },

  researchDirections: { en: "Research Directions", zh: "研究方向" },
  overviewIntro: {
    en: "Four connected research directions, each a track here — every focus area below is fully covered by the track's lessons.",
    zh: "四个相互关联的研究方向，每个对应这里的一条赛道——下面每个聚焦点都由该赛道的课程完整覆盖。",
  },
  focus: { en: "Focus", zh: "聚焦" },
  preferredBackground: { en: "Preferred background", zh: "推荐背景" },
  coveredIn: { en: "Covered across these lessons", zh: "由以下课程覆盖" },
  exploreTrack: { en: "Explore track", zh: "进入赛道" },
  lessonsCount: { en: "lessons", zh: "课" },

  continue: { en: "Continue learning", zh: "继续学习" },
  startHere: { en: "Start here", zh: "从这里开始" },
  resume: { en: "Resume", zh: "继续上次" },
  overallProgress: { en: "Overall progress", zh: "总体进度" },
  lessonsDone: { en: "lessons done", zh: "课已完成" },
  dueToday: { en: "Due for review", zh: "今日待复习" },
  cards: { en: "cards", zh: "张卡片" },
  noReviews: { en: "Nothing due — add checks from lessons to build your review deck.", zh: "暂无待复习——在课程里把检验题加入复习，建立你的卡组。" },
  reviewNow: { en: "Review now", zh: "立即复习" },

  lessons: { en: "Lessons", zh: "课程" },
  lesson: { en: "Lesson", zh: "第" },
  lessonSuffix: { en: "", zh: "课" },
  inPlainWords: { en: "In plain words", zh: "一句话直观理解" },
  interactive: { en: "Interactive — try it", zh: "交互演示 — 动手试试" },
  implementation: { en: "Implementation — see it in code", zh: "代码实现 — 看核心代码" },
  copyCode: { en: "Copy", zh: "复制" },
  copiedCode: { en: "Copied", zh: "已复制" },
  openInColab: { en: "Open in Colab", zh: "在 Colab 打开" },
  runItYourself: { en: "Run it yourself — no setup", zh: "亲自运行 — 无需配置" },
  output: { en: "Output", zh: "运行结果" },
  revealOutput: { en: "Reveal output", zh: "揭晓结果" },
  hideOutput: { en: "Hide output", zh: "收起结果" },
  predictHint: { en: "Predict what it prints & plots, then reveal", zh: "先预测它会打印/画出什么，再揭晓" },
  printedLabel: { en: "printed", zh: "打印输出" },
  figureLabel: { en: "figure", zh: "图像" },
  keyTerms: { en: "Key terms", zh: "关键术语" },
  papers: { en: "Key papers", zh: "关键论文" },
  learnMore: { en: "Learn more", zh: "延伸阅读" },
  watchTalks: { en: "Talks & explainers", zh: "讲解与讲座" },
  related: { en: "Connected lessons", zh: "关联课程" },
  checkYourself: { en: "Check yourself", zh: "自我检验" },
  yourTurn: { en: "Answer it in your head, then reveal.", zh: "先在心里作答，再揭晓答案。" },
  showAnswer: { en: "Reveal answer", zh: "揭晓答案" },
  hideAnswer: { en: "Hide answer", zh: "收起答案" },
  hint: { en: "Hint", zh: "提示" },
  addToReview: { en: "Add to review", zh: "加入复习" },
  inReview: { en: "In review deck", zh: "已在复习卡组" },
  markComplete: { en: "Mark lesson complete", zh: "标记本课完成" },
  completed: { en: "Completed", zh: "已完成" },
  markIncomplete: { en: "Mark as not done", zh: "标记为未完成" },
  prev: { en: "Previous", zh: "上一课" },
  next: { en: "Next", zh: "下一课" },

  quiz: { en: "Quiz", zh: "测验" },
  quizTrack: { en: "Quiz this track", zh: "测验本赛道" },
  quizStart: { en: "Start quiz", zh: "开始测验" },
  knewIt: { en: "I knew it", zh: "我会" },
  missedIt: { en: "Missed it", zh: "没答对" },
  quizComplete: { en: "Quiz complete", zh: "测验完成" },
  quizScore: { en: "You knew", zh: "你答对了" },
  addMissedToReview: { en: "Add missed to review", zh: "把答错的加入复习" },
  restartQuiz: { en: "Restart", zh: "重新开始" },
  forecastTitle: { en: "Next 7 days", zh: "未来 7 天" },
  todayLabel: { en: "Today", zh: "今天" },
  reviewTitle: { en: "Spaced repetition", zh: "间隔重复复习" },
  reviewEmpty: { en: "Your review deck is empty.", zh: "你的复习卡组是空的。" },
  reviewEmptyHint: { en: "Open any lesson and tap “Add to review” on its checks.", zh: "打开任意课程，在检验题上点「加入复习」。" },
  reviewDone: { en: "All caught up. Nothing due right now.", zh: "全部完成。当前没有待复习的卡片。" },
  reveal: { en: "Show answer", zh: "看答案" },
  gradeAgain: { en: "Again", zh: "重来" },
  gradeHard: { en: "Hard", zh: "困难" },
  gradeGood: { en: "Good", zh: "良好" },
  gradeEasy: { en: "Easy", zh: "轻松" },
  remaining: { en: "remaining", zh: "剩余" },

  graphTitle: { en: "Concept map", zh: "概念图" },
  graphHint: {
    en: "Each dot is a lesson. Hover one to see what it connects to across tracks; click to open it.",
    zh: "每个圆点是一课。悬停查看它跨赛道连接到哪些课；点击即可打开。",
  },

  settingsLanguage: { en: "Content language", zh: "内容语言" },
  langEn: { en: "English", zh: "英文" },
  langZh: { en: "中文", zh: "中文" },
  langBoth: { en: "Bilingual", zh: "中英双语" },
  settingsTheme: { en: "Theme", zh: "主题" },
  themeLight: { en: "Light", zh: "浅色" },
  themeDark: { en: "Dark", zh: "深色" },
  settingsData: { en: "Your data", zh: "你的数据" },
  dataLocal: {
    en: "Progress is saved in this browser. Connect Supabase (see README) for easy login and cross-device sync.",
    zh: "进度保存在此浏览器中。连接 Supabase（见 README）即可一键登录、跨设备同步。",
  },
  resetData: { en: "Reset all progress", zh: "重置全部进度" },
  resetConfirm: { en: "Reset all progress, review cards, and completion? This cannot be undone.", zh: "重置全部进度、复习卡片与完成状态？此操作无法撤销。" },

  localMode: { en: "Local mode", zh: "本地模式" },
  backToTrack: { en: "Back to track", zh: "返回赛道" },
  ofN: { en: "of", zh: "/" },
};

export function t(key: keyof typeof S | string, mode: LangMode): string {
  const entry = S[key as string];
  if (!entry) return key as string;
  return pick(entry, mode);
}
