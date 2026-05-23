import { FAMILY_LIBRARY } from "@/data/achievements";
import { FAMILIES_META } from "@/data/families";
import type {
  CrackedResultV1,
  ExtractedSignals,
  Family,
  FamilyScore,
  LeagueKey,
  PercentileTrio,
  Tier,
  TierStars,
} from "@/lib/types";
import { isSpecialTier } from "@/lib/types";
import { scoreAllFamilies } from "@/lib/chain-detector";
import { placeInLeague } from "@/lib/leagues";
import { buildSyntheticCell, computePercentileTrio } from "@/lib/percentile";

export interface BuildCrackedResultInput {
  id: string;
  name: string;
  signals: ExtractedSignals;
  verdict?: string;
  flavor?: string;
  modelUsed: "claude" | "regex-fallback";
  userAge?: number;
  inferredAge?: number;
  inferredConfidence?: number;
  speciality?: string;
  photoUrl?: string;
  scoringTier?: "mac-claude" | "anthropic-api" | "regex-fallback";
  calibrating?: boolean;
}

export function buildCrackedResult(input: BuildCrackedResultInput): CrackedResultV1 {
  const { age, ageSource, ageConfidence } = resolveAge(input);
  const allFamilies = scoreAllFamilies({
    signals: input.signals,
    age,
    library: FAMILY_LIBRARY,
  });

  const primary = allFamilies.families.find(
    (f) => f.family === allFamilies.primaryFamily
  )!;
  const tier = primary.finalTier;
  const tierStars = isSpecialTier(tier) ? undefined : primary.tierStars ?? 1;
  const signalScore = signalScoreForTier(tier, tierStars, primary);
  const cohort: LeagueKey = age ? leagueForAgeOnly(age) : "pro";

  const rawPercentiles = computePercentileTrio({
    internalScore: signalScore,
    primaryFamily: allFamilies.primaryFamily,
    cohort,
    cellLookup: (family, ck) => buildSyntheticCell(family, ck, midpointBaseline(ck)),
    globalDistribution: buildSyntheticCell(
      allFamilies.primaryFamily,
      cohort,
      midpointBaseline(cohort)
    ),
  });
  const percentiles = anchorPercentileToTier(tier, tierStars, rawPercentiles);

  const league = age
    ? placeInLeague({
        tier,
        tierStars,
        age,
        ageSource,
        ageConfidence,
      })
    : undefined;

  const chainsAll = allFamilies.families.flatMap((fs) =>
    fs.activeChains
      .map((chainId) => FAMILY_LIBRARY.chains.find((c) => c.id === chainId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        id: c.id,
        name: c.name,
        family: c.family,
        bumpTo: c.bumpTo,
        description: c.description,
      }))
  );

  const achievementsAll = allFamilies.families.flatMap((fs) =>
    fs.matched
      .map((aId) => FAMILY_LIBRARY.achievements.find((a) => a.id === aId))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({
        id: a.id,
        label: a.label,
        family: a.family,
        tier: a.tier,
      }))
  );

  return {
    id: input.id,
    name: input.name,
    tier,
    tierStars,
    signalScore,
    league,
    families: allFamilies.families,
    primaryFamily: allFamilies.primaryFamily,
    secondaryFamily: allFamilies.secondaryFamily,
    percentiles,
    verdict: input.verdict || tierVerdict(tier, tierStars, input.name, allFamilies.primaryFamily, allFamilies.families),
    flavor: input.flavor || tierFlavor(tier, tierStars),
    modelUsed: input.modelUsed,
    createdAt: new Date().toISOString(),
    scoringTier: input.scoringTier,
    calibrating: input.calibrating,
    speciality: input.speciality,
    photoUrl: input.photoUrl,
    chainsAll,
    achievementsAll,
  };
}

function resolveAge(input: BuildCrackedResultInput): {
  age?: number;
  ageSource: "user" | "inferred";
  ageConfidence?: number;
} {
  if (input.userAge && input.userAge >= 8 && input.userAge <= 100) {
    return { age: Math.round(input.userAge), ageSource: "user", ageConfidence: 1 };
  }
  if (input.inferredAge && input.inferredAge > 0) {
    return {
      age: Math.round(input.inferredAge),
      ageSource: "inferred",
      ageConfidence: input.inferredConfidence,
    };
  }
  return { ageSource: "inferred" };
}

