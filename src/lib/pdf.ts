// Extract plain text from a LinkedIn "Save to PDF" export.
// Uses `unpdf` (ESM, no native deps, works in Node + edge).

import { extractText, getDocumentProxy } from "unpdf";

export async function pdfToText(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

/**
 * Quick best-effort extraction of the subject's name from a LinkedIn PDF.
 * LinkedIn exports put the name on the first line as the largest text.
 */
export function guessNameFromPdfText(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // First non-empty line is usually the full name. Skip "Contact" / "www.linkedin.com" headers.
  for (const line of lines.slice(0, 10)) {
    if (/^(contact|www\.linkedin|linkedin\.com|page\s+\d)/i.test(line)) continue;
    if (line.length < 2 || line.length > 60) continue;
    // Looks like a person's name: 2-4 capitalized words.
    if (/^[A-Z][\p{L}'.-]+(\s+[A-Z][\p{L}'.-]+){1,3}$/u.test(line)) return line;
  }
  return "Anonymous";
}
