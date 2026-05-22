import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        script: ["var(--font-script)", "Pinyon Script", "cursive"],
      },
      colors: {
        // Redefine "white" globally as warm cream so existing text-white/border-white
        // utility references inherit Cozy Twilight automatically across all pages.
        white: "#F2E8DC",
        // "black" → warm espresso so any text-black/bg-black references stay warm too.
        black: "#1F1612",
        // Cozy Twilight — warm dark palette (espresso → mahogany)
        bg: {
          DEFAULT: "#1F1612",
          1: "#1F1612",
          2: "#2A1F1B",
          3: "#362720",
          4: "#4A3528",
        },
        ink: {
          DEFAULT: "#1F1612",
          900: "#15100D",
          800: "#1F1612",
          700: "#2A1F1B",
        },
        // Warm cream type
        cream: {
          DEFAULT: "#F2E8DC",
          dim: "#D9CCB8",
          muted: "#A8987F",
        },
        // Candle-glow amber
        amber: {
          DEFAULT: "#E8B547",
          light: "#FFE5A8",
          deep: "#B98A2E",
          dark: "#8B6420",
        },
        // Walnut warmth for lines/borders
        walnut: {
          DEFAULT: "#4A3528",
          line: "rgba(232,181,71,0.18)",
        },
        // Foil palette unchanged — holo card depends on it
        foil: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#06B6D4",
          gold: "#FCD34D",
        },
        gold: {
          DEFAULT: "#E8B547",
          light: "#FFE5A8",
          deep: "#B98A2E",
        },
      },
      boxShadow: {
        foil: "0 30px 80px -20px rgba(139, 92, 246, 0.35), 0 0 100px rgba(236, 72, 153, 0.15)",
        card: "0 50px 110px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(232,181,71,0.18)",
        "amber-glow": "0 14px 36px -10px rgba(232,181,71,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
        "amber-ring": "0 0 0 1px rgba(232,181,71,0.35), 0 0 24px -4px rgba(232,181,71,0.30)",
        ember: "inset 0 0 60px rgba(232,181,71,0.08), 0 30px 60px -30px rgba(0,0,0,0.6)",
      },
      animation: {
        "foil-shift": "foilShift 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "count-up": "countUp 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ember-pulse": "emberPulse 6s ease-in-out infinite",
      },
      keyframes: {
        foilShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        emberPulse: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
