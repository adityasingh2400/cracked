// Engineering family — starter achievement library for v1.0 launch.
//
// This is a HAND-WRITTEN baseline of ~30 representative achievements + 5 chains
// to ship Week 1a launchable. The full 18-agent research pass (per
// scripts/generate-achievements.ts) expands this to ~95 achievements + 20 chains.
// This baseline ensures the family page, leaderboard, and scoring engine all
// have real data on Day 1.

import type { Achievement, Chain } from "@/lib/types";

export const ENGINEERING_ACHIEVEMENTS: Achievement[] = [
  // -------- ASCENDED — lifetime-defining --------
  {
    id: "eng_turing_award",
    family: "engineering",
    tier: "ASCENDED",
    label: "Turing Award",
    description:
      "Once-in-a-career recognition for fundamental contributions to computing. The closest thing to a Nobel in CS.",
    signals: [{ kind: "award", match: ["Turing Award", "A.M. Turing Award"] }],
    evidence: ["Geoffrey Hinton", "Yann LeCun", "Yoshua Bengio"],
  },
  {
    id: "eng_anthropic_openai_cofounder",
    family: "engineering",
    tier: "ASCENDED",
    label: "Frontier-lab co-founder",
    description:
      "Co-founded one of the labs that defines the frontier of AI — a lifetime-defining engineering bet.",
    signals: [{ kind: "company", match: ["Anthropic", "OpenAI", "DeepMind", "SSI"], title: ["Co-Founder", "Co-founder", "Founder"] }],
    evidence: ["Dario Amodei", "Ilya Sutskever", "Demis Hassabis"],
  },
  {
    id: "eng_ml_breakthrough_paper",
    family: "engineering",
    tier: "ASCENDED",
    label: "Defining ML paper (first author)",
    description:
      "First author on a paper that defined a generation of ML research — top of profession, lifetime achievement.",
    signals: [
      { kind: "free_text", patterns: [/attention is all you need|alexnet|gpt-3|imagenet|transformer|resnet/i] },
      { kind: "publication", venue: ["NeurIPS", "Nature", "Science"], role: "first" },
    ],
    evidence: ["Ashish Vaswani (Attention Is All You Need)", "Alec Radford (GPT)", "Alex Krizhevsky (AlexNet)"],
  },

  // -------- MYTHIC — career-defining --------
  {
    id: "eng_frontier_lab_founding_eng",
    family: "engineering",
    tier: "MYTHIC",
    label: "Founding engineer at frontier lab",
    description:
      "Among the first 20 engineers at Anthropic / OpenAI / DeepMind / SSI / xAI. Rare career-defining trajectory.",
    signals: [
      { kind: "company", match: ["Anthropic", "OpenAI", "DeepMind", "SSI", "xAI"], title: ["Founding", "Member of Technical Staff", "Research Engineer"] },
    ],
    evidence: ["John Schulman", "Trevor Blackwell", "Andrej Karpathy"],
  },
  {
    id: "eng_neurips_first_author_phd",
    family: "engineering",
    tier: "MYTHIC",
    label: "NeurIPS first author as PhD student",
    description:
      "Top-tier ML conference first-author paper during PhD — career-defining signal.",
    signals: [
      { kind: "publication", venue: ["NeurIPS", "ICML", "ICLR"], role: "first" },
      { kind: "school", match: ["PhD", "Ph.D"] },
    ],
    evidence: ["Many YC AI founders", "L3+ research engineers at frontier labs"],
  },
  {
    id: "eng_ioi_imo_gold",
    family: "engineering",
    tier: "MYTHIC",
    label: "IMO / IOI / IPhO Gold Medal",
    description:
      "Top-of-world performance on the hardest competitive exams. Lifetime credential. Age-capped at 19.",
    signals: [{ kind: "award", match: ["IMO Gold", "IOI Gold", "IPhO Gold", "International Mathematical Olympiad", "International Olympiad in Informatics"] }],
    ageCap: 19,
    evidence: ["Terence Tao (4x IMO medalist)", "Po-Shen Loh"],
  },

  // -------- S — obviously cracked (top 1%) --------
  {
    id: "eng_mit_caltech_cmu_cs",
    family: "engineering",
    tier: "S",
    label: "MIT / Caltech / CMU SCS — CS degree",
    description: "Top-3 CS schools globally.",
    signals: [
      { kind: "school", match: ["MIT", "Massachusetts Institute of Technology", "Caltech", "California Institute of Technology", "Carnegie Mellon"], regex: [/computer science|EECS|electrical engineering/i] },
    ],
    evidence: ["Most Anthropic MTS", "Top quants", "FAANG L6+"],
  },
  {
    id: "eng_stanford_cs",
    family: "engineering",
    tier: "S",
    label: "Stanford CS BS/MS",
    description: "Top CS pipeline globally.",
    signals: [{ kind: "school", match: ["Stanford University"], regex: [/computer science|CS/i] }],
    evidence: ["Many YC founders", "Frontier lab researchers"],
  },
  {
    id: "eng_anthropic_openai_mts",
    family: "engineering",
    tier: "S",
    label: "Anthropic / OpenAI / DeepMind MTS",
    description: "Member of Technical Staff at a frontier lab — top 1% of engineers globally.",
    signals: [{ kind: "company", match: ["Anthropic", "OpenAI", "DeepMind", "SSI", "xAI"], title: ["Member of Technical Staff", "Research Engineer", "Research Scientist"] }],
    evidence: ["thousands of named researchers"],
  },
  {
    id: "eng_jane_street_two_sigma",
    family: "engineering",
    tier: "S",
    label: "Jane Street / Two Sigma / Citadel — quant engineer",
    description: "Top quant trading firms — extremely selective.",
    signals: [{ kind: "company", match: ["Jane Street", "Two Sigma", "Citadel", "Hudson River Trading", "DE Shaw", "Renaissance Technologies"] }],
    evidence: ["competitive programming alumni", "math olympiad medalists"],
  },
  {
    id: "eng_faang_l5_plus",
    family: "engineering",
    tier: "S",
    label: "FAANG L5+ engineer",
    description: "Senior+ at a frontier tech company.",
    signals: [
      { kind: "company", match: ["Google", "Meta", "Facebook", "Apple", "Amazon", "Microsoft", "Nvidia", "Netflix"], title: ["Senior", "Staff", "Principal", "L5", "L6", "L7", "E5", "E6", "E7"] },
    ],
    evidence: ["thousands"],
  },
  {
    id: "eng_open_source_10k_stars",
    family: "engineering",
    tier: "S",
    label: "10k+ stars on a maintained open-source project",
    description: "Authored or co-maintains a widely-used open source library.",
    signals: [{ kind: "open_source", minMetric: 10_000 }],
    evidence: ["maintainers of: transformers, react, vite, tailwindcss, etc."],
  },

  // -------- A — top 5-10% --------
  {
    id: "eng_t10_cs_school",
    family: "engineering",
    tier: "A",
    label: "Top-10 CS school degree",
    description: "Berkeley, Princeton, UIUC, Cornell, UWashington, Harvard, GeorgiaTech, UTAustin, UMichigan.",
    signals: [{ kind: "school", match: ["Berkeley", "Princeton", "UIUC", "University of Illinois", "Cornell", "University of Washington", "Harvard", "Georgia Tech", "UT Austin", "University of Michigan"] }],
    evidence: ["large alumni"],
  },
  {
    id: "eng_yc_company_engineer",
    family: "engineering",
    tier: "A",
    label: "Engineer at a YC company",
    description: "Worked as an engineer at a Y Combinator-backed startup.",
    signals: [{ kind: "free_text", patterns: [/y combinator|YC W\d+|YC S\d+|YC \d+/i] }],
    evidence: ["thousands"],
  },
  {
    id: "eng_published_neurips_co_author",
    family: "engineering",
    tier: "A",
    label: "NeurIPS / ICML / ICLR co-author",
    description: "Not first author, but co-author on a top ML conference paper.",
    signals: [{ kind: "publication", venue: ["NeurIPS", "ICML", "ICLR"], role: "co" }],
    evidence: ["any PhD with multi-author papers"],
  },
  {
    id: "eng_faang_l4",
    family: "engineering",
    tier: "A",
    label: "FAANG L4 engineer (mid-level)",
    description: "Mid-level engineer at a frontier tech company. Strong baseline.",
    signals: [{ kind: "company", match: ["Google", "Meta", "Facebook", "Apple", "Amazon", "Microsoft"], title: ["L4", "E4", "SDE II", "Software Engineer II"] }],
    evidence: ["very large"],
  },

  // -------- B — top 10-20% --------
  {
    id: "eng_t25_cs_school",
    family: "engineering",
    tier: "B",
    label: "Top-25 CS school degree",
    description: "Solid CS pipeline. UCLA, USC, Duke, Northwestern, Brown, UCSD, etc.",
    signals: [{ kind: "school", match: ["UCLA", "USC", "Duke", "Northwestern", "Brown", "UCSD", "UC San Diego", "Vanderbilt", "Rice"], regex: [/computer science|CS/i] }],
    evidence: ["broad"],
  },
  {
    id: "eng_swe_at_known_startup",
    family: "engineering",
    tier: "B",
    label: "Engineer at a Series A+ startup",
    description: "Engineer at a venture-backed startup post-Series A.",
    signals: [{ kind: "free_text", patterns: [/series [a-d]|raised \$[\d.]+m|backed by/i] }],
    evidence: ["broad"],
  },

  // -------- C — top 30-50% --------
  {
    id: "eng_cs_degree_known_school",
    family: "engineering",
    tier: "C",
    label: "CS degree from a known university",
    description: "Earned a CS degree from a recognizable institution.",
    signals: [{ kind: "school", match: ["University", "College", "Institute"], regex: [/computer science|software engineering|EECS/i] }],
    evidence: ["very broad"],
  },
  {
    id: "eng_swe_anywhere",
    family: "engineering",
    tier: "C",
    label: "Software engineer somewhere",
    description: "Holds a software engineering role at any company.",
    signals: [{ kind: "company", match: [""], title: ["Software Engineer", "Engineer", "Developer", "Programmer"] }],
    evidence: ["broad"],
  },

  // -------- D — long tail --------
  {
    id: "eng_self_taught",
    family: "engineering",
    tier: "D",
    label: "Self-taught / bootcamp grad",
    description: "Picked up coding without a CS degree.",
    signals: [{ kind: "free_text", patterns: [/bootcamp|self-taught|self taught|freecodecamp|codecademy/i] }],
    evidence: ["broad"],
  },
];

