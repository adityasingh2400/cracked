// Chain detection - the v1.0 scoring engine layered above the v0.7 rubric.
// Per /plan-eng-review Chain Detection Algorithm section:
//
// For a user with extracted signals S and family F:
//   1. matched[F] = { all achievements A where A.family === F and A.signals
//                     fully match against S, respecting any ageCap }
//   2. baseTier[F] = max-tier of matched[F]   (D if empty)
//   3. activeChains[F] = { all chains C where C.family === F
//                          AND every id in C.requires appears in matched[F] }
//   4. chainTier[F] = max(C.bumpTo for C in activeChains[F])  (D if empty)
//   5. finalTier[F] = max(baseTier[F], chainTier[F])
//
// Per-family ordering on Tier: D < C < B < A < S < MYTHIC < ASCENDED.

import type {
  Achievement,
  Chain,
  ExtractedSignals,
  Family,
  FamilyScore,
  SignalMatcher,
  Tier,
  TierStars,
} from "./types";
import { ALL_FAMILIES, TIER_RANK, isSpecialTier, maxTier } from "./types";

// =============================================================================
// MATCH ONE ACHIEVEMENT AGAINST EXTRACTED SIGNALS.
// =============================================================================

export function matchSignal(
  matcher: SignalMatcher,
  signals: ExtractedSignals
): boolean {
  switch (matcher.kind) {
    case "school":
      return signals.schools.some((s) => {
        const nameHit =
          matcher.match.some((m) =>
            s.name.toLowerCase().includes(m.toLowerCase())
          ) ||
          (matcher.regex?.some((r) => r.test(s.name)) ?? false);
        return nameHit;
      });

    case "company":
      return signals.companies.some((c) => {
        const nameHit = matcher.match.some((m) =>
          c.name.toLowerCase().includes(m.toLowerCase())
        );
        if (!nameHit) return false;
        if (matcher.title && matcher.title.length > 0) {
          if (!c.title) return false;
          return matcher.title.some((t) =>
            c.title!.toLowerCase().includes(t.toLowerCase())
          );
        }
        return true;
      });

    case "award":
      return signals.awards.some((a) => {
        const nameHit =
          matcher.match.some((m) =>
            a.name.toLowerCase().includes(m.toLowerCase())
          ) ||
          (matcher.regex?.some((r) => r.test(a.name)) ?? false);
        return nameHit;
      });

    case "publication":
      return signals.publications.some((p) => {
        const venueHit = matcher.venue.some((v) =>
          p.venue.toLowerCase().includes(v.toLowerCase())
        );
        if (!venueHit) return false;
        if (matcher.role) {
          return p.role === matcher.role;
        }
        return true;
      });

    case "funding":
      return signals.funding.some((f) => {
        const roundHit = matcher.round
          ? (f.round?.toLowerCase().includes(matcher.round.toLowerCase()) ?? false)
          : true;
        const amountHit =
          matcher.minAmount === undefined ||
          (f.amount !== undefined && f.amount >= matcher.minAmount);
        return roundHit && amountHit;
      });

    case "online":
      return signals.online.some((o) => {
        const platformHit = matcher.platform
          ? o.platform.toLowerCase().includes(matcher.platform.toLowerCase())
          : true;
        const followersHit =
          matcher.minFollowers === undefined ||
          (o.followers !== undefined && o.followers >= matcher.minFollowers);
        return platformHit && followersHit;
      });

    case "open_source":
      return signals.open_source.some((o) => {
        const projectHit = matcher.project
          ? matcher.project.some((p) =>
              o.project.toLowerCase().includes(p.toLowerCase())
            )
          : true;
        const metricHit =
          matcher.minMetric === undefined ||
          (o.metric !== undefined && o.metric >= matcher.minMetric);
        return projectHit && metricHit;
      });

    case "free_text":
      return matcher.patterns.some((re) => re.test(signals.raw_text));
  }
}

/**
 * Achievement matches if ALL its SignalMatcher entries hit AND the user's
 * age is under the achievement's ageCap (if any).
 */
export function achievementMatches(
  achievement: Achievement,
  signals: ExtractedSignals,
  age?: number
): boolean {
  // Age cap check - some achievements only count under a certain age (e.g. Thiel ≤22).
  if (achievement.ageCap !== undefined && age !== undefined && age > 0) {
    if (age > achievement.ageCap) return false;
  }
  // ALL matchers must hit.
  return achievement.signals.every((m) => matchSignal(m, signals));
}

// =============================================================================
// CHAIN DETECTION - per family.
// =============================================================================

export function detectChainsForFamily(
  matched: Set<string>,
  chains: Chain[]
): { activeChains: string[]; chainTier: Tier } {
  const active: string[] = [];
  const bumps: Tier[] = [];

  for (const chain of chains) {
    // Every required achievement ID must be in the matched set.
    // Stale chain.requires IDs (achievement no longer exists) silently skip
    // because they can't appear in `matched`.
    const allHit = chain.requires.every((id) => matched.has(id));
    if (allHit && chain.requires.length > 0) {
      active.push(chain.id);
      bumps.push(chain.bumpTo);
    }
  }

  return {
    activeChains: active,
    chainTier: bumps.length > 0 ? maxTier(...bumps) : "D",
  };
}

