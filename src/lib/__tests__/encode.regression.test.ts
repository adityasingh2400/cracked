import { describe, expect, it } from "vitest";
import { decodeResult, encodeResult } from "@/lib/encode";
import type { CrackedResultV1 } from "@/lib/types";

function fixture(overrides: Partial<CrackedResultV1> = {}): CrackedResultV1 {
  return {
    id: "fixture-id",
    name: "Test User",
    tier: "A",
    tierStars: 2,
    signalScore: 80.5,
    verdict: "A2 in Engineering. Strong signal with room to compound.",
    flavor: "Compounding.",
    createdAt: "2026-01-15T12:00:00Z",
    modelUsed: "claude",
    primaryFamily: "engineering",
    percentiles: {
      withinFamilyCohort: 96,
      crossFamilyCohort: 91,
      global: 94,
    },
    league: {
      league: "pro",
      leagueLabel: "Ages 23-26",
      leagueTier: "A",
      leagueTierStars: 2,
      percentile: 95,
      age: 25,
      ageSource: "user",
      ageConfidence: 1,
    },
    ...overrides,
  };
}

describe("share URL encoding", () => {
  it("roundtrips the current achievement-native result shape", () => {
    const original = fixture();
    const decoded = decodeResult(encodeResult(original));

    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe(original.id);
    expect(decoded!.tier).toBe("A");
    expect(decoded!.tierStars).toBe(2);
    expect(decoded!.signalScore).toBe(80.5);
    expect(decoded!.league?.leagueTierStars).toBe(2);
  });

  it("roundtrips special tiers without stars", () => {
    const decoded = decodeResult(
      encodeResult(fixture({ tier: "MYTHIC", tierStars: undefined, signalScore: 97 }))
    );

    expect(decoded).not.toBeNull();
    expect(decoded!.tier).toBe("MYTHIC");
    expect(decoded!.tierStars).toBeUndefined();
  });

  it("returns null on malformed input rather than throwing", () => {
    expect(decodeResult("not-a-real-blob")).toBeNull();
    expect(decodeResult("")).toBeNull();
  });
});
