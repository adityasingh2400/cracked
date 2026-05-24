// Mount Olympus leaderboard ranking - top-100 cross-family, all-time.
// Per /plan-eng-review Section 1.2 + 4.2:
// - Entry threshold: MYTHIC tier or above in any family.
// - Capacity: top 100.
// - Storage: Redis sorted set (Vercel KV / Upstash).
//   ZADD on score-write, ZREVRANGE for top-100 read. O(log N).
// - Score formula (internal, never shown):
//     olympus_score = tier_index * 1000 + chain_count * 50 + cohort_percentile
//   where tier_index(ASCENDED)=2, MYTHIC=1.
// - Tiebreaker: most recent qualifying achievement first.
// - Invariant: every ASCENDED entry outranks every MYTHIC entry.
//   (1000-multiplier on tier_index dominates the ≤50*chain_count contribution.)

import type { CrackedResultV1, Family, Tier } from "./types";

export const OLYMPUS_THRESHOLD: Tier[] = ["MYTHIC", "ASCENDED"];
export const OLYMPUS_CAPACITY = 100;

export function isOlympusEligible(tier: Tier): boolean {
  return OLYMPUS_THRESHOLD.includes(tier);
}

export function tierIndex(tier: Tier): number {
  // Only defined for MYTHIC and ASCENDED. S-and-below cannot enter.
  if (tier === "ASCENDED") return 2;
  if (tier === "MYTHIC") return 1;
  return -1;
}

export interface OlympusEntryInputs {
  tier: Tier; // MYTHIC or ASCENDED
  chainCount: number; // active chains in primary family
  cohortPercentile: number; // 0-100
  timestampSeconds: number; // unix seconds; newer wins ties
}

/**
 * Compute the composite Olympus score with timestamp baked in so that
 * Redis sorted set ranking handles tiebreaking automatically.
 *
 * Recency tiebreaker: newer entries get a slight score bump within the
 * same tier+chain+percentile bracket. We encode it as a small fractional
 * adjustment that can't push a MYTHIC over an ASCENDED.
 */
export function computeOlympusScore(input: OlympusEntryInputs): number {
  if (!isOlympusEligible(input.tier)) {
    throw new Error(
      `Tier ${input.tier} is not Olympus-eligible (MYTHIC+ only).`
    );
  }
  const baseScore =
    tierIndex(input.tier) * 1000 +
    Math.min(15, input.chainCount) * 50 + // cap chain contribution at 15
    Math.max(0, Math.min(100, input.cohortPercentile));

  // Recency adjustment: 0-0.999 range based on timestamp. Newer = higher.
  // Keeps the integer part exactly the documented formula; only fractional
  // part shifts. Two users with identical baseScore: newer is greater.
  const recencyAdjustment = (input.timestampSeconds % 100000) / 100000;
  return baseScore + recencyAdjustment;
}

// =============================================================================
// KV STORAGE SCHEMA - Redis sorted set keyed by olympus_score.
// =============================================================================
//
//   ZADD  olympus:zset  <olympus_score>  <user_id>
//   ZREVRANGE olympus:zset 0 99 WITHSCORES   → top-100 user_ids + scores
//
// User detail lives at `olympus:user:<user_id>` as JSON:
//   { tier, family, chain_count, cohort, cohort_percentile, masked_name, when }
//
// The combined read for the leaderboard is:
//   1. ZREVRANGE → top-100 user_ids
//   2. MGET olympus:user:<id> ...  → 1 batched read for detail
//
// This is O(log N + 100) total regardless of total user count.

export const KV_KEYS = {
  zset: "olympus:zset",
  user: (id: string) => `olympus:user:${id}`,
} as const;

export interface OlympusUserRecord {
  id: string;
  tier: Tier;
  primaryFamily: Family;
  chainCount: number;
  cohort: string; // LeagueKey
  cohortPercentile: number;
  /** Masked display name - initials only, e.g. "A.S." */
  maskedName: string;
  /** Headline chain name for display (if any). */
  headlineChain?: string;
  /** ISO timestamp when this entry was recorded. */
  when: string;
}

export interface OlympusEntry extends OlympusUserRecord {
  rank: number;
  score: number;
}

/**
 * Compute the masked display name (initials + last name initial).
 * "Aditya Singh" → "A.S.", "Mary Jane Watson" → "M.W."
 */
export function maskName(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => /^[A-Za-z]/.test(p));
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0][0].toUpperCase() + ".";
  const first = parts[0][0].toUpperCase();
  const last = parts[parts.length - 1][0].toUpperCase();
  return `${first}.${last}.`;
}

/**
 * Build an OlympusUserRecord from a CrackedResultV1.
 * Returns null if the result isn't Olympus-eligible.
 */
export function buildOlympusRecord(
  result: CrackedResultV1
): OlympusUserRecord | null {
  if (!isOlympusEligible(result.tier)) return null;
  if (!result.primaryFamily) return null;
  if (!result.league) return null;

  const primaryFam = result.families?.find((f) => f.family === result.primaryFamily);
  const chainCount = primaryFam?.activeChains.length ?? 0;

  return {
    id: result.id,
    tier: result.tier,
    primaryFamily: result.primaryFamily,
    chainCount,
    cohort: result.league.league,
    cohortPercentile: result.percentiles?.withinFamilyCohort ?? 50,
    maskedName: maskName(result.name),
    when: result.createdAt,
  };
}
