import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In production we serve from a GitHub Pages project subpath by default
// (https://<user>.github.io/ropedia-academy/). Override with VITE_BASE,
// e.g. VITE_BASE=/ for a user/custom-domain site. Dev always uses "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? process.env.VITE_BASE ?? "/ropedia-academy/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: [
            "react-markdown",
            "remark-gfm",
            "remark-math",
            "rehype-katex",
            "rehype-highlight",
            "katex",
          ],
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "zustand",
            "@supabase/supabase-js",
          ],
        },
      },
    },
  },
}));
