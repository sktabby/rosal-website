import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        content: "1440px",
      },
      // Theme-dependent colours resolve to CSS variables (defined in
      // app/globals.css for light and .dark). They hold bare RGB channels so
      // opacity modifiers like `border-rsl-amber/40` keep working.
      colors: {
        rsl: {
          // Brand constants — identical in both themes.
          black: "#141414",
          red: "#D42027",
          "red-dark": "#A81920",
          amber: "#F5B60E",
          orange: "#F07C1D",
          white: "#FFFFFF",
          bg: "rgb(var(--rsl-bg) / <alpha-value>)",
          "bg-soft": "rgb(var(--rsl-bg-soft) / <alpha-value>)",
          border: "rgb(var(--rsl-border) / <alpha-value>)",
          muted: "rgb(var(--rsl-muted) / <alpha-value>)",
          "muted-soft": "rgb(var(--rsl-muted-soft) / <alpha-value>)",
        },
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        placeholder: "rgb(var(--placeholder) / <alpha-value>)",
        label: "rgb(var(--label) / <alpha-value>)",
        notice: {
          bg: "rgb(var(--notice-bg) / <alpha-value>)",
          fg: "rgb(var(--notice-fg) / <alpha-value>)",
        },
        danger: {
          bg: "rgb(var(--danger-bg) / <alpha-value>)",
          fg: "rgb(var(--danger-fg) / <alpha-value>)",
        },
        status: {
          "pending-bg": "rgb(var(--status-pending-bg) / <alpha-value>)",
          "pending-fg": "rgb(var(--status-pending-fg) / <alpha-value>)",
          "processing-bg": "rgb(var(--status-processing-bg) / <alpha-value>)",
          "processing-fg": "rgb(var(--status-processing-fg) / <alpha-value>)",
          "dispatched-bg": "rgb(var(--status-dispatched-bg) / <alpha-value>)",
          "dispatched-fg": "rgb(var(--status-dispatched-fg) / <alpha-value>)",
          "done-bg": "rgb(var(--status-done-bg) / <alpha-value>)",
          "done-fg": "rgb(var(--status-done-fg) / <alpha-value>)",
          "rejected-bg": "rgb(var(--status-rejected-bg) / <alpha-value>)",
          "rejected-fg": "rgb(var(--status-rejected-fg) / <alpha-value>)",
          "cancelled-bg": "rgb(var(--status-cancelled-bg) / <alpha-value>)",
          "cancelled-fg": "rgb(var(--status-cancelled-fg) / <alpha-value>)",
        },
      },
      borderRadius: {
        field: "9px",
        card: "12px",
        sheet: "16px",
      },
      fontSize: {
        "page-title": ["15px", { fontWeight: "700" }],
        "page-title-lg": ["16px", { fontWeight: "700" }],
        "section-label": ["10.5px", { fontWeight: "700", letterSpacing: "0.04em" }],
        body: ["12.5px", { lineHeight: "1.5" }],
        "body-md": ["13px", { lineHeight: "1.5" }],
        "field-label": ["10.5px", { fontWeight: "700", letterSpacing: "0.03em" }],
        meta: ["11px", { lineHeight: "1.4" }],
        btn: ["12.5px", { fontWeight: "700" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06)",
        pop: "0 4px 12px rgba(0,0,0,0.12)",
        sheet: "0 8px 32px rgba(0,0,0,0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "slide-up": {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "slide-up": "slide-up 0.2s ease-out",
        "sheet-up": "sheet-up 0.22s ease-out",
        fadeIn: "fadeIn 0.18s ease-out",
        slideIn: "slideIn 0.22s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
