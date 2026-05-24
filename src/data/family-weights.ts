// Coarse 9-family population weights for the cross-family-within-cohort
// percentile claim ("more cracked than Y% of all 23-26 year olds").
//
// v1.0 ships with hand-picked estimates based on rough cultural intuition
// and back-of-envelope Census/BLS sanity checks. Per /plan-eng-review #1.5:
// "use a coarse 9-bucket population estimate." Refined to empirical share
// once `w = min(real_users_in_cell / 500, 1.0)` saturates per family.
//
// IMPORTANT: weights MUST sum to 1.0. Runtime assertion at module load.

import type { Family } from "@/lib/types";
import { ALL_FAMILIES } from "@/lib/types";

export const FAMILY_WEIGHTS: Record<Family, number> = {
  // Engineering - large bucket: all CS, AI, software, infra, ML, quant.
  // Roughly 4% of US workforce, higher share among college-age cohorts.
  engineering: 0.18,
  // Science & academia - narrower: PhDs, profs, lab scientists, competition.
  // Most STEM grads route to industry (Engineering); academia is a smaller share.
  science_academia: 0.07,
  // Founder - small absolute population, oversampled in cracked.com's target
  // audience (17-26 internet-native crowd). Hand-tuned higher than census.
  founder: 0.06,
  // Finance - banking, hedge funds, VC, PE. ~2-3% of college-educated workforce,
  // overrepresented in elite-school cohorts.
  finance: 0.09,
  // Consulting & corporate - broadest white-collar bucket. MBB + F500 climbers
  // + strategists + ops/finance-coded careers without trading-floor specificity.
  consulting_corporate: 0.20,
  // Law & public service - BigLaw + government + military officers. Smaller
  // than corporate but real share.
  law_public_service: 0.08,
  // Medicine - doctors + biotech + healthcare professionals.
  // ~3-4% of US workforce, narrower at 17-26 cohort (pre-med).
  medicine: 0.07,
  // Athletics & performance - pro athletes + classical musicians + dancers.
  // Tiny absolute population but real audience for "am I cracked at this."
  athletics_performance: 0.05,
  // Creative & audience - writers, designers, creators, brand founders, influencers.
  // Large at 17-26 cohort (internet-native creators) and growing.
  creative_audience: 0.20,
};

// Runtime assertion: weights sum to 1.0 (within float epsilon).
const SUM = Object.values(FAMILY_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(SUM - 1.0) > 1e-6) {
  throw new Error(
    `FAMILY_WEIGHTS must sum to 1.0, got ${SUM.toFixed(4)}. Fix src/data/family-weights.ts.`
  );
}

// Every family in ALL_FAMILIES must have a weight (catches typos / new families).
for (const f of ALL_FAMILIES) {
  if (FAMILY_WEIGHTS[f] === undefined) {
    throw new Error(`FAMILY_WEIGHTS missing entry for family: ${f}`);
  }
}

export function weightFor(family: Family): number {
  return FAMILY_WEIGHTS[family];
}
