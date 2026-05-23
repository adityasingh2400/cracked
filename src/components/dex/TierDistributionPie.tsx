// Pie chart of tier distribution — per /plan-eng-review Week 3 (promoted from
// Week 4 polish). Pure SVG, no external charting deps. Renders on each family
// dex page + on result page (smaller) for the "where am I" view.

import type { Tier } from "@/lib/types";

interface PieProps {
  /** percent in each tier — should sum to ~100 but the component normalizes. */
  distribution: Record<Tier, number>;
  size?: number;
  className?: string;
}

const TIER_ORDER: Tier[] = ["ASCENDED", "MYTHIC", "S", "A", "B", "C", "D"];

const TIER_COLOR: Record<Tier, string> = {
  ASCENDED: "#FF5A2E",
  MYTHIC: "#FCD34D",
  S: "#F59E0B",
  A: "#A78BFA",
  B: "#06B6D4",
  C: "#475569",
  D: "#1E293B",
};

export function TierDistributionPie({
  distribution,
  size = 180,
  className,
}: PieProps) {
  const total = TIER_ORDER.reduce((s, t) => s + (distribution[t] ?? 0), 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const innerR = r * 0.55;

  let startAngle = -Math.PI / 2; // start at top
  const slices = TIER_ORDER.map((tier) => {
    const pct = (distribution[tier] ?? 0) / total;
    const sweep = pct * Math.PI * 2;
    const endAngle = startAngle + sweep;
    const path = donutSlice(cx, cy, r, innerR, startAngle, endAngle);
    const labelAngle = (startAngle + endAngle) / 2;
    const labelR = (r + innerR) / 2;
    const labelX = cx + Math.cos(labelAngle) * labelR;
    const labelY = cy + Math.sin(labelAngle) * labelR;
    const slice = { tier, path, pct, labelX, labelY };
    startAngle = endAngle;
    return slice;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="tier distribution"
    >
      {slices.map((s) => (
        <path
          key={s.tier}
          d={s.path}
          fill={TIER_COLOR[s.tier]}
          stroke="#0A0402"
          strokeWidth={0.5}
        >
          <title>
            {s.tier}: {(s.pct * 100).toFixed(2)}%
          </title>
        </path>
      ))}
      {/* center label */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={9}
        fill="rgba(255,229,168,0.55)"
        style={{ letterSpacing: "0.15em" }}
      >
        TIER MIX
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={11}
        fontWeight={700}
        fill="#FCD34D"
      >
        {((slices[0]?.pct ?? 0) * 100).toFixed(2)}%
      </text>
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={7}
        fill="rgba(255,229,168,0.4)"
        style={{ letterSpacing: "0.1em" }}
      >
        ASCENDED
      </text>
    </svg>
  );
}

function donutSlice(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  const x1 = cx + Math.cos(start) * rOuter;
  const y1 = cy + Math.sin(start) * rOuter;
  const x2 = cx + Math.cos(end) * rOuter;
  const y2 = cy + Math.sin(end) * rOuter;
  const x3 = cx + Math.cos(end) * rInner;
  const y3 = cy + Math.sin(end) * rInner;
  const x4 = cx + Math.cos(start) * rInner;
  const y4 = cy + Math.sin(start) * rInner;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}
