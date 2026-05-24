// Smoke tests for KV wrapper - verifies the silent-degradation contract.
// Without KV_REST_API_URL set, every operation should return safe defaults
// without throwing.

import { describe, expect, it } from "vitest";
import {
  getLookup,
  batchGetLookup,
  setLookup,
  olympusTop,
  recordTelemetry,
  appendCellScore,
  getCellScores,
  profileKey,
  kvAvailable,
} from "@/lib/kv";

describe("profileKey normalization", () => {
  it("strips protocol, www., trailing slashes", () => {
    expect(profileKey("https://linkedin.com/in/aditya/")).toBe("lookup:in/aditya");
    expect(profileKey("https://www.linkedin.com/in/aditya")).toBe("lookup:in/aditya");
    expect(profileKey("linkedin.com/in/aditya")).toBe("lookup:in/aditya");
  });

  it("collapses equivalent forms to same key", () => {
    expect(profileKey("https://www.linkedin.com/in/foo/")).toBe(
      profileKey("linkedin.com/in/foo")
    );
  });

  it("strips dangerous characters", () => {
    expect(profileKey("https://linkedin.com/in/<script>")).not.toContain("<");
    expect(profileKey("https://linkedin.com/in/<script>")).not.toContain(">");
  });
});

describe("KV silent degradation (no env vars set)", () => {
  // These tests run with no KV creds in the test env - every op must
  // return a safe default and not throw.

  it("kvAvailable returns false when not configured", () => {
    // In test env we deliberately don't set KV_REST_API_URL.
    expect(kvAvailable()).toBe(false);
  });

  it("getLookup returns null", async () => {
    expect(await getLookup("linkedin.com/in/aditya")).toBeNull();
  });

  it("batchGetLookup returns all-null map", async () => {
    const result = await batchGetLookup(["a", "b", "c"]);
    expect(result.a).toBeNull();
    expect(result.b).toBeNull();
    expect(result.c).toBeNull();
  });

  it("batchGetLookup with empty array returns empty map", async () => {
    expect(await batchGetLookup([])).toEqual({});
  });

  it("setLookup does not throw", async () => {
    await expect(
      setLookup("linkedin.com/in/test", {
        family: "engineering",
        tier: "S",
        cohort: "pro",
        percentile: 95,
        maskedName: "T.U.",
        when: new Date().toISOString(),
      })
    ).resolves.toBeUndefined();
  });

  it("olympusTop returns empty array", async () => {
    expect(await olympusTop()).toEqual([]);
  });

  it("recordTelemetry does not throw", async () => {
    await expect(
      recordTelemetry({ schools: 1, companies: 2 })
    ).resolves.toBeUndefined();
  });

  it("appendCellScore / getCellScores do not throw", async () => {
    await expect(
      appendCellScore("engineering", "pro", 75)
    ).resolves.toBeUndefined();
    expect(await getCellScores("engineering", "pro")).toEqual([]);
  });
});
