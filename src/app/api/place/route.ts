// POST /api/place
// Body: JSON { encoded: string, age: number }
// Returns: { encoded, result } — the original result, re-placed in the league
//          that matches the corrected age. Used by the "edit age" affordance
//          on the result card so we don't re-run PDF extraction.

import { NextRequest, NextResponse } from "next/server";
import { decodeResult, encodeResult } from "@/lib/encode";
import { placeInLeague } from "@/lib/leagues";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { encoded?: string; age?: number };
    const encoded = body.encoded;
    const age = Math.round(Number(body.age));

    if (!encoded || typeof encoded !== "string") {
      return NextResponse.json({ error: "Missing `encoded`" }, { status: 400 });
    }
    if (!Number.isFinite(age) || age < 8 || age > 100) {
      return NextResponse.json({ error: "Age must be 8-100" }, { status: 400 });
    }

    const result = decodeResult(encoded);
    if (!result) {
      return NextResponse.json({ error: "Invalid encoded result" }, { status: 400 });
    }

    const league = placeInLeague({
      total: result.total,
      age,
      ageSource: "user",
      ageConfidence: 1,
    });

    const updated = { ...result, league };
    const newEncoded = encodeResult(updated);
    return NextResponse.json({ encoded: newEncoded, result: updated });
  } catch (err) {
    console.error("/api/place failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