export function signalScoreForTier(
  tier: Tier,
  stars: TierStars | undefined,
  familyScore?: FamilyScore
): number {
  if (tier === "ASCENDED") return 100;
  if (tier === "MYTHIC") return 97;

  const base: Record<Exclude<Tier, "ASCENDED" | "MYTHIC">, number> = {
    D: 10,
    C: 40,
    B: 60,
    A: 75,
    S: 90,
  };
  const starStep: Record<Exclude<Tier, "ASCENDED" | "MYTHIC">, number> = {
    D: 10,
    C: 7,
    B: 5,
    A: 5,
    S: 3,
  };
  const starScore = base[tier] + ((stars ?? 1) - 1) * starStep[tier];
  const depthBonus = Math.min(
    2,
    ((familyScore?.matched.length ?? 0) + (familyScore?.activeChains.length ?? 0)) * 0.25
  );
  return Math.min(95, Math.round((starScore + depthBonus) * 10) / 10);
}

const TIER_RARITY_PCT: Record<Tier, { primary: number; cross: number; global: number }> = {
  ASCENDED: { primary: 99.999, cross: 99.99, global: 99.999 },
  MYTHIC: { primary: 99.9, cross: 99.5, global: 99.7 },
  S: { primary: 99, cross: 97, global: 98 },
  A: { primary: 95, cross: 90, global: 93 },
  B: { primary: 85, cross: 75, global: 80 },
  C: { primary: 65, cross: 55, global: 60 },
  D: { primary: 30, cross: 25, global: 28 },
};

function starBump(stars?: TierStars): number {
  return stars === 3 ? 2 : stars === 2 ? 1 : 0;
}

export function anchorPercentileToTier(
  tier: Tier,
  stars: TierStars | undefined,
  raw: PercentileTrio
): PercentileTrio {
  const target = TIER_RARITY_PCT[tier];
  const bump = isSpecialTier(tier) ? 0 : starBump(stars);
  return {
    withinFamilyCohort: Math.max(raw.withinFamilyCohort, Math.min(99.5, target.primary + bump)),
    crossFamilyCohort: Math.max(raw.crossFamilyCohort, Math.min(99, target.cross + bump)),
    global: Math.max(raw.global, Math.min(99.5, target.global + bump)),
  };
}

function tierVerdict(
  tier: Tier,
  stars: TierStars | undefined,
  name: string,
  family: Family,
  families: FamilyScore[]
): string {
  const first = name.split(/\s+/)[0] || "this one";
  const familyName = FAMILIES_META[family]?.name ?? "their field";
  const chainCount = families.find((f) => f.family === family)?.activeChains.length ?? 0;
  const chainNote = chainCount > 0 ? ` Chains unlocked: ${chainCount}.` : "";
  const label = isSpecialTier(tier) ? tier : `${tier}${stars ?? 1}`;

  switch (tier) {
    case "ASCENDED":
      return `${first} is ASCENDED in ${familyName}. The 0.001%. Lifetime-defining trajectory.${chainNote}`;
    case "MYTHIC":
      return `${first} is MYTHIC in ${familyName}. The 0.1%. Career-defining dossier.${chainNote}`;
    case "S":
      return `${first} hit ${label} in ${familyName}. The top shelf before MYTHIC. Obviously cracked.${chainNote}`;
    case "A":
      return `${first} is ${label} in ${familyName}. Recognizable institutional stack, with room to compound.`;
    case "B":
      return `${first} is ${label} in ${familyName}. Real signal, real trajectory, not finished yet.`;
    case "C":
      return `${first} is ${label} in ${familyName}. The foundation is visible; leverage is the next unlock.`;
    default:
      return `${first} is ${label} in ${familyName}. Early signal, still gathering receipts.`;
  }
}

function tierFlavor(tier: Tier, stars?: TierStars): string {
  if (tier === "ASCENDED") return "Once a decade. Built different.";
  if (tier === "MYTHIC") return "The ceiling for most people. The floor for them.";
  if (tier === "S") return stars === 3 ? "One clean push from myth." : "Quietly accumulating leverage.";
  if (tier === "A") return stars === 3 ? "On the verge." : "Compounding.";
  if (tier === "B") return "Climbing.";
  if (tier === "C") return "The arc is just beginning.";
  return "Day one is the best day to start.";
}

function midpointBaseline(cohort: LeagueKey): number {
  const m: Record<LeagueKey, number> = {
    rookie: 18,
    prospect: 26,
    apprentice: 38,
    pro: 50,
    veteran: 62,
    legend: 70,
  };
  return m[cohort];
}

function leagueForAgeOnly(age: number): LeagueKey {
  if (age <= 16) return "rookie";
  if (age <= 19) return "prospect";
  if (age <= 22) return "apprentice";
  if (age <= 26) return "pro";
  if (age <= 32) return "veteran";
  return "legend";
}
