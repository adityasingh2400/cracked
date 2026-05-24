// CrackednessLine - single screenshot-bait flex below the tier illustration.
// Reads: "top 0.3% most cracked 25-year-olds"
// Replaces the v1.0 three-line percentile strip and the cohort HP-stamp text.

import clsx from "clsx";
import type { Family, PercentileTrio } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface CrackednessLineProps {
  percentiles: PercentileTrio;
  /** Cohort label like "23-26" or "Ages 23–26" - used to anchor the claim. */
  cohortLabel: string;
  family: Family;
  /** Age the user actually was when scored (from result.league.age). */
  age?: number;
  className?: string;
}

export function CrackednessLine({ percentiles, cohortLabel, family, age, className }: CrackednessLineProps) {
  const meta = FAMILIES_META[family];
  const top = 100 - percentiles.withinFamilyCohort;

  let topLabel: string;
  if (top < 0.1) topLabel = top.toFixed(3);
  else if (top < 1) topLabel = top.toFixed(2);
  else if (top < 10) topLabel = top.toFixed(1);
  else topLabel = String(Math.round(top));

  // Prefer the actual age if we know it ("25-year-olds"); fall back to the
  // cohort label ("23-26 year olds").
  const ageNoun =
    age && age > 0
      ? `${age}-year-olds`
      : cohortLabel.toLowerCase().includes("age")
      ? cohortLabel.toLowerCase()
      : `${cohortLabel} year olds`;

  return (
    <div
      className={clsx(
        "font-display text-center leading-tight",
        className
      )}
      data-testid="crackedness-line"
    >
      <div className="text-sm sm:text-base">
        <span className="font-mono uppercase tracking-[0.18em] text-white/55">top </span>
        <span
          className="font-bold tabular-nums"
          style={{ color: meta.accent, textShadow: `0 0 12px ${meta.accent}66` }}
        >
          {topLabel}%
        </span>
        <span className="font-mono uppercase tracking-[0.18em] text-white/55"> most cracked </span>
        <span className="text-white">{ageNoun}</span>
      </div>
    </div>
  );
}
