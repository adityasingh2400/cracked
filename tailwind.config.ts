import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        script: ["var(--font-script)", "Pinyon Script", "cursive"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          900: "#05050A",
          800: "#0E0E15",
          700: "#1A1A22",
        },
        foil: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#06B6D4",
          gold: "#FCD34D",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F5D77A",
          deep: "#9B7E1F",
        },
      },
      boxShadow: {
        foil: "0 30px 80px -20px rgba(139, 92, 246, 0.35), 0 0 100px rgba(236, 72, 153, 0.15)",
        card: "0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.7)",
      },
      animation: {
        "foil-shift": "foilShift 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "count-up": "countUp 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
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
      },
    },
  },
  plugins: [],
};

export default config;
