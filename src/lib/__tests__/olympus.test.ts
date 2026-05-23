// Tests for the Mount Olympus ranking algorithm.
// Per /plan-eng-review test plan: 100% coverage required on src/lib/olympus.
// Critical invariant: every ASCENDED entry must outrank every MYTHIC entry.

import { describe, expect, it } from "vitest";
import {
  computeOlympusScore,
  isOlympusEligible,
  maskName,
  tierIndex,
  buildOlympusRecord,
  OLYMPUS_CAPACITY,
  OLYMPUS_THRESHOLD,
} from "@/lib/olympus";

describe("isOlympusEligible", () => {
  it("MYTHIC and ASCENDED are eligible", () => {
    expect(isOlympusEligible("MYTHIC")).toBe(true);
    expect(isOlympusEligible("ASCENDED")).toBe(true);
  });

  it("S and below are not eligible", () => {
    expect(isOlympusEligible("S")).toBe(false);
    expect(isOlympusEligible("A")).toBe(false);
    expect(isOlympusEligible("B")).toBe(false);
    expect(isOlympusEligible("C")).toBe(false);
    expect(isOlympusEligible("D")).toBe(false);
  });

  it("OLYMPUS_THRESHOLD exposes the same set", () => {
    expect(OLYMPUS_THRESHOLD).toEqual(["MYTHIC", "ASCENDED"]);
  });

  it("OLYMPUS_CAPACITY is 100", () => {
    expect(OLYMPUS_CAPACITY).toBe(100);
  });
});

describe("tierIndex", () => {
  it("ASCENDED=2, MYTHIC=1", () => {
    expect(tierIndex("ASCENDED")).toBe(2);
    expect(tierIndex("MYTHIC")).toBe(1);
  });

  it("S-and-below return -1 (undefined-by-design)", () => {
    expect(tierIndex("S")).toBe(-1);
    expect(tierIndex("D")).toBe(-1);
  });
});

describe("computeOlympusScore — invariants", () => {
  it("ASCENDED with no chains and 0 cohort_percentile still outranks MYTHIC with max chains and 100 cohort_percentile", () => {
    const ascendedMin = computeOlympusScore({
      tier: "ASCENDED",
      chainCount: 0,
      cohortPercentile: 0,
      timestampSeconds: 0,
    });
    const mythicMax = computeOlympusScore({
      tier: "MYTHIC",
      chainCount: 15, // capped
      cohortPercentile: 100,
      timestampSeconds: 9999999999, // far-future recency bump
    });
    expect(ascendedMin).toBeGreaterThan(mythicMax);
  });

  it("chain_count contribution is capped at 15 * 50 = 750 (< 1000 tier delta)", () => {
    const noChains = computeOlympusScore({
      tier: "ASCENDED",
      chainCount: 0,
      cohortPercentile: 0,
      timestampSeconds: 0,
    });
    const manyChains = computeOlympusScore({
      tier: "ASCENDED",
      chainCount: 100, // way over cap
      cohortPercentile: 0,
      timestampSeconds: 0,
    });
    const diff = manyChains - noChains;
    expect(diff).toBeLessThanOrEqual(750); // 15 * 50 cap
  });

  it("higher cohort_percentile → higher score within same tier", () => {
    const lowPct = computeOlympusScore({
      tier: "MYTHIC",
      chainCount: 5,
      cohortPercentile: 20,
      timestampSeconds: 1000,
    });
    const highPct = computeOlympusScore({
      tier: "MYTHIC",
      chainCount: 5,
      cohortPercentile: 90,
      timestampSeconds: 1000,
    });
    expect(highPct).toBeGreaterThan(lowPct);
  });

  it("newer timestamp wins ties (recency adjustment)", () => {
    const older = computeOlympusScore({
      tier: "MYTHIC",
      chainCount: 3,
      cohortPercentile: 50,
      timestampSeconds: 1_700_000_000,
    });
    const newer = computeOlympusScore({
      tier: "MYTHIC",
      chainCount: 3,
      cohortPercentile: 50,
      timestampSeconds: 1_700_000_500,
    });
    expect(newer).toBeGreaterThan(older);
    // Recency delta should not push within-tier scores past the next tier's floor
    expect(newer - older).toBeLessThan(1);
  });

  it("throws on ineligible tier", () => {
    expect(() =>
      computeOlympusScore({
        tier: "S",
        chainCount: 5,
        cohortPercentile: 99,
        timestampSeconds: 0,
      })
    ).toThrow(/not Olympus-eligible/);
  });
});

describe("maskName", () => {
  it("two-part name: first + last initial", () => {
    expect(maskName("Aditya Singh")).toBe("A.S.");
  });

  it("three-part name: first + last initial (middle skipped)", () => {
    expect(maskName("Mary Jane Watson")).toBe("M.W.");
  });

  it("single-part name: just first letter", () => {
    expect(maskName("Madonna")).toBe("M.");
  });

  it("uppercase the initials", () => {
    expect(maskName("aditya singh")).toBe("A.S.");
  });

  it("empty/garbage input falls back to ??", () => {
    expect(maskName("")).toBe("??");
    expect(maskName("   ")).toBe("??");
    expect(maskName("123 456")).toBe("??");
  });

  it("ignores numeric tokens, picks alphabetic ones", () => {
    expect(maskName("Aditya 1999 Singh")).toBe("A.S.");
  });
});

describe("buildOlympusRecord", () => {
	  const baseResult = {
	    id: "user-1",
	    name: "Aditya Singh",
	    signalScore: 100,
	    verdict: "",
	    flavor: "",
	    createdAt: "2026-05-22T00:00:00Z",
	    modelUsed: "claude" as const,
	  };

  it("returns null for ineligible tier", () => {
    expect(
      buildOlympusRecord({
        ...baseResult,
        tier: "S",
      } as any)
    ).toBeNull();
  });

  it("returns null when primaryFamily missing", () => {
    expect(
      buildOlympusRecord({
        ...baseResult,
        tier: "ASCENDED",
      } as any)
    ).toBeNull();
  });

  it("builds full record for eligible result", () => {
    const record = buildOlympusRecord({
      ...baseResult,
      tier: "ASCENDED",
      primaryFamily: "engineering",
      families: [
        {
          family: "engineering",
          baseTier: "S",
          chainTier: "ASCENDED",
          finalTier: "ASCENDED",
          matched: ["a", "b", "c"],
          activeChains: ["chain1", "chain2"],
        },
      ],
      percentiles: {
        withinFamilyCohort: 99.7,
        crossFamilyCohort: 98.2,
        global: 99.5,
      },
      league: {
        league: "pro",
        leagueLabel: "23-26",
        leagueTier: "ASCENDED",
        percentile: 99,
        age: 25,
        ageSource: "user",
        ageConfidence: 1.0,
      },
    } as any);
    expect(record).not.toBeNull();
    expect(record!.tier).toBe("ASCENDED");
    expect(record!.primaryFamily).toBe("engineering");
    expect(record!.chainCount).toBe(2);
    expect(record!.maskedName).toBe("A.S.");
    expect(record!.cohortPercentile).toBe(99.7);
  });
});