export const ENGINEERING_CHAINS: Chain[] = [
  {
    id: "eng_chain_classic_pipeline",
    name: "The Classic Pipeline",
    family: "engineering",
    requires: ["eng_stanford_cs", "eng_anthropic_openai_mts"],
    bumpTo: "MYTHIC",
    description: "Stanford CS into a frontier lab — the canonical AI-era career path.",
  },
  {
    id: "eng_chain_mit_quant",
    name: "The Quant Pipeline",
    family: "engineering",
    requires: ["eng_mit_caltech_cmu_cs", "eng_jane_street_two_sigma"],
    bumpTo: "MYTHIC",
    description: "MIT/Caltech/CMU CS into top-tier quant trading.",
  },
  {
    id: "eng_chain_olympiad_to_frontier",
    name: "Olympiad to Frontier",
    family: "engineering",
    requires: ["eng_ioi_imo_gold", "eng_anthropic_openai_mts"],
    bumpTo: "ASCENDED",
    description: "Olympiad medal followed by a frontier lab seat — lifetime-defining.",
  },
  {
    id: "eng_chain_papers_plus_lab",
    name: "Paper + Lab",
    family: "engineering",
    requires: ["eng_published_neurips_co_author", "eng_frontier_lab_founding_eng"],
    bumpTo: "ASCENDED",
    description: "NeurIPS authorship plus founding-engineer status at a frontier lab.",
  },
  {
    id: "eng_chain_open_source_legend",
    name: "Open-Source Legend",
    family: "engineering",
    requires: ["eng_open_source_10k_stars", "eng_faang_l5_plus"],
    bumpTo: "MYTHIC",
    description: "Maintainer of a major OSS project AND a senior engineer at FAANG.",
  },
];
