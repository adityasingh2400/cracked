// Consulting & Corporate family - starter achievement library for v1.0 launch.

import type { Achievement, Chain } from "@/lib/types";

export const CONSULTING_CORPORATE_ACHIEVEMENTS: Achievement[] = [
  // ASCENDED
  {
    id: "ccp_ceo_public_company",
    family: "consulting_corporate",
    tier: "ASCENDED",
    label: "CEO of a public company",
    description: "Public-company CEO. Lifetime-defining.",
    signals: [{ kind: "company", match: [""], title: ["CEO", "Chief Executive Officer"] }],
    evidence: ["Tim Cook", "Satya Nadella", "Sundar Pichai"],
  },
  {
    id: "ccp_mbb_partner_global",
    family: "consulting_corporate",
    tier: "ASCENDED",
    label: "MBB Senior Partner / global head",
    description: "Senior Partner or global practice head at McKinsey/BCG/Bain.",
    signals: [
      { kind: "company", match: ["McKinsey & Company", "Boston Consulting Group", "Bain & Company"], title: ["Senior Partner", "Global Managing Partner", "Director"] },
    ],
    evidence: ["broad"],
  },
  // MYTHIC
  {
    id: "ccp_mbb_partner",
    family: "consulting_corporate",
    tier: "MYTHIC",
    label: "MBB Partner",
    description: "Partner at McKinsey/BCG/Bain. Top of the consulting profession.",
    signals: [
      { kind: "company", match: ["McKinsey", "Boston Consulting Group", "Bain & Company"], title: ["Partner"] },
    ],
    evidence: ["large"],
  },
  {
    id: "ccp_f500_cxo",
    family: "consulting_corporate",
    tier: "MYTHIC",
    label: "C-suite (CFO/COO/CPO) at F500",
    description: "C-suite role at a Fortune 500 company.",
    signals: [
      { kind: "company", match: [""], title: ["Chief Financial Officer", "CFO", "Chief Operating Officer", "COO", "Chief Product Officer", "CPO"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "ccp_mba_top_3",
    family: "consulting_corporate",
    tier: "MYTHIC",
    label: "HBS / Stanford GSB / Wharton MBA",
    description: "MBA from a top-3 business school.",
    signals: [
      { kind: "school", match: ["Harvard Business School", "HBS", "Stanford GSB", "Stanford Graduate School of Business", "Wharton"], regex: [/MBA/i] },
    ],
    evidence: ["broad"],
  },
  // S
  {
    id: "ccp_mbb_consultant",
    family: "consulting_corporate",
    tier: "S",
    label: "MBB consultant (any level)",
    description: "Consultant at McKinsey/BCG/Bain.",
    signals: [
      { kind: "company", match: ["McKinsey", "Boston Consulting Group", "Bain & Company"] },
    ],
    evidence: ["thousands"],
  },
  {
    id: "ccp_vp_unicorn",
    family: "consulting_corporate",
    tier: "S",
    label: "VP at a unicorn / pre-IPO",
    description: "VP-level role at a unicorn or pre-IPO company.",
    signals: [{ kind: "company", match: [""], title: ["VP", "Vice President", "Senior Vice President", "SVP"] }],
    evidence: ["broad"],
  },
  {
    id: "ccp_apm_top_tech",
    family: "consulting_corporate",
    tier: "S",
    label: "APM at Stripe / Google / Meta",
    description: "Associate Product Manager track at top tech.",
    signals: [
      { kind: "company", match: ["Stripe", "Google", "Meta", "Facebook"], title: ["Associate Product Manager", "APM"] },
    ],
    evidence: ["broad"],
  },
  // A
  {
    id: "ccp_top_mba_other",
    family: "consulting_corporate",
    tier: "A",
    label: "Top-10 MBA (Columbia / Booth / Kellogg / MIT Sloan / Tuck)",
    description: "MBA from a top-10 but not top-3 business school.",
    signals: [
      { kind: "school", match: ["Columbia Business School", "Booth", "Kellogg", "MIT Sloan", "Tuck", "Yale SOM", "NYU Stern"], regex: [/MBA/i] },
    ],
    evidence: ["broad"],
  },
  {
    id: "ccp_pm_top_tech",
    family: "consulting_corporate",
    tier: "A",
    label: "Product Manager at top tech",
    description: "PM role at FAANG / Stripe / unicorn.",
    signals: [
      { kind: "company", match: ["Google", "Meta", "Apple", "Amazon", "Microsoft", "Stripe", "Airbnb"], title: ["Product Manager", "PM"] },
    ],
    evidence: ["large"],
  },
  {
    id: "ccp_tier2_consulting",
    family: "consulting_corporate",
    tier: "A",
    label: "Tier-2 consulting (Deloitte / Accenture / EY-Parthenon)",
    description: "Consultant at a tier-2 strategy firm.",
    signals: [
      { kind: "company", match: ["Deloitte", "Accenture", "EY-Parthenon", "Strategy&", "PwC Strategy"] },
    ],
    evidence: ["very large"],
  },
  // B
  {
    id: "ccp_pm_known_co",
    family: "consulting_corporate",
    tier: "B",
    label: "Product Manager at known company",
    description: "PM at a recognizable tech or growth-stage company.",
    signals: [{ kind: "company", match: [""], title: ["Product Manager", "Senior PM"] }],
    evidence: ["very large"],
  },
  // C
  {
    id: "ccp_corp_strategy",
    family: "consulting_corporate",
    tier: "C",
    label: "Corporate strategy at F500",
    description: "Strategy or operations role at a Fortune 500 company.",
    signals: [{ kind: "company", match: [""], title: ["Strategy", "Operations Manager", "Business Operations"] }],
    evidence: ["large"],
  },
  // D
  {
    id: "ccp_associate_anywhere",
    family: "consulting_corporate",
    tier: "D",
    label: "Associate-level corporate role",
    description: "Entry-level corporate role.",
    signals: [{ kind: "company", match: [""], title: ["Associate", "Coordinator"] }],
    evidence: ["very large"],
  },
];

export const CONSULTING_CORPORATE_CHAINS: Chain[] = [
  {
    id: "ccp_chain_mbb_mba_partner",
    name: "The Partner Track",
    family: "consulting_corporate",
    requires: ["ccp_mbb_consultant", "ccp_mba_top_3", "ccp_mbb_partner"],
    bumpTo: "ASCENDED",
    description: "MBB → top-3 MBA → MBB partner - the canonical consulting partner path.",
  },
  {
    id: "ccp_chain_mba_cxo",
    name: "MBA to C-Suite",
    family: "consulting_corporate",
    requires: ["ccp_mba_top_3", "ccp_f500_cxo"],
    bumpTo: "ASCENDED",
    description: "Top MBA into F500 C-suite - the corporate apex.",
  },
  {
    id: "ccp_chain_apm_pm_vp",
    name: "Product Climb",
    family: "consulting_corporate",
    requires: ["ccp_apm_top_tech", "ccp_pm_top_tech", "ccp_vp_unicorn"],
    bumpTo: "MYTHIC",
    description: "APM → PM → VP - the product-leader trajectory.",
  },
];
