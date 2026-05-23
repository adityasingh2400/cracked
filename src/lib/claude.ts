// Claude integration: extract STRUCTURED signals from raw LinkedIn text,
// plus generate the verdict prose and flavor line.
//
// v1.0 rewrite (per /plan-eng-review Section 2.3):
// - Returns typed fields (schools, companies, awards, …) instead of flat
//   category-tagged text. Achievement matchers (kind-tagged SignalMatcher
//   from src/lib/types.ts) run against this structured shape.
// - Falls back to a regex-based extractor when no Claude tier is reachable.
//   The regex fallback normalizes to the same ExtractedSignals shape so
//   downstream scoring doesn't care which tier produced the result.
//
// Routing across the 3-tier backend (Mac-Claude → Anthropic API → regex)
// lives in src/lib/score-router.ts. This file is the API integration only.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ExtractedSignals } from "./types";

const MODEL = process.env.CRACKED_MODEL || "claude-sonnet-4-5";

// =============================================================================
// STRUCTURED EXTRACTION SCHEMA — what the prompt returns.
// =============================================================================

const SchoolSchema = z.object({
  name: z.string(),
  degree: z.string().optional(),
  gradYear: z.number().int().min(1950).max(2050).optional(),
});

const CompanySchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  tenure: z.tuple([z.number().int(), z.number().int()]).optional(),
});

const AwardSchema = z.object({
  name: z.string(),
  year: z.number().int().min(1950).max(2050).optional(),
});

const PublicationSchema = z.object({
  venue: z.string(),
  role: z.enum(["first", "co", "senior"]).optional(),
});

const FundingSchema = z.object({
  company: z.string(),
  round: z.string(),
  amount: z.number().optional(),
});

const OpenSourceSchema = z.object({
  project: z.string(),
  metric: z.number().optional(),
});

const OnlineSchema = z.object({
  platform: z.string(),
  followers: z.number().optional(),
});

const ExtractedSignalsSchema = z.object({
  schools: z.array(SchoolSchema),
  companies: z.array(CompanySchema),
  awards: z.array(AwardSchema),
  publications: z.array(PublicationSchema),
  funding: z.array(FundingSchema),
  open_source: z.array(OpenSourceSchema),
  online: z.array(OnlineSchema),
  raw_text: z.string(),
});

