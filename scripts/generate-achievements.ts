// scripts/generate-achievements.ts
//
// Orchestrator for the 18-parallel-research-subagent pass that populates
// src/data/achievements/{family}.ts. Per /plan-eng-review Section 1.4:
//   2 agents per family (one for achievements, one for chains)
//   × 9 families = 18 agents total
//   run 4-wide via Claude Code's Agent tool
//
// This script writes the per-family draft JSON files. The Agent-tool dispatch
// itself is meant to be invoked from within Claude Code (you, the user, run
// this script during a focused Claude Code session and Claude will call the
// Agent tool 18 times in batches of 4).
//
// For the v1.0 launch baseline, this file also contains the per-family
// prompt template that each subagent receives. Output is validated against
// the Achievement / Chain shapes in src/lib/types.ts.

import { ALL_FAMILIES, type Family } from "@/lib/types";
import * as path from "node:path";
import * as fs from "node:fs/promises";

const TIER_TARGETS: Record<string, number> = {
  ASCENDED: 10, // 5-15 per family
  MYTHIC: 10,
  S: 25,
  A: 20,
  B: 15,
  C: 10,
  D: 5,
};

const CHAIN_TARGET = 20; // 15-25 per family

const DRAFTS_DIR = path.join(process.cwd(), "src/data/achievements");

// =============================================================================
// PROMPT TEMPLATES — per /plan-eng-review Section 1.4 Generation Pipeline.
// =============================================================================

export function achievementPrompt(family: Family): string {
  const familyDescription = FAMILY_DESCRIPTIONS[family];
  return `You are researching independent Achievements that qualify someone as cracked in the ${family.toUpperCase()} family of cracked.com.

${familyDescription}

For each tier in ASCENDED, MYTHIC, S, A, B, C, D — return Achievements that on their own (no chaining) put a person at that tier.

Tier targets:
  ASCENDED (the 0.001%, lifetime-defining): ${TIER_TARGETS.ASCENDED} entries
  MYTHIC (the 0.1%, career-defining):       ${TIER_TARGETS.MYTHIC} entries
  S (the 1%, obviously cracked):             ${TIER_TARGETS.S} entries
  A (climbers' ceiling):                     ${TIER_TARGETS.A} entries
  B (the climbers):                          ${TIER_TARGETS.B} entries
  C (the believers):                         ${TIER_TARGETS.C} entries
  D (the long tail):                         ${TIER_TARGETS.D} entries

For each, return JSON matching the Achievement schema in src/lib/types.ts:
{
  "id": "${family.slice(0, 3)}_<kebab-case-slug>",     // unique stable
  "family": "${family}",
  "tier": "ASCENDED" | "MYTHIC" | "S" | "A" | "B" | "C" | "D",
  "label": "Human-readable name",
  "description": "1-sentence explanation",
  "signals": [SignalMatcher[]],   // ALL must hit for this Achievement to match
  "ageCap": null | number,          // some only count under age N (e.g. Thiel ≤22)
  "evidence": ["example person 1", "example person 2", "example person 3"]
}

SignalMatcher schema (8 kinds):
  { kind: "school",      match: string[],  regex?: RegExp[] }
  { kind: "company",     match: string[],  title?: string[] }
  { kind: "award",       match: string[]   }
  { kind: "publication", venue: string[],  role?: "first" | "co" | "senior" }
  { kind: "funding",     round?: string,   minAmount?: number }
  { kind: "online",      platform?: string, minFollowers?: number }
  { kind: "open_source", project?: string[], minMetric?: number }
  { kind: "free_text",   patterns: RegExp[] }

Rules:
- IDs MUST be globally unique. Use namespace prefix matching the family.
- Every Achievement needs ≥1 SignalMatcher.
- Age caps only for programs with explicit cutoffs (Thiel ≤22, Rhodes ≤24, Marshall ≤25, IMO ≤19, ISEF HS-only, Davidson ≤18, Knight-Hennessy BA within ~5y, Schwarzman <29, Forbes 30U30 ≤29).
- ≥3 evidence examples per Achievement (real public people).
- MYTHIC and ASCENDED need magnitude language in description ("lifetime", "once-in-decade", "top of profession", "rare", or equivalent).

Return JSON array. No prose. No markdown fences.`;
}

