// URL-safe encoding for the public CrackedResultV1 share payload.
// Keep this payload intentionally small: browser asset requests include the
// current URL as Referer, so giant /c/<data> routes can break CSS/JS loading.

import { gzipSync, gunzipSync } from "node:zlib";
import type { CrackedResultV1 } from "./types";

export function encodeResult(result: CrackedResultV1): string {
  const json = JSON.stringify(toSharePayload(result));
  const gz = gzipSync(json, { level: 9 });
  return gz.toString("base64url");
}

export function decodeResult(encoded: string): CrackedResultV1 | null {
  try {
    const buf = Buffer.from(encoded, "base64url");
    const json = gunzipSync(buf).toString("utf-8");
    return JSON.parse(json) as CrackedResultV1;
  } catch {
    return null;
  }
}

export function toSharePayload(result: CrackedResultV1): CrackedResultV1 {
  return {
    id: result.id,
    name: result.name,
    tier: result.tier,
    tierStars: result.tierStars,
    signalScore: result.signalScore,
    league: result.league,
    verdict: result.verdict,
    flavor: result.flavor,
    createdAt: result.createdAt,
    modelUsed: result.modelUsed,
    families: result.families?.map((family) => ({
      ...family,
      matched: family.matched.slice(0, 12),
      activeChains: family.activeChains.slice(0, 6),
    })),
    primaryFamily: result.primaryFamily,
    secondaryFamily: result.secondaryFamily,
    percentiles: result.percentiles,
    scoringTier: result.scoringTier,
    calibrating: result.calibrating,
    photoUrl: result.photoUrl,
    speciality: result.speciality,
    bestAccolades: result.bestAccolades?.slice(0, 6).map((item) => ({
      title: item.title,
      detail: item.detail,
      family: item.family,
    })),
    chainsAll: result.chainsAll?.slice(0, 8),
    achievementsAll: result.achievementsAll?.slice(0, 14),
  };
}
