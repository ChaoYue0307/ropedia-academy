import { Component, type ReactNode } from "react";

// Catches render-time errors in a subtree and shows a friendly fallback instead
// of blanking the whole app. Resets automatically when `resetKey` changes (e.g.
// on route navigation), so the user can simply move to another page.
export class ErrorBoundary extends Component<
  { children: ReactNode; resetKey?: string; zh?: boolean },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Caught render error:", error);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const zh = this.props.zh;
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200/70 bg-white/70 p-8 text-center shadow-card dark:border-white/[0.07] dark:bg-white/[0.04]">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 className="font-display text-lg font-semibold text-ink dark:text-stone-100">
          {zh ? "这部分出了点问题" : "Something went wrong here"}
        </h2>
        <p className="mt-1 text-sm text-ink/55 dark:text-stone-400">
          {zh ? "应用的其余部分仍可正常使用。" : "The rest of the app still works — try another page."}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => location.reload()}
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            {zh ? "刷新" : "Reload"}
          </button>
          <a
            href={import.meta.env.BASE_URL}
            className="rounded-lg border border-stone-200 px-3.5 py-2 text-sm font-medium text-ink/70 transition hover:border-brand-300 dark:border-white/10 dark:text-stone-300"
          >
            {zh ? "返回首页" : "Go to dashboard"}
          </a>
        </div>
      </div>
    );
  }
}
