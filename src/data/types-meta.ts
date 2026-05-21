// Type metadata for the Cracked Dex.
// 7 elemental types. Each has its own color palette, glyph, and narrative —
// like Pokemon types (fire/water/grass). Archetypes belong to one primary
// type + 0-2 secondary types.

import type { ArchetypeType } from "./archetypes";

export interface TypeMeta {
  key: ArchetypeType;
  slug: string;           // url-friendly
  name: string;           // display name
  motto: string;          // tagline shown on type card
  description: string;    // 2-3 sentence narrative for the type page
  glyph: string;          // single-char visual symbol
  /** Holo foil colors for this type — drives the holo treatment everywhere. */
  foil: { primary: string; secondary: string; tertiary: string };
  /** Hex color for the type chip / accent. */
  accent: string;
  /** Sub-stat this type optimizes for. */
  signature: "hack" | "grind" | "taste" | "rizz";
  /** Adjacent types (for "if you like X, see also Y"). */
  adjacent: ArchetypeType[];
}

export const TYPES_META: Record<ArchetypeType, TypeMeta> = {
  Hacker: {
    key: "Hacker",
    slug: "hacker",
    name: "Hacker",
    motto: "Compiles. Commits. Computes.",
    description:
      "The builder type. Hackers grow by shipping. They measure themselves in commits, PRs merged, systems made, and oddball side projects deployed to fifteen friends. Engineering is the act. Output is the proof.",
    glyph: "⌬",
    foil: { primary: "#06B6D4", secondary: "#22D3EE", tertiary: "#8B5CF6" },
    accent: "#22D3EE",
    signature: "hack",
    adjacent: ["Quant", "Researcher"],
  },
  Quant: {
    key: "Quant",
    slug: "quant",
    name: "Quant",
    motto: "Math, money, and the difference between them.",
    description:
      "The numerical type. Quants win by being right when others guess. Olympiad medals stack with Jane Street partnerships. The job is finding the edge before the market closes it. Sub-S means you didn't win Putnam.",
    glyph: "Σ",
    foil: { primary: "#FCD34D", secondary: "#F59E0B", tertiary: "#0A0A0F" },
    accent: "#FCD34D",
    signature: "taste",
    adjacent: ["Scholar", "Hacker"],
  },
  Founder: {
    key: "Founder",
    slug: "founder",
    name: "Founder",
    motto: "Made it. Shipped it. Sold it.",
    description:
      "The operator type. Founders score on what they built and who funded it. YC batches, Thiel Fellowships, exits, unicorns — these are the load-bearing signals. The dex separates 'has an LLC' from 'has a board'.",
    glyph: "▲",
    foil: { primary: "#F97316", secondary: "#EF4444", tertiary: "#FCD34D" },
    accent: "#F97316",
    signature: "rizz",
    adjacent: ["Operator", "Influencer"],
  },
  Scholar: {
    key: "Scholar",
    slug: "scholar",
    name: "Scholar",
    motto: "Credentialed by the hardest tests on earth.",
    description:
      "The competition-and-credentials type. Scholars are graded by exams you've heard of (IMO, Putnam, USAMO) and schools whose acceptance rates are decimals. Pure pedigree compounds — until it doesn't, at which point you need to also build.",
    glyph: "❖",
    foil: { primary: "#A78BFA", secondary: "#7C3AED", tertiary: "#FCD34D" },
    accent: "#A78BFA",
    signature: "taste",
    adjacent: ["Researcher", "Quant"],
  },
  Researcher: {
    key: "Researcher",
    slug: "researcher",
    name: "Researcher",
    motto: "Cited by the people you'd cite.",
    description:
      "The frontier type. Researchers ship papers, not products. The dex measures NeurIPS authorship, citation count, and time spent at OpenAI/Anthropic/DeepMind. Sub-S means your h-index hasn't broken triple digits.",
    glyph: "◈",
    foil: { primary: "#8B5CF6", secondary: "#EC4899", tertiary: "#06B6D4" },
    accent: "#8B5CF6",
    signature: "hack",
    adjacent: ["Scholar", "Hacker"],
  },
  Operator: {
    key: "Operator",
    slug: "operator",
    name: "Operator",
    motto: "Polished. Promoted. Plausible.",
    description:
      "The career-path type. Operators win by climbing the right ladders — Stripe APM, McKinsey, BCG, IPO-bound directorships, COO at unicorns. Taste is high, hack is low. The dex respects the credential without confusing it with construction.",
    glyph: "◼",
    foil: { primary: "#94A3B8", secondary: "#475569", tertiary: "#22D3EE" },
    accent: "#94A3B8",
    signature: "taste",
    adjacent: ["Founder", "Influencer"],
  },
  Influencer: {
    key: "Influencer",
    slug: "influencer",
    name: "Influencer",
    motto: "Audience as leverage. Distribution as moat.",
    description:
      "The audience type. Influencers turn followers into a flywheel — every tweet is a recruiting funnel, every blog post a sales letter. The dex separates 'big follower count' from 'big follower count of people who matter'.",
    glyph: "✺",
    foil: { primary: "#EC4899", secondary: "#F472B6", tertiary: "#FCD34D" },
    accent: "#EC4899",
    signature: "rizz",
    adjacent: ["Founder", "Operator"],
  },
};

export const TYPES_ORDERED: ArchetypeType[] = [
  "Hacker",
  "Quant",
  "Researcher",
  "Scholar",
  "Founder",
  "Operator",
  "Influencer",
];

export function typeBySlug(slug: string): TypeMeta | undefined {
  return Object.values(TYPES_META).find((t) => t.slug === slug);
}
