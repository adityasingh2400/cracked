// Vercel KV (Upstash Redis) wrapper for v1.0.
//
// Per /plan-eng-review Section 1.2: persistence layer for /api/lookup +
// /api/telemetry + Mount Olympus sorted set. Free tier = 10k commands/day +
// 256MB storage, plenty for v1.0 launch.
//
// Privacy posture: ONLY the URL slug (hashed) and {family, tier, cohort,
// percentile, masked_name, when} are persisted. Never the raw signal set.
// README updated to reflect this change from v0.7's "literally stateless."
//
// Silent degradation: every read returns a safe default on failure; every
// write swallows errors and logs server-side. Endpoint handlers never
// propagate 5xx to clients (per /plan-eng-review Section 2.4 locked contract).

import { Redis } from "@upstash/redis";
import type { CrackedResultV1 } from "./types";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let _client: Redis | null = null;

function client(): Redis | null {
  if (_client) return _client;
  if (!KV_URL || !KV_TOKEN) {
    // Not configured - endpoints fall through to "no data" responses.
    return null;
  }
  _client = new Redis({ url: KV_URL, token: KV_TOKEN });
  return _client;
}

export function kvAvailable(): boolean {
  return client() !== null;
}

// =============================================================================
// LOOKUP - profile_url → tier data
// =============================================================================

export interface LookupEntry {
  /** family the user qualifies in (primary). */
  family: string;
  /** tier (D / C / B / A / S / MYTHIC / ASCENDED). */
  tier: string;
  /** cohort label (rookie / prospect / apprentice / pro / veteran / legend). */
  cohort: string;
  /** within-family-within-cohort percentile claim (the primary card metric). */
  percentile: number;
  /** masked display name, e.g. "A.S.". */
  maskedName: string;
  /** ISO timestamp when this entry was last updated. */
  when: string;
}

/**
 * Hash a LinkedIn profile URL to a stable, namespace-safe KV key.
 * Strips protocol, trailing slashes, and the linkedin.com prefix so
 * `/in/aditya` and `linkedin.com/in/aditya/` collapse to the same key.
 */
export function profileKey(profileUrl: string): string {
  const cleaned = profileUrl
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^linkedin\.com\//, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9/_-]/g, "_");
  return `lookup:${cleaned}`;
}

/** Single profile read. Returns null on miss or any error. */
export async function getLookup(profileUrl: string): Promise<LookupEntry | null> {
  const c = client();
  if (!c) return null;
  try {
    const raw = await c.get<LookupEntry | string>(profileKey(profileUrl));
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("kv.getLookup failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Batched MGET of multiple profile URLs - used by Chrome extension browse-mode.
 * Per /plan-eng-review Section 4.1: this is the ONLY supported pattern for
 * lookup at scale. Returns map of url → entry (null for misses).
 */
export async function batchGetLookup(
  profileUrls: string[]
): Promise<Record<string, LookupEntry | null>> {
  const result: Record<string, LookupEntry | null> = {};
  for (const u of profileUrls) result[u] = null;

  const c = client();
  if (!c || profileUrls.length === 0) return result;

  try {
    const keys = profileUrls.map(profileKey);
    const values = await c.mget<(LookupEntry | string | null)[]>(...keys);
    profileUrls.forEach((url, i) => {
      const v = values[i];
      if (!v) {
        result[url] = null;
      } else if (typeof v === "string") {
        try { result[url] = JSON.parse(v); } catch { result[url] = null; }
      } else {
        result[url] = v;
      }
    });
  } catch (err) {
    console.error(
      "kv.batchGetLookup failed:",
      err instanceof Error ? err.message : err
    );
    // Leave result as all-nulls; silent degradation per Section 2.4.
  }
  return result;
}

/** Write a single profile lookup entry. Fire-and-forget; logs but swallows errors. */
export async function setLookup(
  profileUrl: string,
  entry: LookupEntry
): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    await c.set(profileKey(profileUrl), JSON.stringify(entry));
  } catch (err) {
    console.error("kv.setLookup failed:", err instanceof Error ? err.message : err);
  }
}

// =============================================================================
// OLYMPUS sorted set + per-user record
// =============================================================================

const OLYMPUS_ZSET = "olympus:zset";
function olympusUserKey(userId: string): string {
  return `olympus:user:${userId}`;
}

export interface OlympusRecord {
  id: string;
  tier: string; // MYTHIC | ASCENDED
  primaryFamily: string;
  chainCount: number;
  cohort: string;
  cohortPercentile: number;
  maskedName: string;
  headlineChain?: string;
  when: string;
}

/** Add or update a user's Olympus entry. ZADD + per-user JSON. */
export async function olympusUpsert(
  record: OlympusRecord,
  score: number
): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    await c.zadd(OLYMPUS_ZSET, { score, member: record.id });
    await c.set(olympusUserKey(record.id), JSON.stringify(record));
  } catch (err) {
    console.error("kv.olympusUpsert failed:", err instanceof Error ? err.message : err);
  }
}

