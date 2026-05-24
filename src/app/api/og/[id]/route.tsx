// GET /api/og/[id] - Open Graph image renderer.
//
// Per /plan-eng-review Section 1.1: Twitter/X/LinkedIn/iMessage scrapers fetch
// this URL when someone shares a /c/<data> card link. Returns image/png at
// 1200x630 rendered via next/og (Satori under the hood).
//
// Fallback path: if Satori chokes on weird input, return a generic
// cracked-logo PNG so the share never looks completely broken.

import { ImageResponse } from "next/og";
import { StaticCard } from "@/components/StaticCard";
import { resolveShareResult } from "@/lib/share-store";
import type { Family, Tier, PercentileTrio, CrackedResultV1 } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

// nodejs runtime because decodeResult uses node:zlib (gzip).
// next/og supports both edge and nodejs; nodejs lets us reuse the existing
// share-URL encoding pipeline without rewriting it for the edge runtime.
//
// NOTE: `size` and `contentType` are NOT valid exports for arbitrary route
// handlers - they're only meaningful in the `opengraph-image.tsx` file
// convention. We pass width/height directly to ImageResponse instead.
export const runtime = "nodejs";

// Fallback PNG when rendering fails - just the cracked.com brand.
function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #1C0A05 0%, #0A0402 100%)",
          color: "#FCD34D",
          fontFamily: "monospace",
          fontSize: 72,
          letterSpacing: "0.04em",
        }}
      >
        how cracked are you?
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return fallbackImage();

    // The /c/[data] route's [data] is the base64 share blob. /api/og/[id] takes
    // the same string. Decode and render.
    let result: CrackedResultV1 | null = null;
    try {
      result = (await resolveShareResult(id)) as CrackedResultV1 | null;
    } catch {
      return fallbackImage();
    }
    if (!result) return fallbackImage();

    // Pull v1.0 fields with safe defaults for legacy (v0.7) share URLs.
    const family: Family =
      result.primaryFamily ?? Object.keys(FAMILIES_META)[0] as Family;
    const tier: Tier = result.tier ?? "C";
    const name = result.name || "User";
    const percentiles: PercentileTrio = result.percentiles ?? {
      withinFamilyCohort: 50,
      crossFamilyCohort: 50,
      global: 50,
    };

    return new ImageResponse(
      (
        <StaticCard
          name={name}
          tier={tier}
          tierStars={result.tierStars}
          family={family}
          percentiles={percentiles}
          signalScore={result.signalScore ?? 50}
          headlineChain={result.families?.find((f) => f.family === family)?.activeChains[0]}
          calibrating={result.calibrating ?? false}
        />
      ),
      {
        width: 1200,
        height: 630,
        // Cache aggressively at the CDN.
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }
    );
  } catch (err) {
    console.error("api/og render failed:", err instanceof Error ? err.message : err);
    return fallbackImage();
  }
}
