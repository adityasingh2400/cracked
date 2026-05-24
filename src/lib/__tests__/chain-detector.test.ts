// Tests for the chain detection algorithm - load-bearing v1.0 math.
// Per /plan-eng-review test plan: 100% coverage required on src/lib/score
// chain detection.

import { describe, expect, it } from "vitest";
import {
  achievementMatches,
  detectChainsForFamily,
  matchSignal,
  scoreAllFamilies,
  scoreFamily,
} from "@/lib/chain-detector";
import type {
  Achievement,
  Chain,
  ExtractedSignals,
  SignalMatcher,
} from "@/lib/types";

// =============================================================================
// FIXTURES
// =============================================================================

const emptySignals: ExtractedSignals = {
  schools: [],
  companies: [],
  awards: [],
  publications: [],
  funding: [],
  open_source: [],
  online: [],
  raw_text: "",
};

const stanfordEngSignals: ExtractedSignals = {
  schools: [{ name: "Stanford University", degree: "BS Computer Science", gradYear: 2023 }],
  companies: [{ name: "Anthropic", title: "Member of Technical Staff" }],
  awards: [],
  publications: [],
  funding: [],
  open_source: [],
  online: [],
  raw_text: "Stanford CS BS 2023, Anthropic MTS",
};

const ycFounderSignals: ExtractedSignals = {
  schools: [{ name: "MIT", degree: "BS EECS" }],
  companies: [{ name: "MyStartup", title: "Founder & CEO" }],
  awards: [{ name: "Y Combinator W23" }],
  publications: [],
  funding: [{ company: "MyStartup", round: "Series A", amount: 15_000_000 }],
  open_source: [],
  online: [],
  raw_text: "MIT EECS, YC W23 founder, raised $15M Series A",
};

// =============================================================================
// matchSignal - 8 SignalMatcher kinds
// =============================================================================

describe("matchSignal", () => {
  it("school: any match string hits", () => {
    const m: SignalMatcher = { kind: "school", match: ["Stanford"] };
    expect(matchSignal(m, stanfordEngSignals)).toBe(true);
    expect(matchSignal(m, ycFounderSignals)).toBe(false);
  });

  it("school: regex variant", () => {
    const m: SignalMatcher = {
      kind: "school",
      match: [],
      regex: [/^Stanford/i],
    };
    expect(matchSignal(m, stanfordEngSignals)).toBe(true);
  });

  it("company: matches when title constraint passes", () => {
    const m: SignalMatcher = {
      kind: "company",
      match: ["Anthropic"],
      title: ["Member of Technical Staff"],
    };
    expect(matchSignal(m, stanfordEngSignals)).toBe(true);
  });

  it("company: rejects when title constraint fails", () => {
    const m: SignalMatcher = {
      kind: "company",
      match: ["Anthropic"],
      title: ["VP of Engineering"],
    };
    expect(matchSignal(m, stanfordEngSignals)).toBe(false);
  });

  it("award: matches", () => {
    const m: SignalMatcher = { kind: "award", match: ["Y Combinator"] };
    expect(matchSignal(m, ycFounderSignals)).toBe(true);
    expect(matchSignal(m, stanfordEngSignals)).toBe(false);
  });

  it("funding: round + minAmount constraints", () => {
    const m: SignalMatcher = {
      kind: "funding",
      round: "Series A",
      minAmount: 10_000_000,
    };
    expect(matchSignal(m, ycFounderSignals)).toBe(true);
    const tooSmall: SignalMatcher = {
      kind: "funding",
      round: "Series A",
      minAmount: 50_000_000,
    };
    expect(matchSignal(tooSmall, ycFounderSignals)).toBe(false);
  });

  it("free_text: regex against raw_text", () => {
    const m: SignalMatcher = {
      kind: "free_text",
      patterns: [/yc\s*w23/i],
    };
    expect(matchSignal(m, ycFounderSignals)).toBe(true);
    expect(matchSignal(m, stanfordEngSignals)).toBe(false);
  });

  it("empty signals never match", () => {
    const m: SignalMatcher = { kind: "school", match: ["Anything"] };
    expect(matchSignal(m, emptySignals)).toBe(false);
  });
});

// =============================================================================
// achievementMatches - AND semantics + ageCap
// =============================================================================

