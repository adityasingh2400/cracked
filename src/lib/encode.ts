// URL-safe encoding for CrackedResultV1 so the share link IS the storage.
// No database required. Compressed with gzip + base64url.
//
// A typical result is ~2-4kb JSON → ~800-1500 bytes encoded.
// Well under the 8kb URL safe limit.

import { gzipSync, gunzipSync } from "node:zlib";
import type { CrackedResultV1 } from "./types";

export function encodeResult(result: CrackedResultV1): string {
  const json = JSON.stringify(result);
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
