// Match a CrackedResult to the closest Dex archetype.
// Considers: total-score proximity to scoreRange + sub-stat distance + tier compatibility.

import { ARCHETYPES, type Archetype } from "@/data/archetypes";
import type { CrackedResult, SubStats, Tier } from "./types";

const tierRank: Record<Tier, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };

/** L2 distance between two SubStats vectors (each axis 0-99). */
function statDistance(a: SubStats, b: SubStats): number {
  const dx = a.hack - b.hack;
  const dy = a.grind - b.grind;
  const dz = a.taste - b.taste;
  const dw = a.rizz - b.rizz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
}

/** 0 inside range, increases linearly outside. */
function rangeDistance(value: number, range: [number, number]): number {
  if (value >= range[0] && value <= range[1]) return 0;
  if (value < range[0]) return range[0] - value;
  return value - range[1];
}

export interface ArchetypeMatch {
  archetype: Archetype;
  score: number; // 0-1, higher = better
}

export function matchArchetype(result: Pick<CrackedResult, "total" | "tier" | "subStats">): ArchetypeMatch {
  let best: { archetype: Archetype; raw: number } | null = null;

  for (const arch of ARCHETYPES) {
    // Range distance (0-100 scale)
    const rangeD = rangeDistance(result.total, arch.scoreRange);
    // Sub-stat distance (0-200 scale roughly, since 4-dim L2 of 0-99)
    const statD = statDistance(result.subStats, arch.typicalStats);
    // Tier mismatch penalty: 0, 1, 2, 3, 4 levels apart
    const tierGap = Math.abs(tierRank[arch.tier] - tierRank[result.tier]);

    // Composite: lower is better. Weights tuned by feel.
    const raw = rangeD * 1.5 + statD * 0.35 + tierGap * 12;

    if (!best || raw < best.raw) {
      best = { archetype: arch, raw };
    }
  }

  if (!best) {
    return { archetype: ARCHETYPES[0], score: 0 };
  }

  // Normalize: typical raw ranges 0-150. Convert to 0-1 "match score".
  const normalized = Math.max(0, Math.min(1, 1 - best.raw / 150));
  return { archetype: best.archetype, score: normalized };
}
