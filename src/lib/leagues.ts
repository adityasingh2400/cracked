// Pure functions: turn an achievement tier + age into a LeaguePlacement.
// No IO. Determined entirely by the constants in src/data/leagues.

import { LEAGUES, leagueForAge } from "@/data/leagues";
import type { LeaguePlacement, Tier, TierStars } from "./types";
import { supportsTierCrowns } from "./types";

const STANDARD_TIER_PERCENTILE: Record<Exclude<Tier, "ASCENDED" | "MYTHIC">, [number, number, number]> = {
  D: [25, 35, 45],
  C: [55, 65, 72],
  B: [80, 85, 89],
  A: [92, 95, 97],
  S: [98, 99, 99.5],
};

export function tierPercentile(tier: Tier, crowns?: TierStars): number {
  if (tier === "ASCENDED") return 99.999;
  if (tier === "MYTHIC") return 99.9;
  if (!supportsTierCrowns(tier)) return STANDARD_TIER_PERCENTILE[tier][1];
  const idx = Math.max(0, Math.min(2, (crowns ?? 1) - 1));
  return STANDARD_TIER_PERCENTILE[tier][idx];
}

export interface PlacementInput {
  tier: Tier;
  tierStars?: TierStars;
  age: number;
  ageSource: "user" | "inferred";
  ageConfidence?: number;
}

export function placeInLeague(input: PlacementInput): LeaguePlacement {
  const league = leagueForAge(input.age);
  const percentile = tierPercentile(input.tier, input.tierStars);
  return {
    league: league.key,
    leagueLabel: league.label,
    leagueTier: input.tier,
    leagueTierStars: supportsTierCrowns(input.tier) ? input.tierStars ?? 1 : undefined,
    percentile,
    age: input.age,
    ageSource: input.ageSource,
    ageConfidence: input.ageSource === "user" ? 1 : (input.ageConfidence ?? 0.6),
  };
}

/** Re-export for convenience. */
export { LEAGUES, leagueForAge };
