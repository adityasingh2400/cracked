// Age cohorts = age-relative competitive buckets. The site scores achievements
// inside a career family, then uses age to frame the percentile claim.
//
// IMPORTANT: cohorts are pure age ranges (≤16, 17-19, 20-22, 23-26, 27-32, 33+).
// They are NOT ranked names ("Rookie → Legend") because that ordering would
// imply older = more cracked, which inverts the point of age-relative scoring.
// A 14-year-old IMO gold and a 40-year-old MacArthur fellow are both S in
// their cohort and that's the whole story.
//
// Why six cohorts, not three or twelve?
// - 6 expresses the natural inflection points of a career arc (early HS,
//   late HS, late UG, new grad, mid-career, established) without demanding
//   a precision the absolute rubric can't carry.
// - The age handicap *saturates* at ~33 (Azoulay's billion-dollar-founder
//   median is 45, MacArthur median is mid-40s) so splitting the 33+ cohort
//   into 33-45 vs 46+ would be false precision.
//
// Calibration sources behind each league's exemplars:
// - Hard age caps verified per program: IMO ≤19, ISEF HS-only, Davidson ≤18,
//   Thiel ≤22, Rhodes ≤24 (≤25 medics), Marshall ≤2y post-BA, Schwarzman <29
//   on Aug 1, Forbes 30U30 ≤29 on Dec 31, Sloan Research Fellow tenure-track
//   only ("normally several years past PhD"). NSF GRFP first/second yr grad.
// - Median-age data: Nobel medians 60-67 by category, MacArthur mid-40s,
//   Azoulay et al billion-dollar-founder median 45. YC has moved from PG's
//   classic "27" claim to ~24-26 median under Garry Tan.
// - Per-cohort re-weighting of the 6 category caps (so the 14-year-old isn't
//   structurally capped at ~60 by missing Work/Founder signal) is a
//   v2 follow-up - for v1 the cohort label and percentile framing do the work.

import type { LeagueKey } from "@/lib/types";

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
  /** P50 expected absolute score for this league - used for percentile center. */
  baseline: number;
  /** ~25-word flavor line for cards / hover state. */
  flavor: string;
  /** One-liner shown below the league name to set context. */
  tagline: string;
  /** Concrete examples of an S-tier profile in this league - shown in the dex. */
  sTierExemplars: string[];
}

export const LEAGUES: League[] = [
  {
    key: "rookie",
    label: "Ages ≤16",
    shortLabel: "≤16",
    ageMin: 0,
    ageMax: 16,
    glyph: "①",
    accent: "#22D3EE",
    baseline: 18,
    tagline: "Middle school · early high school",
    flavor: "Nothing is expected yet, so anything you do counts double. The S-tier here is doing the work most people only attempt at 25.",
    sTierExemplars: [
      "IMO / IOI / IPhO medal (hard cap ≤19)",
      "ISEF Grand Award top-5 (HS only)",
      "Davidson Fellow ($50k laureate, ≤18)",
      "Published first-author in a real journal",
      "100k+ following with monetized output by 15",
    ],
  },
  {
    key: "prospect",
    label: "Ages 17–19",
    shortLabel: "17–19",
    ageMin: 17,
    ageMax: 19,
    glyph: "②",
    accent: "#A78BFA",
    baseline: 26,
    tagline: "Late high school · freshman year",
    flavor: "Programs, schools, and funds are already circling. The S-tier here decides which orbit to pick.",
    sTierExemplars: [
      "Thiel Fellow (≤22, $200k to skip college)",
      "USAMO + RSI + MIT/Stanford/Caltech admit",
      "Regeneron STS / Coca-Cola Scholar top award",
      "Founded a company that's actually raising real money",
      "Knight-Hennessy-bound (BA within ~5 yrs gate)",
    ],
  },
  {
    key: "apprentice",
    label: "Ages 20–22",
    shortLabel: "20–22",
    ageMin: 20,
    ageMax: 22,
    glyph: "③",
    accent: "#EC4899",
    baseline: 38,
    tagline: "Late undergrad · the internship circuit",
    flavor: "Where the funnel sorts hard. Frontier-lab return offers, YC batches, and named fellowships are the four currencies that matter.",
    sTierExemplars: [
      "Putnam Fellow (top 5, undergrad-only)",
      "NeurIPS / Nature first-author as undergrad",
      "YC W/S batch while still-undergrad founder",
      "Anthropic / OpenAI / Jane Street intern → return offer",
      "Hertz / Rhodes / Marshall (apply ≤24)",
    ],
  },
  {
    key: "pro",
    label: "Ages 23–26",
    shortLabel: "23–26",
    ageMin: 23,
    ageMax: 26,
    glyph: "④",
    accent: "#FCD34D",
    baseline: 50,
    tagline: "New grad · early career",
    flavor: "First checkpoint where bullshit stops working. Equity, papers, and prizes are the only currency - and the age-gated prizes are closing fast.",
    sTierExemplars: [
      "Founding research engineer at Anthropic / OpenAI / SSI / DeepMind",
      "YC founder w/ Series A ≥ $100M post-money before 26",
      "Rhodes / Marshall Scholar (apply ≤24, hard cap)",
      "SCOTUS clerkship awarded before 27",
      "NeurIPS / Nature first-author as a 2nd-yr PhD",
      "Forbes 30 Under 30 founder (≤29, real revenue)",
    ],
  },
  {
    key: "veteran",
    label: "Ages 27–32",
    shortLabel: "27–32",
    ageMin: 27,
    ageMax: 32,
    glyph: "⑤",
    accent: "#F59E0B",
    baseline: 62,
    tagline: "Mid career · the receipts are due",
    flavor: "Decade in. Talent has sorted, time-excuses expire. The body of work is finally legible - exit, promote, paper, partnership.",
    sTierExemplars: [
      "Exited founder ($100M+) or current $1B+ unicorn",
      "Forbes Midas Brink / Forbes 30 Under 30 (≤29) w/ real outcome",
      "Research lead at Anthropic / OpenAI / DeepMind ($1B+ product line)",
      "Y Combinator GP / partner at Sequoia·a16z·Founders Fund",
      "Sloan Research Fellow (tenure-track gate)",
      "Tenure-track asst prof at MIT / Stanford / Berkeley CS",
    ],
  },
  {
    key: "legend",
    label: "Ages 33+",
    shortLabel: "33+",
    ageMin: 33,
    ageMax: null,
    glyph: "⑥",
    accent: "#FCD34D",
    baseline: 70,
    tagline: "Established · the record speaks",
    flavor: "Past the age where 'potential' counts. The handicap saturates - from here on it's the same bar as the absolute board, and either the resume is real or it isn't.",
    sTierExemplars: [
      "Forbes Midas List Top 50 (active investor)",
      "MacArthur Fellow (median age mid-40s)",
      "Founder of a $1B+ company (median age 45 per Azoulay)",
      "Public company CEO / CTO / CPO",
      "Pulitzer / Booker / Nobel-adjacent honor",
      "Senate-confirmed appointee / Article III judge",
    ],
  },
];

const LEAGUE_BY_KEY: Record<LeagueKey, League> = Object.fromEntries(
  LEAGUES.map((l) => [l.key, l])
) as Record<LeagueKey, League>;

/** Resolve a cohort for a given age. Falls back to the 33+ cohort for absurd ages. */
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
