import { describe, expect, it } from "vitest";
import type { SignalMatcher } from "../types";
import { formatSignal, formatSignals } from "../format-signals";

describe("formatSignal", () => {
  describe("school", () => {
    it("lists matched school names", () => {
      const m: SignalMatcher = { kind: "school", match: ["MIT", "Stanford"] };
      expect(formatSignal(m)).toBe("School: MIT, Stanford");
    });

    it("falls back to generic label when no names", () => {
      const m: SignalMatcher = { kind: "school", match: [] };
      expect(formatSignal(m)).toBe("School credential");
    });

    it("drops empty strings before deciding fallback", () => {
      const m: SignalMatcher = { kind: "school", match: ["", ""] };
      expect(formatSignal(m)).toBe("School credential");
    });

    it("truncates long lists with a +N suffix", () => {
      const m: SignalMatcher = {
        kind: "school",
        match: ["A", "B", "C", "D", "E", "F"],
      };
      expect(formatSignal(m)).toBe("School: A, B, C, D +2");
    });
  });

  describe("company", () => {
    it("renders company only", () => {
      const m: SignalMatcher = { kind: "company", match: ["OpenAI"] };
      expect(formatSignal(m)).toBe("OpenAI");
    });

    it("renders company with titles", () => {
      const m: SignalMatcher = {
        kind: "company",
        match: ["Stripe"],
        title: ["Staff Engineer", "Principal"],
      };
      expect(formatSignal(m)).toBe("Stripe · Staff Engineer, Principal");
    });

    it("renders role only when no companies given", () => {
      const m: SignalMatcher = { kind: "company", match: [], title: ["CTO"] };
      expect(formatSignal(m)).toBe("Role: CTO");
    });

    it("falls back to Any company when neither present", () => {
      const m: SignalMatcher = { kind: "company", match: [] };
      expect(formatSignal(m)).toBe("Any company");
    });
  });

  describe("award", () => {
    it("lists award names", () => {
      const m: SignalMatcher = { kind: "award", match: ["Turing Award"] };
      expect(formatSignal(m)).toBe("Award: Turing Award");
    });

    it("falls back to generic Award label", () => {
      const m: SignalMatcher = { kind: "award", match: [] };
      expect(formatSignal(m)).toBe("Award");
    });
  });

  describe("publication", () => {
    it("defaults role to author", () => {
      const m: SignalMatcher = { kind: "publication", venue: ["Nature"] };
      expect(formatSignal(m)).toBe("Publication (author): Nature");
    });

    it("uses explicit role", () => {
      const m: SignalMatcher = {
        kind: "publication",
        venue: ["NeurIPS"],
        role: "first",
      };
      expect(formatSignal(m)).toBe("Publication (first-author): NeurIPS");
    });

    it("handles no venues", () => {
      const m: SignalMatcher = { kind: "publication", venue: [], role: "senior" };
      expect(formatSignal(m)).toBe("Publication (senior-author)");
    });
  });

  describe("funding", () => {
    it("renders round and minAmount", () => {
      const m: SignalMatcher = { kind: "funding", round: "Series A", minAmount: 5_000_000 };
      expect(formatSignal(m)).toBe("Funding · Series A · ≥ $5M");
    });

    it("renders bare Funding when nothing else", () => {
      const m: SignalMatcher = { kind: "funding" };
      expect(formatSignal(m)).toBe("Funding");
    });

    it("formats billions and thousands", () => {
      expect(formatSignal({ kind: "funding", minAmount: 2_000_000_000 })).toBe(
        "Funding · ≥ $2B"
      );
      expect(formatSignal({ kind: "funding", minAmount: 250_000 })).toBe(
        "Funding · ≥ $250K"
      );
      expect(formatSignal({ kind: "funding", minAmount: 500 })).toBe("Funding · ≥ $500");
    });
  });

  describe("online", () => {
    it("renders platform and follower threshold", () => {
      const m: SignalMatcher = { kind: "online", platform: "YouTube", minFollowers: 1_500_000 };
      expect(formatSignal(m)).toBe("YouTube · ≥ 1.5M followers");
    });

    it("falls back when empty", () => {
      const m: SignalMatcher = { kind: "online" };
      expect(formatSignal(m)).toBe("Online presence");
    });

    it("rounds exact thousands without a decimal", () => {
      const m: SignalMatcher = { kind: "online", minFollowers: 10_000 };
      expect(formatSignal(m)).toBe("≥ 10K followers");
    });
  });

  describe("open_source", () => {
    it("renders projects with star metric", () => {
      const m: SignalMatcher = {
        kind: "open_source",
        project: ["react"],
        minMetric: 100_000,
      };
      expect(formatSignal(m)).toBe("react · ≥ 100K stars");
    });

    it("renders projects only", () => {
      const m: SignalMatcher = { kind: "open_source", project: ["linux", "git"] };
      expect(formatSignal(m)).toBe("OSS: linux, git");
    });

    it("renders metric only", () => {
      const m: SignalMatcher = { kind: "open_source", minMetric: 5000 };
      expect(formatSignal(m)).toBe("Open source · ≥ 5K stars");
    });

    it("falls back to generic signal", () => {
      const m: SignalMatcher = { kind: "open_source" };
      expect(formatSignal(m)).toBe("Open source signal");
    });
  });

  describe("free_text", () => {
    it("shows a short regex hint", () => {
      const m: SignalMatcher = { kind: "free_text", patterns: [/forbes 30 under 30/i] };
      expect(formatSignal(m)).toBe("Text match: /forbes 30 under 30/");
    });

    it("truncates long patterns with an ellipsis", () => {
      const long = "a".repeat(80);
      const m: SignalMatcher = { kind: "free_text", patterns: [new RegExp(long)] };
      const out = formatSignal(m);
      expect(out.startsWith("Text match: /")).toBe(true);
      expect(out.endsWith("…/")).toBe(true);
    });

    it("falls back when no patterns", () => {
      const m: SignalMatcher = { kind: "free_text", patterns: [] };
      expect(formatSignal(m)).toBe("Resume text match");
    });
  });
});

describe("formatSignals", () => {
  it("maps every matcher to a label", () => {
    const signals: SignalMatcher[] = [
      { kind: "school", match: ["MIT"] },
      { kind: "award", match: ["Nobel"] },
    ];
    expect(formatSignals(signals)).toEqual(["School: MIT", "Award: Nobel"]);
  });

  it("returns an empty array for no signals", () => {
    expect(formatSignals([])).toEqual([]);
  });
});
