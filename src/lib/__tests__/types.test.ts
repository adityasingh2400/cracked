// Foundation tests for v1.0 type system: tier ordering, comparators,
// max-tier reduction. These are pure unit tests against the canonical
// TIER_RANK so the whole 7-tier ladder stays internally consistent.

import { describe, expect, it } from "vitest";
import { TIER_RANK, compareTiers, maxTier, ALL_FAMILIES } from "@/lib/types";
import type { Tier } from "@/lib/types";

describe("TIER_RANK", () => {
  it("has all 7 tier values", () => {
    const tiers: Tier[] = ["D", "C", "B", "A", "S", "MYTHIC", "ASCENDED"];
    for (const t of tiers) {
      expect(TIER_RANK[t]).toBeTypeOf("number");
    }
  });

  it("ranks tiers in correct order: D < C < B < A < S < MYTHIC < ASCENDED", () => {
    expect(TIER_RANK.D).toBe(0);
    expect(TIER_RANK.C).toBe(1);
    expect(TIER_RANK.B).toBe(2);
    expect(TIER_RANK.A).toBe(3);
    expect(TIER_RANK.S).toBe(4);
    expect(TIER_RANK.MYTHIC).toBe(5);
    expect(TIER_RANK.ASCENDED).toBe(6);
  });

  it("each adjacent pair differs by exactly 1", () => {
    expect(TIER_RANK.C - TIER_RANK.D).toBe(1);
    expect(TIER_RANK.B - TIER_RANK.C).toBe(1);
    expect(TIER_RANK.A - TIER_RANK.B).toBe(1);
    expect(TIER_RANK.S - TIER_RANK.A).toBe(1);
    expect(TIER_RANK.MYTHIC - TIER_RANK.S).toBe(1);
    expect(TIER_RANK.ASCENDED - TIER_RANK.MYTHIC).toBe(1);
  });
});

describe("compareTiers", () => {
  it("returns negative when first is lower", () => {
    expect(compareTiers("D", "S")).toBeLessThan(0);
    expect(compareTiers("S", "MYTHIC")).toBeLessThan(0);
    expect(compareTiers("MYTHIC", "ASCENDED")).toBeLessThan(0);
  });

  it("returns positive when first is higher", () => {
    expect(compareTiers("ASCENDED", "MYTHIC")).toBeGreaterThan(0);
    expect(compareTiers("S", "A")).toBeGreaterThan(0);
    expect(compareTiers("D", "D")).toBe(0);
  });

  it("returns 0 for equal tiers", () => {
    expect(compareTiers("S", "S")).toBe(0);
    expect(compareTiers("ASCENDED", "ASCENDED")).toBe(0);
  });
});

describe("maxTier", () => {
  it("returns the highest of multiple tiers", () => {
    expect(maxTier("D", "B", "S")).toBe("S");
    expect(maxTier("MYTHIC", "S", "ASCENDED")).toBe("ASCENDED");
    expect(maxTier("D")).toBe("D");
  });

  it("defaults to D for empty input", () => {
    expect(maxTier()).toBe("D");
  });

  it("handles duplicates", () => {
    expect(maxTier("S", "S", "S")).toBe("S");
  });
});

describe("ALL_FAMILIES", () => {
  it("contains exactly 9 family keys", () => {
    expect(ALL_FAMILIES).toHaveLength(9);
  });

  it("has no duplicates", () => {
    expect(new Set(ALL_FAMILIES).size).toBe(9);
  });

  it("contains the canonical 9 family slugs", () => {
    expect(ALL_FAMILIES).toContain("engineering");
    expect(ALL_FAMILIES).toContain("science_academia");
    expect(ALL_FAMILIES).toContain("founder");
    expect(ALL_FAMILIES).toContain("finance");
    expect(ALL_FAMILIES).toContain("consulting_corporate");
    expect(ALL_FAMILIES).toContain("law_public_service");
    expect(ALL_FAMILIES).toContain("medicine");
    expect(ALL_FAMILIES).toContain("athletics_performance");
    expect(ALL_FAMILIES).toContain("creative_audience");
  });
});
