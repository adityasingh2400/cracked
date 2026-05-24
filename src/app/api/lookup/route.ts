// GET /api/lookup - Chrome extension browse-mode + bookmarklet tier lookup.
//
// Per /plan-eng-review Section 4.1 (batched) + Section 2.4 (silent degradation):
//
//   GET /api/lookup?profile_url=...            → single profile
//   GET /api/lookup?urls=url1,url2,url3        → batched MGET (max 50)
//
// Always returns 200. On KV down / malformed input / any internal error:
// returns `{found: false}` or `{results: {}}` - never propagates 5xx to client.
// Browse-mode badges silently disappear when the index is unavailable.

import { NextRequest, NextResponse } from "next/server";
import { getLookup, batchGetLookup } from "@/lib/kv";

export const runtime = "edge";

const MAX_BATCH = 50;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const single = searchParams.get("profile_url");
  const batch = searchParams.get("urls");

  try {
    // Batched form takes precedence - Chrome extension uses this.
    if (batch) {
      const urls = batch
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)
        .slice(0, MAX_BATCH);
      const results = await batchGetLookup(urls);
      // Normalize to {url: {...}} or {url: null}
      return NextResponse.json(
        { results },
        { status: 200, headers: CACHE_HEADERS }
      );
    }

    if (single) {
      const entry = await getLookup(single);
      if (!entry) {
        return NextResponse.json(
          { found: false },
          { status: 200, headers: CACHE_HEADERS }
        );
      }
      return NextResponse.json(
        { found: true, entry },
        { status: 200, headers: CACHE_HEADERS }
      );
    }

    // No params → empty success (per silent-degradation contract).
    return NextResponse.json(
      { found: false },
      { status: 200, headers: CACHE_HEADERS }
    );
  } catch (err) {
    console.error("api/lookup error:", err instanceof Error ? err.message : err);
    // Silent degradation: still 200.
    return NextResponse.json(
      { found: false, results: {} },
      { status: 200, headers: CACHE_HEADERS }
    );
  }
}
