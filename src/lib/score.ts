// Scoring engine: takes extracted signals → produces a CrackedResult.
// Pure functions, no IO. Deterministic given the same input.

import { RUBRIC, TIER_POINTS, matchEntry, tierFromTotal } from "./tier-list";
import { matchArchetype } from "./match";
import { placeInLeague } from "./leagues";
import type {
  CategoryKey,
  CategoryScore,
  CrackedResult,
  ExtractedSignal,
  LeaguePlacement,
  ScoredSignal,
  SubStats,
  Tier,
} from "./types";

const tierRank: Record<Tier, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };

export interface ScoreInput {
  id: string;
  name: string;
  signals: ExtractedSignal[];
  verdict: string;
  flavor: string;
  modelUsed: "claude" | "regex-fallback";
  /** When known, used to place the result in an age-relative league. */
  age?: number;
  ageSource?: "user" | "inferred";
  ageConfidence?: number;
}

export function scoreSignals(args: ScoreInput): CrackedResult {
  const { id, name, signals, verdict, flavor, modelUsed, age, ageSource, ageConfidence } = args;

  const categories: CategoryScore[] = RUBRIC.map((rubric) => {
    // Score every signal in this category
    const inCat = signals.filter((s) => s.category === rubric.key);
    const scored: ScoredSignal[] = inCat.map((s) => {
      const m = matchEntry(`${s.raw} ${s.detail ?? ""}`.trim(), rubric);
      return {
        ...s,
        tier: m.tier,
        points: TIER_POINTS[m.tier],
        matched: m.label,
      };
    });

    // Sort descending by points, then by tier rank
    scored.sort((a, b) => (b.points - a.points) || (tierRank[b.tier] - tierRank[a.tier]));

    // Apply aggregation weights to top-N
    const { topN, weights } = rubric.aggregate;
    let raw = 0;
    for (let i = 0; i < Math.min(topN, scored.length); i++) {
      raw += scored[i].points * (weights[i] ?? 0);
    }

    // Scale: rubric.cap is the category cap. Max possible raw =
    // sum(weights) * S(10) = sum(w) * 10. Scale to cap.
    const maxRaw = weights.reduce((a, b) => a + b, 0) * TIER_POINTS.S;
    const credited = maxRaw === 0 ? 0 : Math.min(rubric.cap, (raw / maxRaw) * rubric.cap);

    const topTier = scored[0]?.tier ?? "D";

    return {
      key: rubric.key as CategoryKey,
      label: rubric.label,
      raw: round1(raw),
      credited: round1(credited),
      cap: rubric.cap,
      topTier,
      signals: scored,
    };
  });

  const total = Math.round(categories.reduce((sum, c) => sum + c.credited, 0));
  const tier = tierFromTotal(total);
  const subStats = computeSubStats(categories);
  const match = matchArchetype({ total, tier, subStats });

  // Age-relative placement — omitted only when age inference returned nothing
  // usable (0 confidence on a sparse resume). The card handles that case.
  let league: LeaguePlacement | undefined;
  if (typeof age === "number" && age > 0 && age < 120) {
    league = placeInLeague({
      total,
      age,
      ageSource: ageSource ?? "inferred",
      ageConfidence,
    });
  }

  return {
    id,
    name,
    total,
    tier,
    league,
    subStats,
    categories,
    verdict: verdict || defaultVerdict(total, tier, name),
    flavor: flavor || defaultFlavor(tier),
    matchedArchetype: match.archetype.slug,
    archetypeMatchScore: match.score,
    createdAt: new Date().toISOString(),
    modelUsed,
  };
}

/**
 * Map category scores → HACK / GRIND / TASTE / RIZZ (each 0-99).
 * These are vibes, not science. They make the card pop.
 */
function computeSubStats(cats: CategoryScore[]): SubStats {
  const byKey = Object.fromEntries(cats.map((c) => [c.key, c]));
  const pct = (key: CategoryKey) => {
    const c = byKey[key];
    if (!c) return 0;
    return c.cap === 0 ? 0 : (c.credited / c.cap) * 100;
  };

  // HACK = technical chops: education + open source + technical accolades
  const hack = clamp(
    (pct("education") * 0.4 + pct("openSource") * 0.4 + pct("accolades") * 0.2)
  );

  // GRIND = sustained output: stacked signals across categories (count > 3 in any cat = grind)
  const totalSignals = cats.reduce((sum, c) => sum + c.signals.length, 0);
  const stackedCats = cats.filter((c) => c.signals.length >= 2).length;
  const grind = clamp(
    (pct("work") * 0.5 + pct("openSource") * 0.2 + Math.min(40, totalSignals * 3) + stackedCats * 4)
  );

  // TASTE = quality of top-tier choices (S/A in any category)
  const sCount = cats.filter((c) => c.topTier === "S").length;
  const aCount = cats.filter((c) => c.topTier === "A").length;
  const taste = clamp(
    (pct("work") * 0.3 + pct("education") * 0.3 + pct("accolades") * 0.2 + sCount * 12 + aCount * 6)
  );

  // RIZZ = social/founder/online presence
  const rizz = clamp(
    (pct("founder") * 0.6 + pct("signal") * 0.4)
  );

  return {
    hack: Math.round(hack),
    grind: Math.round(grind),
    taste: Math.round(taste),
    rizz: Math.round(rizz),
  };
}

function clamp(n: number, max = 99): number {
  return Math.max(0, Math.min(max, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function defaultVerdict(total: number, tier: Tier, name: string): string {
  const firstName = name.split(/\s+/)[0] || "this one";
  if (tier === "S") return `${firstName} is the kind of person you mention in a pitch deck. Top 1%. Quietly dangerous.`;
  if (tier === "A") return `${firstName} is the real deal — multiple S-tier signals stacked. Recruit immediately.`;
  if (tier === "B") return `${firstName} is strong. The kind of resume that gets interviews everywhere. Top 10%.`;
  if (tier === "C") return `${firstName} has potential. A few sharp signals but room to compound. Watch this space.`;
  return `${firstName} is early. The signals haven't shown up yet. Time to ship something.`;
}

function defaultFlavor(tier: Tier): string {
  if (tier === "S") return "Compiled in basements. Shipped at dawn.";
  if (tier === "A") return "Quietly accumulating leverage.";
  if (tier === "B") return "On the verge.";
  if (tier === "C") return "The arc is just beginning.";
  return "Day one is the best day to start.";
}
