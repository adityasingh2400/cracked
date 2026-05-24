// GET /api/sample
// Returns a pre-baked achievement-native sample result so the landing page can
// preview a card without uploading a PDF.

import { NextRequest, NextResponse } from "next/server";
import { persistShareResult, sharePath } from "@/lib/share-store";
import { placeInLeague } from "@/lib/leagues";
import { buildCrackedResult, signalScoreForTier } from "@/lib/result-scoring";
import type { CrackedResultV1, ExtractedSignals, Tier, TierStars } from "@/lib/types";

export const runtime = "nodejs";

const SAMPLE_SIGNALS: ExtractedSignals = {
  schools: [{ name: "Stanford University", degree: "BS Computer Science", gradYear: 2024 }],
  companies: [{ name: "Anthropic", title: "Member of Technical Staff" }],
  awards: [{ name: "Y Combinator W25" }],
  publications: [{ venue: "NeurIPS", role: "co" }],
  funding: [{ company: "Stealth AI", round: "seed", amount: 1_500_000 }],
  open_source: [{ project: "sample", metric: 5_400 }],
  online: [],
  raw_text: "Stanford CS, Anthropic MTS, YC W25, NeurIPS co-author, seed-funded AI startup, 5.4k GitHub stars",
};

const MEGA_SIGNALS: ExtractedSignals = {
  schools: [
    { name: "MIT", degree: "BS EECS" },
    { name: "Stanford University", degree: "PhD Computer Science" },
  ],
  companies: [
    { name: "Anthropic", title: "Founding Research Engineer" },
    { name: "OpenAI", title: "Member of Technical Staff" },
  ],
  awards: [
    { name: "IMO Gold Medal" },
    { name: "Putnam Fellow" },
    { name: "Rhodes Scholar" },
    { name: "MacArthur Fellow" },
    { name: "Thiel Fellow" },
  ],
  publications: [
    { venue: "NeurIPS", role: "first" },
    { venue: "Nature", role: "first" },
  ],
  funding: [{ company: "MyStartup", round: "Series B", amount: 50_000_000 }],
  open_source: [{ project: "flagship", metric: 80_000 }],
  online: [{ platform: "twitter", followers: 50_000 }],
  raw_text:
    "MIT EECS, Stanford PhD, Anthropic founding engineer, OpenAI MTS, IMO Gold, Putnam Fellow, Rhodes, MacArthur, Thiel, NeurIPS first-author, Nature paper, $50M Series B, 80k stars",
};

export async function GET(req: NextRequest) {
  const mega = req.nextUrl.searchParams.get("super") === "1";
  let result = buildCrackedResult({
    id: mega ? "sample-mega" : "sample",
    name: "Aditya Singh",
    signals: mega ? MEGA_SIGNALS : SAMPLE_SIGNALS,
    modelUsed: mega ? "claude" : "regex-fallback",
    userAge: 23,
    speciality: mega ? "Frontier AI Researcher + Founder" : "AI Startup Founder",
    bestAccolades: mega
      ? [
          { title: "MIT EECS + Stanford PhD", detail: "Elite technical pedigree", family: "science_academia" },
          { title: "Anthropic Founding Engineer", detail: "Frontier AI lab operator", family: "engineering" },
          { title: "IMO Gold + Putnam Fellow", detail: "Rare math competition stack", family: "science_academia" },
          { title: "$50M Series B Founder", detail: "Venture-backed company builder", family: "founder" },
          { title: "NeurIPS + Nature First Author", detail: "Top-tier research output", family: "science_academia" },
        ]
      : [
          { title: "Stanford CS", detail: "Core technical pedigree", family: "science_academia" },
          { title: "Anthropic MTS", detail: "Frontier AI engineering signal", family: "engineering" },
          { title: "YC W25 Founder", detail: "Startup batch signal", family: "founder" },
          { title: "NeurIPS Co-Author", detail: "Research publication signal", family: "science_academia" },
          { title: "$1.5M Seed Round", detail: "Early funding traction", family: "founder" },
        ],
    scoringTier: mega ? "anthropic-api" : "regex-fallback",
    calibrating: !mega,
  });

  const gradeOverride = (req.nextUrl.searchParams.get("grade") ?? "").toLowerCase();
  const g = GRADE_MAP[gradeOverride];
  if (g) {
    result = overrideGrade(result, g);
  }

  await persistShareResult(result);
  return NextResponse.json({ encoded: result.id, shareUrl: sharePath(result), result });
}

const GRADE_MAP: Record<string, { tier: Tier; stars?: TierStars; verdict: string; flavor: string }> = {
  ascended: {
    tier: "ASCENDED",
    verdict: "ASCENDED in Engineering. The 0.001%. Lifetime-defining trajectory.",
    flavor: "Once a decade. Built different.",
  },
  mythic: {
    tier: "MYTHIC",
    verdict: "MYTHIC in Engineering. The 0.1%. Career-defining dossier.",
    flavor: "The ceiling for most people. The floor for them.",
  },
  s: {
    tier: "S",
    stars: 3,
    verdict: "S3 in Engineering. The top shelf before MYTHIC.",
    flavor: "One clean push from myth.",
  },
  a: {
    tier: "A",
    stars: 2,
    verdict: "A2 in Engineering. Strong institutional signal with room to compound.",
    flavor: "Compounding.",
  },
  b: {
    tier: "B",
    stars: 2,
    verdict: "B2 in Engineering. Real signal, real trajectory.",
    flavor: "Climbing.",
  },
  c: {
    tier: "C",
    stars: 2,
    verdict: "C2 in Engineering. The foundation is visible.",
    flavor: "The arc is just beginning.",
  },
  d: {
    tier: "D",
    stars: 1,
    verdict: "D1 in Engineering. Early signal, still gathering receipts.",
    flavor: "Day one is the best day to start.",
  },
};

GRADE_MAP["rare-holo"] = GRADE_MAP.a;
GRADE_MAP.rare = GRADE_MAP.b;
GRADE_MAP.uncommon = GRADE_MAP.c;
GRADE_MAP.common = GRADE_MAP.d;

function overrideGrade(
  result: CrackedResultV1,
  grade: { tier: Tier; stars?: TierStars; verdict: string; flavor: string }
): CrackedResultV1 {
  const signalScore = signalScoreForTier(grade.tier, grade.stars);
  return {
    ...result,
    tier: grade.tier,
    tierStars: grade.stars,
    signalScore,
    verdict: grade.verdict,
    flavor: grade.flavor,
    league: result.league
      ? placeInLeague({
          tier: grade.tier,
          tierStars: grade.stars,
          age: result.league.age,
          ageSource: result.league.ageSource,
          ageConfidence: result.league.ageConfidence,
        })
      : result.league,
  };
}
