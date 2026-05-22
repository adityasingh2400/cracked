// GET /api/sample
// Returns a pre-baked sample result so the user can preview the card without
// uploading a PDF. Useful for the landing page demo + first-impression.

import { NextRequest, NextResponse } from "next/server";
import { scoreSignals } from "@/lib/score";
import { encodeResult } from "@/lib/encode";
import type { ExtractedSignal, Tier } from "@/lib/types";

export const runtime = "nodejs";

const SAMPLE_SIGNALS: ExtractedSignal[] = [
  { category: "education", raw: "MIT", detail: "B.S. EECS, 2024" },
  { category: "education", raw: "Phillips Exeter Academy", detail: "Math team captain" },
  { category: "work", raw: "Anthropic", detail: "ML Engineer" },
  { category: "work", raw: "Jane Street", detail: "SWE Intern, Summer 2023" },
  { category: "work", raw: "Stripe", detail: "SWE Intern, Summer 2022" },
  { category: "accolades", raw: "Putnam Top 25 — Putnam Fellow", detail: "2023" },
  { category: "accolades", raw: "USAMO", detail: "Qualifier, 2020" },
  { category: "accolades", raw: "HackMIT Grand Prize", detail: "2022" },
  { category: "accolades", raw: "Mercury Fellowship", detail: "2023" },
  { category: "openSource", raw: "github.com/sample — 5.4k stars on main project" },
  { category: "founder", raw: "Thiel Fellow 2023 · Co-founder, stealth AI · raised $1.5M seed via Y Combinator W25" },
  { category: "signal", raw: "Co-author of NeurIPS 2024 paper, arxiv.org/2410.xxxxx" },
];

// God-tier sample for previewing the ASCENDED mega-S card frame.
const MEGA_SIGNALS: ExtractedSignal[] = [
  { category: "education", raw: "MIT", detail: "B.S. EECS" },
  { category: "education", raw: "Stanford", detail: "Ph.D. CS" },
  { category: "work", raw: "Anthropic", detail: "Founding ML engineer" },
  { category: "work", raw: "OpenAI", detail: "Research Engineer" },
  { category: "work", raw: "Jane Street", detail: "Quant Trader" },
  { category: "accolades", raw: "IMO Gold Medal" },
  { category: "accolades", raw: "Putnam Top 5 — Putnam Fellow" },
  { category: "accolades", raw: "USAMO Winner" },
  { category: "accolades", raw: "Rhodes Scholar" },
  { category: "accolades", raw: "MacArthur Fellowship" },
  { category: "accolades", raw: "Thiel Fellowship" },
  { category: "founder", raw: "Y Combinator S23 — raised $50M Series A at $1B valuation" },
  { category: "founder", raw: "Prior exit: startup acquired by Stripe for $200M" },
  { category: "openSource", raw: "github — 80k stars on flagship open-source project" },
  { category: "signal", raw: "First-author NeurIPS 2024 + ICML 2024 + Nature 2024 papers" },
];

