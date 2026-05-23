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
 * Cohort key = age-relative competitive bucket. Same absolute score → different
 * cohort tier depending on which cohort you're in. Younger cohorts have lower
 * cutoffs because there's been less time to stack signals.
 *
 * IMPORTANT: the *keys* are internal identifiers retained for compatibility,
 * but the *user-facing labels* are pure age ranges (≤16, 17-19, 20-22, …, 33+)
 * — we deliberately do not name them "Rookie/Legend" etc., because that
 * ordering would imply older = more cracked, which inverts the point.
 */
export type LeagueKey =
  | "rookie"      // ≤16
  | "prospect"    // 17-19
  | "apprentice"  // 20-22
  | "pro"         // 23-26
  | "veteran"     // 27-32
  | "legend";     // 33+

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
 *
 * Display strings (label, tagline, accent…) are NOT snapshotted here — the UI
 * derives them from the league key on every render so renames in data/leagues
 * propagate to every existing share link without re-encoding.
 */
export interface LeaguePlacement {
  league: LeagueKey;
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
  /**
   * Age-relative placement. Optional because age inference can return 0
   * confidence on a sparse resume — when that happens we still want a card,
   * just without the cohort grade.
   */
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
