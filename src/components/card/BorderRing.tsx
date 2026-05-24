// BorderRing - animated rectangular outline that traces the card perimeter
// using SVG stroke-dashoffset. NEVER use mask-composite/transforms here:
// earlier versions translated/rotated an inner div and produced ghost
// rectangles when it escaped the card's clip bounds.
//
// Two visible "runs" chase each other around the border, leaving a glowing
// trail. Tier-gated:
//   ASCENDED: 2 runs, foil gradient, glowy
//   MYTHIC:   1 run,  gold, brighter
//   S:        1 run,  family accent, subtle
//   A and below: hidden (no animated ring)

import type { Tier } from "@/lib/types";

interface BorderRingProps {
  tier: Tier;
  /** Family accent color - used as the ring color for S tier. */
  accent: string;
  /** Border radius matching the card's outer corner. */
  radius?: number;
  /** Card aspect - pass null for the surrounding holo-card width/height. */
}

interface RingPlan {
  show: boolean;
  runs: number;          // number of moving highlight segments
  baseStroke: string;    // background stroke color
  glowStroke: string;    // glowing segment stroke color
  strokeOpacity: number;
  glowOpacity: number;
  duration: number;      // seconds for one full loop
}

function ringPlan(tier: Tier, accent: string): RingPlan {
  switch (tier) {
    case "ASCENDED":
      return {
        show: true,
        runs: 3,
        baseStroke: "rgba(255, 213, 122, 0.35)",
        glowStroke: "#FFE5A8",
        strokeOpacity: 0.55,
        glowOpacity: 1,
        duration: 6,
      };
    case "MYTHIC":
      return {
        show: true,
        runs: 2,
        baseStroke: "rgba(232, 181, 71, 0.30)",
        glowStroke: "#FFD27A",
        strokeOpacity: 0.45,
        glowOpacity: 0.95,
        duration: 8,
      };
    case "S":
      return {
        show: true,
        runs: 1,
        baseStroke: `rgba(255, 255, 255, 0.18)`,
        glowStroke: accent,
        strokeOpacity: 0.35,
        glowOpacity: 0.85,
        duration: 10,
      };
    default:
      return {
        show: false,
        runs: 0,
        baseStroke: "",
        glowStroke: "",
        strokeOpacity: 0,
        glowOpacity: 0,
        duration: 0,
      };
  }
}

export function BorderRing({ tier, accent, radius = 22 }: BorderRingProps) {
  const plan = ringPlan(tier, accent);
  if (!plan.show) return null;

  // The SVG viewports the card. We draw an inset rounded-rect just inside
  // the card border. The path perimeter for a rounded rect of dims (W,H)
  // and radius r is: 2*(W + H) - (8-2π)·r ≈ 2W + 2H - 1.72r.
  // We don't need exact dasharray - we want a clean offset cycle so we use
  // a large dasharray with stroke-dashoffset animation.
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        inset: 4,
        width: "calc(100% - 8px)",
        height: "calc(100% - 8px)",
        pointerEvents: "none",
        zIndex: 5,
        overflow: "visible",
      }}
      preserveAspectRatio="none"
      viewBox="0 0 100 140"
    >
      <defs>
        <filter id={`ringGlow-${tier}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      {/* base hairline */}
      <rect
        x="0.5"
        y="0.5"
        width="99"
        height="139"
        rx={radius / 5}
        ry={radius / 5}
        fill="none"
        stroke={plan.baseStroke}
        strokeWidth="0.5"
        strokeOpacity={plan.strokeOpacity}
        vectorEffect="non-scaling-stroke"
      />
      {/* moving glowing segments */}
      {Array.from({ length: plan.runs }).map((_, i) => (
        <rect
          key={i}
          x="0.5"
          y="0.5"
          width="99"
          height="139"
          rx={radius / 5}
          ry={radius / 5}
          fill="none"
          stroke={plan.glowStroke}
          strokeWidth="0.9"
          strokeOpacity={plan.glowOpacity}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#ringGlow-${tier})`}
          style={{
            strokeDasharray: "18 220",
            strokeDashoffset: -(i * (238 / plan.runs)),
            animation: `borderRingSpin ${plan.duration}s linear infinite`,
            animationDelay: `${-(i * plan.duration) / plan.runs}s`,
          }}
        />
      ))}
    </svg>
  );
}
