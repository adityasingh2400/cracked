import { describe, expect, it } from "vitest";
import type { Achievement } from "../types";
import { computeTierCrowns, A_PER_S_CROWN, B_PER_A_CROWN } from "../tier-crowns";

function ach(id: string, tier: Achievement["tier"]): Achievement {
  return {
    id,
    family: "founder",
    tier,
    label: id,
    description: "",
    signals: [],
  };
}

describe("computeTierCrowns", () => {
  it("returns undefined for non A/S tiers", () => {
    expect(computeTierCrowns("B", [ach("b1", "B")])).toBeUndefined();
    expect(computeTierCrowns("MYTHIC", [ach("m1", "MYTHIC")])).toBeUndefined();
  });

  it("A tier: 1 A achievement = 1 crown", () => {
    expect(computeTierCrowns("A", [ach("a1", "A")])).toBe(1);
  });

  it("A tier: 4 B achievements = 1 crown", () => {
    const matched = Array.from({ length: B_PER_A_CROWN }, (_, i) => ach(`b${i}`, "B"));
    expect(computeTierCrowns("A", matched)).toBe(1);
  });

  it("A tier: 2 A + 4 B = 3 crowns", () => {
    const matched = [
      ach("a1", "A"),
      ach("a2", "A"),
      ...Array.from({ length: B_PER_A_CROWN }, (_, i) => ach(`b${i}`, "B")),
    ];
    expect(computeTierCrowns("A", matched)).toBe(3);
  });

  it("S tier: 3 S achievements = 3 crowns", () => {
    expect(
      computeTierCrowns("S", [ach("s1", "S"), ach("s2", "S"), ach("s3", "S")])
    ).toBe(3);
  });

  it("S tier: 1 S + 8 A = 3 crowns", () => {
    const matched = [
      ach("s1", "S"),
      ...Array.from({ length: A_PER_S_CROWN * 2 }, (_, i) => ach(`a${i}`, "A")),
    ];
    expect(computeTierCrowns("S", matched)).toBe(3);
  });

  it("S tier: 12 A with no S = 3 crowns", () => {
    const matched = Array.from({ length: A_PER_S_CROWN * 3 }, (_, i) => ach(`a${i}`, "A"));
    expect(computeTierCrowns("S", matched)).toBe(3);
  });

  it("caps at 3 crowns", () => {
    const matched = [
      ...Array.from({ length: 5 }, (_, i) => ach(`s${i}`, "S")),
      ...Array.from({ length: 12 }, (_, i) => ach(`a${i}`, "A")),
    ];
    expect(computeTierCrowns("S", matched)).toBe(3);
  });
});
