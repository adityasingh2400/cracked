import { describe, expect, it } from "vitest";
import type { Tier } from "../types";
import { FAMILIES_META } from "@/data/families";
import type { DexAchievementView, DexChainView } from "../dex-views";
import {
  buildDexSampleResult,
  buildDexSampleResults,
  formatDexTierLabel,
} from "../dex-sample-results";

const ENG_META = FAMILIES_META.engineering;

function view(partial: Partial<DexAchievementView> & Pick<DexAchievementView, "id" | "tier">): DexAchievementView {
  return {
    label: partial.id,
    description: "",
    signals: ["School: MIT"],
    ...partial,
  };
}

function chain(id: string, bumpTo: Tier): DexChainView {
  return { id, name: id, bumpTo, description: "", requires: [] };
}

describe("buildDexSampleResult", () => {
  it("assigns 3 crowns at S and exposes league crowns", () => {
    const achievements = [view({ id: "s1", tier: "S", label: "Frontier work", evidence: ["Grace Hopper"] })];
    const result = buildDexSampleResult(ENG_META, "S", achievements, []);

    expect(result.tier).toBe("S");
    expect(result.tierStars).toBe(3);
    expect(result.id).toBe(`dex-${ENG_META.key}-S`);
    expect(result.name).toBe("Grace Hopper");
    expect(result.speciality).toBe("Frontier work");
    expect(result.signalScore).toBe(99.0);
    expect(result.league?.leagueTierStars).toBe(3);
    expect(result.primaryFamily).toBe(ENG_META.key);
  });

  it("assigns 2 crowns at A", () => {
    const result = buildDexSampleResult(ENG_META, "A", [view({ id: "a1", tier: "A" })], []);
    expect(result.tierStars).toBe(2);
    expect(result.league?.leagueTierStars).toBe(2);
  });

  it("omits crowns for tiers that do not support them", () => {
    const result = buildDexSampleResult(ENG_META, "MYTHIC", [view({ id: "m1", tier: "MYTHIC" })], []);
    expect(result.tierStars).toBeUndefined();
    // MYTHIC does not support crowns, so the league crown is omitted too.
    expect(result.league?.leagueTierStars).toBeUndefined();
  });

  it("falls back to an exemplar name when no evidence is present", () => {
    const result = buildDexSampleResult(ENG_META, "B", [view({ id: "b1", tier: "B" })], []);
    expect(result.name).toBe(`${ENG_META.name.split(" ")[0]} Exemplar`);
  });

  it("falls back to the family motto for speciality when there is no flagship", () => {
    const result = buildDexSampleResult(ENG_META, "D", [], []);
    expect(result.name).toBe(`${ENG_META.name.split(" ")[0]} Exemplar`);
    expect(result.speciality).toBe(ENG_META.motto);
    expect(result.bestAccolades).toEqual([]);
    expect(result.achievementsAll).toEqual([]);
  });

  it("caps matched ids and active chains, and mirrors the full inventories", () => {
    const achievements = Array.from({ length: 20 }, (_, i) => view({ id: `a${i}`, tier: "A" }));
    const chains = Array.from({ length: 6 }, (_, i) => chain(`c${i}`, "A"));
    const result = buildDexSampleResult(ENG_META, "A", achievements, chains);

    const primary = result.families?.find((f) => f.family === ENG_META.key);
    expect(primary?.matched).toHaveLength(8); // capped at 8
    expect(primary?.activeChains).toHaveLength(4); // capped at 4

    expect(result.bestAccolades).toHaveLength(4); // top 4
    expect(result.achievementsAll).toHaveLength(18); // top 18
    expect(result.chainsAll).toHaveLength(6); // all chains mirrored
  });

  it("marks non-primary families as a lower baseline tier", () => {
    const result = buildDexSampleResult(ENG_META, "S", [view({ id: "s1", tier: "S" })], []);
    const others = (result.families ?? []).filter((f) => f.family !== ENG_META.key);
    expect(others.length).toBeGreaterThan(0);
    for (const f of others) {
      expect(f.finalTier).toBe("C");
      expect(f.matched).toEqual([]);
    }
  });

  it("keeps non-primary families at D when the primary tier is D", () => {
    const result = buildDexSampleResult(ENG_META, "D", [view({ id: "d1", tier: "D" })], []);
    const others = (result.families ?? []).filter((f) => f.family !== ENG_META.key);
    for (const f of others) {
      expect(f.finalTier).toBe("D");
    }
  });

  it("clamps the lower percentiles to zero", () => {
    const result = buildDexSampleResult(ENG_META, "D", [view({ id: "d1", tier: "D" })], []);
    expect(result.percentiles?.global).toBeGreaterThanOrEqual(0);
    expect(result.percentiles?.crossFamilyCohort).toBeGreaterThanOrEqual(0);
  });
});

describe("buildDexSampleResults", () => {
  it("builds one result per non-empty tier and skips empties", () => {
    const achievementsByTier = {
      ASCENDED: [],
      MYTHIC: [],
      S: [view({ id: "s1", tier: "S" })],
      A: [view({ id: "a1", tier: "A" })],
      B: [],
      C: [],
      D: [],
    } as Record<Tier, DexAchievementView[]>;
    const chainsByTier = {
      ASCENDED: [],
      MYTHIC: [],
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
    } as Record<Tier, DexChainView[]>;

    const out = buildDexSampleResults(ENG_META, achievementsByTier, chainsByTier);
    expect(Object.keys(out).sort()).toEqual(["A", "S"]);
    expect(out.S?.tier).toBe("S");
    expect(out.A?.tier).toBe("A");
  });

  it("tolerates a missing chains bucket", () => {
    const achievementsByTier = {
      S: [view({ id: "s1", tier: "S" })],
    } as unknown as Record<Tier, DexAchievementView[]>;
    const chainsByTier = {} as Record<Tier, DexChainView[]>;
    const out = buildDexSampleResults(ENG_META, achievementsByTier, chainsByTier);
    expect(out.S?.chainsAll).toEqual([]);
  });
});

describe("formatDexTierLabel", () => {
  it("appends crowns for A/S and leaves special tiers bare", () => {
    expect(formatDexTierLabel("S", 3)).toBe("S3");
    expect(formatDexTierLabel("A", 1)).toBe("A1");
    expect(formatDexTierLabel("A")).toBe("A1");
    expect(formatDexTierLabel("MYTHIC")).toBe("MYTHIC");
    expect(formatDexTierLabel("D")).toBe("D");
  });
});
