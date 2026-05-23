// Percentile computation — the three claims the v1.0 card shows.
// Per /plan-eng-review Percentile Computation section:
//   1. within-family, within-cohort   (primary)
//   2. cross-family, within-cohort    (secondary)
//   3. all-time global                (smallest)
//
// Blend: displayed_pct = (1-w) * synthetic + w * empirical
//        where w = max(0.1, min(real_users_in_cell / 500, 1.0))
//
// The `0.1` floor ensures the hand-collected seed always nudges even
// heavily-trafficked cells (prevents Mount-Olympus-cohort bias from a few
// early viral users distorting the claim for the rest).

import type { Family, LeagueKey, PercentileTrio } from "./types";
import { ALL_FAMILIES } from "./types";
import { FAMILY_WEIGHTS } from "@/data/family-weights";

// =============================================================================
// SYNTHETIC DISTRIBUTION — Claude-generated baseline per cell. Replaced by
// real empirical curves as `w` saturates per cell.
// =============================================================================

export interface CellDistribution {
  /** family this distribution belongs to. */
  family: Family;
  /** cohort this distribution belongs to. */
  cohort: LeagueKey;
  /** quantile lookup: score → percentile rank within this cell. */
  quantile: (internalScore: number) => number;
  /** count of real users that have contributed to this cell so far. */
  realUserCount: number;
}

// Default synthetic distribution per cell — a smooth bell curve centered on
// the league's baseline score. Replaced at runtime by Claude-generated curves
// anchored to the hand-collected seed, then converged toward empirical.
function defaultSyntheticQuantile(
  internalScore: number,
  baseline: number,
  spread = 18
): number {
  // Logistic CDF — smooth, monotonic, anchored at baseline.
  // pct = 100 / (1 + exp(-(score - baseline) / spread))
  const x = (internalScore - baseline) / spread;
  const pct = 100 / (1 + Math.exp(-x));
  return Math.max(0, Math.min(100, pct));
}

/**
 * Build a synthetic CellDistribution for one (family, cohort, baseline).
 * v1.0 ships with these as the default; gets overridden by real percentile
 * lookups from KV as users accumulate.
 */
export function buildSyntheticCell(
  family: Family,
  cohort: LeagueKey,
  baseline: number
): CellDistribution {
  return {
    family,
    cohort,
    quantile: (score: number) => defaultSyntheticQuantile(score, baseline),
    realUserCount: 0,
  };
}

// =============================================================================
// BLENDED PERCENTILE — synthetic + empirical mix with w_min floor.
// =============================================================================

export interface BlendInputs {
  internalScore: number;
  cellSyntheticPct: number;
  cellEmpiricalPct: number;
  realUserCount: number;
}

const W_MIN = 0.1;
const W_SATURATION = 500;

/**
 * displayed_pct(cell, user) = (1-w) * synthetic_pct + w * empirical_pct
 *                           where w = max(0.1, min(real_users / 500, 1.0))
 */
export function blendPercentile({
  cellSyntheticPct,
  cellEmpiricalPct,
  realUserCount,
}: BlendInputs): number {
  const w = Math.max(W_MIN, Math.min(realUserCount / W_SATURATION, 1.0));
  const blended = (1 - w) * cellSyntheticPct + w * cellEmpiricalPct;
  return Math.max(0, Math.min(100, blended));
}

/**
 * Compute empirical percentile rank for a user against a cell's distribution.
 * Returns rank-based percentile in [0, 100]. Tied scores rank at midpoint.
 */
export function empiricalPercentile(
  userScore: number,
  cellScores: number[]
): number {
  if (cellScores.length === 0) return 50; // no data yet → neutral
  let below = 0;
  let equal = 0;
  for (const s of cellScores) {
    if (s < userScore) below++;
    else if (s === userScore) equal++;
  }
  // Midpoint rank for ties.
  const rank = below + equal / 2;
  return Math.max(0, Math.min(100, (rank / cellScores.length) * 100));
}

// =============================================================================
// THREE-METRIC TRIO — the screenshot-bait claims.
// =============================================================================

export interface ComputeTrioInputs {
  internalScore: number;
  primaryFamily: Family;
  cohort: LeagueKey;
  /** Distribution lookup: (family, cohort) → CellDistribution. */
  cellLookup: (family: Family, cohort: LeagueKey) => CellDistribution;
  /** Global distribution across all families and cohorts (for the global metric). */
  globalDistribution: CellDistribution;
  /** Optional: empirical user scores per cell, for blending. */
  empiricalScoresLookup?: (family: Family, cohort: LeagueKey) => number[];
}

export function computePercentileTrio(input: ComputeTrioInputs): PercentileTrio {
  const { internalScore, primaryFamily, cohort, cellLookup, globalDistribution } = input;
  const empiricalScoresLookup = input.empiricalScoresLookup ?? (() => []);

  // 1. WITHIN-FAMILY, WITHIN-COHORT
  const primaryCell = cellLookup(primaryFamily, cohort);
  const primarySynth = primaryCell.quantile(internalScore);
  const primaryEmpScores = empiricalScoresLookup(primaryFamily, cohort);
  const primaryEmp = empiricalPercentile(internalScore, primaryEmpScores);
  const withinFamilyCohort = blendPercentile({
    internalScore,
    cellSyntheticPct: primarySynth,
    cellEmpiricalPct: primaryEmp,
    realUserCount: primaryCell.realUserCount,
  });

  // 2. CROSS-FAMILY, WITHIN-COHORT — family-weighted average over 9 family cells
  let crossWeighted = 0;
  let weightSum = 0;
  for (const f of ALL_FAMILIES) {
    const cell = cellLookup(f, cohort);
    const synth = cell.quantile(internalScore);
    const empScores = empiricalScoresLookup(f, cohort);
    const emp = empiricalPercentile(internalScore, empScores);
    const blended = blendPercentile({
      internalScore,
      cellSyntheticPct: synth,
      cellEmpiricalPct: emp,
      realUserCount: cell.realUserCount,
    });
    const w = FAMILY_WEIGHTS[f];
    crossWeighted += blended * w;
    weightSum += w;
  }
  const crossFamilyCohort = weightSum > 0 ? crossWeighted / weightSum : 50;

  // 3. ALL-TIME GLOBAL — single distribution across everyone
  const globalSynth = globalDistribution.quantile(internalScore);
  const globalEmpScores = empiricalScoresLookup("engineering", cohort); // proxy when global not blended
  const globalEmp = empiricalPercentile(internalScore, globalEmpScores);
  const global = blendPercentile({
    internalScore,
    cellSyntheticPct: globalSynth,
    cellEmpiricalPct: globalEmp,
    realUserCount: globalDistribution.realUserCount,
  });

  return {
    withinFamilyCohort: Math.round(withinFamilyCohort * 10) / 10,
    crossFamilyCohort: Math.round(crossFamilyCohort * 10) / 10,
    global: Math.round(global * 10) / 10,
  };
}
