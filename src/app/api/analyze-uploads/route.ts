// POST /api/analyze-uploads - multi-file vision intake.
//
// Accepts multipart/form-data with:
//   • files[] - 1..N image (png/jpeg/webp/gif) or PDF files
//   • name   - optional user-provided name
//   • age    - optional user-provided age (int)
//   • profilePhoto - optional headshot image rendered on the card
//
// Pipeline:
//   1. Validate file count / size / MIME
//   2. Base64-encode and call extractFromUploads (Claude Vision)
//   3. Fall back to a thin synthetic extraction if vision returns null
//   4. Run the same scoreAndEnrich logic /api/analyze and /sample share
//   5. Encode result → redirect-style { encoded, shareUrl }

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  extractFromUploads,
  isSupportedUploadMime,
  templateSpeciality,
  type UploadFile,
} from "@/lib/claude";
import {
  extractViaLocalClaude,
  isLocalClaudeAvailable,
} from "@/lib/local-claude";
import { persistShareResult, sharePath } from "@/lib/share-store";
import { buildCrackedResult } from "@/lib/result-scoring";
import type { CrackedResultV1, ExtractedSignals } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Limits - keep total payload bounded for the API call.
const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB each
const MAX_TOTAL_SIZE = 32 * 1024 * 1024; // 32 MB total
const MAX_PROFILE_PHOTO_SIZE = 4 * 1024 * 1024; // 4 MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const rawName = form.get("name");
    const rawAge = form.get("age");
    const rawProfilePhoto = form.get("profilePhoto");

    const name = typeof rawName === "string" ? rawName.trim() : "";
    const userAge =
      typeof rawAge === "string" && rawAge.trim() !== ""
        ? Math.round(Number(rawAge))
        : undefined;
    const photoUrl =
      rawProfilePhoto instanceof File
        ? await profilePhotoUrl(rawProfilePhoto)
        : undefined;

    // Collect files (both "files" and "files[]" for browser FormData quirks).
    const fileEntries: File[] = [];
    for (const [k, v] of form.entries()) {
      if ((k === "files" || k === "files[]") && v instanceof File) {
        fileEntries.push(v);
      }
    }

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Upload at least one screenshot or PDF." },
        { status: 400 }
      );
    }
    if (fileEntries.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Max ${MAX_FILES}.` },
        { status: 400 }
      );
    }

    // Validate and convert.
    let totalSize = 0;
    const uploads: UploadFile[] = [];
    for (const f of fileEntries) {
      if (!isSupportedUploadMime(f.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${f.name} (${f.type})` },
          { status: 400 }
        );
      }
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${f.name} (max 8MB)` },
          { status: 413 }
        );
      }
      totalSize += f.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json(
          { error: "Total upload size exceeds 32MB." },
          { status: 413 }
        );
      }
      const buf = Buffer.from(await f.arrayBuffer());
      uploads.push({
        name: f.name,
        mimeType: f.type,
        base64: buf.toString("base64"),
      });
    }

    // Dev convenience: snapshot the request so we can replay or dry-run.
    // GET /api/analyze-uploads/last returns the saved payload (dev only).
    if (process.env.NODE_ENV !== "production") {
      await saveLastUpload({ name, age: userAge, uploads }).catch(() => {});
    }

    // Vision extract - two-tier cascade.
    //   1. Local `claude -p` CLI (no API key needed, uses keychain auth).
    //      Tried first in dev because both pasted API keys are 401.
    //   2. Remote Anthropic API via SDK.
    let ext = await tryLocalCli(uploads, name, userAge);
    if (!ext.ok) {
      const remote = await extractFromUploads(uploads, name, userAge);
      // Prefer the remote result if it's ok; else keep the more-specific local error.
      if (remote.ok) ext = remote;
    }
    if (!ext.ok) {
      const msg = (() => {
        switch (ext.reason) {
          case "no-key":
            return "Server is missing ANTHROPIC_API_KEY. Add a working key to .env.local and restart the dev server.";
          case "auth":
            return "Anthropic API key is invalid or rejected (401). Get a fresh key at console.anthropic.com/settings/keys and put it in .env.local.";
          case "schema":
            return `Claude returned something the schema didn't accept: ${ext.detail}. Try fewer or clearer files.`;
          case "parse":
            return `Claude's response wasn't valid JSON: ${ext.detail}. Try again.`;
          case "api":
            return `Anthropic API error: ${ext.detail}.`;
          case "no-files":
            return "No files were provided.";
        }
      })();
      const status = ext.reason === "auth" || ext.reason === "no-key" ? 503 : 422;
      return NextResponse.json({ error: msg, reason: ext.reason }, { status });
    }
    const extraction = ext.data;

    // Score + enrich. Same logic /api/analyze and /sample share.
    const result = scoreAndEnrich({
      id: nanoid(10),
      name: extraction.name || name || "Anonymous",
      signals: extraction.signals,
      userAge,
      inferredAge: extraction.ageInference.age,
      inferredConfidence: extraction.ageInference.confidence,
      speciality:
        extraction.speciality || templateSpeciality(extraction.signals),
      verdict: extraction.verdict,
      flavor: extraction.flavor,
      bestAccolades: normalizeBestAccolades(extraction.bestAccolades),
      photoUrl,
    });

    await persistShareResult(result);
    const shareUrl = new URL(sharePath(result), req.url).toString();
    return NextResponse.json({
      ok: true,
      encoded: result.id,
      shareUrl,
      result,
      scoringTier: "anthropic-api",
    });
  } catch (err) {
    console.error("/api/analyze-uploads failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// =============================================================================
// LAST-UPLOAD SNAPSHOT - dev-only persistence so failed uploads are replayable.
// =============================================================================

const LAST_UPLOAD_DIR = join(tmpdir(), "cracked-last-upload");

interface SavedPayload {
  name: string;
  age?: number;
  uploads: UploadFile[];
}

async function saveLastUpload(payload: SavedPayload): Promise<void> {
  await mkdir(LAST_UPLOAD_DIR, { recursive: true });
  // Clear previous snapshot.
  for (const entry of await readdir(LAST_UPLOAD_DIR).catch(() => [] as string[])) {
    if (entry !== "manifest.json") {
      await writeFile(join(LAST_UPLOAD_DIR, entry), Buffer.alloc(0)).catch(() => {});
    }
  }
  const manifest = {
    savedAt: new Date().toISOString(),
    name: payload.name,
    age: payload.age,
    files: payload.uploads.map((u, i) => ({
      index: i,
      filename: u.name,
      mimeType: u.mimeType,
      sizeBytes: Buffer.from(u.base64, "base64").length,
    })),
  };
  await writeFile(join(LAST_UPLOAD_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  for (let i = 0; i < payload.uploads.length; i++) {
    const u = payload.uploads[i];
    const ext =
      u.mimeType === "application/pdf" ? "pdf"
      : u.mimeType === "image/png" ? "png"
      : u.mimeType === "image/webp" ? "webp"
      : u.mimeType === "image/gif" ? "gif"
      : "jpg";
    await writeFile(join(LAST_UPLOAD_DIR, `file-${i}.${ext}`), Buffer.from(u.base64, "base64"));
  }
}

// =============================================================================
// LOCAL CLI EXTRACTION - only tried if the `claude` binary is reachable.
// =============================================================================

async function tryLocalCli(
  uploads: UploadFile[],
  name: string,
  userAge: number | undefined
) {
  // Skip entirely if disabled by env (e.g. production) or CLI not present.
  if (process.env.DISABLE_LOCAL_CLAUDE === "1") {
    return { ok: false as const, reason: "no-key" as const };
  }
  const available = await isLocalClaudeAvailable();
  if (!available) return { ok: false as const, reason: "no-key" as const };
  return extractViaLocalClaude(uploads, name || undefined, userAge);
}

// =============================================================================
// SCORING - same flow as /sample/route.ts so the card looks consistent.
// =============================================================================

interface ScoreInputs {
  id: string;
  name: string;
  signals: ExtractedSignals;
  userAge?: number;
  inferredAge?: number;
  inferredConfidence?: number;
  speciality?: string;
  verdict?: string;
  flavor?: string;
  bestAccolades?: CrackedResultV1["bestAccolades"];
  photoUrl?: string;
}

function scoreAndEnrich(input: ScoreInputs): CrackedResultV1 {
  return buildCrackedResult({
    id: input.id,
    name: input.name,
    signals: input.signals,
    verdict: input.verdict,
    flavor: input.flavor,
    modelUsed: "claude",
    userAge: input.userAge,
    inferredAge: input.inferredAge,
    inferredConfidence: input.inferredConfidence,
    speciality: input.speciality,
    bestAccolades: input.bestAccolades,
    photoUrl: input.photoUrl,
    scoringTier: "anthropic-api",
    calibrating: false,
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

async function profilePhotoUrl(file: File): Promise<string | undefined> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    throw new Error("Profile picture must be PNG, JPG, or WEBP.");
  }
  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error("Profile picture is too large (max 4MB).");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { put } = await import("@vercel/blob");
      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const uploaded = await put(`profile-${Date.now()}-${nanoid(6)}.${ext}`, buffer, {
        access: "public",
        contentType: file.type,
        token: blobToken,
      });
      return uploaded.url;
    } catch (err) {
      console.error("profile photo blob upload failed:", err instanceof Error ? err.message : err);
    }
  }

  // Dev fallback: store under public instead of embedding base64 in the share URL.
  // Embedded data URLs can make /c/<encoded> exceed browser/proxy header limits.
  if (process.env.NODE_ENV !== "production") {
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const dir = join(process.cwd(), "public", "generated");
    await mkdir(dir, { recursive: true });
    const filename = `profile-${Date.now()}-${nanoid(6)}.${ext}`;
    await writeFile(join(dir, filename), buffer);
    return `/generated/${filename}`;
  }

  return undefined;
}