describe("achievementMatches", () => {
  const stanfordAnthropic: Achievement = {
    id: "eng_stanford_anthropic",
    family: "engineering",
    tier: "S",
    label: "Stanford CS + Anthropic",
    description: "Top CS school + frontier lab.",
    signals: [
      { kind: "school", match: ["Stanford"] },
      { kind: "company", match: ["Anthropic"] },
    ],
  };

  it("AND-combines all matchers - both must hit", () => {
    expect(achievementMatches(stanfordAnthropic, stanfordEngSignals)).toBe(true);
    expect(achievementMatches(stanfordAnthropic, ycFounderSignals)).toBe(false);
  });

  it("ageCap blocks when over the cap", () => {
    const thielFellow: Achievement = {
      id: "founder_thiel",
      family: "founder",
      tier: "MYTHIC",
      label: "Thiel Fellow",
      description: "≤22 only.",
      signals: [{ kind: "award", match: ["Thiel Fellow"] }],
      ageCap: 22,
    };
    const signals: ExtractedSignals = {
      ...emptySignals,
      awards: [{ name: "Thiel Fellow" }],
    };
    expect(achievementMatches(thielFellow, signals, 21)).toBe(true);
    expect(achievementMatches(thielFellow, signals, 25)).toBe(false);
    expect(achievementMatches(thielFellow, signals)).toBe(true); // no age = unknown, allow
  });
});

// =============================================================================
// detectChainsForFamily - chain.requires intersection + max bumpTo
// =============================================================================

describe("detectChainsForFamily", () => {
  const sandHill: Chain = {
    id: "founder_sand_hill",
    name: "The Sand Hill",
    family: "founder",
    requires: ["eng_stanford", "founder_yc", "founder_series_a"],
    bumpTo: "ASCENDED",
    description: "Stanford + YC + Series A - the classic pipeline.",
  };
  const mythicChain: Chain = {
    id: "founder_mythic_combo",
    name: "Mythic Combo",
    family: "founder",
    requires: ["eng_stanford", "founder_yc"],
    bumpTo: "MYTHIC",
    description: "stripped chain.",
  };

  it("activates when all required IDs are matched", () => {
    const matched = new Set(["eng_stanford", "founder_yc", "founder_series_a"]);
    const result = detectChainsForFamily(matched, [sandHill, mythicChain]);
    expect(result.activeChains).toContain("founder_sand_hill");
    expect(result.activeChains).toContain("founder_mythic_combo");
    expect(result.chainTier).toBe("ASCENDED"); // max of MYTHIC + ASCENDED
  });

  it("does not activate when any required ID missing", () => {
    const matched = new Set(["eng_stanford", "founder_yc"]);
    const result = detectChainsForFamily(matched, [sandHill]);
    expect(result.activeChains).toHaveLength(0);
    expect(result.chainTier).toBe("D");
  });

  it("stale requires (deleted achievement id) silently skips", () => {
    const staleChain: Chain = {
      id: "founder_stale",
      name: "Stale",
      family: "founder",
      requires: ["nonexistent_id"],
      bumpTo: "MYTHIC",
      description: "references a removed achievement.",
    };
    const matched = new Set(["eng_stanford"]);
    const result = detectChainsForFamily(matched, [staleChain]);
    expect(result.activeChains).toHaveLength(0);
  });

  it("empty chain library returns D", () => {
    const matched = new Set(["eng_stanford"]);
    const result = detectChainsForFamily(matched, []);
    expect(result.activeChains).toHaveLength(0);
    expect(result.chainTier).toBe("D");
  });

  it("empty requires array does not activate", () => {
    const emptyChain: Chain = {
      id: "empty",
      name: "Empty",
      family: "founder",
      requires: [],
      bumpTo: "MYTHIC",
      description: "broken chain.",
    };
    const matched = new Set(["eng_stanford"]);
    const result = detectChainsForFamily(matched, [emptyChain]);
    expect(result.activeChains).toHaveLength(0);
  });
});

// =============================================================================
// scoreFamily - base + chain → final tier
// =============================================================================

