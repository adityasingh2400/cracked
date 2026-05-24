import type { Achievement, Tier, TierStars } from "./types";
import { supportsTierCrowns } from "./types";

/** B-tier milestones that equal one A crown when stacked. */
export const B_PER_A_CROWN = 4;
/** A-tier milestones that equal one S crown when stacked. */
export const A_PER_S_CROWN = 4;

function countMatchedByTier(matched: Achievement[]): Record<"B" | "A" | "S", number> {
  let b = 0;
  let a = 0;
  let s = 0;
  for (const achievement of matched) {
    if (achievement.tier === "B") b += 1;
    else if (achievement.tier === "A") a += 1;
    else if (achievement.tier === "S") s += 1;
  }
  return { B: b, A: a, S: s };
}

/**
 * Crown math for A/S tiers:
 * - At A: each crown = 1 matched A achievement OR 4 matched B achievements.
 * - At S: each crown = 1 matched S achievement OR 4 matched A achievements.
 *
 * Examples at S: 3 S → S3; 1 S + 8 A → S3; 12 A (no S) → S3 if tier is S via chain bump.
 */
export function computeTierCrowns(finalTier: Tier, matched: Achievement[]): TierStars | undefined {
  if (!supportsTierCrowns(finalTier)) return undefined;

  const { B, A, S } = countMatchedByTier(matched);
  const points =
    finalTier === "A" ? A + Math.floor(B / B_PER_A_CROWN) : S + Math.floor(A / A_PER_S_CROWN);

  return Math.min(3, Math.max(1, points)) as TierStars;
}
