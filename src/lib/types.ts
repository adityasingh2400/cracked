// Core types shared across the app.

export type Tier = "S" | "A" | "B" | "C" | "D";

export type CategoryKey =
  | "education"
  | "work"
  | "accolades"
  | "founder"
  | "openSource"
  | "signal";

/**
 * League = age-relative competitive bucket. Same absolute score → different
 * league tier depending on which league you're in. Younger leagues have lower
 * cutoffs because there's been less time to stack signals.
 *
 * "Rookie" → "Legend" mirrors the Dex / trading-card vibe.
 */
export type LeagueKey =
  | "rookie"      // ≤16, middle / early HS
  | "prospect"    // 17-19, late HS / freshman
  | "apprentice"  // 20-22, late UG / pre-grad
  | "pro"         // 23-26, new grad / early career
  | "veteran"     // 27-32, mid career
  | "legend";     // 33+, late career

export interface ExtractedSignal {
  category: CategoryKey;
  /** Raw text from the source, e.g. "MIT", "Anthropic — ML Engineer", "USAMO Honorable Mention" */
  raw: string;
  /** Optional: secondary info (role title, year, etc.) */
  detail?: string;
}

export interface ScoredSignal extends ExtractedSignal {
  tier: Tier;
  points: number;
  /** which rubric entry matched, for transparency */
  matched: string;
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  /** raw sum of points before cap */
  raw: number;
  /** points credited to total (after cap) */
  credited: number;
  cap: number;
  topTier: Tier;
  signals: ScoredSignal[];
}

export interface SubStats {
  hack: number;   // technical signal
  grind: number;  // sustained effort / repeat wins / depth
  taste: number;  // top-tier choices
  rizz: number;   // social / founder / online presence
}

/**
 * Result of placing an absolute score into an age-relative league.
 * Same person, two grades: the absolute "your raw score" and the league
 * "how you stack vs your age cohort". The product leads with the league grade.
 */
export interface LeaguePlacement {
  league: LeagueKey;
  /** Display name, e.g. "Pro League". */
  leagueLabel: string;
  /** League-relative tier — what S/A/B/C/D means INSIDE this age bucket. */
  leagueTier: Tier;
  /** 1-99 — where you fall in your league's score range. 50 = median for league. */
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

export interface CrackedResult {
  id: string;
  name: string;
  total: number;          // 0-100
  tier: Tier;             // mapped from total (absolute)
  /** Age-relative placement. Optional so legacy share-links still decode. */
  league?: LeaguePlacement;
  subStats: SubStats;
  categories: CategoryScore[];
  verdict: string;        // ~30 words of biting-but-fair prose
  flavor: string;         // 1 short italic line for the card bottom
  matchedArchetype: string;       // slug — best-fit archetype from the Dex
  archetypeMatchScore: number;    // 0-1, how close the match is
  createdAt: string;      // ISO
  modelUsed: "claude" | "regex-fallback";
}

export interface LeaderboardRow {
  id: string;
  name: string;
  handle?: string | null;
  city?: string | null;
  total: number;
  tier: Tier;
  league?: LeagueKey;
  leagueTier?: Tier;
  age?: number;
  createdAt: string;
}
