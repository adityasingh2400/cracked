// Short-ID share storage for /c/[id] routes.
//
// Giant gzip blobs in the URL path blow past browser/proxy header limits because
// asset requests send the current page URL as Referer. Persist results under the
// existing nanoid and keep legacy encoded blobs working as a fallback.

import type { CrackedResultV1 } from "./types";
import { decodeResult, encodeResult, toSharePayload } from "./encode";
import { getShareResult, setShareResult } from "./kv";

const MAX_INLINE_SHARE_CHARS = 96;
const MEMORY_CAP = 500;

declare global {
  // eslint-disable-next-line no-var
  var __crackedShareStore: Map<string, CrackedResultV1> | undefined;
}

const memoryStore =
  globalThis.__crackedShareStore ?? new Map<string, CrackedResultV1>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__crackedShareStore = memoryStore;
}

export function sharePath(result: CrackedResultV1): string {
  return `/c/${result.id}`;
}

export async function persistShareResult(result: CrackedResultV1): Promise<string> {
  const payload = toSharePayload(result);
  rememberShare(payload);
  await setShareResult(result.id, payload);
  return result.id;
}

export async function resolveShareResult(data: string): Promise<CrackedResultV1 | null> {
  const trimmed = data.trim();
  if (!trimmed) return null;

  if (looksLikeInlineShareBlob(trimmed)) {
    return decodeResult(trimmed);
  }

  const stored = await loadStoredShare(trimmed);
  if (stored) return stored;

  return decodeResult(trimmed);
}

export function legacyEncodedShare(result: CrackedResultV1): string {
  return encodeResult(result);
}

function looksLikeInlineShareBlob(data: string): boolean {
  return data.length > MAX_INLINE_SHARE_CHARS;
}

function rememberShare(result: CrackedResultV1): void {
  if (memoryStore.has(result.id)) {
    memoryStore.delete(result.id);
  }
  memoryStore.set(result.id, result);
  while (memoryStore.size > MEMORY_CAP) {
    const oldest = memoryStore.keys().next().value;
    if (!oldest) break;
    memoryStore.delete(oldest);
  }
}

async function loadStoredShare(id: string): Promise<CrackedResultV1 | null> {
  const local = memoryStore.get(id);
  if (local) return local;

  const remote = await getShareResult(id);
  if (remote) rememberShare(remote);
  return remote;
}