export async function GET(req: NextRequest) {
  const mega = req.nextUrl.searchParams.get("super") === "1";
  let result = scoreSignals(
    mega
      ? {
          id: "sample-mega",
          name: "Aditya Singh",
          signals: MEGA_SIGNALS,
          verdict:
            "MIT, Anthropic founding, IMO gold, Putnam Fellow, Rhodes, MacArthur, Thiel + YC, NeurIPS first-author, Nature paper, $200M exit, $1B startup. Calibration ceiling. The dossier ends arguments.",
          flavor: "Once a decade. Built different.",
          modelUsed: "claude",
          age: 23,
          ageSource: "user",
          ageConfidence: 1,
        }
      : {
          id: "sample",
          name: "Aditya Singh",
          signals: SAMPLE_SIGNALS,
          verdict:
            "MIT EECS, Anthropic, HackMIT grand prize, and a Mercury Fellowship before age 23. Add a YC batch or a viral side project and they're untouchable.",
          flavor: "Compiled in basements. Shipped at dawn.",
          modelUsed: "regex-fallback",
          age: 23,
          ageSource: "user",
          ageConfidence: 1,
        },
  );
  // Mega-S preview: pin the absolute tier to S so the ASCENDED frame renders
  // for the demo card even when the rubric falls slightly short of the 90+ floor.
  if (mega && result.tier !== "S") {
    result = { ...result, tier: "S", total: Math.max(result.total, 92) };
    if (result.league) {
      result.league = { ...result.league, leagueTier: "S", percentile: 99 };
    }
  }

  // Generic grade preview — overrides absolute tier + leagueTier so each
  // visual grade (ascended / mythic / rare-holo / rare / uncommon / common)
  // renders without needing real signals to back it.
  const gradeOverride = (req.nextUrl.searchParams.get("grade") ?? "").toLowerCase();
  const GRADE_MAP: Record<string, { tier: Tier; leagueTier: Tier; total: number; percentile: number; verdict: string; flavor: string }> = {
    ascended: { tier: "S", leagueTier: "S", total: 94, percentile: 99, verdict: "MIT, Anthropic founding, IMO gold, Rhodes, MacArthur, Thiel + YC, NeurIPS first-author, Nature paper, $200M exit, $1B startup. Calibration ceiling.", flavor: "Once a decade. Built different." },
    mythic:   { tier: "A", leagueTier: "S", total: 84, percentile: 96, verdict: "MIT EECS, Anthropic, Mercury Fellowship, Putnam, IMO Bronze, YC batch, NeurIPS co-author. Cohort-S — peers can't touch it.", flavor: "Built the thing. Shipped it anyway." },
    "rare-holo": { tier: "A", leagueTier: "A", total: 75, percentile: 78, verdict: "MIT EECS, Anthropic, HackMIT grand prize, Mercury Fellowship before 23. Add a YC batch or a viral side project and they're untouchable.", flavor: "Compiled in basements. Shipped at dawn." },
    a:        { tier: "A", leagueTier: "A", total: 75, percentile: 78, verdict: "MIT EECS, Anthropic, HackMIT grand prize, Mercury Fellowship before 23. Add a YC batch or a viral side project and they're untouchable.", flavor: "Compiled in basements. Shipped at dawn." },
    rare:     { tier: "B", leagueTier: "B", total: 64, percentile: 62, verdict: "Brown CS, Stripe SWE, two real internships, a hackathon win. Solid trajectory — the next checkpoint decides whether it compounds.", flavor: "On the verge." },
    b:        { tier: "B", leagueTier: "B", total: 64, percentile: 62, verdict: "Brown CS, Stripe SWE, two real internships, a hackathon win. Solid trajectory — the next checkpoint decides whether it compounds.", flavor: "On the verge." },
    uncommon: { tier: "C", leagueTier: "C", total: 48, percentile: 42, verdict: "State school CS, mid-tier SaaS engineer, one boot-strapped side project. Real work, real shipping — just hasn't found the leverage yet.", flavor: "The arc is just beginning." },
    c:        { tier: "C", leagueTier: "C", total: 48, percentile: 42, verdict: "State school CS, mid-tier SaaS engineer, one boot-strapped side project. Real work, real shipping — just hasn't found the leverage yet.", flavor: "The arc is just beginning." },
    common:   { tier: "D", leagueTier: "D", total: 22, percentile: 18, verdict: "Bootcamp grad, junior eng at a regional shop, no public output. Plenty of runway — none of it compounded yet.", flavor: "The signals haven't shown up yet." },
    d:        { tier: "D", leagueTier: "D", total: 22, percentile: 18, verdict: "Bootcamp grad, junior eng at a regional shop, no public output. Plenty of runway — none of it compounded yet.", flavor: "The signals haven't shown up yet." },
  };
  const g = GRADE_MAP[gradeOverride];
  if (g) {
    result = {
      ...result,
      tier: g.tier,
      total: g.total,
      verdict: g.verdict,
      flavor: g.flavor,
      league: result.league
        ? { ...result.league, leagueTier: g.leagueTier, percentile: g.percentile }
        : result.league,
    };
  }

  const encoded = encodeResult(result);
  return NextResponse.json({ encoded, result });
}
