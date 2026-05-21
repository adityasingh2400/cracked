// Core types shared across the app.

export type Tier = "S" | "A" | "B" | "C" | "D";

export type CategoryKey =
  | "education"
  | "work"
  | "accolades"
  | "founder"
  | "openSource"
  | "signal";

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

export interface CrackedResult {
  id: string;
  name: string;
  total: number;          // 0-100
  tier: Tier;             // mapped from total
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
  createdAt: string;
}
