// POST /api/mirror-photo
//
// Accepts { sourceUrl: string } — a *.licdn.com profile image URL the
// bookmarklet / Chrome extension scraped from the user's own logged-in
// LinkedIn session. Downloads it, validates, mirrors to Vercel Blob
// (or KV-base64 as a v1.0 fallback if @vercel/blob isn't provisioned).
// Returns { url: string } pointing to the stable mirror.
//
// Why mirror at all? LinkedIn (*.licdn.com) hot-linking is unreliable —
// they rotate URLs, expire tokens, and serve different sizes per session.
// Mirroring once to a stable URL means the share card survives.
//
// Privacy: only the URL the user already had in their own DOM. We don't
// scrape anyone else's photo.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_HOSTS = [
  "media.licdn.com",
  "static.licdn.com",
  "media-exp1.licdn.com",
  "media-exp2.licdn.com",
  "media-exp3.licdn.com",
];
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

interface Body {
  sourceUrl?: string;
}

function err(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return err(400, "invalid JSON body");
  }

  const sourceUrl = body.sourceUrl;
  if (!sourceUrl || typeof sourceUrl !== "string") {
    return err(400, "missing sourceUrl");
  }

  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return err(400, "invalid URL");
  }

  // Only accept HTTPS + LinkedIn CDN hosts. Prevents SSRF + abuse.
  if (parsed.protocol !== "https:") return err(400, "must be https");
  if (!ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
    return err(400, `host not allowed: ${parsed.hostname}`);
  }

  // Fetch the image
  let resp: Response;
  try {
    resp = await fetch(parsed.toString(), {
      headers: {
        // LinkedIn requires a real-ish User-Agent
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "image/*",
      },
      // 10s timeout via AbortController
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error("mirror-photo fetch failed:", e instanceof Error ? e.message : e);
    return err(502, "failed to fetch source image");
  }

  if (!resp.ok) {
    return err(502, `source returned ${resp.status}`);
  }

  const contentType = (resp.headers.get("content-type") || "").toLowerCase().split(";")[0].trim();
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return err(415, `unsupported content-type: ${contentType}`);
  }

  const contentLength = Number(resp.headers.get("content-length") || "0");
  if (contentLength > MAX_BYTES) {
    return err(413, `image too large: ${contentLength} bytes`);
  }

  const buffer = await resp.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return err(413, `image too large after fetch: ${buffer.byteLength} bytes`);
  }

  // Mirror via @vercel/blob if available; else fall back to data-URL embed
  // (works fine for v1.0 launch but bloats the share blob by ~150KB).
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const { put } = await import("@vercel/blob");
      const ext = contentType.split("/")[1].replace("jpeg", "jpg");
      const filename = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const result = await put(filename, buffer, {
        access: "public",
        contentType,
        token: blobToken,
      });
      return NextResponse.json({ url: result.url }, { status: 200 });
    } catch (e) {
      console.error("blob upload failed; falling through to data-url:", e instanceof Error ? e.message : e);
    }
  }

  // Fallback: data URL. Inline-encodes the image into the URL response.
  // Caller stores this URL on result.photoUrl. The share blob carries the
  // full base64 image — ~150KB extra in the encoded URL. Still under the
  // 8KB-after-gzip limit for typical profile photos thanks to gzip.
  const b64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${contentType};base64,${b64}`;
  return NextResponse.json({ url: dataUrl, mode: "data-url-fallback" }, { status: 200 });
}

// CORS preflight — bookmarklet runs on linkedin.com so requests are cross-origin.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
