// MissingAchievements - the retention-loop panel shown on the result page.
// "You're A in Engineering. Three things you could add to hit S: ..."
//
// Per /plan-eng-review Section 0 step 12 + Week 3 deliverable: shows 3 next-tier
// Achievements the user doesn't have, sorted by attainability (younger ageCaps
// and lower-tier-threshold achievements first).

import clsx from "clsx";
import type { Achievement, Family, Tier } from "@/lib/types";
import { TIER_RANK } from "@/lib/types";

interface MissingAchievementsProps {
  /** All Achievements available in the user's primary family. */
  familyAchievements: Achievement[];
  /** Achievement IDs the user already has. */
  matchedIds: Set<string>;
  /** User's current finalTier in this family. */
  currentTier: Tier;
  /** Used for ageCap filtering (don't show achievements they've aged out of). */
  age?: number;
  family: Family;
  className?: string;
}

const NEXT_TIER: Record<Tier, Tier | null> = {
  D: "C",
  C: "B",
  B: "A",
  A: "S",
  S: "MYTHIC",
  MYTHIC: "ASCENDED",
  ASCENDED: null, // already at the top
};

export function MissingAchievements({
  familyAchievements,
  matchedIds,
  currentTier,
  age,
  family,
  className,
}: MissingAchievementsProps) {
  const nextTier = NEXT_TIER[currentTier];
  if (!nextTier) {
    return (
      <div className={clsx("font-mono text-xs text-white/55 italic", className)}>
        you've maxed the ladder in this family.
      </div>
    );
  }

  // Candidates: same-or-next-tier Achievements the user doesn't have AND can still earn.
  const candidates = familyAchievements
    .filter((a) => {
      if (a.family !== family) return false;
      if (matchedIds.has(a.id)) return false;
      if (TIER_RANK[a.tier] < TIER_RANK[nextTier]) return false;
      // Already aged out → drop.
      if (a.ageCap !== undefined && age !== undefined && age > a.ageCap) return false;
      return true;
    })
    // Sort by attainability: closer tier first, then by ageCap (younger = more attainable).
    .sort((a, b) => {
      const tierDiff = TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (tierDiff !== 0) return tierDiff;
      const aCap = a.ageCap ?? 99;
      const bCap = b.ageCap ?? 99;
      return bCap - aCap;
    })
    .slice(0, 3);

  if (candidates.length === 0) {
    return (
      <div className={clsx("font-mono text-xs text-white/55 italic", className)}>
        nothing close to {nextTier} in this family that you don't already have.
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/55">
        three to hit {nextTier}
      </div>
      <ul className="flex flex-col gap-1.5">
        {candidates.map((a) => (
          <li
            key={a.id}
            className="flex items-baseline gap-2 text-sm text-white/85"
            data-testid={`missing-${a.id}`}
          >
            <span className="font-mono text-[10px] text-amber-foil w-12 shrink-0">
              {a.tier}
            </span>
            <span>{a.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
