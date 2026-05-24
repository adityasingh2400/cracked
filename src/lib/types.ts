// Core types shared across the app.

// v1.0 tier ladder: 7 tiers. ASCENDED + MYTHIC are special tiers; only A and S
// carry a 1-3 crown subtype. D/C/B are plain letter tiers.
export type Tier = "ASCENDED" | "MYTHIC" | "S" | "A" | "B" | "C" | "D";
export type StandardTier = Exclude<Tier, "ASCENDED" | "MYTHIC">;
/** 1-3 crown rank for A and S tiers only. Stored as tierStars for share-url compatibility. */
export type TierStars = 1 | 2 | 3;
export type TierCrowns = TierStars;

/** Visual crown glyph used on cards and badges. */
export const CROWN_GLYPH = "♔";

export function supportsTierCrowns(tier: Tier): tier is "A" | "S" {
  return tier === "A" || tier === "S";
}

export function normalizeTierCrowns(tier: Tier, crowns?: TierStars): TierStars | undefined {
  if (isSpecialTier(tier) || !supportsTierCrowns(tier)) return undefined;
  return crowns ?? 1;
}

export function formatCrowns(crowns: TierStars): string {
  return CROWN_GLYPH.repeat(crowns);
}

// Numeric rank for tier comparisons. Higher = more cracked.
export const TIER_RANK: Record<Tier, number> = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  S: 4,
  MYTHIC: 5,
  ASCENDED: 6,
};

export function compareTiers(a: Tier, b: Tier): number {
  return TIER_RANK[a] - TIER_RANK[b];
}

export function maxTier(...tiers: Tier[]): Tier {
  return tiers.reduce((best, t) => (TIER_RANK[t] > TIER_RANK[best] ? t : best), "D");
}

export function isSpecialTier(tier: Tier): tier is "ASCENDED" | "MYTHIC" {
  return tier === "ASCENDED" || tier === "MYTHIC";
}

export function formatTier(tier: Tier, crowns?: TierStars): string {
  if (isSpecialTier(tier)) return tier;
  if (supportsTierCrowns(tier)) return `${tier}${crowns ?? 1}`;
  return tier;
}

// v1.0 career families - 9 buckets above the tier ladder. Each family has its
// own Achievement library and Chain set under src/data/achievements/{family}.ts.
export type Family =
  | "engineering"
  | "science_academia"
  | "founder"
  | "finance"
  | "consulting_corporate"
  | "law_public_service"
  | "medicine"
  | "athletics_performance"
  | "creative_audience";

export const ALL_FAMILIES: Family[] = [
  "engineering",
  "science_academia",
  "founder",
  "finance",
  "consulting_corporate",
  "law_public_service",
  "medicine",
  "athletics_performance",
  "creative_audience",
];

// Structured signals extracted from a resume by the LLM (or regex fallback).
// Achievement matchers run against these.
export interface ExtractedSignals {
  schools: Array<{ name: string; degree?: string; gradYear?: number }>;
  companies: Array<{ name: string; title?: string; tenure?: [number, number] }>;
  awards: Array<{ name: string; year?: number }>;
  publications: Array<{ venue: string; role?: "first" | "co" | "senior" }>;
  funding: Array<{ company: string; round?: string; amount?: number }>;
  open_source: Array<{ project: string; metric?: number }>;
  online: Array<{ platform: string; followers?: number }>;
  /** Full text fallback for free_text SignalMatchers. */
  raw_text: string;
}

// One independent qualifier. Matches against ExtractedSignals.
export interface Achievement {
  /** Unique slug, prefixed with family namespace, e.g. "eng_stanford_cs_bs". */
  id: string;
  family: Family;
  /** Tier on its own, before chaining. */
  tier: Tier;
  label: string;
  description: string;
  signals: SignalMatcher[];
  /** Some achievements only count under age N (e.g., Thiel Fellow ≤22). */
  ageCap?: number;
  /** Concrete real-world examples shown in the dex. */
  evidence?: string[];
}

