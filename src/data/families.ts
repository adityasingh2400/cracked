// The 9 career families that v1.0 organizes everything around.
// Each family has its own Achievement library at src/data/achievements/{family}.ts
// and its own tier ladder ASCENDED → D.

import type { Family } from "@/lib/types";

export interface FamilyMeta {
  key: Family;
  /** URL slug — single word, lowercase. */
  slug: string;
  /** Display name shown on card + dex + leaderboard. */
  name: string;
  /** Short version for the leaderboard tab strip (mobile-friendly). */
  shortName: string;
  /** One-line tagline shown under the family name on the dex. */
  motto: string;
  /** 2-3 sentence narrative for the family dex page. */
  description: string;
  /** Single-char visual symbol. */
  glyph: string;
  /** Hex color for the family chip + accent. */
  accent: string;
  /** Holo foil colors for the family — drives the card's holo treatment. */
  foil: { primary: string; secondary: string; tertiary: string };
  /** Adjacent families (for "if you're strong here, check also" links). */
  adjacent: Family[];
}

export const FAMILIES_META: Record<Family, FamilyMeta> = {
  engineering: {
    key: "engineering",
    slug: "engineering",
    name: "Engineering",
    shortName: "ENG",
    motto: "Compiles. Commits. Computes.",
    description:
      "The builder family. Engineers, AI researchers shipping product, quants, infra wizards. The career is measured in shipped systems, PRs merged, models trained, and the size of the surface area you can hold in your head. Frontier labs, FAANG L+, and indie hackers all live here.",
    glyph: "⌬",
    accent: "#22D3EE",
    foil: { primary: "#06B6D4", secondary: "#22D3EE", tertiary: "#8B5CF6" },
    adjacent: ["science_academia", "founder"],
  },
  science_academia: {
    key: "science_academia",
    slug: "science-academia",
    name: "Science & Academia",
    shortName: "ACADEMIA",
    motto: "Cited by the people you'd cite.",
    description:
      "The frontier-research family. PhDs, professors, olympiad medalists, lab researchers, scholars. Graded by citations, papers in Nature/Science/NeurIPS, named scholarships (Rhodes, Marshall, Hertz), and time spent at Anthropic/OpenAI/DeepMind/Broad/Whitehead. Pure pedigree compounds — until the work has to.",
    glyph: "❖",
    accent: "#A78BFA",
    foil: { primary: "#A78BFA", secondary: "#7C3AED", tertiary: "#FCD34D" },
    adjacent: ["engineering", "medicine"],
  },
  founder: {
    key: "founder",
    slug: "founder",
    name: "Founder",
    shortName: "FOUNDER",
    motto: "Made it. Shipped it. Sold it.",
    description:
      "The startup-operator family. Founders score on what they built and who funded it. YC batches, Thiel Fellowships, exits, unicorns. The dex separates 'has an LLC' from 'has a board' from 'has carry that funds three generations.'",
    glyph: "▲",
    accent: "#F97316",
    foil: { primary: "#F97316", secondary: "#EF4444", tertiary: "#FCD34D" },
    adjacent: ["engineering", "finance", "creative_audience"],
  },
  finance: {
    key: "finance",
    slug: "finance",
    name: "Finance",
    shortName: "FINANCE",
    motto: "Right on the things that matter.",
    description:
      "The capital family. Bankers, hedge fund traders, VCs, PE professionals, allocators. Measured by deal size, fund size, IRR, carry, and the prestige density of the rooms billed into. Goldman TMT, Jane Street, Sequoia, KKR — these are the load-bearing logos.",
    glyph: "◊",
    accent: "#10B981",
    foil: { primary: "#0F766E", secondary: "#0EA5E9", tertiary: "#FCD34D" },
    adjacent: ["consulting_corporate", "founder"],
  },
  consulting_corporate: {
    key: "consulting_corporate",
    slug: "consulting-corporate",
    name: "Consulting & Corporate",
    shortName: "CONSULTING",
    motto: "Frames the deck before you frame the problem.",
    description:
      "The advisory + corporate-ladder family. MBB consultants, F500 climbers, strategists, operators on a COO/CFO track. Scored by partner-track velocity, elite-MBA stamps, and the org-chart altitude reached inside a single institution.",
    glyph: "◐",
    accent: "#1E3A8A",
    foil: { primary: "#1E3A8A", secondary: "#38BDF8", tertiary: "#F1F5F9" },
    adjacent: ["finance", "founder"],
  },
  law_public_service: {
    key: "law_public_service",
    slug: "law-public-service",
    name: "Law & Public Service",
    shortName: "LAW",
    motto: "Public office. Public record. Public consequence.",
    description:
      "The advocate + civic-power family. BigLaw partners, federal judges, SCOTUS clerks, NSC Directors, Senators, military officers, ambassadors. The currency is influence at scale, conferred by confirmation or by service.",
    glyph: "⚖",
    accent: "#B45309",
    foil: { primary: "#0F172A", secondary: "#B45309", tertiary: "#D6B271" },
    adjacent: ["consulting_corporate"],
  },
  medicine: {
    key: "medicine",
    slug: "medicine",
    name: "Medicine",
    shortName: "MEDICINE",
    motto: "Triple-boarded. Triple-shifted.",
    description:
      "The clinician + biotech family. Doctors, surgeons, biotech founders, clinical researchers. Graded by residency program, board certifications, what they cut, and who they kept alive. Match Day is the IPO. Hopkins neurosurg is to medicine what Stanford CS is to tech.",
    glyph: "✚",
    accent: "#059669",
    foil: { primary: "#059669", secondary: "#F8FAFC", tertiary: "#0284C7" },
    adjacent: ["science_academia"],
  },
  athletics_performance: {
    key: "athletics_performance",
    slug: "athletics-performance",
    name: "Athletics & Performance",
    shortName: "ATHLETICS",
    motto: "Measured against the clock and the field.",
    description:
      "The physical-competition + artistic-execution family. Pro athletes, Olympic medalists, dancers, classical soloists, musicians. Graded by venues that crown one winner (Olympics, Grand Slams, Met Opera, ABT, Curtis, Juilliard). Performance is unfalsifiable: you medaled or you didn't.",
    glyph: "❂",
    accent: "#DC2626",
    foil: { primary: "#DC2626", secondary: "#18181B", tertiary: "#FCD34D" },
    adjacent: ["creative_audience"],
  },
  creative_audience: {
    key: "creative_audience",
    slug: "creative-audience",
    name: "Creative & Audience",
    shortName: "CREATIVE",
    motto: "Taste as moat. Audience as leverage.",
    description:
      "The cultural family. Writers, designers, creators, brand founders, influencers. Pulitzer, AIGA Medal, Pritzker, MrBeast-scale audiences, Glossier/Fenty/Telfar-class consumer brands. Win on aesthetic, category creation, and the moat that taste builds.",
    glyph: "✺",
    accent: "#EC4899",
    foil: { primary: "#EC4899", secondary: "#F472B6", tertiary: "#FCD34D" },
    adjacent: ["athletics_performance", "founder"],
  },
};

/** The 9 families in the order they appear on the leaderboard tab strip. */
export const FAMILIES_ORDERED: Family[] = [
  "engineering",
  "science_academia",
  "founder",
  "finance",
  "consulting_corporate",
  "law_public_service",
  "medicine",
  "athletics_performance",
  "creative_audience",
];

export function familyBySlug(slug: string): FamilyMeta | undefined {
  return Object.values(FAMILIES_META).find((f) => f.slug === slug);
}
