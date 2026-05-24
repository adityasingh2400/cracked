// POST /api/analyze - v1.0 scoring endpoint.
//
// Two input shapes:
//   • multipart/form-data with `pdf` file (LinkedIn "Save to PDF" export)
//   • JSON {kind:"structured", name, signals, source} (extension/paste)
//   • JSON {kind:"text", text, name?, age?, source?} (LinkedIn console extract)
//
// Returns: { id, encoded, result: CrackedResultV1, shareUrl, scoringTier, calibrating }
//
// Pipeline:
//   1. Extract signals (3-tier router: Mac-Claude → API → regex)
//   2. Run achievement scoring for per-family tier + chains + A/S crown rank
//   4. Pick primaryFamily (highest finalTier) + secondaryFamily (runner-up)
//   5. Compute 3-percentile trio against synthetic cell distributions
//   6. Encode → share URL
//   8. Fire-and-forget KV writes (cell empirical distribution)

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pdfToText, guessNameFromPdfText } from "@/lib/pdf";
import { templateSpeciality as templateSpecialityFromSignals } from "@/lib/claude";
import { persistShareResult, sharePath } from "@/lib/share-store";
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

interface TextBody {
  kind: "text";
  text: string;
  name?: string;
  source?: "linkedin-console" | "paste";
  age?: number;
  /** User-uploaded profile picture encoded by the client for pasted text flow. */
  photoUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const body = (await req.json()) as StructuredBody | TextBody;

      if (body.kind === "text") {
        const text = normalizePastedProfileText(body.text);
        if (text.length < 100) {
          return NextResponse.json(
            { error: "Paste looks too short. Paste the LinkedIn extractor JSON or profile text." },
            { status: 400 }
          );
        }

        const guessedName = body.name?.trim() || guessNameFromPdfText(text) || "Anonymous";
        const routed = await routeExtraction(text, guessedName);
        const extraction = routed.extraction;
        const result = scoreAndEnrich({
          id: nanoid(10),
          name: extraction.name || guessedName,
          signals: extraction.signals,
          verdict: extraction.verdict,
          flavor: extraction.flavor,
          modelUsed: routed.tier === "regex-fallback" ? "regex-fallback" : "claude",
          userAge: body.age,
          inferredAge: extraction.ageInference.age,
          inferredConfidence: extraction.ageInference.confidence,
          speciality: extraction.speciality || templateSpecialityFromSignals(extraction.signals),
          bestAccolades: normalizeBestAccolades(extraction.bestAccolades),
          photoUrl: await normalizePhotoUrl(body.photoUrl),
        });

        const json = respondWithResult(result, routed.tier, routed.calibrating);
        const responseBody = await json.json();
        return NextResponse.json({ ...responseBody, ageInference: extraction.ageInference });
      }

      if (body.kind !== "structured" || !body.signals) {
        return NextResponse.json(
          { error: "expected {kind:'structured', signals} or {kind:'text', text}" },
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
        photoUrl: await normalizePhotoUrl(body.photoUrl),
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

function normalizePastedProfileText(input: string): string {
  const raw = String(input || "").trim();
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as unknown;
    const extracted = extractTextFromLinkedInPayload(parsed);
    if (extracted.trim().length > 0) return extracted;
  } catch {
    // Plain text paste path.
  }

  return raw;
}

function extractTextFromLinkedInPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const obj = payload as Record<string, unknown>;
  const parts: string[] = [];

  const push = (value: unknown) => {
    if (typeof value === "string" && value.trim()) parts.push(value.trim());
  };

  push(obj.combinedText);

  const combined = obj.combined as Record<string, unknown> | undefined;
  push(combined?.text);

  const current = obj.current as Record<string, unknown> | undefined;
  push(current?.text);

  const currentLoadedPage = obj.currentLoadedPage as Record<string, unknown> | undefined;
  push(currentLoadedPage?.mainText);
  push(currentLoadedPage?.bodyText);

  const profile = obj.profile as Record<string, unknown> | undefined;
  push(profile?.mainText);
  push(profile?.bodyText);

  const pages = Array.isArray(obj.pages)
    ? obj.pages
    : Array.isArray(obj.fetchedPages)
      ? obj.fetchedPages
      : [];

  for (const page of pages) {
    if (!page || typeof page !== "object") continue;
    const p = page as Record<string, unknown>;
    push(p.text);
    push(p.mainText);
    push(p.bodyText);
  }

  return parts.join("\n\n");
}

function validShareablePhotoUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length < 2_000 &&
    (/^https:\/\/.+/i.test(value) || /^\/generated\/[A-Za-z0-9_.-]+$/.test(value))
  );
}

async function normalizePhotoUrl(value: unknown): Promise<string | undefined> {
  if (validShareablePhotoUrl(value)) return value;
  if (typeof value !== "string") return undefined;

  const match = value.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || value.length > 6_000_000) return undefined;

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { put } = await import("@vercel/blob");
      const ext = contentType.split("/")[1].replace("jpeg", "jpg");
      const uploaded = await put(`profile-${Date.now()}-${nanoid(6)}.${ext}`, buffer, {
        access: "public",
        contentType,
        token: blobToken,
      });
      return uploaded.url;
    } catch (err) {
      console.error("profile photo blob upload failed:", err instanceof Error ? err.message : err);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const ext = contentType.split("/")[1].replace("jpeg", "jpg");
    const dir = join(process.cwd(), "public", "generated");
    await mkdir(dir, { recursive: true });
    const filename = `profile-${Date.now()}-${nanoid(6)}.${ext}`;
    await writeFile(join(dir, filename), buffer);
    return `/generated/${filename}`;
  }

  return undefined;
}

// =============================================================================
// SHARED PIPELINE - score + enrich with v1.0 family/chain/percentile fields.
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
  bestAccolades?: CrackedResultV1["bestAccolades"];
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

function normalizeBestAccolades(
  accolades: CrackedResultV1["bestAccolades"] | undefined
): CrackedResultV1["bestAccolades"] | undefined {
  if (!accolades?.length) return undefined;
  return accolades
    .filter((item) => item.title.trim().length > 0)
    .map((item) => ({
      title: item.title.trim().slice(0, 42),
      detail: item.detail?.trim().slice(0, 90),
      family: item.family,
    }))
    .slice(0, 6);
}

// =============================================================================
// RESPONSE + KV WRITE
// =============================================================================

function respondWithResult(
  result: CrackedResultV1,
  scoringTier: "mac-claude" | "anthropic-api" | "regex-fallback",
  calibrating: boolean
): NextResponse {
  void persistShareResult(result);

  // Fire-and-forget KV writes - never block the response.
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
    encoded: result.id,
    result,
    shareUrl: sharePath(result),
    scoringTier,
    calibrating,
  });
}