const AgeInferenceSchema = z.object({
  age: z.number().int().min(0).max(120),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export const ExtractionV1Schema = z.object({
  name: z.string(),
  signals: ExtractedSignalsSchema,
  verdict: z.string(),
  flavor: z.string(),
  ageInference: AgeInferenceSchema,
  /** 2-5 word phrase summarizing the person's specific niche.
   *  Examples: "Frontier AI Researcher", "Pediatric Cardiologist".
   *  Empty string if signals are too thin to identify a niche. */
  speciality: z.string().default(""),
});

export type ExtractionV1Result = z.infer<typeof ExtractionV1Schema>;

// =============================================================================
// PROMPT — structured extraction for v1.0.
// =============================================================================

const SYSTEM_PROMPT_V1 = `You are an OSINT analyst grading how "cracked" someone is from their LinkedIn export.

"Cracked" = hypercompetent, hacker-coded, terminal-online overachiever. Think IMO medalists, YC founders, FAANG ML engineers, Nobel laureates, NBA champions, MacArthur fellows.

Your job: extract STRUCTURED fields from the resume text. Return JSON matching the schema exactly. No prose, no markdown fences.

Schema:
{
  name: string,                         // person's name
  signals: {
    schools:      [{ name, degree?, gradYear? }],
    companies:    [{ name, title?, tenure?: [startYear, endYear] }],
    awards:       [{ name, year? }],     // olympiads, fellowships, scholarships, prizes
    publications: [{ venue, role?: "first" | "co" | "senior" }],
    funding:      [{ company, round, amount? }],  // for founders
    open_source:  [{ project, metric? }],         // metric = stars/users
    online:       [{ platform, followers? }],
    raw_text:     string                 // full resume text, for free-text matchers
  },
  verdict: string,                       // ~30 words, biting-but-fair
  flavor: string,                        // 1 short italic line, <8 words
  ageInference: { age, confidence: 0-1, reasoning: short string }
}

Extraction rules:
- Use the OFFICIAL name when possible: "MIT" not "Massachusetts Institute of Technology" (both work, but MIT canonical).
- Companies: include both the official name AND any common acronyms in name.
- Awards: prefer the canonical award name. "USAMO" not "US Math Olympiad."
- Funding: "round" is the named round ("Seed", "Series A", "Series B", "Series C+"). Amount in USD if mentioned.
- Open source: project = repo name (e.g. "transformers"), metric = star count if mentioned.
- raw_text: include the FULL resume text verbatim (or first 18k chars if truncated).
- Be GENEROUS but EXACT. Don't invent things, don't omit things.

Verdict examples (~30 words):
- "MIT CS + Anthropic + USAMO HM. Stacked but not S-tier yet. Add a YC batch or a viral side project and they're untouchable."
- "Three FAANGs in five years with no founder or olympiad signal. Solid grinder, low taste premium. Top 20%."

Flavor examples (<8 words):
- "Compiled in basements. Shipped at dawn."
- "Quietly accumulating leverage."
- "Reads papers others tweet about."

Age inference:
- Prefer grad years. "BS 2024" + today is mid-2026 → ~24.
- "MBA 2018" → ~32-35. "PhD 2021" + 3-4y work → ~32.
- HS senior today → 17-18.
- Old job history ("VP since 2008") → 40+.
- No signal → age: 0, confidence: 0.
- reasoning: short string shown to user (e.g. "BS 2024 → 25").

SPECIALITY (NEW): a 2-5 word phrase capturing this person's specific niche.
Not a job title alone — a combination that reads true to who they are.
Examples:
- Stanford CS + Anthropic → "Frontier AI Researcher"
- MIT + Jane Street + Putnam → "Quant Trader"
- Harvard Med + Hopkins residency → "Academic Surgeon"
- IMO Gold + MIT freshman → "Olympiad Mathematician"
- YC W23 + Series A founder → "AI Startup Founder"
- Pulitzer + New Yorker → "Investigative Journalist"
- bootcamp + first SWE job → "Junior Engineer"
- no signals at all → "" (empty string, NOT "N/A")
Capitalize each word. No periods. Max 5 words. Use + or & sparingly
when truly bimodal (e.g. "AI Founder + Researcher").

Return ONLY valid JSON matching the schema. No preamble, no fences.`;

// =============================================================================
// CLAUDE PATH — structured extraction via Anthropic API.
// =============================================================================

/**
 * Returns null if Anthropic isn't configured. Caller should fall back to regex.
 * Note: in v1.0, score-router.ts owns the cascade; this is just the API call.
 */
export async function extractWithClaude(
  pdfText: string
): Promise<ExtractionV1Result | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const client = new Anthropic({ apiKey: key });
  const truncated = pdfText.length > 18000 ? pdfText.slice(0, 18000) : pdfText;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT_V1,
      messages: [
        {
          role: "user",
          content: `Today is ${today}. Extract structured cracked-signals from this LinkedIn export. Return JSON matching the schema (name, signals: {schools, companies, awards, publications, funding, open_source, online, raw_text}, verdict, flavor, ageInference):\n\n---\n${truncated}\n---`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    // Strip accidental code fences.
    const cleaned = textBlock.text
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    const json = JSON.parse(cleaned);
    const parsed = ExtractionV1Schema.safeParse(json);
    if (!parsed.success) {
      console.error("Schema mismatch:", parsed.error.format());
      return null;
    }
    // Ensure raw_text is populated even if model forgot.
    if (!parsed.data.signals.raw_text) {
      parsed.data.signals.raw_text = truncated;
    }
    return parsed.data;
  } catch (err) {
    console.error("Claude extraction failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// =============================================================================
// CLAUDE VISION PATH — accepts uploaded images + PDFs directly.
// Each file is converted to a content block; Claude sees them in one message.
// Returns null on any failure so callers can fall back to regex.
// =============================================================================

export type UploadFile = {
  /** Original filename for context — Claude sees it as part of the prompt. */
  name: string;
  /** MIME type. Supported: image/png, image/jpeg, image/webp, image/gif, application/pdf */
  mimeType: string;
  /** Raw base64 (no data: prefix). */
  base64: string;
};

const SUPPORTED_IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export function isSupportedUploadMime(mime: string): boolean {
  return SUPPORTED_IMAGE_MIME.has(mime) || mime === "application/pdf";
}

export type ExtractUploadsResult =
  | { ok: true; data: ExtractionV1Result }
  | { ok: false; reason: "no-key" | "no-files" | "auth" | "schema" | "parse" | "api"; detail?: string };

export async function extractFromUploads(
  files: UploadFile[],
  userName?: string,
  userAge?: number
): Promise<ExtractUploadsResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, reason: "no-key" };
  if (!files || files.length === 0) return { ok: false, reason: "no-files" };

  const client = new Anthropic({ apiKey: key });
  const today = new Date().toISOString().slice(0, 10);

  // Build the content blocks: instruction text + each file as image/document.
  type ContentBlock =
    | { type: "text"; text: string }
    | {
        type: "image";
        source: { type: "base64"; media_type: string; data: string };
      }
    | {
        type: "document";
        source: { type: "base64"; media_type: "application/pdf"; data: string };
      };

  const blocks: ContentBlock[] = [];

  const nameHint = userName ? ` The subject's name is "${userName}".` : "";
  const ageHint = userAge ? ` The subject is approximately ${userAge} years old.` : "";

  blocks.push({
    type: "text",
    text:
      `Today is ${today}.${nameHint}${ageHint}\n` +
      `The following ${files.length} file${files.length === 1 ? "" : "s"} ` +
      `(screenshot${files.length === 1 ? "" : "s"} and/or PDF${files.length === 1 ? "" : "s"}) ` +
      `are the subject's LinkedIn profile, résumé, and related documents. ` +
      `Carefully read EVERYTHING in them: schools, companies, titles, dates, ` +
      `awards, publications, funding rounds, open-source projects, follower counts. ` +
      `Cross-reference if multiple files cover overlapping information.\n\n` +
      `Extract structured cracked-signals matching the schema. Return ONLY JSON: ` +
      `{ name, signals: { schools, companies, awards, publications, funding, ` +
      `open_source, online, raw_text }, verdict, flavor, ageInference, speciality }. ` +
      `The raw_text field should contain a clean summary of everything extracted.`,
  });

  for (const f of files) {
    if (!isSupportedUploadMime(f.mimeType)) continue;
    blocks.push({
      type: "text",
      text: `--- File: ${f.name} ---`,
    });
    if (f.mimeType === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: f.base64 },
      });
    } else {
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: f.mimeType, data: f.base64 },
      });
    }
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT_V1,
      // The SDK's content type accepts these block shapes at runtime; cast to
      // any to satisfy the narrower compile-time union (older SDK type def).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: [{ role: "user", content: blocks as any }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, reason: "parse", detail: "no text block in response" };
    }

    const cleaned = textBlock.text
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    let json: unknown;
    try {
      json = JSON.parse(cleaned);
    } catch (e) {
      return {
        ok: false,
        reason: "parse",
        detail: e instanceof Error ? e.message : "json parse failed",
      };
    }

    const parsed = ExtractionV1Schema.safeParse(json);
    if (!parsed.success) {
      console.error("Vision schema mismatch:", parsed.error.format());
      return {
        ok: false,
        reason: "schema",
        detail: parsed.error.issues[0]?.message || "schema mismatch",
      };
    }
    return { ok: true, data: parsed.data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Claude vision extraction failed:", msg);
    // Detect auth errors specifically so the user gets a clear message.
    if (/401|invalid x-api-key|authentication/i.test(msg)) {
      return { ok: false, reason: "auth", detail: msg };
    }
    return { ok: false, reason: "api", detail: msg };
  }
}

