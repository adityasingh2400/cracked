// POST /api/analyze
// Body: multipart/form-data with `pdf` file (LinkedIn "Save to PDF" export)
// Returns: { id, encoded, result }

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { pdfToText, guessNameFromPdfText } from "@/lib/pdf";
import { extractWithClaude, extractWithRegex } from "@/lib/claude";
import { scoreSignals } from "@/lib/score";
import { encodeResult } from "@/lib/encode";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf");

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
        { error: "PDF appears empty. Make sure you used LinkedIn's 'Save to PDF' from your profile." },
        { status: 400 }
      );
    }

    const guessedName = guessNameFromPdfText(text);
    let modelUsed: "claude" | "regex-fallback" = "regex-fallback";
    let extraction = await extractWithClaude(text);
    if (extraction) {
      modelUsed = "claude";
    } else {
      extraction = extractWithRegex(text, guessedName);
    }

    const id = nanoid(10);
    const name = extraction.name || guessedName || "Anonymous";

    const result = scoreSignals({
      id,
      name,
      signals: extraction.signals,
      verdict: extraction.verdict,
      flavor: extraction.flavor,
      modelUsed,
    });

    const encoded = encodeResult(result);

    return NextResponse.json({ id, encoded, result });
  } catch (err) {
    console.error("/api/analyze failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
