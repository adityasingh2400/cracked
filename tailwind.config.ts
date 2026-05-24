import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // `display` is the chunky Bowlby One for headlines + stamps.
        // `serif` is Fraunces for italic flavor + card names.
        // `sans` is Inter for body. `mono` is JetBrains Mono.
        display: ["var(--font-display)", "Bowlby One", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Tokens flipped vs. the previous Cozy Twilight build: `white` now
        // resolves to ink and `black` to paper, so every existing
        // text-white/65, bg-white/[0.02], border-white/10 inherits the new
        // light-mode palette automatically. HoloCardV1 is exempt — it
        // styles itself inline because a trading card looks like a trading
        // card on any background.
        white: "#3C1F15",
        black: "#FFF6EC",
        // Sunset Arcade — warm light palette
        bg: {
          DEFAULT: "#FFF6EC",
          1: "#FFE4D6",   // blush — top of gradient
          2: "#FFCFA8",   // peach
          3: "#FFB07A",   // apricot
          4: "#FFA532",   // mango — bottom of gradient
        },
        paper: {
          DEFAULT: "#FFF6EC",
          cream: "#FFFAF2",
          dim: "#F5EBD9",
        },
        ink: {
          DEFAULT: "#3C1F15",
          soft: "#6E3F2E",
          fade: "#9C7560",
          900: "#2A150C",
          800: "#3C1F15",
          700: "#5C3424",
        },
        // `cream` stays a light tone. It's used in two places:
        //   - `bg-cream` / `border-cream` for light card surfaces on the
        //     arcade page (light card, dark border).
        //   - `text-cream` inside HoloCardV1 for light text on the card's
        //     dark interior. Both contexts want a warm-light color.
        cream: {
          DEFAULT: "#FFFAF2",
          dim: "#F5EBD9",
          muted: "#E7D5BC",
        },
        cherry: {
          DEFAULT: "#FF6B5C",
          deep: "#E03E2D",
          light: "#FF8C7E",
        },
        marigold: {
          DEFAULT: "#FFC53D",
          deep: "#E0A41F",
          light: "#FFD66E",
        },
        mango: {
          DEFAULT: "#FFA532",
          deep: "#E08515",
        },
        blush: {
          DEFAULT: "#FFE4D6",
          deep: "#FFD0BA",
        },
        peach: {
          DEFAULT: "#FFCFA8",
          deep: "#FFB97F",
        },
        apricot: "#FFB07A",
        amber: {
          DEFAULT: "#E8B547",
          light: "#FFE5A8",
          deep: "#B98A2E",
          dark: "#8B6420",
        },
        gold: {
          DEFAULT: "#E8B547",
          light: "#FFE5A8",
          deep: "#B98A2E",
        },
        walnut: {
          DEFAULT: "#4A3528",
          line: "rgba(60, 31, 21, 0.18)",
        },
        // Holo card foil palette — preserved verbatim (HoloCardV1 reads it).
        foil: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          cyan: "#06B6D4",
          gold: "#FCD34D",
        },
      },
      boxShadow: {
        // Arcade hard shadows — signature of the new design
        "arcade-sm": "3px 3px 0 #3C1F15",
        "arcade-md": "5px 5px 0 #3C1F15",
        "arcade-lg": "8px 8px 0 #3C1F15",
        "arcade-cherry": "5px 5px 0 #FF6B5C",
        "arcade-cherry-lg": "8px 8px 0 #FF6B5C",
        "arcade-cherry-xl": "10px 10px 0 #FF6B5C",
        "arcade-marigold": "5px 5px 0 #FFC53D",
        // HoloCardV1 kept (any pages still calling `shadow-foil`/`shadow-card`)
        foil: "0 30px 80px -20px rgba(139, 92, 246, 0.35), 0 0 100px rgba(236, 72, 153, 0.15)",
        card: "0 50px 110px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(232,181,71,0.18)",
        "amber-glow": "0 14px 36px -10px rgba(232,181,71,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
        "amber-ring": "0 0 0 1px rgba(232,181,71,0.35), 0 0 24px -4px rgba(232,181,71,0.30)",
        ember: "inset 0 0 60px rgba(232,181,71,0.08), 0 30px 60px -30px rgba(0,0,0,0.6)",
      },
      animation: {
        "holo-pan":   "holoPan 4s linear infinite",
        marquee:      "marquee 38s linear infinite",
        wiggle:       "wiggle 2.4s ease-in-out infinite",
        bobble:       "bobble 4s ease-in-out infinite",
        "bolt-flash": "boltFlash 2.2s ease-in-out infinite",
        "cta-pulse":  "ctaPulse 2.8s ease-out infinite",
        "stamp-in":   "stampIn 0.7s cubic-bezier(.4,1.6,.6,1) 0.1s both",
        "blob-a":     "blobA 22s ease-in-out infinite",
        "blob-b":     "blobB 28s ease-in-out infinite",
        aurora:       "aurora 18s ease-in-out infinite",
        "foil-shift": "foilShift 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "count-up":   "countUp 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "ember-pulse":"emberPulse 6s ease-in-out infinite",
      },
      keyframes: {
        holoPan: {
          "0%":   { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "-50% 50%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(14deg)" },
          "50%":      { transform: "rotate(10deg) translateY(-2px)" },
        },
        bobble: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r,0deg))" },
          "50%":      { transform: "translateY(-8px) rotate(calc(var(--r,0deg) + 2deg))" },
        },
        boltFlash: {
          "0%, 90%, 100%": { transform: "rotate(-8deg) scale(1)", filter: "drop-shadow(0 0 0 transparent)" },
          "93%":           { transform: "rotate(-6deg) scale(1.18)", filter: "drop-shadow(0 0 8px #FFC53D)" },
          "96%":           { transform: "rotate(-10deg) scale(0.96)", filter: "drop-shadow(0 0 4px #FF6B5C)" },
        },
        ctaPulse: {
          "0%":   { boxShadow: "0 0 0 0 rgba(255,107,92,0.55)" },
          "70%":  { boxShadow: "0 0 0 16px rgba(255,107,92,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,107,92,0)" },
        },
        stampIn: {
          "0%":   { transform: "rotate(20deg) scale(2)", opacity: "0" },
          "60%":  { transform: "rotate(-3deg) scale(0.96)" },
          "100%": { transform: "rotate(-2deg) scale(1)", opacity: "1" },
        },
        blobA: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%":      { transform: "translate(60px,-40px) scale(1.1)" },
          "66%":      { transform: "translate(-30px,50px) scale(0.95)" },
        },
        blobB: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%":      { transform: "translate(-50px,60px) scale(1.15)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%":      { transform: "translate(-30px,20px) scale(1.05)" },
        },
        foilShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        emberPulse: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%":      { opacity: "0.85", transform: "scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
