// POST /api/telemetry - selector telemetry for the bookmarklet.
//
// Per /plan-eng-review Section 2.4: always returns 204 No Content. Body is
// fire-and-forget. Logs failures server-side; never blocks the user flow.
//
// Privacy: NO profile data, NO IPs. Only field-category counts so we can
// detect LinkedIn DOM rotations within hours (parsed_field count dropping
// sharply == selectors broke).

import { NextRequest, NextResponse } from "next/server";
import { recordTelemetry } from "@/lib/kv";

export const runtime = "edge";

interface TelemetryBody {
  fieldCounts: Record<string, number>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TelemetryBody;
    if (
      body &&
      typeof body.fieldCounts === "object" &&
      body.fieldCounts !== null
    ) {
      // Sanity-cap: each count integer in [0, 999], total keys ≤ 20.
      const sanitized: Record<string, number> = {};
      let keyCount = 0;
      for (const [k, v] of Object.entries(body.fieldCounts)) {
        if (keyCount >= 20) break;
        if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1000) {
          // Slug the key to prevent injection.
          const safeKey = String(k).replace(/[^a-z0-9_-]/gi, "").slice(0, 30);
          if (safeKey) {
            sanitized[safeKey] = Math.floor(v);
            keyCount++;
          }
        }
      }
      await recordTelemetry(sanitized);
    }
  } catch (err) {
    // Silent - log but don't propagate.
    console.error("api/telemetry error:", err instanceof Error ? err.message : err);
  }
  // Always 204, regardless of internal success/failure.
  return new NextResponse(null, { status: 204 });
}

// CORS preflight for the bookmarklet (runs on linkedin.com, posts cross-origin).
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
