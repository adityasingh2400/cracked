// AchievementConstellation - overlays the illustration with deterministic
// "stars" representing each matched achievement, with faint connecting lines.
// Positions are FNV-1a hashed from achievement id + name salt so the same
// user sees the same constellation across reloads.
//
// Tier-gated:
//   ASCENDED / MYTHIC: full brightness + ring pulse on connect lines
//   S / A:             dimmer dots, thinner lines
//   B / C / D:         hidden (constellation only kicks in for top tiers)

import { hash32 } from "@/lib/types";
import type { Tier, Family } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface ConstellationProps {
  achievements: Array<{ id: string; label: string; family: Family; tier: Tier }>;
  /** Salt - usually the user's name. Keeps constellations user-stable. */
  seed: string;
  cardTier: Tier;
  /** Family of the card's primary identity (used for accent color). */
  family: Family;
  /** Width/height of the SVG viewport. Internally we use a 0-100 unit grid. */
  className?: string;
}

const TIER_VISIBILITY: Record<Tier, { dot: number; line: number; pulse: boolean }> = {
  ASCENDED: { dot: 1.0,  line: 0.35, pulse: true },
  MYTHIC:   { dot: 0.9,  line: 0.28, pulse: true },
  S:        { dot: 0.75, line: 0.20, pulse: false },
  A:        { dot: 0.6,  line: 0.14, pulse: false },
  B:        { dot: 0.0,  line: 0,    pulse: false }, // hidden
  C:        { dot: 0.0,  line: 0,    pulse: false },
  D:        { dot: 0.0,  line: 0,    pulse: false },
};

export function AchievementConstellation({
  achievements,
  seed,
  cardTier,
  family,
  className,
}: ConstellationProps) {
  const visibility = TIER_VISIBILITY[cardTier];
  if (visibility.dot === 0 || achievements.length === 0) return null;

  const accent = FAMILIES_META[family].accent;
  const dots = achievements.slice(0, 14).map((a) => {
    const h = hash32(`${seed}::${a.id}`);
    // pluck two independent dimensions from the 32-bit hash
    const x = 8 + (h % 84);                        // 8-92 inner padding
    const y = 12 + ((h >>> 9) % 76);               // 12-88
    const r = 0.8 + ((h >>> 17) % 14) / 10;        // 0.8-2.2 radius
    return { id: a.id, label: a.label, x, y, r };
  });

  // simple nearest-neighbor lines: each dot connects to the dot with closest
  // hash-distance (deterministic, no quadratic re-render churn).
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i < dots.length; i++) {
    let bestJ = -1;
    let bestD = Infinity;
    for (let j = 0; j < dots.length; j++) {
      if (i === j) continue;
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        bestJ = j;
      }
    }
    if (bestJ > i) {
      lines.push({ x1: dots[i].x, y1: dots[i].y, x2: dots[bestJ].x, y2: dots[bestJ].y });
    }
  }

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
        mixBlendMode: "screen",
        opacity: visibility.dot,
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`const-dot-${cardTier}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      {lines.map((l, i) => (
        <line
          key={`l-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={accent}
          strokeWidth="0.3"
          strokeOpacity={visibility.line}
          strokeLinecap="round"
          style={
            visibility.pulse
              ? { animation: `constLinePulse 4s ease-in-out infinite` }
              : undefined
          }
        />
      ))}
      {dots.map((d) => (
        <g key={d.id}>
          <circle
            cx={d.x}
            cy={d.y}
            r={d.r * 2.2}
            fill={`url(#const-dot-${cardTier})`}
            opacity="0.55"
          />
          <circle
            cx={d.x}
            cy={d.y}
            r={d.r * 0.7}
            fill="#FFFFFF"
            opacity="0.95"
          />
        </g>
      ))}
    </svg>
  );
}
