// Achievement library aggregator - combines all 9 families' Achievements + Chains
// into a single FamilyLibrary for the chain-detector to consume.
//
// Per /plan-eng-review Section 1.4 Generation Pipeline: this index is the
// single source of truth. To regenerate any family's library, edit its
// individual file, NOT this index.

import type { Achievement, Chain, Family } from "@/lib/types";
import type { FamilyLibrary } from "@/lib/chain-detector";

import { ENGINEERING_ACHIEVEMENTS, ENGINEERING_CHAINS } from "./engineering";
import { SCIENCE_ACADEMIA_ACHIEVEMENTS, SCIENCE_ACADEMIA_CHAINS } from "./science_academia";
import { FOUNDER_ACHIEVEMENTS, FOUNDER_CHAINS } from "./founder";
import { FINANCE_ACHIEVEMENTS, FINANCE_CHAINS } from "./finance";
import {
  CONSULTING_CORPORATE_ACHIEVEMENTS,
  CONSULTING_CORPORATE_CHAINS,
} from "./consulting_corporate";
import {
  LAW_PUBLIC_SERVICE_ACHIEVEMENTS,
  LAW_PUBLIC_SERVICE_CHAINS,
} from "./law_public_service";
import { MEDICINE_ACHIEVEMENTS, MEDICINE_CHAINS } from "./medicine";
import {
  ATHLETICS_PERFORMANCE_ACHIEVEMENTS,
  ATHLETICS_PERFORMANCE_CHAINS,
} from "./athletics_performance";
import {
  CREATIVE_AUDIENCE_ACHIEVEMENTS,
  CREATIVE_AUDIENCE_CHAINS,
} from "./creative_audience";

const PER_FAMILY: Record<Family, { achievements: Achievement[]; chains: Chain[] }> = {
  engineering: { achievements: ENGINEERING_ACHIEVEMENTS, chains: ENGINEERING_CHAINS },
  science_academia: {
    achievements: SCIENCE_ACADEMIA_ACHIEVEMENTS,
    chains: SCIENCE_ACADEMIA_CHAINS,
  },
  founder: { achievements: FOUNDER_ACHIEVEMENTS, chains: FOUNDER_CHAINS },
  finance: { achievements: FINANCE_ACHIEVEMENTS, chains: FINANCE_CHAINS },
  consulting_corporate: {
    achievements: CONSULTING_CORPORATE_ACHIEVEMENTS,
    chains: CONSULTING_CORPORATE_CHAINS,
  },
  law_public_service: {
    achievements: LAW_PUBLIC_SERVICE_ACHIEVEMENTS,
    chains: LAW_PUBLIC_SERVICE_CHAINS,
  },
  medicine: { achievements: MEDICINE_ACHIEVEMENTS, chains: MEDICINE_CHAINS },
  athletics_performance: {
    achievements: ATHLETICS_PERFORMANCE_ACHIEVEMENTS,
    chains: ATHLETICS_PERFORMANCE_CHAINS,
  },
  creative_audience: {
    achievements: CREATIVE_AUDIENCE_ACHIEVEMENTS,
    chains: CREATIVE_AUDIENCE_CHAINS,
  },
};

/** Combined library across all 9 families. Used by chain-detector.scoreAllFamilies. */
export const FAMILY_LIBRARY: FamilyLibrary = {
  achievements: Object.values(PER_FAMILY).flatMap((f) => f.achievements),
  chains: Object.values(PER_FAMILY).flatMap((f) => f.chains),
};

export function libraryForFamily(family: Family): FamilyLibrary {
  return PER_FAMILY[family];
}

/** Critical-gap guard #1 from /plan-eng-review failure modes:
 *  assert that the combined library has at least ONE Achievement.
 *  Without this, all 9 families would silently return D tier.
 */
if (FAMILY_LIBRARY.achievements.length === 0) {
  throw new Error(
    "Achievement library is empty - every user would score D across all families. " +
      "Populate at least one src/data/achievements/{family}.ts before deploying."
  );
}

/** Also assert every family has at least one Achievement (post-v1.0 quality bar). */
for (const f of Object.keys(PER_FAMILY) as Family[]) {
  if (PER_FAMILY[f].achievements.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Family "${f}" has 0 Achievements - users in this family will all score D.`
    );
  }
}