export function chainPrompt(family: Family): string {
  const familyDescription = FAMILY_DESCRIPTIONS[family];
  return `You are researching named CHAINS in the ${family.toUpperCase()} family of cracked.com. A CHAIN is a combo of Achievements that, when stacked, qualify someone for a higher tier than any single member.

${familyDescription}

Target: ${CHAIN_TARGET} chains for this family.

For each chain, return JSON matching the Chain schema in src/lib/types.ts:
{
  "id": "${family.slice(0, 3)}_<chain-slug>",   // unique
  "name": "The Memorable Name",                  // internal label, e.g. "The Classic Pipeline"
  "family": "${family}",
  "requires": [achievement_id_1, achievement_id_2, ...],  // 2-5 IDs, ALL required
  "bumpTo": "S" | "MYTHIC" | "ASCENDED",         // tier this chain unlocks
  "description": "1-sentence why this combo qualifies"
}

Rules:
- Reference Achievement IDs from the parallel achievement-pass on the same family (which runs before this).
- 2-5 required Achievements per chain.
- Name chains memorably ("The Sand Hill", "The Quant Pipeline", "The Recruited", etc.) — internal labels, used in the card banner.
- bumpTo is usually one tier above the highest single Achievement in the chain.

Return JSON array. No prose. No markdown fences.`;
}

const FAMILY_DESCRIPTIONS: Record<Family, string> = {
  engineering:
    "Engineers, AI researchers shipping product, quants on the floor, infra wizards, FAANG L+, indie hackers. Measured by shipped systems, PRs merged, models trained.",
  science_academia:
    "PhDs, professors, olympiad medalists (IMO/IOI/IPhO/USAMO), lab researchers, named scholars (Rhodes/Marshall/Hertz), time at Anthropic/OpenAI/DeepMind/Broad/Whitehead.",
  founder:
    "Startup operators, indie hackers, exited founders. YC batches, Thiel Fellows, exits, unicorns. From 'has an LLC' to 'has carry that funds three generations.'",
  finance:
    "Bankers, hedge fund traders, VCs, PE professionals, allocators. Goldman TMT, Jane Street, Sequoia, KKR. Measured by deal size, fund size, IRR, carry.",
  consulting_corporate:
    "MBB consultants, F500 climbers, strategists, COO/CFO track. Partner-track velocity, elite-MBA stamps, org-chart altitude.",
  law_public_service:
    "BigLaw partners, federal judges, SCOTUS clerks, NSC Directors, Senators, military officers, ambassadors. Influence by confirmation or service.",
  medicine:
    "Doctors, surgeons, biotech founders, clinical researchers. Hopkins neurosurg, MGH residency, FDA-approved drugs. Match Day is the IPO.",
  athletics_performance:
    "Pro athletes, Olympic medalists, dancers, classical soloists, musicians. Grand Slams, Met Opera, ABT, Curtis, Juilliard. You medaled or you didn't.",
  creative_audience:
    "Writers, designers, creators, brand founders, influencers. Pulitzer, AIGA Medal, Pritzker, MrBeast-scale audiences, Glossier/Fenty/Telfar consumer brands.",
};

// =============================================================================
// DISPATCH — invoke from a Claude Code session.
// =============================================================================
//
// Inside Claude Code, run this script. It writes per-family draft JSON files
// (achievements-{family}.draft.json). Then for each family, dispatch a
// research subagent with the achievement prompt + the chain prompt.
//
// Recommended pattern (you, the human, drive this):
//   1. bun run scripts/generate-achievements.ts          # generates draft skeletons
//   2. In Claude Code, ask: "Research achievements for {family} using the
//      prompt in generate-achievements.ts. Return JSON array."
//   3. Paste the JSON into achievements-{family}.draft.json.
//   4. Hand-review, then commit as src/data/achievements/{family}.ts.

export async function generateDraftSkeletons(): Promise<void> {
  await fs.mkdir(DRAFTS_DIR, { recursive: true });

  for (const family of ALL_FAMILIES) {
    const draftPath = path.join(DRAFTS_DIR, `${family}.draft.json`);
    const exists = await fs
      .stat(draftPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      console.log(`skip: ${family} draft exists`);
      continue;
    }
    const skeleton = {
      family,
      generated_at: new Date().toISOString(),
      tier_targets: TIER_TARGETS,
      chain_target: CHAIN_TARGET,
      achievement_prompt: achievementPrompt(family),
      chain_prompt: chainPrompt(family),
      achievements: [],
      chains: [],
    };
    await fs.writeFile(draftPath, JSON.stringify(skeleton, null, 2));
    console.log(`wrote ${draftPath}`);
  }

  console.log("\nNext steps:");
  console.log("  1. In a Claude Code session, run: 'Read scripts/generate-achievements.ts");
  console.log("     then dispatch 9 parallel research subagents (4-wide), one per family,");
  console.log("     using the achievement_prompt from each draft file. Update the JSON");
  console.log("     achievements array with the result.'");
  console.log("  2. Then dispatch 9 more subagents for chains (chain_prompt) once");
  console.log("     achievements are in place.");
  console.log("  3. Hand-review each draft file.");
  console.log("  4. Convert to TypeScript: src/data/achievements/{family}.ts");
}

// Run on `bun run scripts/generate-achievements.ts`
if (typeof require !== "undefined" && require.main === module) {
  generateDraftSkeletons().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
