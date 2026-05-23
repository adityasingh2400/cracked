// Tests that the coarse 9-family population weights are valid and stable.
// The runtime assertion in family-weights.ts throws on module load if invalid,
// but these tests assert the invariants explicitly so failures are loud.

import { describe, expect, it } from "vitest";
import { FAMILY_WEIGHTS, weightFor } from "@/data/family-weights";
import { ALL_FAMILIES } from "@/lib/types";

describe("FAMILY_WEIGHTS", () => {
  it("sums to 1.0 within float epsilon", () => {
    const sum = Object.values(FAMILY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(1e-6);
  });

  it("has an entry for every family in ALL_FAMILIES", () => {
    for (const f of ALL_FAMILIES) {
      expect(FAMILY_WEIGHTS[f]).toBeDefined();
      expect(FAMILY_WEIGHTS[f]).toBeGreaterThan(0);
    }
  });

  it("has no negative weights", () => {
    for (const w of Object.values(FAMILY_WEIGHTS)) {
      expect(w).toBeGreaterThanOrEqual(0);
    }
  });

  it("has no weight greater than 1.0", () => {
    for (const w of Object.values(FAMILY_WEIGHTS)) {
      expect(w).toBeLessThanOrEqual(1.0);
    }
  });

  it("weightFor() returns the correct weight per family", () => {
    for (const f of ALL_FAMILIES) {
      expect(weightFor(f)).toBe(FAMILY_WEIGHTS[f]);
    }
  });
});
