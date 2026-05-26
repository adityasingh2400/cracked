// Tests for the Vercel KV (Upstash Redis) wrapper.
//
// Two regimes are covered:
//   1. Unconfigured (no KV env vars): every read returns a safe default and
//      every write is a no-op, per the Section 2.4 silent-degradation contract.
//   2. Configured (mocked Redis): round-trips, batch reads with mixed
//      hit/miss/string/object/bad-JSON values, Olympus ordering, telemetry
//      counters, cell-score lists, and the error path where Redis throws.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LookupEntry, OlympusRecord } from "../kv";

// Hoisted in-memory fake so the vi.mock factory below can close over it.
const h = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  const lists = new Map<string, string[]>();
  const zmembers = new Map<string, number>();
  let throwOnce = false;
  const maybeThrow = () => {
    if (throwOnce) {
      throwOnce = false;
      throw new Error("redis unavailable");
    }
  };
  const fake = {
    get: vi.fn(async (k: string) => {
      maybeThrow();
      return store.has(k) ? store.get(k) : null;
    }),
    set: vi.fn(async (k: string, v: unknown) => {
      maybeThrow();
      store.set(k, v);
      return "OK";
    }),
    mget: vi.fn(async (...keys: string[]) => {
      maybeThrow();
      return keys.map((k) => (store.has(k) ? store.get(k) : null));
    }),
    zadd: vi.fn(async (_key: string, m: { score: number; member: string }) => {
      maybeThrow();
      zmembers.set(m.member, m.score);
      return 1;
    }),
    zrange: vi.fn(
      async (_key: string, start: number, stop: number, opts?: { rev?: boolean }) => {
        maybeThrow();
        const ordered = [...zmembers.entries()]
          .sort((a, b) => (opts?.rev ? b[1] - a[1] : a[1] - b[1]))
          .map(([member]) => member);
        return ordered.slice(start, stop + 1);
      },
    ),
    incr: vi.fn(async () => {
      maybeThrow();
      return 1;
    }),
    incrby: vi.fn(async () => {
      maybeThrow();
      return 1;
    }),
    lpush: vi.fn(async (k: string, v: string) => {
      maybeThrow();
      const arr = lists.get(k) ?? [];
      arr.unshift(v);
      lists.set(k, arr);
      return arr.length;
    }),
    ltrim: vi.fn(async () => {
      maybeThrow();
      return "OK";
    }),
    lrange: vi.fn(async (k: string) => {
      maybeThrow();
      return lists.get(k) ?? [];
    }),
  };
  return {
    store,
    lists,
    zmembers,
    fake,
    failNextCall: () => {
      throwOnce = true;
    },
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => h.fake),
}));

const ORIGINAL_ENV = { ...process.env };

type KvModule = typeof import("../kv");

async function loadConfigured(): Promise<KvModule> {
  process.env.KV_REST_API_URL = "https://fake.upstash.io";
  process.env.KV_REST_API_TOKEN = "faketoken";
  vi.resetModules();
  return import("../kv");
}

async function loadUnconfigured(): Promise<KvModule> {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  vi.resetModules();
  return import("../kv");
}

const sampleEntry: LookupEntry = {
  family: "engineering",
  tier: "S",
  cohort: "legend",
  percentile: 99,
  maskedName: "A.S.",
  when: "2026-05-26T00:00:00.000Z",
};