// =============================================================================
// REGEX FALLBACK — works without ANTHROPIC_API_KEY. Crude but normalized.
// Returns the same ExtractedSignals shape so downstream scoring doesn't care.
// =============================================================================

const SCHOOL_HINTS =
  /\b(university|college|school of|institute of technology|polytechnic|academy)\b/i;
const HS_HINT = /\b(high school|prep school|secondary school)\b/i;
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const FANG_HINTS = [
  "google", "meta", "facebook", "amazon", "apple", "microsoft",
  "nvidia", "anthropic", "openai", "deepmind", "stripe", "tesla",
  "netflix", "uber", "airbnb", "doordash", "palantir", "figma", "linear",
];
const ELITE_FINANCE = [
  "goldman sachs", "morgan stanley", "jpmorgan", "j.p. morgan",
  "jane street", "two sigma", "citadel", "hudson river",
  "kkr", "blackstone", "sequoia", "andreessen", "founders fund",
];
const AWARD_HINTS = /\b(imo|ioi|usaco|usamo|putnam|rhodes|marshall|hertz|thiel fellow|y combinator|yc[ws]\d+|forbes 30 under 30|macarthur)\b/i;
const PUBLICATION_HINTS = /\b(neurips|icml|iclr|nature|science|arxiv|cvpr|acl|emnlp|sigcomm)\b/i;
const FUNDING_HINTS = /\b(seed|series [a-d]|raised\s+\$?[\d.]+[mk]?)\b/i;

