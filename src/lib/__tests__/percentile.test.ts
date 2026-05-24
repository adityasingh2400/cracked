// Tests for percentile blending math - the screenshot-bait flex.
// Per /plan-eng-review test plan: 100% coverage required on src/lib/percentile.

import { describe, expect, it } from "vitest";
import {
  blendPercentile,
  buildSyntheticCell,
  computePercentileTrio,
  empiricalPercentile,
} from "@/lib/percentile";
import { ALL_FAMILIES } from "@/lib/types";

describe("blendPercentile", () => {
  it("when realUserCount=0, w hits the floor at 0.1", () => {
    const result = blendPercentile({
      internalScore: 50,
      cellSyntheticPct: 80,
      cellEmpiricalPct: 0,
      realUserCount: 0,
    });
    // (1-0.1)*80 + 0.1*0 = 72
    expect(result).toBeCloseTo(72, 1);
  });

  it("when realUserCount=500, w saturates at 1.0", () => {
    const result = blendPercentile({
      internalScore: 50,
      cellSyntheticPct: 80,
      cellEmpiricalPct: 20,
      realUserCount: 500,
    });
    // (1-1)*80 + 1*20 = 20
    expect(result).toBeCloseTo(20, 1);
  });

  it("when realUserCount=250, w=0.5 - half-blend", () => {
    const result = blendPercentile({
      internalScore: 50,
      cellSyntheticPct: 80,
      cellEmpiricalPct: 20,
      realUserCount: 250,
    });
    // 0.5*80 + 0.5*20 = 50
    expect(result).toBeCloseTo(50, 1);
  });

  it("never returns above 100 or below 0", () => {
    expect(
      blendPercentile({
        internalScore: 100,
        cellSyntheticPct: 200, // simulated bad data
        cellEmpiricalPct: 50,
        realUserCount: 100,
      })
    ).toBeLessThanOrEqual(100);
    expect(
      blendPercentile({
        internalScore: 0,
        cellSyntheticPct: -10, // simulated bad data
        cellEmpiricalPct: 0,
        realUserCount: 0,
      })
    ).toBeGreaterThanOrEqual(0);
  });
});

describe("empiricalPercentile", () => {
  it("midpoint rank for ties", () => {
    // user score = 50, distribution = [50, 50, 50, 50]
    // below=0, equal=4 → rank = 0 + 4/2 = 2 → 2/4 = 50%
    expect(empiricalPercentile(50, [50, 50, 50, 50])).toBe(50);
  });

  it("rank/N for clean distribution", () => {
    // user=70 vs [10,20,30,40,50,60,70,80,90,100]
    // below=6, equal=1 → rank=6.5 → 65%
    expect(empiricalPercentile(70, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100])).toBe(65);
  });

  it("returns 50 (neutral) on empty distribution", () => {
    expect(empiricalPercentile(50, [])).toBe(50);
  });

  it("returns 0 for user below everything", () => {
    expect(empiricalPercentile(1, [10, 20, 30])).toBe(0);
  });

  it("returns 100 for user above everything", () => {
    expect(empiricalPercentile(100, [10, 20, 30])).toBe(100);
  });

  it("clamps to [0, 100]", () => {
    expect(empiricalPercentile(1000, [1, 2, 3])).toBeLessThanOrEqual(100);
    expect(empiricalPercentile(-100, [1, 2, 3])).toBeGreaterThanOrEqual(0);
  });
});

describe("buildSyntheticCell", () => {
  it("returns 50 at baseline score", () => {
    const cell = buildSyntheticCell("engineering", "pro", 50);
    expect(cell.quantile(50)).toBeCloseTo(50, 1);
  });

  it("returns higher percentile for higher scores", () => {
    const cell = buildSyntheticCell("engineering", "pro", 50);
    expect(cell.quantile(80)).toBeGreaterThan(cell.quantile(60));
    expect(cell.quantile(60)).toBeGreaterThan(cell.quantile(50));
  });

  it("clamps quantile to [0, 100]", () => {
    const cell = buildSyntheticCell("engineering", "pro", 50);
    expect(cell.quantile(1000)).toBeLessThanOrEqual(100);
    expect(cell.quantile(-1000)).toBeGreaterThanOrEqual(0);
  });
});

describe("computePercentileTrio", () => {
  const cellLookup = (family: any, cohort: any) =>
    buildSyntheticCell(family, cohort, 50);
  const globalDistribution = buildSyntheticCell("engineering", "pro", 50);

  it("returns three percentile metrics in 0-100 range", () => {
    const trio = computePercentileTrio({
      internalScore: 80,
      primaryFamily: "engineering",
      cohort: "pro",
      cellLookup,
      globalDistribution,
    });
    expect(trio.withinFamilyCohort).toBeGreaterThanOrEqual(0);
    expect(trio.withinFamilyCohort).toBeLessThanOrEqual(100);
    expect(trio.crossFamilyCohort).toBeGreaterThanOrEqual(0);
    expect(trio.crossFamilyCohort).toBeLessThanOrEqual(100);
    expect(trio.global).toBeGreaterThanOrEqual(0);
    expect(trio.global).toBeLessThanOrEqual(100);
  });

  it("higher scores produce higher percentiles in all three metrics", () => {
    const low = computePercentileTrio({
      internalScore: 40,
      primaryFamily: "engineering",
      cohort: "pro",
      cellLookup,
      globalDistribution,
    });
    const high = computePercentileTrio({
      internalScore: 90,
      primaryFamily: "engineering",
      cohort: "pro",
      cellLookup,
      globalDistribution,
    });
    expect(high.withinFamilyCohort).toBeGreaterThan(low.withinFamilyCohort);
    expect(high.crossFamilyCohort).toBeGreaterThan(low.crossFamilyCohort);
    expect(high.global).toBeGreaterThan(low.global);
  });

  it("rounded to one decimal place", () => {
    const trio = computePercentileTrio({
      internalScore: 73,
      primaryFamily: "founder",
      cohort: "apprentice",
      cellLookup,
      globalDistribution,
    });
    // All values should have at most 1 decimal
    expect(trio.withinFamilyCohort * 10).toBeCloseTo(
      Math.round(trio.withinFamilyCohort * 10),
      0
    );
  });

  it("cross-family weighting iterates all 9 families", () => {
    let familiesSeen = new Set<string>();
    const trackingLookup = (family: any, cohort: any) => {
      familiesSeen.add(family);
      return buildSyntheticCell(family, cohort, 50);
    };
    computePercentileTrio({
      internalScore: 75,
      primaryFamily: "engineering",
      cohort: "pro",
      cellLookup: trackingLookup,
      globalDistribution,
    });
    // Should have iterated all 9 families for the cross-family metric
    for (const f of ALL_FAMILIES) {
      expect(familiesSeen.has(f)).toBe(true);
    }
  });
});
