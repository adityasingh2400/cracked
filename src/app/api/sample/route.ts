// GET /api/sample
// Returns a pre-baked sample result so the user can preview the card without
// uploading a PDF. Useful for the landing page demo + first-impression.

import { NextResponse } from "next/server";
import { scoreSignals } from "@/lib/score";
import { encodeResult } from "@/lib/encode";
import type { ExtractedSignal } from "@/lib/types";

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

export async function GET() {
  const result = scoreSignals({
    id: "sample",
    name: "Aditya Singh",
    signals: SAMPLE_SIGNALS,
    verdict: "MIT EECS, Anthropic, HackMIT grand prize, and a Mercury Fellowship before age 23. Add a YC batch or a viral side project and they're untouchable.",
    flavor: "Compiled in basements. Shipped at dawn.",
    modelUsed: "regex-fallback",
  });
  const encoded = encodeResult(result);
  return NextResponse.json({ encoded, result });
}
