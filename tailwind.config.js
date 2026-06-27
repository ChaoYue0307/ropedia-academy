/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef0ff",
          100: "#e0e3ff",
          200: "#c6ccff",
          300: "#a3a8ff",
          400: "#827ef9",
          500: "#6a5ef0",
          600: "#5a44d6",
          700: "#4c37b0",
          800: "#3f308d",
          900: "#372d71",
          950: "#221a43",
        },
        ink: {
          DEFAULT: "#1c1b22",
          soft: "#3a3946",
          mute: "#6b6a78",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        display: [
          "Sora",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,15,30,0.04), 0 10px 30px -12px rgba(16,15,30,0.10)",
        "card-hover": "0 1px 2px rgba(16,15,30,0.05), 0 18px 40px -16px rgba(80,60,200,0.22)",
        glow: "0 0 0 1px rgba(106,94,240,0.18), 0 12px 36px -10px rgba(106,94,240,0.45)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-fast": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-fast": "fade-in-fast 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
