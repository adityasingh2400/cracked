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
import { isSpecialTier, normalizeTierCrowns, supportsTierCrowns, formatTier } from "@/lib/types";
import { scoreAllFamilies } from "@/lib/chain-detector";
import { placeInLeague } from "@/lib/leagues";
import { buildSyntheticCell, computePercentileTrio } from "@/lib/percentile";

const STANDARD_TIERS: Exclude<Tier, "ASCENDED" | "MYTHIC">[] = ["D", "C", "B", "A", "S"];

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
  bestAccolades?: Array<{
    title: string;
    detail?: string;
    family?: Family;
  }>;
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
  const scoredFamilies = applyEvidenceFloors(
    allFamilies.families,
    input.signals,
    age
  );

  const primary = pickPrimaryFamily(scoredFamilies);
  const tier = primary.finalTier;
  const tierStars = normalizeTierCrowns(tier, primary.tierStars);
  const signalScore = signalScoreForTier(tier, tierStars, primary);
  const cohort: LeagueKey = age ? leagueForAgeOnly(age) : "pro";

  const rawPercentiles = computePercentileTrio({
    internalScore: signalScore,
    primaryFamily: primary.family,
    cohort,
    cellLookup: (family, ck) => buildSyntheticCell(family, ck, midpointBaseline(ck)),
    globalDistribution: buildSyntheticCell(
      primary.family,
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

  const chainsAll = scoredFamilies.flatMap((fs) =>
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

  const achievementsAll = scoredFamilies.flatMap((fs) =>
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
    families: scoredFamilies,
    primaryFamily: primary.family,
    secondaryFamily: pickSecondaryFamily(scoredFamilies, primary.family),
    percentiles,
    verdict: input.verdict || tierVerdict(tier, tierStars, input.name, primary.family, scoredFamilies),
    flavor: input.flavor || tierFlavor(tier, tierStars),
    modelUsed: input.modelUsed,
    createdAt: new Date().toISOString(),
    scoringTier: input.scoringTier,
    calibrating: input.calibrating,
    speciality: input.speciality,
    bestAccolades: input.bestAccolades?.length
      ? input.bestAccolades
      : buildSignalAccolades(input.signals),
    photoUrl: input.photoUrl,
    chainsAll,
    achievementsAll,
  };
}

function applyEvidenceFloors(
  families: FamilyScore[],
  signals: ExtractedSignals,
  age?: number
): FamilyScore[] {
  const floors = evidenceFloors(signals, age);
  return families.map((family) => {
    const floor = floors[family.family];
    if (!floor) return family;

    const floorRank = tierRank(floor.tier);
    const currentRank = tierRank(family.finalTier);
    if (floorRank < currentRank) return family;

    const finalTier = floorRank > currentRank ? floor.tier : family.finalTier;
    const tierStars =
      isSpecialTier(finalTier) || !supportsTierCrowns(finalTier)
        ? undefined
        : floorRank > currentRank
          ? floor.stars
          : (Math.max(family.tierStars ?? 1, floor.stars ?? 1) as TierStars);

    return {
      ...family,
      finalTier,
      tierStars,
      matched: [...new Set([...family.matched, ...floor.matched])],
    };
  });
}

function evidenceFloors(
  signals: ExtractedSignals,
  age?: number
): Partial<Record<Family, { tier: Tier; stars?: TierStars; matched: string[] }>> {
  const text = [
    signals.raw_text,
    ...signals.awards.map((a) => a.name),
    ...signals.companies.map((c) => `${c.name} ${c.title ?? ""}`),
    ...signals.funding.map((f) => `${f.company} ${f.round ?? ""} ${f.amount ?? ""}`),
    ...signals.publications.map((p) => p.venue),
  ].join("\n");

  const founderSignals = [
    /\bco[- ]?founder\b|\bfounder\b|\bceo\b/i.test(text),
    /\bseed\b|\bpre[- ]?seed\b|\braised\b|\bfunding\b|\bventure[- ]?backed\b/i.test(text),
    /\b4x\b[^.\n]{0,50}\bhackathon\b|\bhackathon\b[^.\n]{0,50}\b4x\b|multiple[^.\n]{0,30}hackathon/i.test(text),
    /\bieee\b|\bpublication\b|\bpublished\b|\bresearch\b|\bpaper\b/i.test(text),
  ].filter(Boolean).length;

  const floors: Partial<Record<Family, { tier: Tier; stars?: TierStars; matched: string[] }>> = {};
  if (founderSignals >= 3 && age && age <= 19) {
    floors.founder = {
      tier: "S",
      stars: founderSignals >= 4 ? 3 : 2,
      matched: ["founder_young_signal_stack"],
    };
  } else if (founderSignals >= 3) {
    floors.founder = {
      tier: "S",
      stars: 1,
      matched: ["founder_signal_stack"],
    };
  }

  const hackathonWins = hackathonWinCount(text);
  if (hackathonWins >= 3 && age && age <= 19) {
    floors.engineering = {
      tier: "S",
      stars: 2,
      matched: ["eng_multi_hackathon_winner_young"],
    };
  }

  return floors;
}

function pickPrimaryFamily(families: FamilyScore[]): FamilyScore {
  return [...families].sort((a, b) => {
    const tierDelta = tierRank(b.finalTier) - tierRank(a.finalTier);
    if (tierDelta !== 0) return tierDelta;
    if ((b.tierStars ?? 0) !== (a.tierStars ?? 0)) return (b.tierStars ?? 0) - (a.tierStars ?? 0);
    if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
    return b.activeChains.length - a.activeChains.length;
  })[0];
}

function pickSecondaryFamily(
  families: FamilyScore[],
  primaryFamily: Family
): Family | undefined {
  const secondary = [...families]
    .filter((family) => family.family !== primaryFamily)
    .sort((a, b) => {
      const tierDelta = tierRank(b.finalTier) - tierRank(a.finalTier);
      if (tierDelta !== 0) return tierDelta;
      if ((b.tierStars ?? 0) !== (a.tierStars ?? 0)) return (b.tierStars ?? 0) - (a.tierStars ?? 0);
      return b.matched.length - a.matched.length;
    })[0];
  return secondary && secondary.finalTier !== "D" && secondary.matched.length > 0
    ? secondary.family
    : undefined;
}

function tierRank(tier: Tier): number {
  if (tier === "ASCENDED") return 6;
  if (tier === "MYTHIC") return 5;
  return STANDARD_TIERS.indexOf(tier);
}

function buildSignalAccolades(
  signals: ExtractedSignals
): Array<{ title: string; detail?: string; family?: Family }> {
  const items: Array<{ title: string; detail?: string; family?: Family }> = [];

  for (const award of signals.awards.slice(0, 2)) {
    items.push({ title: award.name, detail: award.year ? `Awarded in ${award.year}` : undefined, family: familyForAccolade(award.name) });
  }
  const hackathonWins = hackathonWinCount(signals.raw_text);
  if (hackathonWins >= 2) {
    items.unshift({
      title: hackathonWins >= 3 ? `${hackathonWins}x Hackathon Winner` : "Multiple Hackathon Winner",
      detail: "Repeated competitive build wins",
      family: "engineering",
    });
  }
  for (const company of signals.companies.slice(0, 2)) {
    const title = company.title ? `${company.name} ${company.title}` : company.name;
    items.push({ title, family: familyForAccolade(title) });
  }
  for (const school of signals.schools.slice(0, 2)) {
    items.push({
      title: school.degree ? `${school.name} ${school.degree}` : school.name,
      detail: school.gradYear ? `Class of ${school.gradYear}` : undefined,
      family: "science_academia",
    });
  }
  for (const pub of signals.publications.slice(0, 2)) {
    items.push({
      title: pub.role ? `${pub.venue} ${pub.role}-author` : `${pub.venue} publication`,
      detail: "Research publication signal",
      family: "science_academia",
    });
  }
  for (const funding of signals.funding.slice(0, 2)) {
    const round = funding.round ?? "Funding";
    items.push({
      title: `${funding.company} ${round}`,
      detail: funding.amount ? `$${compactNumber(funding.amount)} raised` : "Funding round",
      family: "founder",
    });
  }
  for (const oss of signals.open_source.slice(0, 2)) {
    items.push({
      title: oss.project,
      detail: oss.metric ? `${compactNumber(oss.metric)} GitHub stars/users` : "Open-source project",
      family: "engineering",
    });
  }

  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => ({
      ...item,
      title: item.title.slice(0, 42),
      detail: item.detail?.slice(0, 90),
    }))
    .slice(0, 6);
}

function hackathonWinCount(text: string): number {
  const matches = text.match(/\b(?:won|winner|winning|1st|first place|grand prize|champion)\b[^.\n]{0,80}\bhackathon\b|\bhackathon\b[^.\n]{0,80}\b(?:winner|won|1st|first place|grand prize|champion)\b/gi);
  return matches?.length ?? 0;
}

function familyForAccolade(text: string): Family | undefined {
  if (/\b(yc|founder|startup|seed|series|thiel)\b/i.test(text)) return "founder";
  if (/\b(openai|anthropic|google|meta|microsoft|nvidia|engineer|github|software|ai|ml)\b/i.test(text)) return "engineering";
  if (/\b(neurips|nature|science|phd|research|olympiad|putnam|rhodes|stanford|mit)\b/i.test(text)) return "science_academia";
  if (/\b(jane street|goldman|bank|vc|invest|fund|quant)\b/i.test(text)) return "finance";
  if (/\b(mckinsey|bain|bcg|strategy|consult)\b/i.test(text)) return "consulting_corporate";
  if (/\b(hospital|medicine|doctor|clinical|surgeon|residency)\b/i.test(text)) return "medicine";
  return undefined;
}

function compactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 ? 1 : 0)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 ? 1 : 0)}K`;
  return String(n);
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
  const starStep: Partial<Record<"A" | "S", number>> = {
    A: 5,
    S: 3,
  };
  const starScore = supportsTierCrowns(tier)
    ? base[tier] + ((stars ?? 1) - 1) * (starStep[tier] ?? 0)
    : base[tier as Exclude<Tier, "ASCENDED" | "MYTHIC">];
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

function crownBump(crowns?: TierStars): number {
  return crowns === 3 ? 2 : crowns === 2 ? 1 : 0;
}

export function anchorPercentileToTier(
  tier: Tier,
  stars: TierStars | undefined,
  raw: PercentileTrio
): PercentileTrio {
  const target = TIER_RARITY_PCT[tier];
  const bump = supportsTierCrowns(tier) ? crownBump(stars) : 0;
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
  const label = isSpecialTier(tier) ? tier : formatTier(tier, stars);

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
