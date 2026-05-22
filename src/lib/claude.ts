// Claude integration: extract structured cracked-signals from raw LinkedIn text,
// plus generate the verdict prose and flavor line.
//
// Falls back to a regex-based extractor when ANTHROPIC_API_KEY is not set.

import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedSignal, CategoryKey } from "./types";
import { z } from "zod";

const MODEL = process.env.CRACKED_MODEL || "claude-sonnet-4-5";

const SignalSchema = z.object({
  category: z.enum(["education", "work", "accolades", "founder", "openSource", "signal"]),
  raw: z.string(),
  detail: z.string().optional(),
});

const AgeInferenceSchema = z.object({
  /** Best-guess current age in years. Use 0 if there's truly nothing to infer from. */
  age: z.number().int().min(0).max(120),
  /** 0-1 confidence in the inference. */
  confidence: z.number().min(0).max(1),
  /**
   * Short, transparent reasoning the UI shows next to the inferred age so the
   * user can sanity-check or correct. E.g. "BS 2022 → ~25" or "HS senior 2025 → ~18".
   */
  reasoning: z.string(),
});

const ExtractionSchema = z.object({
  name: z.string(),
  signals: z.array(SignalSchema),
  verdict: z.string(),
  flavor: z.string(),
  ageInference: AgeInferenceSchema,
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;

const SYSTEM_PROMPT = `You are an OSINT analyst grading how "cracked" someone is from their LinkedIn export.

"Cracked" = hypercompetent, hacker-coded, terminal-online overachiever. Think IMO medalists, YC founders, FAANG ML engineers, hackathon grand-prize winners, Thiel fellows, top-tier quant traders, viral builders.

Your job: extract STRUCTURED signals from the resume text into 6 categories:
- education: schools, degrees, honors-within-education (dean's list, etc.)
- work: jobs with company + role (especially impressive companies, ML/AI/quant/founding roles)
- accolades: Olympiads, fellowships, scholarships, named awards, hackathon wins, publications, conference talks, prestigious recognition
- founder: founded companies, accelerator participation (YC, Founders Inc, Neo, Thiel, Z Fellows), funding raised, exits
- openSource: notable GitHub projects, OSS contributions, popular packages
- signal: online presence (followers, talks, blog), academic publications, viral output

For each signal, output:
- raw: the exact entity name (e.g., "MIT", "Anthropic", "USAMO Honorable Mention", "TreeHacks 2023 Grand Prize")
- detail: optional context (role title, year, prize amount, etc.) — keep short
- category: one of the 6 keys above

Be GENEROUS in extraction — extract everything that COULD be cracked. The scoring engine filters.

After extracting signals, write:
- verdict: ~30 words, biting-but-fair. Mention specific signals. No corporate platitudes.
- flavor: ONE short italic-feeling sentence under 8 words. Cracked-coded, slightly mysterious.

Examples of good verdicts:
- "MIT CS + Anthropic + USAMO Honorable Mention. Stacked but not S-tier yet. Add a YC batch or a viral side project and they're untouchable."
- "Three FAANGs in five years with no founder or olympiad signal. Solid grinder, low taste premium. Top 20%."

Examples of good flavors:
- "Compiled in basements. Shipped at dawn."
- "Quietly accumulating leverage."
- "Reads papers others tweet about."
- "Two hackathons from inevitable."

Then ALSO infer the subject's current age. The site grades people relative
to their age cohort ("Leagues") so this is load-bearing — the user will be
shown your inference and asked to confirm or edit.

Method:
- Prefer concrete grad years: "BS Computer Science, 2024" → if today is mid-2026, they're ~24.
- "Expected graduation 2027" undergrad → ~20.
- "MBA 2018" → likely ~32-35 (MBA median start ~28).
- "PhD 2021" + 3-4 years work → ~32.
- If only HS info: senior in HS today → 17-18.
- If older job history (e.g. "VP since 2008"), use that as a lower bound (~40+).
- If truly no signal, return age: 0 and confidence: 0.

Output ageInference: { age: integer 0-120, confidence: 0-1, reasoning: short string }
The reasoning is shown to the user (e.g. "BS 2024 → 25", "HS class of 2026 → 17").
Keep it under 12 words.

Return ONLY valid JSON matching the schema. No markdown fences, no preamble.`;

/**
 * Returns null if Anthropic isn't configured. Caller should fall back to regex extractor.
 */
export async function extractWithClaude(
  pdfText: string
): Promise<ExtractionResult | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const client = new Anthropic({ apiKey: key });

  const truncated = pdfText.length > 18000 ? pdfText.slice(0, 18000) : pdfText;

  const today = new Date().toISOString().slice(0, 10);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Today is ${today}. Extract cracked-signals from this LinkedIn export. Return JSON matching the schema (name, signals[], verdict, flavor, ageInference):\n\n---\n${truncated}\n---`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  let json: unknown;
  try {
    // Strip any accidental code fences.
    const cleaned = textBlock.text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    json = JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Claude response as JSON:", textBlock.text.slice(0, 200));
    return null;
  }

  const parsed = ExtractionSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Schema mismatch:", parsed.error.format());
    return null;
  }
  return parsed.data;
}

// =============================================================================
// REGEX FALLBACK — works without ANTHROPIC_API_KEY. Crude but functional.
// =============================================================================

// Keywords that suggest each category. We scan line-by-line.
const FALLBACK_HINTS: Record<CategoryKey, string[]> = {
  education: ["university", "college", "school of", "bachelor", "master", "ph.d", "phd", "b.s.", "m.s.", "b.tech", "m.tech"],
  work: ["engineer", "intern", "founder", "ceo", "cto", "researcher", "scientist", "analyst", "manager", "developer", "designer"],
  accolades: ["olympiad", "scholar", "fellow", "award", "prize", "winner", "honor", "medal", "champion", "finalist", "imo", "ioi", "usaco", "putnam", "rhodes", "forbes"],
  founder: ["founder", "co-founder", "y combinator", "thiel fellow", "raised", "acquired", "exit", "seed round"],
  openSource: ["github.com", "open source", "open-source", "contributor", "maintainer"],
  signal: ["followers", "speaker", "keynote", "published", "arxiv", "neurips", "icml", "iclr"],
};

export function extractWithRegex(pdfText: string, name: string): ExtractionResult {
  const lines = pdfText.split("\n").map((l) => l.trim()).filter(Boolean);
  const signals: ExtractedSignal[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const [cat, hints] of Object.entries(FALLBACK_HINTS) as [CategoryKey, string[]][]) {
      if (hints.some((h) => lower.includes(h))) {
        // Snip to ~140 chars per signal to keep matching efficient
        const trimmed = line.length > 140 ? line.slice(0, 140) : line;
        signals.push({ category: cat, raw: trimmed });
        break; // first matching category wins; resume isn't long enough for multi-cat lines
      }
    }
  }

  // De-duplicate by lowercase substring (rough)
  const seen = new Set<string>();
  const deduped = signals.filter((s) => {
    const k = `${s.category}:${s.raw.toLowerCase().slice(0, 80)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    name,
    signals: deduped,
    verdict: "", // let the scoring engine fill a default
    flavor: "",
    ageInference: inferAgeFromText(pdfText),
  };
}

/**
 * Crude grad-year heuristic for the regex fallback. Looks for the latest
 * 4-digit year that's plausibly an education end-date and assumes BS at 22.
 * Returns confidence 0 if nothing reasonable shows up.
 */
function inferAgeFromText(text: string): {
  age: number;
  confidence: number;
  reasoning: string;
} {
  const thisYear = new Date().getUTCFullYear();
  const lower = text.toLowerCase();

  // Grad years near education-ish keywords.
  const eduLines = lower
    .split("\n")
    .filter((l) =>
      /university|college|school|b\.?s\.?|m\.?s\.?|bachelor|master|ph\.?d|mba|high school/.test(
        l
      )
    );
  const years = eduLines
    .flatMap((l) => Array.from(l.matchAll(/(19|20)\d{2}/g)).map((m) => Number(m[0])))
    .filter((y) => y >= 1980 && y <= thisYear + 8);
  if (years.length === 0) {
    return { age: 0, confidence: 0, reasoning: "no clear grad year detected" };
  }
  // Use the latest plausible end-of-education year.
  const latest = Math.max(...years);
  const isHsLine = eduLines.some(
    (l) => /high school|hs\b|secondary/.test(l) && l.includes(String(latest))
  );
  // BS typically graduates at ~22; HS at ~18; treat MS as +2 above BS.
  const assumedAgeAtGrad = isHsLine ? 18 : 22;
  const yearsSince = thisYear - latest;
  const age = Math.max(14, Math.min(80, assumedAgeAtGrad + yearsSince));
  return {
    age,
    confidence: 0.4,
    reasoning: `latest grad year ${latest} → ~${age}`,
  };
}
