/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fusion: {
          void: "#0A0A0C",
          black: "#121215",
          zinc: "#1C1C22",
          panel: "rgba(24, 24, 27, 0.75)",
          gold: "#FFD700",
          amber: "#FACC15",
          red: "#DC2626",
          "red-hot": "#EF4444",
          green: "#16A34A",
          emerald: "#22C55E",
          muted: "#A1A1AA",
          line: "rgba(250, 204, 21, 0.2)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        brush: ["var(--font-brush)", "cursive"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,0.45)",
        glow: "0 0 28px rgba(22, 163, 74, 0.35)",
        "glow-gold": "0 0 24px rgba(255, 215, 0, 0.25)",
      },
      backdropBlur: {
        xl: "24px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bowl-pop": {
          "0%": { transform: "scale(0.94) rotate(-2deg)" },
          "60%": { transform: "scale(1.03) rotate(1deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "badge-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "press": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
        "price-flash": {
          "0%": { color: "#FFD700", transform: "scale(1.08)" },
          "100%": { color: "#FFFFFF", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "bowl-pop": "bowl-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        "badge-in": "badge-in 0.35s ease-out both",
        press: "press 0.28s ease-out",
        "price-flash": "price-flash 0.45s ease-out",
        shimmer: "shimmer 2.8s linear infinite",
      },
    },
  },
  plugins: [],
};