export function extractWithRegex(
  pdfText: string,
  name: string
): ExtractionV1Result {
  const lines = pdfText.split("\n").map((l) => l.trim()).filter(Boolean);

  const schools: ExtractedSignals["schools"] = [];
  const companies: ExtractedSignals["companies"] = [];
  const awards: ExtractedSignals["awards"] = [];
  const publications: ExtractedSignals["publications"] = [];
  const funding: ExtractedSignals["funding"] = [];
  const open_source: ExtractedSignals["open_source"] = [];
  const online: ExtractedSignals["online"] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const years = [...line.matchAll(YEAR_RE)].map((m) => parseInt(m[0]));

    // Schools
    if (SCHOOL_HINTS.test(line) || HS_HINT.test(line)) {
      const gradYear = years.length > 0 ? Math.max(...years) : undefined;
      schools.push({ name: line.slice(0, 100), gradYear });
    }

    // Companies (look for big-tech / finance brand names)
    for (const brand of [...FANG_HINTS, ...ELITE_FINANCE]) {
      if (lower.includes(brand)) {
        companies.push({ name: brand });
        break;
      }
    }

    // Awards
    if (AWARD_HINTS.test(line)) {
      const m = line.match(AWARD_HINTS);
      if (m) awards.push({ name: m[0], year: years[0] });
    }

    // Publications
    if (PUBLICATION_HINTS.test(line)) {
      const m = line.match(PUBLICATION_HINTS);
      if (m) publications.push({ venue: m[0] });
    }

    // Funding
    if (FUNDING_HINTS.test(lower) && lower.includes("series")) {
      const m = lower.match(/series\s+([a-d])/);
      if (m) funding.push({ company: "unknown", round: `Series ${m[1].toUpperCase()}` });
    }

    // Open source — github.com URLs are a strong hint
    if (lower.includes("github.com/")) {
      const m = line.match(/github\.com\/[a-z0-9_-]+\/([a-z0-9_.-]+)/i);
      if (m) open_source.push({ project: m[1] });
    }

    // Online presence — follower counts
    if (/followers/i.test(line)) {
      const m = line.match(/([\d,]+)\s*followers/i);
      if (m) {
        const followers = parseInt(m[1].replace(/,/g, ""));
        online.push({ platform: "unknown", followers });
      }
    }
  }

  const cleanSignals = {
    schools: dedupBy(schools, (s) => s.name.toLowerCase()),
    companies: dedupBy(companies, (c) => c.name.toLowerCase()),
    awards: dedupBy(awards, (a) => a.name.toLowerCase()),
    publications: dedupBy(publications, (p) => p.venue.toLowerCase()),
    funding,
    open_source: dedupBy(open_source, (o) => o.project.toLowerCase()),
    online,
    raw_text: pdfText.slice(0, 18000),
  };

  return {
    name,
    signals: cleanSignals,
    verdict: "",
    flavor: "",
    ageInference: inferAgeFromText(pdfText),
    speciality: templateSpeciality(cleanSignals),
  };
}

