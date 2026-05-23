// GET /sample redirects to a freshly encoded sample card.

import { NextRequest, NextResponse } from "next/server";
import { encodeResult } from "@/lib/encode";
import { buildCrackedResult } from "@/lib/result-scoring";
import type { ExtractedSignals } from "@/lib/types";

export const runtime = "nodejs";

const PRESETS: Record<string, { name: string; age: number; speciality: string; signals: ExtractedSignals }> = {
  ascended: {
    name: "Aditya — ASCENDED",
    age: 30,
    speciality: "Frontier AI Researcher + Founder",
    signals: {
      schools: [
        { name: "MIT", degree: "BS EECS" },
        { name: "Stanford University", degree: "PhD Computer Science" },
      ],
      companies: [
        { name: "Anthropic", title: "Founding Research Engineer" },
        { name: "OpenAI", title: "Member of Technical Staff" },
      ],
      awards: [{ name: "IMO Gold Medal" }, { name: "MacArthur Fellow" }, { name: "Thiel Fellow" }],
      publications: [{ venue: "NeurIPS", role: "first" }, { venue: "Nature", role: "first" }],
      funding: [{ company: "MyStartup", round: "Series B", amount: 50_000_000 }],
      open_source: [{ project: "flagship", metric: 80_000 }],
      online: [{ platform: "twitter", followers: 50_000 }],
      raw_text: "MIT EECS, Stanford PhD, Anthropic founding engineer, OpenAI MTS, IMO Gold, MacArthur, Thiel, NeurIPS first-author, Nature paper, $50M Series B, 80k stars",
    },
  },
  mythic: {
    name: "Aditya — MYTHIC",
    age: 25,
    speciality: "AI Startup Founder",
    signals: {
      schools: [{ name: "Stanford University", degree: "BS Computer Science" }],
      companies: [{ name: "Anthropic", title: "Member of Technical Staff" }],
      awards: [{ name: "Y Combinator W23" }],
      publications: [],
      funding: [{ company: "MyStartup", round: "Series A", amount: 15_000_000 }],
      open_source: [],
      online: [],
      raw_text: "Stanford CS BS, Anthropic MTS, YC W23 founder, Series A $15M",
    },
  },
  s: {
    name: "Aditya — S",
    age: 24,
    speciality: "Senior AI Engineer",
    signals: {
      schools: [{ name: "Stanford University", degree: "BS Computer Science" }],
      companies: [{ name: "Anthropic", title: "Member of Technical Staff" }],
      awards: [],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "Stanford CS, Anthropic MTS",
    },
  },
  a: {
    name: "Aditya — A",
    age: 24,
    speciality: "Software Engineer",
    signals: {
      schools: [{ name: "Berkeley", degree: "CS" }],
      companies: [{ name: "Stripe", title: "Software Engineer" }],
      awards: [],
      publications: [],
      funding: [],
      open_source: [{ project: "side project", metric: 2_000 }],
      online: [],
      raw_text: "Berkeley CS, Stripe software engineer, 2k GitHub stars",
    },
  },
  b: {
    name: "Aditya — B",
    age: 24,
    speciality: "Startup Engineer",
    signals: {
      schools: [{ name: "University of Washington", degree: "CS" }],
      companies: [{ name: "Series A startup", title: "Software Engineer" }],
      awards: [],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "UW CS, Series A startup software engineer",
    },
  },
  c: {
    name: "Aditya — C",
    age: 24,
    speciality: "Software Engineer",
    signals: {
      schools: [{ name: "State University", degree: "CS" }],
      companies: [{ name: "Regional SaaS", title: "Software Engineer" }],
      awards: [],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "State school CS, regional SaaS software engineer",
    },
  },
  d: {
    name: "Aditya — D",
    age: 24,
    speciality: "Aspiring Builder",
    signals: {
      schools: [],
      companies: [],
      awards: [],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "bootcamp grad, self-taught",
    },
  },
};

export async function GET(req: NextRequest) {
  const tierParam = (req.nextUrl.searchParams.get("tier") || "mythic").toLowerCase();
  const preset = PRESETS[tierParam] ?? PRESETS.mythic;

  const result = buildCrackedResult({
    id: `sample-${tierParam}`,
    name: preset.name,
    signals: preset.signals,
    modelUsed: "regex-fallback",
    userAge: preset.age,
    speciality: preset.speciality,
    scoringTier: "regex-fallback",
    calibrating: false,
  });

  const encoded = encodeResult(result);
  return NextResponse.redirect(new URL(`/c/${encoded}`, req.url));
}
