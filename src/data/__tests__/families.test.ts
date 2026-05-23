// Tests that the 9-family metadata is well-formed and consistent with the
// canonical ALL_FAMILIES list from types.

import { describe, expect, it } from "vitest";
import { FAMILIES_META, FAMILIES_ORDERED, familyBySlug } from "@/data/families";
import { ALL_FAMILIES } from "@/lib/types";

describe("FAMILIES_META", () => {
  it("has an entry for every canonical family", () => {
    for (const f of ALL_FAMILIES) {
      expect(FAMILIES_META[f]).toBeDefined();
    }
  });

  it("every family has all required metadata fields", () => {
    for (const f of ALL_FAMILIES) {
      const meta = FAMILIES_META[f];
      expect(meta.key).toBe(f);
      expect(meta.slug).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.shortName).toBeTruthy();
      expect(meta.motto).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.glyph).toBeTruthy();
      expect(meta.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(meta.foil.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(meta.foil.secondary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(meta.foil.tertiary).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("slugs are unique across families", () => {
    const slugs = Object.values(FAMILIES_META).map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("FAMILIES_ORDERED", () => {
  it("contains exactly 9 families", () => {
    expect(FAMILIES_ORDERED).toHaveLength(9);
  });

  it("matches ALL_FAMILIES as a set", () => {
    expect(new Set(FAMILIES_ORDERED)).toEqual(new Set(ALL_FAMILIES));
  });
});

describe("familyBySlug", () => {
  it("resolves canonical slugs", () => {
    expect(familyBySlug("engineering")?.key).toBe("engineering");
    expect(familyBySlug("science-academia")?.key).toBe("science_academia");
    expect(familyBySlug("creative-audience")?.key).toBe("creative_audience");
  });

  it("returns undefined for unknown slug", () => {
    expect(familyBySlug("nonexistent")).toBeUndefined();
  });
});