// Match semantics:
// - Within one matcher: for `school`/`company`/`award`/`publication`, ANY string
//   in `match[]` (or `venue[]`) counts as a hit. Sibling fields (title, role,
//   round, minAmount) are AND-applied as additional constraints.
// - For `free_text`: ANY regex hitting `raw_text` counts.
// - Within one Achievement: ALL `signals: SignalMatcher[]` entries must hit (AND).
//   For OR semantics, define two Achievements with the same tier/family.
export type SignalMatcher =
  | { kind: "school"; match: string[]; regex?: RegExp[] }
  | { kind: "company"; match: string[]; title?: string[] }
  | { kind: "award"; match: string[]; regex?: RegExp[] }
  | { kind: "publication"; venue: string[]; role?: "first" | "co" | "senior" }
  | { kind: "funding"; round?: string; minAmount?: number }
  | { kind: "online"; platform?: string; minFollowers?: number }
  | { kind: "open_source"; project?: string[]; minMetric?: number }
  | { kind: "free_text"; patterns: RegExp[] };

// A Chain is a NAMED combo of Achievements. If ALL required Achievements match
// for a user in a given family, the chain unlocks and bumps the family tier
// up to `bumpTo`. Chains are scoring constructs - they have internal names
// (e.g. "The Classic Pipeline") but no public URL surface.
export interface Chain {
  /** Unique slug. */
  id: string;
  /** Internal label, used in card banner when this chain unlocks. */
  name: string;
  family: Family;
  /** Achievement IDs, ALL required to match. */
  requires: string[];
  /** Tier this chain unlocks. */
  bumpTo: Tier;
  description: string;
}

// Result of scoring a user against all 9 families.
export interface FamilyScore {
  family: Family;
  /** Best-tier Achievement matched standalone. */
  baseTier: Tier;
  /** Tier from the highest-bump active chain. */
  chainTier: Tier;
  /** max(baseTier, chainTier) - what the user sees. */
  finalTier: Tier;
  /** 1-3 crown rank for A/S only. MYTHIC, ASCENDED, and D/C/B omit this. */
  tierStars?: TierStars;
  /** IDs of all matched Achievements for this family. */
  matched: string[];
  /** All chains that unlocked. */
  activeChains: string[];
}

// Three percentile metrics shown on every v1.0 card.
export interface PercentileTrio {
  /** Within-family, within-cohort. Primary. "more cracked than X% of Engineers 23-26." */
  withinFamilyCohort: number;
  /** Cross-family, within-cohort. Secondary. "more cracked than Y% of 23-26 year olds." */
  crossFamilyCohort: number;
  /** All-time global. Smallest. "more cracked than Z% of the world." */
  global: number;
}

export interface CrackedResultV1 {
  id: string;
  name: string;
  tier: Tier;
  /** 1-3 crown rank for A/S only. MYTHIC, ASCENDED, and D/C/B omit this. */
  tierStars?: TierStars;
  /** Achievement-native score used only for ordering, particles, and synthetic percentiles. */
  signalScore: number;
  /** Age-relative placement. Optional so share links without age still render. */
  league?: LeaguePlacement;
  verdict: string;
  flavor: string;
  createdAt: string;
  modelUsed: "claude" | "regex-fallback";
  /** Per-family scoring breakdown. */
  families?: FamilyScore[];
  /** Primary qualifying family - the one the card highlights. */
  primaryFamily?: Family;
  /** Runner-up family, shown as secondary badge if user is strong in 2+. */
  secondaryFamily?: Family;
  /** Three percentile claims. */
  percentiles?: PercentileTrio;
  /** Whether scoring used Mac-Claude (top), API (mid), or regex (bottom). */
  scoringTier?: "mac-claude" | "anthropic-api" | "regex-fallback";
  /** True when scored via regex fallback - surfaces "calibrating" badge. */
  calibrating?: boolean;