/** Read top-N Olympus entries. Default 100 per design. */
export async function olympusTop(n = 100): Promise<OlympusRecord[]> {
  const c = client();
  if (!c) return [];
  try {
    // ZREVRANGE returns member IDs in descending score order.
    const ids = (await c.zrange(OLYMPUS_ZSET, 0, n - 1, { rev: true })) as string[];
    if (ids.length === 0) return [];
    const keys = ids.map(olympusUserKey);
    const records = await c.mget<(OlympusRecord | string | null)[]>(...keys);
    return records
      .map((r: OlympusRecord | string | null) => {
        if (!r) return null;
        return typeof r === "string" ? (JSON.parse(r) as OlympusRecord) : r;
      })
      .filter((r: OlympusRecord | null): r is OlympusRecord => r !== null);
  } catch (err) {
    console.error("kv.olympusTop failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// =============================================================================
// SELECTOR TELEMETRY - bookmarklet field-count pings
// =============================================================================

const TELEMETRY_PREFIX = "telemetry:";

export interface TelemetryRecord {
  fieldCounts: Record<string, number>; // category → count of fields parsed
  totalFields: number;
  ts: number;
}

/**
 * Append a telemetry sample. Uses date-bucketed keys + INCRBY counters so we
 * can detect DOM rotations within hours.
 */
export async function recordTelemetry(
  fieldCounts: Record<string, number>
): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const total = Object.values(fieldCounts).reduce((a, b) => a + b, 0);
    await c.incr(`${TELEMETRY_PREFIX}runs:${today}`);
    await c.incrby(`${TELEMETRY_PREFIX}fields:${today}`, total);
    for (const [cat, n] of Object.entries(fieldCounts)) {
      await c.incrby(`${TELEMETRY_PREFIX}${cat}:${today}`, n);
    }
  } catch (err) {
    console.error("kv.recordTelemetry failed:", err instanceof Error ? err.message : err);
  }
}

// =============================================================================
// EMPIRICAL DISTRIBUTIONS - per-cell user score lists for percentile blending
// =============================================================================

function cellKey(family: string, cohort: string): string {
  return `cell:${family}:${cohort}`;
}

/**
 * Append a user's internal score to the family×cohort empirical distribution.
 * Stored as a Redis list, capped at last 10k entries per cell to bound memory.
 */
export async function appendCellScore(
  family: string,
  cohort: string,
  internalScore: number
): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    const key = cellKey(family, cohort);
    await c.lpush(key, String(internalScore));
    await c.ltrim(key, 0, 9_999); // cap at 10k
  } catch (err) {
    console.error("kv.appendCellScore failed:", err instanceof Error ? err.message : err);
  }
}

export async function getCellScores(
  family: string,
  cohort: string
): Promise<number[]> {
  const c = client();
  if (!c) return [];
  try {
    const raw = (await c.lrange(cellKey(family, cohort), 0, -1)) as string[];
    return raw.map((s) => Number(s)).filter((n) => Number.isFinite(n));
  } catch (err) {
    console.error("kv.getCellScores failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// =============================================================================
// SHARE CARDS - short /c/<id> storage
// =============================================================================

const SHARE_TTL_SECONDS = 60 * 60 * 24 * 30;

function shareKey(id: string): string {
  return `share:${id}`;
}

/** Read a persisted card result by short id. Returns null on miss or error. */
export async function getShareResult(id: string): Promise<CrackedResultV1 | null> {
  const c = client();
  if (!c) return null;
  try {
    const raw = await c.get<CrackedResultV1 | string>(shareKey(id));
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.error("kv.getShareResult failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Persist a card result under its short id. Fire-and-forget safe. */
export async function setShareResult(id: string, result: CrackedResultV1): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    await c.set(shareKey(id), JSON.stringify(result), { ex: SHARE_TTL_SECONDS });
  } catch (err) {
    console.error("kv.setShareResult failed:", err instanceof Error ? err.message : err);
  }
}
