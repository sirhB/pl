/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fusion: {
          black: "#121212",
          charcoal: "#1a1a1a",
          gold: "#c9a227",
          yellow: "#e8b923",
          green: "#1faa4a",
          "green-dark": "#178a3a",
          red: "#c8102e",
          cream: "#f7f2e8",
          muted: "#6b7280",
          mist: "#f0f1f3",
          paper: "#ffffff",
          ink: "#141414",
          line: "#e6e7eb",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px rgba(16, 24, 40, 0.08)",
        float: "0 18px 50px rgba(16, 24, 40, 0.12)",
        card: "0 4px 24px rgba(16, 24, 40, 0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.96)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
        "slide-in": "slide-in 0.4s ease-out both",
        pop: "pop 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
