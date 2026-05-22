// Leagues = age-relative competitive buckets. The site computes an absolute
// 0-100 score against the rubric, then drops you into the right league based
// on age and re-grades S/A/B/C/D against your peers, not against everyone.
//
// Why six leagues, not three or twelve?
// - 6 is enough to express the *natural inflection points* of a career arc
//   (HS, late HS, late UG, new grad, mid-career, established) without
//   demanding a precision the absolute rubric can't carry.
// - It also maps cleanly to the dex/trading-card vibe (Rookie → Legend).
// - The age handicap *saturates* at ~33 (Azoulay's billion-dollar-founder
//   median is 45, MacArthur median is mid-40s) so splitting Legend 33-45
//   vs 46+ would be false precision.
//
// Cutoffs are anchored against the existing absolute thresholds
// (≥90 = S abs, ≥75 = A abs, ≥60 = B abs, ≥40 = C abs) — see lib/tier-list.
// They drop substantially for younger leagues because there's been less time
// to stack signals; they converge with the absolute rubric in the Legend
// league where the handicap has saturated.
//
// Calibration sources behind each league's cutoffs and exemplars:
// - Hard age caps verified per program: IMO ≤19, ISEF HS-only, Davidson ≤18,
//   Thiel ≤22, Rhodes ≤24 (≤25 medics), Marshall ≤2y post-BA, Schwarzman <29
//   on Aug 1, Forbes 30U30 ≤29 on Dec 31, Sloan Research Fellow tenure-track
//   only ("normally several years past PhD"). NSF GRFP first/second yr grad.
// - Median-age data: Nobel medians 60-67 by category, MacArthur mid-40s,
//   Azoulay et al billion-dollar-founder median 45. YC has moved from PG's
//   classic "27" claim to ~24-26 median under Garry Tan.
// - Per-league re-weighting of the 6 category caps (so Rookie isn't
//   structurally capped at ~60 by missing Work/Founder signal) is a
//   v2 follow-up — for v1 the cohort cutoffs alone do the work.

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
    flavor: "Raw, unalloyed potential. The window when nothing's expected — so anything you do counts double.",
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
    label: "Prospect League",
    shortLabel: "Prospect",
    ageMin: 17,
    ageMax: 19,
    glyph: "✦",
    accent: "#A78BFA",
    cutoffs: { S: 60, A: 44, B: 30, C: 18, D: 0 },
    baseline: 26,
    tagline: "Late high school · freshman year",
    flavor: "Visible from orbit. Programs, schools, and funds are already circling — the only question is which orbit you pick.",
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
    label: "Apprentice League",
    shortLabel: "Apprentice",
    ageMin: 20,
    ageMax: 22,
    glyph: "✺",
    accent: "#EC4899",
    cutoffs: { S: 72, A: 56, B: 40, C: 25, D: 0 },
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
    label: "Pro League",
    shortLabel: "Pro",
    ageMin: 23,
    ageMax: 26,
    glyph: "✶",
    accent: "#FCD34D",
    cutoffs: { S: 82, A: 65, B: 48, C: 30, D: 0 },
    baseline: 50,
    tagline: "New grad · early career",
    flavor: "First checkpoint where bullshit stops working. Equity, papers, and prizes are the only currency — and the age-gated prizes are closing fast.",
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
    label: "Veteran League",
    shortLabel: "Veteran",
    ageMin: 27,
    ageMax: 32,
    glyph: "✷",
    accent: "#F59E0B",
    cutoffs: { S: 88, A: 72, B: 55, C: 38, D: 0 },
    baseline: 62,
    tagline: "Mid career · the receipts are due",
    flavor: "Decade in. Talent has sorted, time-excuses expire. Show the exit, the promote, the paper, the partnership — the body of work, finally legible.",
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
    label: "Legend League",
    shortLabel: "Legend",
    ageMin: 33,
    ageMax: null,
    glyph: "✸",
    accent: "#FCD34D",
    cutoffs: { S: 92, A: 78, B: 62, C: 42, D: 0 },
    baseline: 70,
    tagline: "Established · the record speaks",
    flavor: "Past the age where 'potential' counts. The handicap saturates — from here on it's the same bar as the absolute board, and either the resume is real or it isn't.",
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
