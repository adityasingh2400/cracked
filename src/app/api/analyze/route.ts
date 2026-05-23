// POST /api/analyze — v1.0 scoring endpoint.
//
// Two input shapes:
//   • multipart/form-data with `pdf` file (LinkedIn "Save to PDF" export)
//   • JSON {kind:"structured", name, signals, source} (bookmarklet/extension/paste)
//
// Returns: { id, encoded, result: CrackedResultV1, shareUrl, scoringTier, calibrating }
//
// Pipeline:
//   1. Extract signals (3-tier router: Mac-Claude → API → regex)
//   2. Run achievement scoring for per-family tier + chains + D-S star rank
//   4. Pick primaryFamily (highest finalTier) + secondaryFamily (runner-up)
//   5. Compute 3-percentile trio against synthetic cell distributions
//   6. Encode → share URL
//   8. Fire-and-forget KV writes (cell empirical distribution)

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { pdfToText, guessNameFromPdfText } from "@/lib/pdf";
import { templateSpeciality as templateSpecialityFromSignals } from "@/lib/claude";
import { encodeResult } from "@/lib/encode";
import { routeExtraction } from "@/lib/score-router";
import { setLookup, appendCellScore } from "@/lib/kv";
import { maskName, isOlympusEligible, buildOlympusRecord, computeOlympusScore } from "@/lib/olympus";
import { buildCrackedResult } from "@/lib/result-scoring";
import type {
  CrackedResultV1,
  ExtractedSignals,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface StructuredBody {
  kind: "structured";
  name: string;
  signals: ExtractedSignals;
  source?: "bookmarklet" | "extension" | "paste";
  age?: number;
  /** LLM-derived speciality, or template fallback. */
  speciality?: string;
  /** Bookmarklet-scraped LinkedIn profile photo, mirrored to Vercel Blob. */
  photoUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const body = (await req.json()) as StructuredBody;
      if (body.kind !== "structured" || !body.signals) {
        return NextResponse.json(
          { error: "expected {kind:'structured', signals}" },
          { status: 400 }
        );
      }
      const result = scoreAndEnrich({
        id: nanoid(10),
        name: body.name || "User",
        signals: body.signals,
        verdict: "",
        flavor: "",
        modelUsed: "regex-fallback",
        userAge: body.age,
        speciality: body.speciality ?? templateSpecialityFromSignals(body.signals),
        photoUrl: body.photoUrl,
      });
      return respondWithResult(result, "regex-fallback", true);
    }

    // PDF upload path.
    const formData = await req.formData();
    const file = formData.get("pdf");
    const rawAge = formData.get("age");
    const userAge =
      typeof rawAge === "string" && rawAge.trim() !== ""
        ? Math.round(Number(rawAge))
        : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing `pdf` file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF too large (max 10MB)" }, { status: 413 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const text = await pdfToText(buffer);
    if (text.trim().length < 100) {
      return NextResponse.json(
        {
          error:
            "PDF appears empty. Make sure you used LinkedIn's 'Save to PDF' from your profile.",
        },
        { status: 400 }
      );
    }

    const guessedName = guessNameFromPdfText(text);
    const routed = await routeExtraction(text, guessedName);
    const extraction = routed.extraction;

    const result = scoreAndEnrich({
      id: nanoid(10),
      name: extraction.name || guessedName || "Anonymous",
      signals: extraction.signals,
      verdict: extraction.verdict,
      flavor: extraction.flavor,
      modelUsed: routed.tier === "regex-fallback" ? "regex-fallback" : "claude",
      userAge,
      inferredAge: extraction.ageInference.age,
      inferredConfidence: extraction.ageInference.confidence,
      // Speciality from the LLM extraction; falls through to template if empty
      // (e.g. regex-fallback extraction has empty speciality from the prompt).
      speciality: extraction.speciality || templateSpecialityFromSignals(extraction.signals),
    });

    const json = respondWithResult(result, routed.tier, routed.calibrating);
    // Attach ageInference for the inline age-confirm UI.
    const body = await json.json();
    return NextResponse.json({ ...body, ageInference: extraction.ageInference });
  } catch (err) {
    console.error("/api/analyze failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// =============================================================================
// SHARED PIPELINE — score + enrich with v1.0 family/chain/percentile fields.
// =============================================================================

interface ScoreAndEnrichInputs {
  id: string;
  name: string;
  signals: ExtractedSignals;
  verdict: string;
  flavor: string;
  modelUsed: "claude" | "regex-fallback";
  userAge?: number;
  inferredAge?: number;
  inferredConfidence?: number;
  /** From Claude prompt or template fallback. */
  speciality?: string;
  /** From bookmarklet's LinkedIn DOM scrape, mirrored to Vercel Blob. */
  photoUrl?: string;
}

function scoreAndEnrich(input: ScoreAndEnrichInputs): CrackedResultV1 {
  return buildCrackedResult({
    ...input,
    scoringTier: input.modelUsed === "regex-fallback" ? "regex-fallback" : "anthropic-api",
    calibrating: input.modelUsed === "regex-fallback",
  });
}

// =============================================================================
// RESPONSE + KV WRITE
// =============================================================================

function respondWithResult(
  result: CrackedResultV1,
  scoringTier: "mac-claude" | "anthropic-api" | "regex-fallback",
  calibrating: boolean
): NextResponse {
  const encoded = encodeResult(result);

  // Fire-and-forget KV writes — never block the response.
  if (result.league && result.primaryFamily) {
    void appendCellScore(
      result.primaryFamily,
      result.league.league,
      result.signalScore
    );

    // If this user is Olympus-eligible, upsert into the sorted set.
    if (isOlympusEligible(result.tier)) {
      const record = buildOlympusRecord(result);
      if (record) {
        const score = computeOlympusScore({
          tier: result.tier,
          chainCount: record.chainCount,
          cohortPercentile: record.cohortPercentile,
          timestampSeconds: Math.floor(Date.now() / 1000),
        });
        // Defer the import to break a circular reference if it ever forms.
        import("@/lib/kv").then(({ olympusUpsert }) =>
          olympusUpsert(record, score)
        );
      }
    }
  }

  return NextResponse.json({
    id: result.id,
    encoded,
    result,
    shareUrl: `/c/${encoded}`,
    scoringTier,
    calibrating,
  });
}
