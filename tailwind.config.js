/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fusion: {
          black: "#0a0a0a",
          charcoal: "#141414",
          gold: "#d4a017",
          yellow: "#f5c518",
          green: "#1f8a3b",
          red: "#c8102e",
          cream: "#f7f2e8",
          muted: "#9a9a9a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "fusion-radial":
          "radial-gradient(ellipse at top, rgba(212,160,23,0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(31,138,59,0.12), transparent 45%)",
        "palm-fade":
          "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.85) 70%, #0a0a0a 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