// =============================================================================
// FULL PER-FAMILY SCORING.
// =============================================================================

export interface FamilyLibrary {
  achievements: Achievement[];
  chains: Chain[];
}

export interface ScoreFamilyInputs {
  signals: ExtractedSignals;
  age?: number;
  library: FamilyLibrary;
  family: Family;
  /**
   * Optional set of Achievement IDs matched across ALL families. When a chain
   * references an Achievement from a different family (e.g. `founder_sand_hill`
   * requires `eng_stanford`), the lookup must include cross-family matches.
   * When omitted, only this family's own matches are considered (legacy mode).
   */
  globalMatchedIds?: Set<string>;
}

export function scoreFamily(input: ScoreFamilyInputs): FamilyScore {
  const { signals, age, library, family } = input;

  // 1. Match each Achievement in THIS family.
  const matchedIds: string[] = [];
  let baseTier: Tier = "D";
  for (const a of library.achievements) {
    if (a.family !== family) continue;
    if (achievementMatches(a, signals, age)) {
      matchedIds.push(a.id);
      baseTier = maxTier(baseTier, a.tier);
    }
  }

  // 2. Detect chains. Chain.requires can reference Achievements from other
  // families - use globalMatchedIds if provided, otherwise fall back to this
  // family's own matches.
  const familyChains = library.chains.filter((c) => c.family === family);
  const requiresLookup =
    input.globalMatchedIds ?? new Set(matchedIds);
  const { activeChains, chainTier } = detectChainsForFamily(
    requiresLookup,
    familyChains
  );

  // 3. Final tier = max of base and chain.
  const finalTier = maxTier(baseTier, chainTier);
  const tierStars = crownsForFamilyTier({
    finalTier,
    matchedIds,
    activeChains,
    library,
  });

  return {
    family,
    baseTier,
    chainTier,
    finalTier,
    tierStars,
    matched: matchedIds,
    activeChains,
  };
}

function crownsForFamilyTier(input: {
  finalTier: Tier;
  matchedIds: string[];
  activeChains: string[];
  library: FamilyLibrary;
}): TierStars | undefined {
  const { finalTier, matchedIds, activeChains, library } = input;
  if (isSpecialTier(finalTier) || (finalTier !== "A" && finalTier !== "S")) return undefined;

  const matched = matchedIds
    .map((id) => library.achievements.find((a) => a.id === id))
    .filter((a): a is Achievement => Boolean(a));
  const sameTierCount = matched.filter((a) => a.tier === finalTier).length;
  const higherStandardCount = matched.filter(
    (a) => !isSpecialTier(a.tier) && TIER_RANK[a.tier] > TIER_RANK[finalTier]
  ).length;
  const chainCount = activeChains.length;

  const strength = Math.max(1, sameTierCount + higherStandardCount + chainCount);
  return Math.min(3, strength) as TierStars;
}

// =============================================================================
// SCORE ACROSS ALL 9 FAMILIES.
// =============================================================================

export interface AllFamiliesInputs {
  signals: ExtractedSignals;
  age?: number;
  /** Library covers all families - chain detector filters per family. */
  library: FamilyLibrary;
}

export interface AllFamiliesResult {
  /** All 9 family scores. */
  families: FamilyScore[];
  /** The strongest family (highest final tier). */
  primaryFamily: Family;
  /** Runner-up, shown as a secondary badge if user is strong in 2+. */
  secondaryFamily?: Family;
}

export function scoreAllFamilies(input: AllFamiliesInputs): AllFamiliesResult {
  const { signals, age, library } = input;

  // First pass: compute matched IDs across ALL families (no chain detection yet)
  // so cross-family chain references work.
  const globalMatchedIds = new Set<string>();
  for (const a of library.achievements) {
    if (achievementMatches(a, signals, age)) {
      globalMatchedIds.add(a.id);
    }
  }

  // Second pass: per-family scoring with chain detection against the global set.
  const families: FamilyScore[] = ALL_FAMILIES.map((f) =>
    scoreFamily({ signals, age, library, family: f, globalMatchedIds })
  );

  // Sort by finalTier descending, then by matched-count, then by activeChains-count.
  const sorted = [...families].sort((a, b) => {
    const ta = tierToNum(a.finalTier);
    const tb = tierToNum(b.finalTier);
    if (tb !== ta) return tb - ta;
    if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
    return b.activeChains.length - a.activeChains.length;
  });

  const primaryFamily = sorted[0].family;
  const secondaryFamily =
    sorted[1] && sorted[1].finalTier !== "D" && sorted[1].matched.length > 0
      ? sorted[1].family
      : undefined;

  return { families, primaryFamily, secondaryFamily };
}

function tierToNum(t: Tier): number {
  const m: Record<Tier, number> = {
    D: 0, C: 1, B: 2, A: 3, S: 4, MYTHIC: 5, ASCENDED: 6,
  };
  return m[t];
}
