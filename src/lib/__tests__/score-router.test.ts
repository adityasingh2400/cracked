// Tests for the 3-tier scoring backend router cascade.
// Per /plan-eng-review test plan + critical gap #2: total cascade failure
// must produce a clear failure path, not a silent 500.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the @anthropic-ai/sdk module BEFORE importing score-router.
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: { create: vi.fn().mockResolvedValue(null) },
    })),
  };
});

import { routeExtraction, _resetBudgetForTests } from "@/lib/score-router";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  _resetBudgetForTests();
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("routeExtraction cascade", () => {
  it("falls back to regex when no MAC_CLAUDE_URL and no ANTHROPIC_API_KEY", async () => {
    delete process.env.MAC_CLAUDE_URL;
    delete process.env.ANTHROPIC_API_KEY;
    const result = await routeExtraction("BS Stanford 2024, Anthropic MTS", "Test User");
    expect(result.tier).toBe("regex-fallback");
    expect(result.calibrating).toBe(true);
    expect(result.extraction).toBeDefined();
    expect(result.extraction.name).toBe("Test User");
  });

  it("uses Mac-Claude when MAC_CLAUDE_URL is set and responds", async () => {
    process.env.MAC_CLAUDE_URL = "https://mac.example.com";
    process.env.MAC_CLAUDE_AUTH = "test-token";
    const mockResponse = {
      name: "Mac User",
      signals: {
        schools: [],
        companies: [],
        awards: [],
        publications: [],
        funding: [],
        open_source: [],
        online: [],
        raw_text: "x",
      },
      verdict: "tested",
      flavor: "fixed",
      ageInference: { age: 25, confidence: 0.9, reasoning: "test" },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await routeExtraction("test resume text");
    expect(result.tier).toBe("mac-claude");
    expect(result.calibrating).toBe(false);
    expect(result.extraction.name).toBe("Mac User");
  });

  it("cascades to regex when Mac-Claude returns non-OK", async () => {
    process.env.MAC_CLAUDE_URL = "https://mac.example.com";
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    } as Response);

    const result = await routeExtraction("test resume text");
    expect(result.tier).toBe("regex-fallback");
    expect(result.calibrating).toBe(true);
  });

  it("cascades to regex when Mac-Claude returns malformed JSON", async () => {
    process.env.MAC_CLAUDE_URL = "https://mac.example.com";
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ this: "is malformed" }),
    } as Response);

    const result = await routeExtraction("test resume text");
    expect(result.tier).toBe("regex-fallback");
  });

  it("cascades to regex when Mac-Claude throws (network error)", async () => {
    process.env.MAC_CLAUDE_URL = "https://mac.example.com";
    delete process.env.ANTHROPIC_API_KEY;
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await routeExtraction("test");
    expect(result.tier).toBe("regex-fallback");
  });

  it("regex fallback ALWAYS returns a usable ExtractionV1Result", async () => {
    delete process.env.MAC_CLAUDE_URL;
    delete process.env.ANTHROPIC_API_KEY;
    const result = await routeExtraction("totally empty resume", "Anonymous");
    expect(result.extraction).toBeDefined();
    expect(result.extraction.name).toBe("Anonymous");
    expect(result.extraction.signals.raw_text).toBeDefined();
  });
});
