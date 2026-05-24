import { describe, expect, it } from "vitest";
import type { Achievement, Chain } from "../types";
import { FAMILIES_META } from "@/data/families";
import { libraryForFamily } from "@/data/achievements";
import {
  buildDexLadder,
  toAchievementView,
  DEX_TIER_ORDER,
} from "../dex-views";

const ENG_META = FAMILIES_META.engineering;

function ach(partial: Partial<Achievement> & Pick<Achievement, "id" | "tier">): Achievement {
  return {
    family: "engineering",
    label: partial.id,
    description: "",
    signals: [],
    ...partial,
  };
}

describe("toAchievementView", () => {
  it("projects an achievement into a serializable view", () => {
    const a = ach({
      id: "eng_x",
      tier: "S",
      label: "Did a thing",
      description: "desc",
      signals: [{ kind: "school", match: ["MIT"] }],
      evidence: ["Ada Lovelace"],
      ageCap: 22,
    });
    const view = toAchievementView(a);
    expect(view).toEqual({
      id: "eng_x",
      tier: "S",
      label: "Did a thing",
      description: "desc",
      signals: ["School: MIT"],
      evidence: ["Ada Lovelace"],
      ageCap: 22,
    });
  });

  it("carries undefined optional fields through", () => {
    const view = toAchievementView(ach({ id: "eng_y", tier: "B" }));
    expect(view.evidence).toBeUndefined();
    expect(view.ageCap).toBeUndefined();
    expect(view.signals).toEqual([]);
  });
});

describe("buildDexLadder", () => {
  it("buckets achievements and chains by tier", () => {
    const achievements: Achievement[] = [
      ach({ id: "a_s", tier: "S" }),
      ach({ id: "a_a", tier: "A" }),
      ach({ id: "a_a2", tier: "A" }),
    ];
    const chains: Chain[] = [
      {
        id: "c1",
        name: "The Pipeline",
        family: "engineering",
        requires: ["a_s", "a_a"],
        bumpTo: "MYTHIC",
        description: "stack them",
      },
    ];

    const ladder = buildDexLadder(ENG_META, achievements, chains);

    expect(ladder.meta).toBe(ENG_META);
    expect(ladder.stats).toEqual({ achievements: 3, chains: 1 });
    expect(ladder.achievementsByTier.S.map((a) => a.id)).toEqual(["a_s"]);
    expect(ladder.achievementsByTier.A.map((a) => a.id)).toEqual(["a_a", "a_a2"]);
    expect(ladder.achievementsByTier.D).toEqual([]);
    expect(ladder.chainsByTier.MYTHIC[0].id).toBe("c1");
    expect(ladder.chainsByTier.S).toEqual([]);
  });

  it("resolves chain requirement labels, falling back to a slug-derived label", () => {
    const known = ach({ id: "eng_stanford_cs_bs", tier: "A", label: "Stanford CS BS" });
    const chains: Chain[] = [
      {
        id: "c2",
        name: "Mixed",
        family: "engineering",
        requires: ["eng_stanford_cs_bs", "eng_unknown_made_up_id"],
        bumpTo: "S",
        description: "",
      },
    ];

    const ladder = buildDexLadder(ENG_META, [known], chains);
    const requires = ladder.chainsByTier.S[0].requires;

    // Known id resolves to the real library label (not the local fixture label).
    const resolved = requires.find((r) => r.id === "eng_stanford_cs_bs");
    expect(resolved?.label).toBeTruthy();

    // Unknown id falls back to the de-prefixed, de-underscored slug.
    const fallback = requires.find((r) => r.id === "eng_unknown_made_up_id");
    expect(fallback?.label).toBe("unknown made up id");
  });

  it("initializes every tier bucket even with no data", () => {
    const ladder = buildDexLadder(ENG_META, [], []);
    for (const tier of DEX_TIER_ORDER) {
      expect(ladder.achievementsByTier[tier]).toEqual([]);
      expect(ladder.chainsByTier[tier]).toEqual([]);
    }
    expect(ladder.stats).toEqual({ achievements: 0, chains: 0 });
  });

  it("works against the real engineering library", () => {
    const lib = libraryForFamily("engineering");
    const ladder = buildDexLadder(ENG_META, lib.achievements, lib.chains);
    const total = DEX_TIER_ORDER.reduce(
      (sum, tier) => sum + ladder.achievementsByTier[tier].length,
      0
    );
    expect(total).toBe(lib.achievements.length);
    expect(ladder.stats.chains).toBe(lib.chains.length);
  });
});

describe("DEX_TIER_ORDER", () => {
  it("runs from ASCENDED down to D", () => {
    expect(DEX_TIER_ORDER[0]).toBe("ASCENDED");
    expect(DEX_TIER_ORDER[DEX_TIER_ORDER.length - 1]).toBe("D");
    expect(DEX_TIER_ORDER).toHaveLength(7);
  });
});
