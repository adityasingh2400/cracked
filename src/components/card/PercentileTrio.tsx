// PercentileTrio - the three screenshot-bait percentile lines.
// Per /plan-eng-review Percentile Computation section, in this exact order:
//   1. WITHIN-FAMILY, WITHIN-COHORT (primary, largest)
//   2. CROSS-FAMILY, WITHIN-COHORT (secondary)
//   3. ALL-TIME GLOBAL (smallest, displayed last)

import clsx from "clsx";
import type { Family, LeagueKey, PercentileTrio as Trio } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface PercentileTrioProps {
  percentiles: Trio;
  family: Family;
  cohortLabel: string;
  className?: string;
}

function topPctFormat(percentile: number): string {
  const top = 100 - percentile;
  if (top < 1) return `top ${top.toFixed(2)}%`;
  if (top < 10) return `top ${top.toFixed(1)}%`;
  return `top ${Math.round(top)}%`;
}

export function PercentileTrio({
  percentiles,
  family,
  cohortLabel,
  className,
}: PercentileTrioProps) {
  const meta = FAMILIES_META[family];
  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <Line
        primary
        label={`${topPctFormat(percentiles.withinFamilyCohort)} in ${meta.shortName} · ${cohortLabel}`}
        percentile={percentiles.withinFamilyCohort}
        accent={meta.accent}
      />
      <Line
        label={`${topPctFormat(percentiles.crossFamilyCohort)} of ${cohortLabel}, all fields`}
        percentile={percentiles.crossFamilyCohort}
        accent="#FCD34D"
      />
      <Line
        label={`${topPctFormat(percentiles.global)} of the world, all-time`}
        percentile={percentiles.global}
        accent="rgba(255,229,168,0.45)"
      />
    </div>
  );
}

function Line({
  label,
  percentile,
  accent,
  primary,
}: {
  label: string;
  percentile: number;
  accent: string;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={clsx(
          "font-mono",
          primary ? "text-base text-white" : "text-xs text-white/70"
        )}
      >
        {label}
      </div>
      <div
        className={clsx(
          "w-full rounded-full bg-white/10",
          primary ? "h-2" : "h-1"
        )}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.max(2, Math.min(100, percentile))}%`,
            background: accent,
          }}
          data-percentile={percentile.toFixed(1)}
        />
      </div>
    </div>
  );
}