/** Template-based speciality generator for the regex-fallback path.
 *  Picks the most prominent signal types and assembles a generic phrase.
 *  Marked "calibrating" upstream so the card can show it'll refine when
 *  the LLM tier comes back online. */
export function templateSpeciality(s: ExtractedSignals): string {
  const hasFounder =
    s.companies.some((c) => /found|ceo|cto|co-found/i.test(c.title ?? "")) ||
    s.funding.length > 0;
  const hasResearch =
    s.publications.length > 0 ||
    s.awards.some((a) => /imo|ioi|putnam|olympiad/i.test(a.name));
  const hasClinical = s.schools.some((sc) => /med|medicine|nursing/i.test(sc.name + " " + (sc.degree ?? "")));
  const hasLaw = s.schools.some((sc) => /law|jd|juris/i.test(sc.name + " " + (sc.degree ?? "")));
  const hasFinance = s.companies.some((c) =>
    /goldman|morgan|jpmorgan|jane street|two sigma|citadel|kkr|blackstone|sequoia|a16z|founders fund|benchmark/i.test(c.name)
  );
  const hasFANG = s.companies.some((c) =>
    /google|meta|facebook|amazon|apple|microsoft|nvidia|anthropic|openai|deepmind|stripe|tesla/i.test(c.name)
  );
  const hasOpenSource = s.open_source.length > 0;
  const hasCreator = s.online.some((o) => (o.followers ?? 0) > 10_000);

  // Compose the most representative speciality
  if (hasFounder && hasResearch) return "Researcher Founder";
  if (hasFounder && hasFinance) return "Finance Founder";
  if (hasFounder) return "Startup Founder";
  if (hasClinical && hasResearch) return "Physician Scientist";
  if (hasClinical) return "Clinical Practitioner";
  if (hasLaw) return "Legal Practitioner";
  if (hasFinance) return "Finance Professional";
  if (hasResearch && hasFANG) return "AI Researcher";
  if (hasResearch) return "Academic Researcher";
  if (hasFANG && hasOpenSource) return "Open-Source Engineer";
  if (hasFANG) return "Senior Engineer";
  if (hasOpenSource) return "Independent Builder";
  if (hasCreator) return "Online Creator";
  if (s.schools.length > 0) return "Early-Career Builder";
  return "Aspiring Builder";
}

function dedupBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

function inferAgeFromText(text: string): {
  age: number;
  confidence: number;
  reasoning: string;
} {
  const thisYear = new Date().getUTCFullYear();
  const lower = text.toLowerCase();

  const eduLines = lower
    .split("\n")
    .filter((l) =>
      /university|college|school|b\.?s\.?|m\.?s\.?|bachelor|master|ph\.?d|mba|high school/.test(l)
    );

  const years = eduLines
    .flatMap((l) => [...l.matchAll(YEAR_RE)].map((m) => Number(m[0])))
    .filter((y) => y >= 1980 && y <= thisYear + 8);

  if (years.length === 0) {
    return { age: 0, confidence: 0, reasoning: "no clear grad year detected" };
  }

  const latest = Math.max(...years);
  const isHsLine = eduLines.some(
    (l) => /high school|hs\b|secondary/.test(l) && l.includes(String(latest))
  );
  const assumedAgeAtGrad = isHsLine ? 18 : 22;
  const yearsSince = thisYear - latest;
  const age = Math.max(14, Math.min(80, assumedAgeAtGrad + yearsSince));
  return {
    age,
    confidence: 0.4,
    reasoning: `latest grad year ${latest} → ~${age}`,
  };
}
