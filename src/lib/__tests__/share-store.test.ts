import { describe, expect, it } from "vitest";
import type { CrackedResultV1 } from "@/lib/types";
import {
  legacyEncodedShare,
  persistShareResult,
  resolveShareResult,
  sharePath,
} from "@/lib/share-store";

function fixture(overrides: Partial<CrackedResultV1> = {}): CrackedResultV1 {
  return {
    id: "share-test-id",
    name: "Test User",
    tier: "S",
    tierStars: 2,
    signalScore: 91,
    verdict: "S2 in Engineering.",
    flavor: "Compounding.",
    createdAt: "2026-01-15T12:00:00Z",
    modelUsed: "claude",
    primaryFamily: "engineering",
    percentiles: {
      withinFamilyCohort: 96,
      crossFamilyCohort: 91,
      global: 94,
    },
    ...overrides,
  };
}

describe("share-store", () => {
  it("builds short share paths from result ids", () => {
    expect(sharePath(fixture())).toBe("/c/share-test-id");
  });

  it("persists and resolves short share ids", async () => {
    const original = fixture({ id: "short-share-1" });
    await persistShareResult(original);
    const resolved = await resolveShareResult("short-share-1");

    expect(resolved).not.toBeNull();
    expect(resolved!.name).toBe("Test User");
    expect(resolved!.tier).toBe("S");
  });

  it("still resolves legacy inline encoded blobs", async () => {
    const original = fixture({ id: "legacy-share-1" });
    const encoded = legacyEncodedShare(original);
    const resolved = await resolveShareResult(encoded);

    expect(resolved).not.toBeNull();
    expect(resolved!.id).toBe("legacy-share-1");
    expect(encoded.length).toBeGreaterThan(96);
  });
});