  // ─── card-element fields (TCG-grade redesign 2026-05-22) ───────────
  /** LinkedIn profile photo URL, mirrored to Vercel Blob for stable hosting. */
  photoUrl?: string;
  /** LLM-derived 2-5 word phrase summarizing the user's specific niche.
   *  Example: "Frontier AI Researcher", "Pediatric Cardiologist", "YC Founder + Quant". */
  speciality?: string;
  /** Specific user-facing accolade bullets extracted from the profile for the card back. */
  bestAccolades?: Array<{
    title: string;
    detail?: string;
    family?: Family;
  }>;
  /** Full chain inventory across all families, for the card-back. */
  chainsAll?: Array<{
    id: string;
    name: string;
    family: Family;
    bumpTo: Tier;
    description: string;
  }>;
  /** Full matched-achievement inventory across all families, for the card-back grid. */
  achievementsAll?: Array<{
    id: string;
    label: string;
    family: Family;
    tier: Tier;
  }>;
}

// =============================================================================
// CARD-LEVEL HELPERS - used by HoloCardV1 + AvatarBubble + CardBack.
// =============================================================================

/** Extract initials for the AvatarBubble fallback when no photo is uploaded.
 *  Rules:
 *   - Two+ tokens → first letter of first + first letter of last, uppercased
 *   - One token → first letter only
 *   - Empty / all-non-alphabetic → "??" */
export function getInitials(name: string): string {
  const tokens = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter((t) => /^[A-Za-z]/.test(t));
  if (tokens.length === 0) return "??";
  if (tokens.length === 1) return tokens[0][0].toUpperCase();
  const first = tokens[0][0].toUpperCase();
  const last = tokens[tokens.length - 1][0].toUpperCase();
  return `${first}${last}`;
}

/** Stable 32-bit hash for deterministic constellation dot positions. */
export function hash32(s: string): number {
  let h = 0x811c9dc5; // FNV-1a offset
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0; // FNV-1a prime
  }
  return h >>> 0;
}

/**
 * Cohort key = age-relative competitive bucket. Same achievement tier is framed
 * differently depending on age because younger cohorts have had less time to
 * stack signals.
 *
 * IMPORTANT: the *keys* are internal identifiers retained for compatibility,
 * but the *user-facing labels* are pure age ranges (≤16, 17-19, 20-22, …, 33+)
 * - we deliberately do not name them "Rookie/Legend" etc., because that
 * ordering would imply older = more cracked, which inverts the point.
 */
export type LeagueKey =
  | "rookie"      // ≤16
  | "prospect"    // 17-19
  | "apprentice"  // 20-22
  | "pro"         // 23-26
  | "veteran"     // 27-32
  | "legend";     // 33+

/**
 * Result of placing an achievement tier into an age-relative cohort.
 * The cohort does not recalculate the tier; it frames the percentile claim.
 */
export interface LeaguePlacement {
  league: LeagueKey;
  /** Display name, e.g. "Pro League". */
  leagueLabel: string;
  /** League-relative tier - what S/A/B/C/D means INSIDE this age bucket. */
  leagueTier: Tier;
  /** League-relative crown rank for A/S only. */
  leagueTierStars?: TierStars;
  /** 1-99 - where you fall in your league's score range. 50 = median for league. */
  percentile: number;
  /** The (estimated) age used to determine the league. */
  age: number;
  /**
   * Whether the age was supplied by the user vs inferred from the resume.
   * If "inferred" the card may prompt the user to confirm/edit.
   */
  ageSource: "user" | "inferred";
  /** 0-1 confidence in the inference (1 if user-supplied). */
  ageConfidence: number;
}

export interface LeaderboardRow {
  id: string;
  name: string;
  handle?: string | null;
  city?: string | null;
  signalScore: number;
  tier: Tier;
  tierStars?: TierStars;
  league?: LeagueKey;
  leagueTier?: Tier;
  leagueTierStars?: TierStars;
  age?: number;
  createdAt: string;
}
