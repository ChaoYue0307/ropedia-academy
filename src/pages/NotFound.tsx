import { Link } from "react-router-dom";
import { useStore } from "../lib/store";

export function NotFound() {
  const zh = useStore((s) => s.lang) === "zh";
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="font-display text-6xl font-bold tracking-tight text-brand-500/80">404</div>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink dark:text-stone-100">
        {zh ? "页面不存在" : "Page not found"}
      </h1>
      <p className="mt-1.5 text-sm text-ink/55 dark:text-stone-400">
        {zh ? "你要找的页面不存在或已移动。" : "The page you're looking for doesn't exist or moved."}
      </p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        {zh ? "返回首页" : "Back to dashboard"}
      </Link>
    </div>
  );
}
