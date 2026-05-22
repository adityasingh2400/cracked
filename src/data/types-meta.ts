// Type metadata for the Cracked Dex.
// 22 elemental types. Each has its own color palette, glyph, and narrative —
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
  // ===========================================================================
  // THE ORIGINAL SEVEN (refined descriptions for the broader dex)
  // ===========================================================================
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
    adjacent: ["Scholar", "Banker"],
  },
  Founder: {
    key: "Founder",
    slug: "founder",
    name: "Founder",
    motto: "Made it. Shipped it. Sold it.",
    description:
      "The startup-operator type. Founders score on what they built and who funded it. YC batches, Thiel Fellowships, exits, unicorns — these are the load-bearing signals. The dex separates 'has an LLC' from 'has a board'.",
    glyph: "▲",
    foil: { primary: "#F97316", secondary: "#EF4444", tertiary: "#FCD34D" },
    accent: "#F97316",
    signature: "rizz",
    adjacent: ["Hacker", "Brand", "Allocator"],
  },
  Scholar: {
    key: "Scholar",
    slug: "scholar",
    name: "Scholar",
    motto: "Credentialed by the hardest tests on earth.",
    description:
      "The competition-and-pedigree type. Scholars are graded by exams you've heard of (IMO, Putnam, USAMO, Rhodes, Marshall) and schools whose acceptance rates are decimals. Pure pedigree compounds — until it doesn't, at which point you need to also build.",
    glyph: "❖",
    foil: { primary: "#A78BFA", secondary: "#7C3AED", tertiary: "#FCD34D" },
    accent: "#A78BFA",
    signature: "taste",
    adjacent: ["Researcher", "Counsel", "Quant"],
  },
  Researcher: {
    key: "Researcher",
    slug: "researcher",
    name: "Researcher",
    motto: "Cited by the people you'd cite.",
    description:
      "The frontier type. Researchers ship papers, not products. The dex measures NeurIPS authorship, Nature/Science citations, and time spent at OpenAI/Anthropic/DeepMind/Broad/Whitehead. Sub-S means your h-index hasn't broken triple digits.",
    glyph: "◈",
    foil: { primary: "#8B5CF6", secondary: "#EC4899", tertiary: "#06B6D4" },
    accent: "#8B5CF6",
    signature: "hack",
    adjacent: ["Scholar", "Hacker", "Healer"],
  },
  Operator: {
    key: "Operator",
    slug: "operator",
    name: "Operator",
    motto: "Polished. Promoted. Plausible.",
    description:
      "The generalist-leader type. Operators win by climbing the right ladders inside other people's institutions — APM at Stripe, GM at unicorns, COO before 35. Taste is high, hack is low. The dex respects the credential without confusing it with construction.",
    glyph: "◼",
    foil: { primary: "#94A3B8", secondary: "#475569", tertiary: "#22D3EE" },
    accent: "#94A3B8",
    signature: "taste",
    adjacent: ["Strategist", "Climber", "Founder"],
  },
  Influencer: {
    key: "Influencer",
    slug: "influencer",
    name: "Influencer",
    motto: "Audience as leverage. Distribution as moat.",
    description:
      "The audience type. Influencers turn followers into a flywheel — every tweet is a recruiting funnel, every post a sales letter. The dex separates 'big follower count' from 'big follower count of people who matter'.",
    glyph: "✺",
    foil: { primary: "#EC4899", secondary: "#F472B6", tertiary: "#FCD34D" },
    accent: "#EC4899",
    signature: "rizz",
    adjacent: ["Creator", "Writer", "Founder"],
  },

  // ===========================================================================
  // FINANCE & CAPITAL
  // ===========================================================================
  Banker: {
    key: "Banker",
    slug: "banker",
    name: "Banker",
    motto: "Pitched it. Modeled it. Closed it.",
    description:
      "The deal type. Bankers grow by hours, not commits — by mandates won, decks shipped, and the prestige of the logo on the analyst's badge. The dex separates Goldman TMT from a regional MM, and the EB analyst from the BB grinder. Sub-S means you weren't on a multibillion-dollar deal team.",
    glyph: "$",
    foil: { primary: "#0F766E", secondary: "#0EA5E9", tertiary: "#FCD34D" },
    accent: "#0F766E",
    signature: "grind",
    adjacent: ["Quant", "Allocator", "Strategist"],
  },
  Allocator: {
    key: "Allocator",
    slug: "allocator",
    name: "Allocator",
    motto: "Right on the things that matter. Patient on the rest.",
    description:
      "The capital type. Allocators win by deploying other people's money into the right things at the right size at the right time — and surviving the years between. The dex separates 'has a syndicate' from 'has a fund' from 'has carry that funds three generations'. TASTE is the only axis that matters across a 10-year holding period.",
    glyph: "◊",
    foil: { primary: "#10B981", secondary: "#064E3B", tertiary: "#FCD34D" },
    accent: "#10B981",
    signature: "taste",
    adjacent: ["Banker", "Founder", "Operator"],
  },

  // ===========================================================================
  // CONSULTING & CORPORATE
  // ===========================================================================
  Strategist: {
    key: "Strategist",
    slug: "strategist",
    name: "Strategist",
    motto: "Frames the deck before you frame the problem.",
    description:
      "The advisory type. Strategists score by the prestige density of the rooms they're billed into — MBB, top-boutique, F500 C-suite, PE deal teams. The dex measures partner-track velocity, the elite-MBA stamp, and whether the institution actually outsources its thinking to them.",
    glyph: "◐",
    foil: { primary: "#1E3A8A", secondary: "#38BDF8", tertiary: "#F1F5F9" },
    accent: "#1E3A8A",
    signature: "taste",
    adjacent: ["Operator", "Climber", "Banker"],
  },
  Climber: {
    key: "Climber",
    slug: "climber",
    name: "Climber",
    motto: "Promoted, not pivoted.",
    description:
      "The ladder type. Climbers grow by accumulating org-chart altitude inside a single institution — VP at 32, SVP at 38, EVP at 44, CEO at 52. The dex separates 'got promoted because nobody else wanted it' from 'the board picked you out of 400 internal candidates'.",
    glyph: "▲",
    foil: { primary: "#7C2D12", secondary: "#D4A373", tertiary: "#F5F5DC" },
    accent: "#7C2D12",
    signature: "grind",
    adjacent: ["Operator", "Strategist", "Statesman"],
  },

  // ===========================================================================
  // LAW & POLICY
  // ===========================================================================
  Counsel: {
    key: "Counsel",
    slug: "counsel",
    name: "Counsel",
    motto: "Reads the contract. Writes the better one.",
    description:
      "The advocate type. Counsels score on the rooms they litigate in and the names on their pleadings — Cravath, Wachtell, the SG's office, a federal bench. The dex separates document review at a midlaw from the Wachtell partner who structures the deal everyone reads about. Hack is low; Taste and Grind do the heavy lifting.",
    glyph: "⚖",
    foil: { primary: "#0F172A", secondary: "#B45309", tertiary: "#D6B271" },
    accent: "#B45309",
    signature: "grind",
    adjacent: ["Scholar", "Statesman", "Operator"],
  },
  Statesman: {
    key: "Statesman",
    slug: "statesman",
    name: "Statesman",
    motto: "Public office. Public record. Public consequence.",
    description:
      "The civic-power type. Statesmen are elected, appointed, or selected for service — NSC Directors, Senators, Cabinet Secretaries, ambassadors, think-tank presidents. The currency is influence on policy at scale, conferred not by capital but by confirmation.",
    glyph: "✦",
    foil: { primary: "#1E40AF", secondary: "#DC2626", tertiary: "#F8FAFC" },
    accent: "#1E40AF",
    signature: "rizz",
    adjacent: ["Counsel", "Operator", "Officer"],
  },
  Officer: {
    key: "Officer",
    slug: "officer",
    name: "Officer",
    motto: "Selected. Trained. Sworn in.",
    description:
      "The uniformed-service type. Officers ascend through service-academy admits, command postings, and decorations — West Point → Ranger → War College, or CIA case officer → station chief. GRIND is literal: physical, repeated, lifelong. Promotion is by board, not boss.",
    glyph: "✪",
    foil: { primary: "#4D7C0F", secondary: "#A3A380", tertiary: "#1F2937" },
    accent: "#4D7C0F",
    signature: "grind",
    adjacent: ["Statesman", "Athlete", "Operator"],
  },

  // ===========================================================================
  // MEDICINE
  // ===========================================================================
  Healer: {
    key: "Healer",
    slug: "healer",
    name: "Healer",
    motto: "Triple-boarded. Triple-shifted. Triple-mortgaged.",
    description:
      "The clinician type. Healers are graded by where they trained, what they cut, and who they kept alive. Match Day is their IPO. The dex respects the residency the way it respects the YC batch — Hopkins neurosurg is to medicine what Stanford CS is to tech, and there is no path that skips the eight years.",
    glyph: "✚",
    foil: { primary: "#059669", secondary: "#F8FAFC", tertiary: "#0284C7" },
    accent: "#059669",
    signature: "grind",
    adjacent: ["Researcher", "Scholar", "Founder"],
  },

  // ===========================================================================
  // CREATIVE
  // ===========================================================================
  Writer: {
    key: "Writer",
    slug: "writer",
    name: "Writer",
    motto: "Bylines. Bookshelves. Pulitzers.",
    description:
      "The prose type. Writers are graded by the venue — New Yorker, Knopf, FSG, NYT, Pulitzer board. The dex separates 'self-published on KDP' from 'won the Pulitzer'. Hack is low. Taste does the heavy lifting and the work takes years.",
    glyph: "✑",
    foil: { primary: "#171717", secondary: "#92400E", tertiary: "#F5E6D3" },
    accent: "#92400E",
    signature: "taste",
    adjacent: ["Scholar", "Influencer", "Creator"],
  },
  Designer: {
    key: "Designer",
    slug: "designer",
    name: "Designer",
    motto: "Type set. Form found. Object made.",
    description:
      "The visual-craft type. Designers — graphic, product, industrial, type, architectural — are graded by the studios they belonged to (Pentagram, IDEO, Apple HI, OMA, Foster) and the lifetime awards they end with (AIGA Medal, Pritzker, AIA Gold). Taste is the only axis that ultimately matters.",
    glyph: "◬",
    foil: { primary: "#FEF3E2", secondary: "#0A0A0A", tertiary: "#FF006E" },
    accent: "#FF006E",
    signature: "taste",
    adjacent: ["Brand", "Influencer", "Maker"],
  },

  // ===========================================================================
  // ATHLETICS & PERFORMANCE
  // ===========================================================================
  Athlete: {
    key: "Athlete",
    slug: "athlete",
    name: "Athlete",
    motto: "Measured against the clock, the field, the world.",
    description:
      "The physical-competition type. Athletes are graded by venues that crown one winner — Olympics, NCAA championships, pro drafts, world records, Grand Slams. The dex separates 'varsity in high school' from 'podium at the Games'. Performance is unfalsifiable: you medaled or you didn't.",
    glyph: "❂",
    foil: { primary: "#DC2626", secondary: "#18181B", tertiary: "#FCD34D" },
    accent: "#DC2626",
    signature: "grind",
    adjacent: ["Officer", "Performer", "Influencer"],
  },
  Performer: {
    key: "Performer",
    slug: "performer",
    name: "Performer",
    motto: "Trained for decades. Judged in three minutes.",
    description:
      "The artistic-execution type. Performers — dancers, musicians, actors, classical soloists — are graded by institutions that admit by audition (Juilliard, Curtis, ABT, Met Opera) and by stages whose seats sell out a year out. Taste is mandatory; technique is non-negotiable.",
    glyph: "♪",
    foil: { primary: "#5B21B6", secondary: "#FCD34D", tertiary: "#FAEBD7" },
    accent: "#5B21B6",
    signature: "taste",
    adjacent: ["Athlete", "Scholar", "Writer"],
  },

  // ===========================================================================
  // CREATOR / BRAND / MAKER (the non-tech entrepreneur stack)
  // ===========================================================================
  Creator: {
    key: "Creator",
    slug: "creator",
    name: "Creator",
    motto: "Audience as company. Channel as cap table.",
    description:
      "The creator-entrepreneur type. Creators win when followers convert into a business with margins — MrBeast's Feastables, Mark Rober's Crunch Labs, a 7-figure Substack. The dex separates 'has followers' from 'has built a media company on top of them'.",
    glyph: "▶",
    foil: { primary: "#84CC16", secondary: "#A855F7", tertiary: "#0A0A0A" },
    accent: "#84CC16",
    signature: "rizz",
    adjacent: ["Influencer", "Brand", "Founder"],
  },
  Brand: {
    key: "Brand",
    slug: "brand",
    name: "Brand",
    motto: "Taste as moat. Category as territory.",
    description:
      "The consumer-brand type. Brand founders win on aesthetic and category creation — Glossier, Telfar, Fenty, Aimé Leon Dore, Liquid Death — companies where the founder's taste IS the moat. Measured by category invention, cultural reach, and unit economics.",
    glyph: "◆",
    foil: { primary: "#E11D48", secondary: "#F5F5DC", tertiary: "#0A0A0A" },
    accent: "#E11D48",
    signature: "taste",
    adjacent: ["Creator", "Founder", "Designer"],
  },
  Maker: {
    key: "Maker",
    slug: "maker",
    name: "Maker",
    motto: "Hands on the work. Work on the table.",
    description:
      "The hands-on craft type. Makers — chefs, restaurateurs, bakers, ceramicists, single-store legends — win by physically producing a thing at scale. James Beard wins, Michelin stars, cult cookbooks. The grind compounds for 20 years before anyone notices.",
    glyph: "⚒",
    foil: { primary: "#92400E", secondary: "#FDE68A", tertiary: "#FEF3E2" },
    accent: "#92400E",
    signature: "grind",
    adjacent: ["Brand", "Designer", "Operator"],
  },
};

export const TYPES_ORDERED: ArchetypeType[] = [
  // builders & technologists
  "Hacker",
  "Quant",
  "Researcher",
  "Founder",
  // pedigree & competition
  "Scholar",
  "Performer",
  "Athlete",
  // service & power
  "Counsel",
  "Statesman",
  "Officer",
  "Healer",
  // capital & advisory
  "Banker",
  "Allocator",
  "Strategist",
  "Operator",
  "Climber",
  // taste & audience
  "Writer",
  "Designer",
  "Creator",
  "Brand",
  "Maker",
  "Influencer",
];

export function typeBySlug(slug: string): TypeMeta | undefined {
  return Object.values(TYPES_META).find((t) => t.slug === slug);
}
