// Finance family - starter achievement library for v1.0 launch.

import type { Achievement, Chain } from "@/lib/types";

export const FINANCE_ACHIEVEMENTS: Achievement[] = [
  // ASCENDED
  {
    id: "fin_midas_top50",
    family: "finance",
    tier: "ASCENDED",
    label: "Forbes Midas List Top 50",
    description: "Top-50 active VC on the Midas List. Lifetime-defining recognition.",
    signals: [{ kind: "award", match: ["Forbes Midas", "Midas List Top 50", "Midas Top"] }],
    evidence: ["Marc Andreessen", "Peter Thiel", "Doug Leone"],
  },
  {
    id: "fin_partner_top_vc",
    family: "finance",
    tier: "ASCENDED",
    label: "Partner at top-tier VC (Sequoia / a16z / Founders Fund / Benchmark)",
    description: "Made partner at a top-5 VC firm. Top of profession.",
    signals: [
      { kind: "company", match: ["Sequoia", "Andreessen Horowitz", "a16z", "Founders Fund", "Benchmark", "Greylock", "Accel"], title: ["Partner", "General Partner", "Managing Partner"] },
    ],
    evidence: ["Mike Moritz", "Marc Andreessen"],
  },
  {
    id: "fin_hedge_fund_billion_aum",
    family: "finance",
    tier: "ASCENDED",
    label: "Founder/CIO of $1B+ hedge fund",
    description: "Launched and runs a billion-dollar hedge fund.",
    signals: [
      { kind: "company", match: [""], title: ["CIO", "Founding Partner", "Founder"] },
      { kind: "free_text", patterns: [/\$1\s?[Bb]illion AUM|hedge fund/i] },
    ],
    evidence: ["Ken Griffin (Citadel)", "Ray Dalio (Bridgewater)"],
  },
  // MYTHIC
  {
    id: "fin_jane_street_quant_trader",
    family: "finance",
    tier: "MYTHIC",
    label: "Jane Street / Citadel / Two Sigma quant trader",
    description: "Quant trader at a top firm. Career-defining.",
    signals: [
      { kind: "company", match: ["Jane Street", "Citadel", "Two Sigma", "Hudson River Trading", "Jump Trading"], title: ["Trader", "Quant", "Quant Trader"] },
    ],
    evidence: ["thousands"],
  },
  {
    id: "fin_principal_top_vc",
    family: "finance",
    tier: "MYTHIC",
    label: "Principal at top-tier VC",
    description: "Principal-level at Sequoia / a16z / Founders Fund / Benchmark.",
    signals: [
      { kind: "company", match: ["Sequoia", "Andreessen Horowitz", "a16z", "Founders Fund", "Benchmark"], title: ["Principal"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "fin_managing_director_bb",
    family: "finance",
    tier: "MYTHIC",
    label: "Managing Director at bulge-bracket bank",
    description: "MD at Goldman/Morgan Stanley/JP Morgan in IB/PE division.",
    signals: [
      { kind: "company", match: ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "J.P. Morgan", "Bank of America Merrill Lynch"], title: ["Managing Director", "MD"] },
    ],
    evidence: ["large"],
  },
  // S
  {
    id: "fin_goldman_tmt_analyst",
    family: "finance",
    tier: "S",
    label: "Goldman TMT / M&A analyst",
    description: "Investment banking analyst at Goldman in elite divisions.",
    signals: [
      { kind: "company", match: ["Goldman Sachs"], title: ["Analyst", "Associate"] },
    ],
    evidence: ["thousands"],
  },
  {
    id: "fin_top_pe_associate",
    family: "finance",
    tier: "S",
    label: "Top-PE associate (KKR / Blackstone / Carlyle)",
    description: "Associate at a top-3 private equity firm.",
    signals: [
      { kind: "company", match: ["KKR", "Blackstone", "Carlyle Group", "Apollo Global", "Bain Capital"], title: ["Associate", "Analyst"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "fin_eb_analyst",
    family: "finance",
    tier: "S",
    label: "Elite boutique IB analyst (Evercore / Lazard / Centerview)",
    description: "Analyst at an elite-boutique investment bank.",
    signals: [
      { kind: "company", match: ["Evercore", "Lazard", "Centerview", "Moelis", "Perella Weinberg"], title: ["Analyst", "Associate"] },
    ],
    evidence: ["broad"],
  },
  {
    id: "fin_associate_top_vc",
    family: "finance",
    tier: "S",
    label: "Associate at top-tier VC",
    description: "Associate at Sequoia / a16z / Founders Fund / Benchmark.",
    signals: [
      { kind: "company", match: ["Sequoia", "Andreessen Horowitz", "a16z", "Founders Fund", "Benchmark", "Greylock", "Accel"], title: ["Associate", "Investor"] },
    ],
    evidence: ["broad"],
  },
  // A
  {
    id: "fin_bb_analyst",
    family: "finance",
    tier: "A",
    label: "Bulge-bracket investment banking analyst",
    description: "Analyst at any bulge-bracket bank in any division.",
    signals: [
      { kind: "company", match: ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "J.P. Morgan", "Bank of America"], title: ["Analyst", "Associate"] },
    ],
    evidence: ["very large"],
  },
  {
    id: "fin_mm_hedge_fund",
    family: "finance",
    tier: "A",
    label: "Multi-manager hedge fund analyst",
    description: "Analyst at Millennium / Point72 / Schonfeld.",
    signals: [
      { kind: "company", match: ["Millennium", "Point72", "Schonfeld", "Balyasny"], title: ["Analyst", "Portfolio Manager"] },
    ],
    evidence: ["broad"],
  },
  // B
  {
    id: "fin_mm_ib",
    family: "finance",
    tier: "B",
    label: "Middle-market IB analyst",
    description: "Analyst at a middle-market or regional investment bank.",
    signals: [{ kind: "free_text", patterns: [/middle market|investment banking|m&a/i] }],
    evidence: ["large"],
  },
  // C
  {
    id: "fin_corp_dev",
    family: "finance",
    tier: "C",
    label: "Corporate development / strategic finance",
    description: "F500 corporate development or strategic finance role.",
    signals: [{ kind: "company", match: [""], title: ["Corporate Development", "Strategic Finance"] }],
    evidence: ["broad"],
  },
  // D
  {
    id: "fin_personal_finance",
    family: "finance",
    tier: "D",
    label: "Personal finance / financial advising",
    description: "Personal finance role at a retail brokerage.",
    signals: [{ kind: "company", match: [""], title: ["Financial Advisor", "Wealth Manager"] }],
    evidence: ["large"],
  },
];

export const FINANCE_CHAINS: Chain[] = [
  {
    id: "fin_chain_quant_pipeline",
    name: "The Quant Pipeline",
    family: "finance",
    requires: ["eng_mit_caltech_cmu_cs", "fin_jane_street_quant_trader"],
    bumpTo: "ASCENDED",
    description: "MIT/Caltech/CMU CS into top-tier quant trading.",
  },
  {
    id: "fin_chain_gs_pe",
    name: "GS to PE",
    family: "finance",
    requires: ["fin_goldman_tmt_analyst", "fin_top_pe_associate"],
    bumpTo: "MYTHIC",
    description: "Goldman analyst into top-tier private equity. The 2-2-2 path.",
  },
  {
    id: "fin_chain_vc_climb",
    name: "VC Climb",
    family: "finance",
    requires: ["fin_associate_top_vc", "fin_principal_top_vc"],
    bumpTo: "ASCENDED",
    description: "Associate → Principal at top-tier VC.",
  },
  {
    id: "fin_chain_midas_partner",
    name: "Midas Partner",
    family: "finance",
    requires: ["fin_partner_top_vc", "fin_midas_top50"],
    bumpTo: "ASCENDED",
    description: "Top-VC partner ON the Midas List - the apex.",
  },
];
