// Leagues = age-relative competitive buckets. The site computes an absolute
// 0-100 score against the rubric, then drops you into the right league based
// on age and re-grades S/A/B/C/D against your peers, not against everyone.
//
// Why six leagues, not three or twelve?
// - 6 is enough to express the *natural inflection points* of a career arc
//   (HS, late HS, late UG, new grad, mid-career, established) without
//   demanding a precision the absolute rubric can't carry.
// - It also maps cleanly to the dex/trading-card vibe (Rookie → Legend).
//
// Cutoffs are estimates anchored against the existing absolute thresholds
// (≥90 = S abs, ≥75 = A abs, ≥60 = B abs, ≥40 = C abs) — see lib/tier-list.
// They drop substantially for younger leagues because there's been less time
// to stack signals.

import type { LeagueKey, Tier } from "@/lib/types";

export interface League {
  key: LeagueKey;
  label: string;
  shortLabel: string;
  /** Inclusive age range. `null` for unbounded high end. */
  ageMin: number;
  ageMax: number | null;
  /** Glyph shown next to the league name. Single short symbol. */
  glyph: string;
  /** Accent color hex (matches the foil palette). */
  accent: string;
  /** Cutoffs on the 0-100 absolute scale that map → league tier. */
  cutoffs: Record<Tier, number>;
  /** P50 expected absolute score for this league — used for percentile center. */
  baseline: number;
  /** ~25-word flavor line for cards / hover state. */
  flavor: string;
  /** One-liner shown below the league name to set context. */
  tagline: string;
  /** Concrete examples of an S-tier profile in this league — shown in the dex. */
  sTierExemplars: string[];
}

export const LEAGUES: League[] = [
  {
    key: "rookie",
    label: "Rookie League",
    shortLabel: "Rookie",
    ageMin: 0,
    ageMax: 16,
    glyph: "★",
    accent: "#22D3EE",
    cutoffs: { S: 48, A: 34, B: 22, C: 12, D: 0 },
    baseline: 18,
    tagline: "Middle school · early high school",
    flavor: "The peak years for raw, unalloyed potential. No exits yet — just rocket fuel.",
    sTierExemplars: [
      "IMO medalist",
      "ISEF Grand Award (top 5)",
      "Davidson Fellow",
      "100k+ following at 14",
      "Published first-author in a real journal",
    ],
  },
  {
    key: "prospect",
    label: "Prospect League",
    shortLabel: "Prospect",
    ageMin: 17,
    ageMax: 19,
    glyph: "✦",
    accent: "#A78BFA",
    cutoffs: { S: 60, A: 44, B: 30, C: 18, D: 0 },
    baseline: 26,
    tagline: "Late high school · freshman year",
    flavor: "Visible from orbit. Schools, programs, and funds are already circling.",
    sTierExemplars: [
      "USAMO + RSI + MIT/Stanford admit",
      "Thiel Fellow (deferred college)",
      "Coca-Cola or Regeneron STS top award",
      "Started a company already raising real money",
    ],
  },
  {
    key: "apprentice",
    label: "Apprentice League",
    shortLabel: "Apprentice",
    ageMin: 20,
    ageMax: 22,
    glyph: "✺",
    accent: "#EC4899",
    cutoffs: { S: 72, A: 56, B: 40, C: 25, D: 0 },
    baseline: 38,
    tagline: "Late undergrad · pre-grad",
    flavor: "The internship circuit decides everything. One YC batch from inevitable.",
    sTierExemplars: [
      "Putnam Fellow / NeurIPS first-author at 21",
      "YC W/S batch as still-undergrad founder",
      "Anthropic / OpenAI / Jane Street intern → return offer",
      "Hertz Fellow / Rhodes Scholar elect",
    ],
  },
  {
    key: "pro",
    label: "Pro League",
    shortLabel: "Pro",
    ageMin: 23,
    ageMax: 26,
    glyph: "✶",
    accent: "#FCD34D",
    cutoffs: { S: 82, A: 65, B: 48, C: 30, D: 0 },
    baseline: 50,
    tagline: "New grad · early career",
    flavor: "The first checkpoint where bullshit stops working. Output and equity are the only currency.",
    sTierExemplars: [
      "Founder with $5M+ seed + real revenue",
      "ML researcher at Anthropic / OpenAI / DeepMind",
      "Federal appellate clerk / SCOTUS clerk-bound",
      "Forbes 30 Under 30 (rare at this age, but possible)",
    ],
  },
  {
    key: "veteran",
    label: "Veteran League",
    shortLabel: "Veteran",
    ageMin: 27,
    ageMax: 32,
    glyph: "✷",
    accent: "#F59E0B",
    cutoffs: { S: 88, A: 72, B: 55, C: 35, D: 0 },
    baseline: 60,
    tagline: "Mid career · approaching peak",
    flavor: "Inflection point. One exit, one tenure, or one viral product separates the legends from the lifers.",
    sTierExemplars: [
      "Exited founder ($100M+) or current $1B+ valuation",
      "Forbes 30 Under 30 alum on Midas Brink",
      "Director / Principal at a frontier AI lab",
      "Partner-track at top hedge fund / PE megafund",
    ],
  },
  {
    key: "legend",
    label: "Legend League",
    shortLabel: "Legend",
    ageMin: 33,
    ageMax: null,
    glyph: "✸",
    accent: "#FCD34D",
    cutoffs: { S: 92, A: 78, B: 60, C: 40, D: 0 },
    baseline: 70,
    tagline: "Established · the record speaks",
    flavor: "Past the age where 'potential' counts. Either the resume is real or it isn't.",
    sTierExemplars: [
      "Forbes Midas List Top 50",
      "MacArthur Fellow / Pulitzer / Nobel-adjacent",
      "Public company exec or $1B+ founder",
      "Senate-confirmed appointee / federal judge",
    ],
  },
];

const LEAGUE_BY_KEY: Record<LeagueKey, League> = Object.fromEntries(
  LEAGUES.map((l) => [l.key, l])
) as Record<LeagueKey, League>;

/** Resolve a league for a given age. Falls back to Legend for absurd ages. */
export function leagueForAge(age: number): League {
  const safeAge = Math.max(0, Math.min(120, Math.round(age)));
  for (const l of LEAGUES) {
    if (safeAge >= l.ageMin && (l.ageMax === null || safeAge <= l.ageMax)) {
      return l;
    }
  }
  return LEAGUE_BY_KEY.legend;
}

export function getLeague(key: LeagueKey): League {
  return LEAGUE_BY_KEY[key];
}
