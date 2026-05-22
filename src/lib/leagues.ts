// Pure functions: turn an absolute 0-100 score + an age into a LeaguePlacement.
// No IO. Determined entirely by the constants in src/data/leagues.

import { LEAGUES, leagueForAge, type League } from "@/data/leagues";
import type { LeaguePlacement, Tier } from "./types";

/**
 * Map an absolute total score into a league-relative tier using the league's
 * cutoffs. Cutoffs are ordered S > A > B > C > D so we take the first hit.
 */
export function leagueTierFor(total: number, league: League): Tier {
  if (total >= league.cutoffs.S) return "S";
  if (total >= league.cutoffs.A) return "A";
  if (total >= league.cutoffs.B) return "B";
  if (total >= league.cutoffs.C) return "C";
  return "D";
}

/**
 * Compute a 1-99 league percentile. We anchor 50 at the league baseline and
 * stretch toward S-cutoff (90th) and toward 0 (1st). It's a vibes percentile,
 * not a real population estimate — the leaderboard is opt-in, the sample is
 * not random, and we don't pretend otherwise on the card.
 */
export function leaguePercentile(total: number, league: League): number {
  const lo = 0;
  const baseline = league.baseline;
  const sCut = league.cutoffs.S;
  const hi = 100;

  if (total <= lo) return 1;
  if (total >= hi) return 99;

  let pct: number;
  if (total <= baseline) {
    // 0 → 50 percentile over [0, baseline]
    pct = (total / Math.max(1, baseline)) * 50;
  } else if (total <= sCut) {
    // 50 → 90 percentile over [baseline, S-cutoff]
    const span = Math.max(1, sCut - baseline);
    pct = 50 + ((total - baseline) / span) * 40;
  } else {
    // 90 → 99 percentile over [S-cutoff, 100]
    const span = Math.max(1, 100 - sCut);
    pct = 90 + ((total - sCut) / span) * 9;
  }

  return Math.max(1, Math.min(99, Math.round(pct)));
}

export interface PlacementInput {
  total: number;
  age: number;
  ageSource: "user" | "inferred";
  ageConfidence?: number;
}

export function placeInLeague(input: PlacementInput): LeaguePlacement {
  const league = leagueForAge(input.age);
  const leagueTier = leagueTierFor(input.total, league);
  const percentile = leaguePercentile(input.total, league);
  return {
    league: league.key,
    leagueLabel: league.label,
    leagueTier,
    percentile,
    age: input.age,
    ageSource: input.ageSource,
    ageConfidence: input.ageSource === "user" ? 1 : (input.ageConfidence ?? 0.6),
  };
}

/** Re-export for convenience. */
export { LEAGUES, leagueForAge };
