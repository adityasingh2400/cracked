// Sample CrackedResultV1 payloads for dex tier showcases — one holo card per tier
// per family, populated from real achievement library data.

import type { FamilyMeta } from "@/data/families";
import { FAMILIES_ORDERED } from "@/data/families";
import type { DexAchievementView, DexChainView } from "@/lib/dex-views";
import type { CrackedResultV1, Family, Tier, TierStars } from "@/lib/types";
import { formatTier, supportsTierCrowns } from "@/lib/types";

const TIER_PERCENTILE: Record<Tier, number> = {
  ASCENDED: 99.99,
  MYTHIC: 99.85,
  S: 99.0,
  A: 93.0,
  B: 80.0,
  C: 60.0,
  D: 25.0,
};

const TIER_VERDICT: Record<Tier, (family: string) => string> = {
  ASCENDED: (f) => `ASCENDED in ${f}. The 0.001%. Lifetime-defining trajectory.`,
  MYTHIC: (f) => `MYTHIC in ${f}. The 0.1%. Career-defining dossier.`,
  S: (f) => `S-tier in ${f}. Top 1%. Obviously cracked.`,
  A: (f) => `A-tier in ${f}. Top 5–10%. Recognized institutional signal.`,
  B: (f) => `B-tier in ${f}. Real trajectory, compounding upward.`,
  C: (f) => `C-tier in ${f}. Foundation visible. Believer arc.`,
  D: (f) => `D-tier in ${f}. Day one. Signals gathering.`,
};

const TIER_FLAVOR: Record<Tier, string> = {
  ASCENDED: "Once a decade. Built different.",
  MYTHIC: "The ceiling for most. The floor for them.",
  S: "One clean push from myth.",
  A: "Compounding. Quietly.",
  B: "Climbing the ladder.",
  C: "The arc is beginning.",
  D: "Day one is the best day to start.",
};

function tierStarsFor(tier: Tier): TierStars | undefined {
  if (tier === "S") return 3;
  if (tier === "A") return 2;
  return undefined;
}

export function buildDexSampleResult(
  meta: FamilyMeta,
  tier: Tier,
  achievements: DexAchievementView[],
  chains: DexChainView[]
): CrackedResultV1 {
  const flagship = achievements[0];
  const name = flagship?.evidence?.[0] ?? `${meta.name.split(" ")[0]} Exemplar`;
  const speciality = flagship?.label ?? meta.motto;
  const tierStars = tierStarsFor(tier);
  const pct = TIER_PERCENTILE[tier];
  const matchedIds = achievements.slice(0, 8).map((a) => a.id);
  const activeChainIds = chains.slice(0, 4).map((c) => c.id);

  return {
    id: `dex-${meta.key}-${tier}`,
    name,
    tier,
    tierStars,
    signalScore: pct,
    league: {
      league: "pro",
      leagueLabel: "23-26",
      leagueTier: tier,
      leagueTierStars: supportsTierCrowns(tier) ? tierStars : undefined,
      percentile: Math.round(pct),
      age: 26,
      ageSource: "inferred",
      ageConfidence: 0.7,
    },
    verdict: TIER_VERDICT[tier](meta.name),
    flavor: TIER_FLAVOR[tier],
    createdAt: new Date().toISOString(),
    modelUsed: "claude",
    primaryFamily: meta.key,
    families: FAMILIES_ORDERED.map((f) => ({
      family: f,
      baseTier: f === meta.key ? tier : tier === "D" ? "D" : "C",
      chainTier: f === meta.key ? tier : "D",
      finalTier: f === meta.key ? tier : tier === "D" ? "D" : "C",
      tierStars: f === meta.key ? tierStars : undefined,
      matched: f === meta.key ? matchedIds : [],
      activeChains: f === meta.key ? activeChainIds : [],
    })),
    percentiles: {
      withinFamilyCohort: pct,
      crossFamilyCohort: Math.max(0, pct - 2),
      global: Math.max(0, pct - 4),
    },
    speciality,
    scoringTier: "anthropic-api",
    bestAccolades: achievements.slice(0, 4).map((a) => ({
      title: a.label,
      detail: a.signals[0],
      family: meta.key,
    })),
    chainsAll: chains.map((c) => ({
      id: c.id,
      name: c.name,
      family: meta.key,
      bumpTo: c.bumpTo,
      description: c.description,
    })),
    achievementsAll: achievements.slice(0, 18).map((a) => ({
      id: a.id,
      label: a.label,
      family: meta.key,
      tier: a.tier,
    })),
  };
}

export function buildDexSampleResults(
  meta: FamilyMeta,
  achievementsByTier: Record<Tier, DexAchievementView[]>,
  chainsByTier: Record<Tier, DexChainView[]>
): Partial<Record<Tier, CrackedResultV1>> {
  const out: Partial<Record<Tier, CrackedResultV1>> = {};
  for (const tier of Object.keys(achievementsByTier) as Tier[]) {
    const achievements = achievementsByTier[tier];
    if (achievements.length === 0) continue;
    out[tier] = buildDexSampleResult(meta, tier, achievements, chainsByTier[tier] ?? []);
  }
  return out;
}

export function formatDexTierLabel(tier: Tier, stars?: TierStars): string {
  return formatTier(tier, stars);
}
