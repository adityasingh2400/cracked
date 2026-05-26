// Serializable views for dex pages — pre-formats signals so client components
// don't need RegExp instances passed across the server boundary.

import type { Achievement, Chain, Tier } from "@/lib/types";
import type { FamilyMeta } from "@/data/families";
import { FAMILY_LIBRARY } from "@/data/achievements";
import { formatSignals } from "@/lib/format-signals";

export interface DexAchievementView {
  id: string;
  tier: Tier;
  label: string;
  description: string;
  signals: string[];
  evidence?: string[];
  ageCap?: number;
}

export interface DexChainView {
  id: string;
  name: string;
  bumpTo: Tier;
  description: string;
  requires: Array<{ id: string; label: string }>;
}

export interface DexFamilyLadder {
  meta: FamilyMeta;
  achievementsByTier: Record<Tier, DexAchievementView[]>;
  chainsByTier: Record<Tier, DexChainView[]>;
  stats: { achievements: number; chains: number };
}

const TIER_ORDER: Tier[] = ["ASCENDED", "MYTHIC", "S", "A", "B", "C", "D"];

function emptyTierMap<T>(): Record<Tier, T[]> {
  return Object.fromEntries(TIER_ORDER.map((t) => [t, [] as T[]])) as Record<Tier, T[]>;
}

export function toAchievementView(a: Achievement): DexAchievementView {
  return {
    id: a.id,
    tier: a.tier,
    label: a.label,
    description: a.description,
    signals: formatSignals(a.signals),
    evidence: a.evidence,
    ageCap: a.ageCap,
  };
}

export function buildDexLadder(
  meta: FamilyMeta,
  achievements: Achievement[],
  chains: Chain[]
): DexFamilyLadder {
  const labelById = new Map(
    FAMILY_LIBRARY.achievements.map((a) => [a.id, a.label])
  );

  const achievementsByTier = emptyTierMap<DexAchievementView>();
  for (const a of achievements) {
    achievementsByTier[a.tier].push(toAchievementView(a));
  }

  const chainsByTier = emptyTierMap<DexChainView>();
  for (const c of chains) {
    chainsByTier[c.bumpTo].push({
      id: c.id,
      name: c.name,
      bumpTo: c.bumpTo,
      description: c.description,
      requires: c.requires.map((id) => ({
        id,
        label: labelById.get(id) ?? id.replace(/^[^_]+_/, "").replace(/_/g, " "),
      })),
    });
  }

  return {
    meta,
    achievementsByTier,
    chainsByTier,
    stats: { achievements: achievements.length, chains: chains.length },
  };
}

export { TIER_ORDER as DEX_TIER_ORDER };