beforeEach(() => {
  h.store.clear();
  h.lists.clear();
  h.zmembers.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("profileKey", () => {
  it("collapses protocol, www, linkedin.com prefix, and trailing slashes", async () => {
    const kv = await loadUnconfigured();
    const a = kv.profileKey("https://www.linkedin.com/in/aditya/");
    const b = kv.profileKey("linkedin.com/in/aditya");
    const c = kv.profileKey("LinkedIn.com/in/Aditya///");
    expect(a).toBe("lookup:in/aditya");
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it("replaces unsafe characters with underscores", async () => {
    const kv = await loadUnconfigured();
    const key = kv.profileKey("https://linkedin.com/in/<script>");
    expect(key).not.toContain("<");
    expect(key).not.toContain(">");
    expect(kv.profileKey("in/a b?c")).toBe("lookup:in/a_b_c");
  });
});

describe("unconfigured (no KV env)", () => {
  it("kvAvailable is false and reads return safe defaults", async () => {
    const kv = await loadUnconfigured();
    expect(kv.kvAvailable()).toBe(false);
    expect(await kv.getLookup("in/x")).toBeNull();
    expect(await kv.olympusTop()).toEqual([]);
    expect(await kv.getCellScores("eng", "pro")).toEqual([]);
    expect(await kv.getShareResult("abc")).toBeNull();
    expect(await kv.batchGetLookup(["in/x", "in/y"])).toEqual({
      "in/x": null,
      "in/y": null,
    });
  });

  it("writes are no-ops that never throw", async () => {
    const kv = await loadUnconfigured();
    await expect(kv.setLookup("in/x", sampleEntry)).resolves.toBeUndefined();
    await expect(kv.recordTelemetry({ school: 2 })).resolves.toBeUndefined();
    await expect(kv.appendCellScore("eng", "pro", 1)).resolves.toBeUndefined();
    expect(h.fake.set).not.toHaveBeenCalled();
  });
});

describe("configured (mocked Redis)", () => {
  it("round-trips a lookup entry through set and get", async () => {
    const kv = await loadConfigured();
    expect(kv.kvAvailable()).toBe(true);
    await kv.setLookup("https://linkedin.com/in/aditya/", sampleEntry);
    const got = await kv.getLookup("in/aditya");
    expect(got).toEqual(sampleEntry);
  });

  it("returns a stored object directly without JSON parsing", async () => {
    const kv = await loadConfigured();
    h.store.set(kv.profileKey("in/obj"), sampleEntry);
    expect(await kv.getLookup("in/obj")).toEqual(sampleEntry);
  });

  it("getLookup returns null on a miss", async () => {
    const kv = await loadConfigured();
    expect(await kv.getLookup("in/missing")).toBeNull();
  });

  it("getLookup degrades to null when Redis throws", async () => {
    const kv = await loadConfigured();
    h.failNextCall();
    expect(await kv.getLookup("in/aditya")).toBeNull();
  });

  it("batchGetLookup handles object, string, bad-JSON, and miss together", async () => {
    const kv = await loadConfigured();
    await kv.setLookup("in/string", sampleEntry); // stored as JSON string
    h.store.set(kv.profileKey("in/object"), sampleEntry); // stored as object
    h.store.set(kv.profileKey("in/bad"), "{not valid json"); // unparseable
    const out = await kv.batchGetLookup(["in/string", "in/object", "in/bad", "in/miss"]);
    expect(out["in/string"]).toEqual(sampleEntry);
    expect(out["in/object"]).toEqual(sampleEntry);
    expect(out["in/bad"]).toBeNull();
    expect(out["in/miss"]).toBeNull();
  });

  it("batchGetLookup short-circuits on an empty url list", async () => {
    const kv = await loadConfigured();
    expect(await kv.batchGetLookup([])).toEqual({});
    expect(h.fake.mget).not.toHaveBeenCalled();
  });

  it("batchGetLookup degrades to all-null when Redis throws", async () => {
    const kv = await loadConfigured();
    h.failNextCall();
    expect(await kv.batchGetLookup(["in/a", "in/b"])).toEqual({
      "in/a": null,
      "in/b": null,
    });
  });

  it("olympusTop returns records in descending score order", async () => {
    const kv = await loadConfigured();
    const rec = (id: string): OlympusRecord => ({
      id,
      tier: "MYTHIC",
      primaryFamily: "engineering",
      chainCount: 3,
      cohort: "legend",
      cohortPercentile: 98,
      maskedName: "A.S.",
      when: "2026-05-26T00:00:00.000Z",
    });
    await kv.olympusUpsert(rec("low"), 10);
    await kv.olympusUpsert(rec("high"), 99);
    const top = await kv.olympusTop(10);
    expect(top.map((r) => r.id)).toEqual(["high", "low"]);
  });

  it("olympusTop returns empty when the set has no members", async () => {
    const kv = await loadConfigured();
    expect(await kv.olympusTop()).toEqual([]);
  });

  it("recordTelemetry increments run, field, and per-category counters", async () => {
    const kv = await loadConfigured();
    await kv.recordTelemetry({ school: 2, company: 3 });
    expect(h.fake.incr).toHaveBeenCalledTimes(1);
    // one fields-total counter plus one per category
    expect(h.fake.incrby).toHaveBeenCalledTimes(3);
  });

  it("appendCellScore pushes then trims, and getCellScores parses finite numbers", async () => {
    const kv = await loadConfigured();
    await kv.appendCellScore("engineering", "pro", 42);
    expect(h.fake.lpush).toHaveBeenCalledTimes(1);
    expect(h.fake.ltrim).toHaveBeenCalledWith(expect.any(String), 0, 9999);
    h.lists.set("cell:engineering:pro", ["42", "not-a-number", "7"]);
    expect(await kv.getCellScores("engineering", "pro")).toEqual([42, 7]);
  });

  it("share results round-trip and write with a TTL", async () => {
    const kv = await loadConfigured();
    const result = { schema: "v1", foo: "bar" } as unknown as Parameters<
      typeof kv.setShareResult
    >[1];
    await kv.setShareResult("abc123", result);
    expect(h.fake.set).toHaveBeenCalledWith(
      "share:abc123",
      expect.any(String),
      expect.objectContaining({ ex: expect.any(Number) }),
    );
    expect(await kv.getShareResult("abc123")).toEqual(result);
  });

  it("getShareResult returns null on a configured miss", async () => {
    const kv = await loadConfigured();
    expect(await kv.getShareResult("nope")).toBeNull();
  });

  it("olympusTop skips members whose per-user record is missing", async () => {
    const kv = await loadConfigured();
    // Member is in the sorted set but its per-user JSON was never written.
    h.zmembers.set("ghost", 50);
    expect(await kv.olympusTop(10)).toEqual([]);
  });

  it("read helpers degrade to empty defaults when Redis throws", async () => {
    const kv = await loadConfigured();
    h.failNextCall();
    expect(await kv.olympusTop()).toEqual([]);
    h.failNextCall();
    expect(await kv.getCellScores("eng", "pro")).toEqual([]);
    h.failNextCall();
    expect(await kv.getShareResult("x")).toBeNull();
  });

  it("write helpers swallow Redis errors", async () => {
    const kv = await loadConfigured();
    const record: OlympusRecord = {
      id: "x",
      tier: "MYTHIC",
      primaryFamily: "engineering",
      chainCount: 1,
      cohort: "legend",
      cohortPercentile: 90,
      maskedName: "A.S.",
      when: "2026-05-26T00:00:00.000Z",
    };
    const shareResult = { schema: "v1" } as unknown as Parameters<
      typeof kv.setShareResult
    >[1];
    h.failNextCall();
    await expect(kv.setLookup("in/x", sampleEntry)).resolves.toBeUndefined();
    h.failNextCall();
    await expect(kv.olympusUpsert(record, 5)).resolves.toBeUndefined();
    h.failNextCall();
    await expect(kv.recordTelemetry({ school: 1 })).resolves.toBeUndefined();
    h.failNextCall();
    await expect(kv.appendCellScore("eng", "pro", 1)).resolves.toBeUndefined();
    h.failNextCall();
    await expect(kv.setShareResult("x", shareResult)).resolves.toBeUndefined();
  });
});
