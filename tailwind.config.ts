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
      colors: {
        rsl: {
          black: "#141414",
          red: "#D42027",
          "red-dark": "#A81920",
          amber: "#F5B60E",
          orange: "#F07C1D",
          white: "#FFFFFF",
          bg: "#F2F2F2",
          "bg-soft": "#FAFAFA",
          border: "#E2E2E4",
          muted: "#6B6B6E",
          "muted-soft": "#888888",
        },
        status: {
          "pending-bg": "#FCE8D6",
          "pending-fg": "#B5540A",
          "processing-bg": "#DCE7FB",
          "processing-fg": "#2452B5",
          "dispatched-bg": "#E3DBFB",
          "dispatched-fg": "#5A2CB5",
          "done-bg": "#DBF3E0",
          "done-fg": "#1D8A3E",
          "rejected-bg": "#FBDCDC",
          "rejected-fg": "#B51E1E",
          "cancelled-bg": "#EEEEEE",
          "cancelled-fg": "#555555",
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
