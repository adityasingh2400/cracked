// GET /api/olympus — top-100 Mount Olympus board.
//
// Reads the Redis sorted set via ZREVRANGE + MGET (O(log N + 100)).
// Silent degradation: empty list when KV unavailable.

import { NextResponse } from "next/server";
import { olympusTop } from "@/lib/kv";

export const runtime = "edge";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
};

export async function GET() {
  try {
    const records = await olympusTop(100);
    return NextResponse.json(
      {
        entries: records.map((r, i) => ({
          rank: i + 1,
          tier: r.tier,
          family: r.primaryFamily,
          cohort: r.cohort,
          maskedName: r.maskedName,
          headlineChain: r.headlineChain,
          when: r.when,
        })),
      },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch (err) {
    console.error("api/olympus error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ entries: [] }, { status: 200, headers: CACHE_HEADERS });
  }
}
