// Creative & Audience family - starter achievement library for v1.0 launch.

import type { Achievement, Chain } from "@/lib/types";

export const CREATIVE_AUDIENCE_ACHIEVEMENTS: Achievement[] = [
  // ASCENDED
  {
    id: "ca_pulitzer",
    family: "creative_audience",
    tier: "ASCENDED",
    label: "Pulitzer Prize",
    description: "Top US journalism / letters prize. Lifetime-defining.",
    signals: [{ kind: "award", match: ["Pulitzer Prize"] }],
    evidence: ["broad"],
  },
  {
    id: "ca_pritzker",
    family: "creative_audience",
    tier: "ASCENDED",
    label: "Pritzker Architecture Prize",
    description: "Top global architecture prize.",
    signals: [{ kind: "award", match: ["Pritzker Architecture Prize", "Pritzker Prize"] }],
    evidence: ["Norman Foster", "Frank Gehry"],
  },
  {
    id: "ca_booker_nobel_lit",
    family: "creative_audience",
    tier: "ASCENDED",
    label: "Booker / Nobel Prize in Literature",
    description: "Top global literary prize.",
    signals: [{ kind: "award", match: ["Booker Prize", "Nobel Prize in Literature"] }],
    evidence: ["broad"],
  },
  {
    id: "ca_mrbeast_scale",
    family: "creative_audience",
    tier: "ASCENDED",
    label: "100M+ follower creator (any platform)",
    description: "Built a 9-figure audience. Lifetime-defining cultural reach.",
    signals: [{ kind: "online", minFollowers: 100_000_000 }],
    evidence: ["MrBeast", "Selena Gomez", "Cristiano Ronaldo"],
  },
  {
    id: "ca_brand_billion_dollar",
    family: "creative_audience",
    tier: "ASCENDED",
    label: "Founded a $1B+ consumer brand",
    description: "Glossier / Fenty / Aimé Leon Dore / Telfar scale.",
    signals: [
      { kind: "free_text", patterns: [/founded|founder of/i] },
      { kind: "free_text", patterns: [/Glossier|Fenty Beauty|Telfar|Aim. Leon Dore|Liquid Death|SKIMS/i] },
    ],
    evidence: ["Emily Weiss", "Rihanna", "Kim Kardashian"],
  },
  // MYTHIC
  {
    id: "ca_aiga_medal",
    family: "creative_audience",
    tier: "MYTHIC",
    label: "AIGA Medal / Cooper Hewitt National Design Award",
    description: "Top US design profession honor.",
    signals: [{ kind: "award", match: ["AIGA Medal", "National Design Award"] }],
    evidence: ["Paula Scher", "Michael Bierut"],
  },
  {
    id: "ca_10m_creator",
    family: "creative_audience",
    tier: "MYTHIC",
    label: "10M+ follower creator",
    description: "Eight-figure audience on a major platform.",
    signals: [{ kind: "online", minFollowers: 10_000_000 }],
    evidence: ["broad creator class"],
  },
  {
    id: "ca_new_yorker_byline",
    family: "creative_audience",
    tier: "MYTHIC",
    label: "Staff writer at The New Yorker / NYT Magazine",
    description: "Staff writer at a top-tier publication.",
    signals: [{ kind: "company", match: ["The New Yorker", "New York Times Magazine", "The Atlantic", "Harper's Magazine"], title: ["Staff Writer", "Writer", "Editor"] }],
    evidence: ["broad"],
  },
  {
    id: "ca_pentagram_partner",
    family: "creative_audience",
    tier: "MYTHIC",
    label: "Pentagram partner / equivalent",
    description: "Partner at a top-tier design firm.",
    signals: [
      { kind: "company", match: ["Pentagram", "IDEO", "OMA", "Foster + Partners"], title: ["Partner"] },
    ],
    evidence: ["narrow"],
  },
  // S
  {
    id: "ca_1m_creator",
    family: "creative_audience",
    tier: "S",
    label: "1M+ follower creator",
    description: "Seven-figure audience on a major platform.",
    signals: [{ kind: "online", minFollowers: 1_000_000 }],
    evidence: ["broad creator class"],
  },
  {
    id: "ca_published_author_big5",
    family: "creative_audience",
    tier: "S",
    label: "Published author (Big 5 imprint)",
    description: "Published book with a major publishing house.",
    signals: [
      { kind: "company", match: ["Penguin Random House", "HarperCollins", "Simon & Schuster", "Hachette", "Macmillan", "Knopf", "FSG"], title: ["Author"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "ca_d_school_top",
    family: "creative_audience",
    tier: "S",
    label: "RISD / Parsons / Pratt / SVA degree",
    description: "Top design or fine-art school degree.",
    signals: [
      { kind: "school", match: ["Rhode Island School of Design", "RISD", "Parsons", "Pratt Institute", "SVA", "School of Visual Arts"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "ca_design_lead_top_tech",
    family: "creative_audience",
    tier: "S",
    label: "Design lead at top tech",
    description: "Lead designer at Apple / Google / Stripe / Figma / Linear.",
    signals: [
      { kind: "company", match: ["Apple", "Google", "Stripe", "Figma", "Linear", "Airbnb"], title: ["Design Lead", "Head of Design", "Principal Designer"] },
    ],
    evidence: ["broad"],
  },
  // A
  {
    id: "ca_100k_creator",
    family: "creative_audience",
    tier: "A",
    label: "100k+ follower creator",
    description: "Six-figure audience.",
    signals: [{ kind: "online", minFollowers: 100_000 }],
    evidence: ["very broad"],
  },
  {
    id: "ca_published_author",
    family: "creative_audience",
    tier: "A",
    label: "Published author (any reputable house)",
    description: "Has a published book with a reputable publisher.",
    signals: [{ kind: "free_text", patterns: [/Author of|Published.{0,20}book|book published/i] }],
    evidence: ["large"],
  },
  // B
  {
    id: "ca_dtc_brand_founder",
    family: "creative_audience",
    tier: "B",
    label: "DTC brand founder (revenue)",
    description: "Founded a DTC brand generating real revenue.",
    signals: [
      { kind: "company", match: [""], title: ["Founder", "Creative Director"] },
      { kind: "free_text", patterns: [/DTC|direct-to-consumer|consumer brand/i] },
    ],
    evidence: ["broad"],
  },
  // C
  {
    id: "ca_10k_creator",
    family: "creative_audience",
    tier: "C",
    label: "10k+ follower creator",
    description: "Five-figure audience.",
    signals: [{ kind: "online", minFollowers: 10_000 }],
    evidence: ["very large"],
  },
  // D
  {
    id: "ca_writer_designer_starting",
    family: "creative_audience",
    tier: "D",
    label: "Writer / designer / creator (early)",
    description: "Identifies as a creator with no major output yet.",
    signals: [{ kind: "free_text", patterns: [/Writer|Designer|Creator|Artist|Filmmaker/i] }],
    evidence: ["very large"],
  },
];

export const CREATIVE_AUDIENCE_CHAINS: Chain[] = [
  {
    id: "ca_chain_new_yorker_pulitzer",
    name: "The New Yorker Track",
    family: "creative_audience",
    requires: ["ca_new_yorker_byline", "ca_pulitzer"],
    bumpTo: "ASCENDED",
    description: "Staff writer at The New Yorker + Pulitzer - the journalism apex.",
  },
  {
    id: "ca_chain_risd_pentagram",
    name: "RISD to Pentagram",
    family: "creative_audience",
    requires: ["ca_d_school_top", "ca_pentagram_partner"],
    bumpTo: "ASCENDED",
    description: "RISD/Parsons + Pentagram partner - the design profession ladder.",
  },
  {
    id: "ca_chain_creator_brand",
    name: "Creator to Brand",
    family: "creative_audience",
    requires: ["ca_10m_creator", "ca_brand_billion_dollar"],
    bumpTo: "ASCENDED",
    description: "10M+ audience + $1B brand - the modern category creator pattern.",
  },
  {
    id: "ca_chain_published_pulitzer",
    name: "Big 5 Author Track",
    family: "creative_audience",
    requires: ["ca_published_author_big5", "ca_pulitzer"],
    bumpTo: "ASCENDED",
    description: "Big-5 published + Pulitzer - the literary apex.",
  },
];