describe("scoreFamily", () => {
  const ach1: Achievement = {
    id: "eng_stanford",
    family: "engineering",
    tier: "S",
    label: "Stanford CS",
    description: "",
    signals: [{ kind: "school", match: ["Stanford"] }],
  };
  const ach2: Achievement = {
    id: "founder_yc",
    family: "founder",
    tier: "A",
    label: "YC batch",
    description: "",
    signals: [{ kind: "award", match: ["Y Combinator"] }],
  };
  const ach3: Achievement = {
    id: "founder_series_a",
    family: "founder",
    tier: "A",
    label: "Series A founder",
    description: "",
    signals: [{ kind: "funding", round: "Series A", minAmount: 10_000_000 }],
  };
  const chain: Chain = {
    id: "founder_sand_hill",
    name: "The Sand Hill",
    family: "founder",
    requires: ["eng_stanford", "founder_yc", "founder_series_a"],
    bumpTo: "ASCENDED",
    description: "",
  };

  it("base tier from highest standalone Achievement; chain bumps higher (cross-family chain via scoreAllFamilies)", () => {
    const ycFounder: ExtractedSignals = {
      schools: [{ name: "Stanford University" }],
      companies: [],
      awards: [{ name: "Y Combinator W23" }],
      publications: [],
      funding: [{ company: "X", round: "Series A", amount: 15_000_000 }],
      open_source: [],
      online: [],
      raw_text: "",
    };
    // Use scoreAllFamilies because the chain crosses family boundaries
    // (founder chain requires eng_stanford from Engineering family).
    const result = scoreAllFamilies({
      signals: ycFounder,
      library: { achievements: [ach1, ach2, ach3], chains: [chain] },
    });
    const founderScore = result.families.find((f) => f.family === "founder")!;
    expect(founderScore.baseTier).toBe("A");
    expect(founderScore.chainTier).toBe("ASCENDED");
    expect(founderScore.finalTier).toBe("ASCENDED");
    expect(founderScore.matched).toContain("founder_yc");
    expect(founderScore.matched).toContain("founder_series_a");
    expect(founderScore.activeChains).toContain("founder_sand_hill");
  });

  it("scoreFamily standalone (no globalMatchedIds) only sees same-family achievements", () => {
    const signals: ExtractedSignals = {
      schools: [{ name: "Stanford University" }],
      companies: [],
      awards: [{ name: "Y Combinator W23" }],
      publications: [],
      funding: [{ company: "X", round: "Series A", amount: 15_000_000 }],
      open_source: [],
      online: [],
      raw_text: "",
    };
    const score = scoreFamily({
      signals,
      library: { achievements: [ach1, ach2, ach3], chains: [chain] },
      family: "founder",
    });
    // Standalone mode: cross-family chain requires fail, so chainTier stays D.
    expect(score.chainTier).toBe("D");
    // But same-family achievements still match.
    expect(score.matched).toContain("founder_yc");
    expect(score.matched).toContain("founder_series_a");
  });

  it("returns D when no Achievements match", () => {
    const score = scoreFamily({
      signals: emptySignals,
      library: { achievements: [ach1, ach2, ach3], chains: [chain] },
      family: "founder",
    });
    expect(score.baseTier).toBe("D");
    expect(score.finalTier).toBe("D");
    expect(score.matched).toHaveLength(0);
  });
});

// =============================================================================
// scoreAllFamilies - picks primary + secondary
// =============================================================================

describe("scoreAllFamilies", () => {
  const stanfordCS: Achievement = {
    id: "eng_stanford",
    family: "engineering",
    tier: "S",
    label: "Stanford CS",
    description: "",
    signals: [{ kind: "school", match: ["Stanford"] }],
  };
  const ycA: Achievement = {
    id: "founder_yc",
    family: "founder",
    tier: "A",
    label: "YC batch",
    description: "",
    signals: [{ kind: "award", match: ["Y Combinator"] }],
  };

  it("picks the family with highest finalTier as primary", () => {
    const signals: ExtractedSignals = {
      schools: [{ name: "Stanford University" }],
      companies: [],
      awards: [{ name: "Y Combinator" }],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "",
    };
    const result = scoreAllFamilies({
      signals,
      library: { achievements: [stanfordCS, ycA], chains: [] },
    });
    expect(result.primaryFamily).toBe("engineering");
    expect(result.secondaryFamily).toBe("founder");
    expect(result.families).toHaveLength(9);
  });

  it("returns D for all families when no signals match", () => {
    const result = scoreAllFamilies({
      signals: emptySignals,
      library: { achievements: [stanfordCS, ycA], chains: [] },
    });
    expect(result.families.every((f) => f.finalTier === "D")).toBe(true);
    expect(result.families.every((f) => f.tierStars === undefined)).toBe(true);
    // secondaryFamily should be undefined when no family has matched achievements
    expect(result.secondaryFamily).toBeUndefined();
  });

  it("assigns crowns only for A and S tiers", () => {
    const sTier: Achievement = {
      id: "eng_s_tier",
      family: "engineering",
      tier: "S",
      label: "Frontier lab",
      description: "",
      signals: [{ kind: "company", match: ["OpenAI"] }],
    };
    const bTier: Achievement = {
      id: "eng_b_tier",
      family: "engineering",
      tier: "B",
      label: "Solid eng school",
      description: "",
      signals: [{ kind: "school", match: ["Berkeley"] }],
    };
    const signals: ExtractedSignals = {
      schools: [{ name: "Berkeley" }],
      companies: [{ name: "OpenAI", title: "Research Scientist" }],
      awards: [],
      publications: [],
      funding: [],
      open_source: [],
      online: [],
      raw_text: "",
    };
    const result = scoreAllFamilies({
      signals,
      library: { achievements: [sTier, bTier], chains: [] },
    });
    const eng = result.families.find((f) => f.family === "engineering");
    expect(eng?.finalTier).toBe("S");
    expect(eng?.tierStars).toBeGreaterThanOrEqual(1);
    const creative = result.families.find((f) => f.family === "creative_audience");
    expect(creative?.finalTier).toBe("D");
    expect(creative?.tierStars).toBeUndefined();
  });
});
