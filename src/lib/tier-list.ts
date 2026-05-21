// The soul of the product. Hand-curated tier list of cracked signals.
// S = elite (10 pts), A = top-tier (7), B = strong (4), C = decent (2), D = default (1).
//
// Patterns are matched case-insensitively as substrings against the raw signal text.
// Regex patterns supported via `regex: true`.
//
// Tweak these confidently — the whole scoring is transparent and auditable.

import type { CategoryKey, Tier } from "./types";

export const TIER_POINTS: Record<Tier, number> = { S: 10, A: 7, B: 4, C: 2, D: 1 };

export interface RubricEntry {
  /** Display name for the matched entity. */
  label: string;
  tier: Tier;
  /** Lowercase substring tokens. Match if ANY token is present in lowercased input. */
  patterns: string[];
  /** Optional regexes for stronger matches. */
  regex?: RegExp[];
}

export interface CategoryRubric {
  key: CategoryKey;
  label: string;
  /** Max points this category can contribute to the 100 total. */
  cap: number;
  /** How to aggregate when multiple signals match — typically take top N. */
  aggregate: {
    /** Number of signals counted. */
    topN: number;
    /** Weights applied to ranked signals (descending). Length should match topN. */
    weights: number[];
  };
  /** Tier entries; ordered roughly from strongest to weakest within tier. */
  entries: RubricEntry[];
  /** Fallback when no entry matches but a signal is present. */
  fallback: { tier: Tier; label: string };
}

// =============================================================================
// EDUCATION
// =============================================================================
const EDUCATION: CategoryRubric = {
  key: "education",
  label: "Education",
  cap: 15,
  aggregate: { topN: 2, weights: [1.0, 0.5] },
  fallback: { tier: "D", label: "University" },
  entries: [
    // S — global elite
    { label: "MIT", tier: "S", patterns: ["massachusetts institute of technology", "mit ", " mit", "m.i.t"], regex: [/^mit$/i] },
    { label: "Stanford", tier: "S", patterns: ["stanford"] },
    { label: "Harvard", tier: "S", patterns: ["harvard"] },
    { label: "Caltech", tier: "S", patterns: ["caltech", "california institute of technology"] },
    { label: "Princeton", tier: "S", patterns: ["princeton"] },
    { label: "CMU SCS", tier: "S", patterns: ["carnegie mellon", "school of computer science"] },
    { label: "Cambridge", tier: "S", patterns: ["university of cambridge"] },
    { label: "Oxford", tier: "S", patterns: ["university of oxford"] },
    { label: "ETH Zurich", tier: "S", patterns: ["eth zurich", "eth zürich", "swiss federal institute of technology"] },
    { label: "Tsinghua", tier: "S", patterns: ["tsinghua"] },
    { label: "IIT (top)", tier: "S", patterns: ["iit bombay", "iit delhi", "iit madras", "iit kanpur", "iit kharagpur"] },

    // A — top
    { label: "UC Berkeley", tier: "A", patterns: ["uc berkeley", "berkeley, california", "university of california, berkeley"] },
    { label: "Cornell", tier: "A", patterns: ["cornell"] },
    { label: "Yale", tier: "A", patterns: ["yale"] },
    { label: "Columbia", tier: "A", patterns: ["columbia university"] },
    { label: "UPenn / Wharton", tier: "A", patterns: ["university of pennsylvania", "wharton", "upenn"] },
    { label: "Brown", tier: "A", patterns: ["brown university"] },
    { label: "Dartmouth", tier: "A", patterns: ["dartmouth"] },
    { label: "Duke", tier: "A", patterns: ["duke university"] },
    { label: "Georgia Tech", tier: "A", patterns: ["georgia institute of technology", "georgia tech"] },
    { label: "Waterloo CS", tier: "A", patterns: ["university of waterloo", "waterloo, ontario"] },
    { label: "UIUC", tier: "A", patterns: ["university of illinois urbana-champaign", "uiuc"] },
    { label: "U Michigan", tier: "A", patterns: ["university of michigan"] },
    { label: "UT Austin", tier: "A", patterns: ["university of texas at austin", "ut austin"] },
    { label: "Imperial College", tier: "A", patterns: ["imperial college london"] },
    { label: "UCL", tier: "A", patterns: ["university college london"] },
    { label: "EPFL", tier: "A", patterns: ["epfl", "école polytechnique fédérale"] },
    { label: "U Toronto", tier: "A", patterns: ["university of toronto"] },
    { label: "McGill", tier: "A", patterns: ["mcgill"] },
    { label: "Northwestern", tier: "A", patterns: ["northwestern university"] },
    { label: "Johns Hopkins", tier: "A", patterns: ["johns hopkins"] },
    { label: "Rice", tier: "A", patterns: ["rice university"] },

    // B — strong
    { label: "UCLA", tier: "B", patterns: ["ucla", "university of california, los angeles"] },
    { label: "UCSD", tier: "B", patterns: ["uc san diego", "university of california, san diego"] },
    { label: "USC", tier: "B", patterns: ["university of southern california"] },
    { label: "NYU", tier: "B", patterns: ["new york university", "nyu"] },
    { label: "Northeastern", tier: "B", patterns: ["northeastern university"] },
    { label: "Boston University", tier: "B", patterns: ["boston university"] },
    { label: "U Washington", tier: "B", patterns: ["university of washington"] },
    { label: "Purdue", tier: "B", patterns: ["purdue"] },
    { label: "Virginia Tech", tier: "B", patterns: ["virginia tech"] },
    { label: "Wisconsin–Madison", tier: "B", patterns: ["university of wisconsin"] },
    { label: "UMD", tier: "B", patterns: ["university of maryland"] },
    { label: "Other US Top 30", tier: "B", patterns: ["vanderbilt", "wash u", "washington university in st", "emory"] },
  ],
};

// =============================================================================
// WORK
// =============================================================================
const WORK: CategoryRubric = {
  key: "work",
  label: "Work",
  cap: 25,
  aggregate: { topN: 3, weights: [1.0, 0.5, 0.25] },
  fallback: { tier: "C", label: "Software role" },
  entries: [
    // S — frontier AI labs + elite quant
    { label: "Anthropic", tier: "S", patterns: ["anthropic"] },
    { label: "OpenAI", tier: "S", patterns: ["openai"] },
    { label: "DeepMind", tier: "S", patterns: ["deepmind", "google deepmind"] },
    { label: "xAI", tier: "S", patterns: ["xai", "x.ai"] },
    { label: "Mistral", tier: "S", patterns: ["mistral ai", "mistral.ai"] },
    { label: "SSI", tier: "S", patterns: ["safe superintelligence"] },
    { label: "Jane Street", tier: "S", patterns: ["jane street"] },
    { label: "Citadel", tier: "S", patterns: ["citadel"] },
    { label: "Hudson River Trading", tier: "S", patterns: ["hudson river trading", "hrt"] },
    { label: "Two Sigma", tier: "S", patterns: ["two sigma"] },
    { label: "Renaissance Tech", tier: "S", patterns: ["renaissance technologies"] },
    { label: "DE Shaw", tier: "S", patterns: ["d. e. shaw", "de shaw"] },
    { label: "Tower Research", tier: "S", patterns: ["tower research"] },
    { label: "Optiver", tier: "S", patterns: ["optiver"] },

    // A — top startups, top consulting, top banks (relevant divisions)
    { label: "Stripe", tier: "A", patterns: ["stripe"] },
    { label: "Vercel", tier: "A", patterns: ["vercel"] },
    { label: "Linear", tier: "A", patterns: ["linear.app"] },
    { label: "Figma", tier: "A", patterns: ["figma"] },
    { label: "Notion", tier: "A", patterns: ["notion labs", "notion.so"] },
    { label: "Cursor", tier: "A", patterns: ["anysphere", "cursor.com"] },
    { label: "Scale AI", tier: "A", patterns: ["scale ai", "scale.ai"] },
    { label: "Perplexity", tier: "A", patterns: ["perplexity"] },
    { label: "Anduril", tier: "A", patterns: ["anduril"] },
    { label: "Ramp", tier: "A", patterns: ["ramp business", "ramp.com"] },
    { label: "Mercury", tier: "A", patterns: ["mercury bank"] },
    { label: "Brex", tier: "A", patterns: ["brex"] },
    { label: "Replit", tier: "A", patterns: ["replit"] },
    { label: "Hugging Face", tier: "A", patterns: ["hugging face", "huggingface"] },
    { label: "Modal", tier: "A", patterns: ["modal labs", "modal.com"] },
    { label: "Together AI", tier: "A", patterns: ["together ai", "together.ai"] },
    { label: "Cohere", tier: "A", patterns: ["cohere"] },
    { label: "McKinsey", tier: "A", patterns: ["mckinsey"] },
    { label: "BCG", tier: "A", patterns: ["boston consulting group"] },
    { label: "Bain", tier: "A", patterns: ["bain & company", "bain and company"] },
    { label: "Goldman Sachs", tier: "A", patterns: ["goldman sachs"] },
    { label: "Morgan Stanley", tier: "A", patterns: ["morgan stanley"] },

    // B — FAANG + adjacent + unicorns
    { label: "Google", tier: "B", patterns: ["google "], regex: [/^google$/i] },
    { label: "Meta / Facebook", tier: "B", patterns: ["meta platforms", "facebook"] },
    { label: "Apple", tier: "B", patterns: ["apple inc"] },
    { label: "Microsoft", tier: "B", patterns: ["microsoft"] },
    { label: "Amazon", tier: "B", patterns: ["amazon.com", "amazon web services", "aws"] },
    { label: "Netflix", tier: "B", patterns: ["netflix"] },
    { label: "Nvidia", tier: "B", patterns: ["nvidia"] },
    { label: "Tesla", tier: "B", patterns: ["tesla, inc", "tesla motors"] },
    { label: "Snap", tier: "B", patterns: ["snap inc", "snapchat"] },
    { label: "Discord", tier: "B", patterns: ["discord"] },
    { label: "Pinterest", tier: "B", patterns: ["pinterest"] },
    { label: "Reddit", tier: "B", patterns: ["reddit inc"] },
    { label: "Airbnb", tier: "B", patterns: ["airbnb"] },
    { label: "Coinbase", tier: "B", patterns: ["coinbase"] },
    { label: "Databricks", tier: "B", patterns: ["databricks"] },
    { label: "Snowflake", tier: "B", patterns: ["snowflake"] },
  ],
};

// =============================================================================
// ACCOLADES (Olympiads, Fellowships, Major Awards, Hackathons, Publications)
// =============================================================================
const ACCOLADES: CategoryRubric = {
  key: "accolades",
  label: "Accolades",
  cap: 25,
  aggregate: { topN: 5, weights: [1.0, 0.7, 0.5, 0.3, 0.2] },
  fallback: { tier: "D", label: "Honor / Award" },
  entries: [
    // S — pinnacle
    { label: "IMO Medal", tier: "S", patterns: ["international mathematical olympiad", "imo medal", "imo gold", "imo silver", "imo bronze"] },
    { label: "IOI Medal", tier: "S", patterns: ["international olympiad in informatics", "ioi medal", "ioi gold", "ioi silver"] },
    { label: "IPhO Medal", tier: "S", patterns: ["international physics olympiad", "ipho"] },
    { label: "IChO Medal", tier: "S", patterns: ["international chemistry olympiad", "icho"] },
    { label: "IBO Medal", tier: "S", patterns: ["international biology olympiad", "ibo medal"] },
    { label: "Putnam Top 25", tier: "S", patterns: ["putnam top", "putnam fellow", "putnam top 25"] },
    { label: "Rhodes Scholar", tier: "S", patterns: ["rhodes scholar", "rhodes scholarship"] },
    { label: "Marshall Scholar", tier: "S", patterns: ["marshall scholar", "marshall scholarship"] },
    { label: "Knight-Hennessy", tier: "S", patterns: ["knight-hennessy", "knight hennessy"] },
    { label: "Thiel Fellow", tier: "S", patterns: ["thiel fellow", "thiel fellowship"] },
    { label: "MacArthur Fellow", tier: "S", patterns: ["macarthur fellow", "macarthur \"genius\""] },
    { label: "Forbes 30 Under 30", tier: "S", patterns: ["forbes 30 under 30", "30 under 30"] },
    { label: "TIME 100", tier: "S", patterns: ["time 100"] },
    { label: "ISEF Top 5", tier: "S", patterns: ["isef first place", "isef grand award", "regeneron isef"] },
    { label: "Olympic Medalist", tier: "S", patterns: ["olympic gold", "olympic silver", "olympic bronze", "olympic medal"] },

    // A — top
    { label: "USAMO", tier: "A", patterns: ["usamo", "usa mathematical olympiad"] },
    { label: "USACO Platinum", tier: "A", patterns: ["usaco platinum"] },
    { label: "USAPhO", tier: "A", patterns: ["usapho", "us physics olympiad"] },
    { label: "MOP", tier: "A", patterns: ["math olympiad program", "mathematical olympiad program", "mop "] },
    { label: "RSI", tier: "A", patterns: ["research science institute", "rsi mit"] },
    { label: "PRIMES", tier: "A", patterns: ["primes mit", "mit primes"] },
    { label: "Regeneron STS", tier: "A", patterns: ["regeneron science talent search", "intel science talent"] },
    { label: "NSF GRFP", tier: "A", patterns: ["nsf graduate research fellowship", "nsf grfp"] },
    { label: "Hertz Fellow", tier: "A", patterns: ["hertz fellowship", "hertz foundation"] },
    { label: "Truman Scholar", tier: "A", patterns: ["truman scholar"] },
    { label: "Goldwater Scholar", tier: "A", patterns: ["goldwater scholar"] },
    { label: "Fulbright", tier: "A", patterns: ["fulbright"] },
    { label: "Mercury Fellow", tier: "A", patterns: ["mercury fellow", "mercury fellowship"] },
    { label: "Z Fellow", tier: "A", patterns: ["z fellows"] },
    { label: "Neo Scholar", tier: "A", patterns: ["neo scholar", "neo.com"] },
    { label: "AI2 Fellowship", tier: "A", patterns: ["ai2 fellowship", "allen institute fellow"] },
    { label: "NeurIPS Paper", tier: "A", patterns: ["neurips", "nips conference"] },
    { label: "ICML Paper", tier: "A", patterns: ["icml conference", "international conference on machine learning"] },
    { label: "ICLR Paper", tier: "A", patterns: ["iclr conference"] },

    // B — strong
    { label: "AIME Qualifier", tier: "B", patterns: ["aime", "american invitational mathematics"] },
    { label: "USACO Gold", tier: "B", patterns: ["usaco gold"] },
    { label: "TreeHacks Grand Prize", tier: "B", patterns: ["treehacks", "stanford treehacks"] },
    { label: "HackMIT Grand Prize", tier: "B", patterns: ["hackmit", "hack mit"] },
    { label: "HackHarvard", tier: "B", patterns: ["hackharvard"] },
    { label: "PennApps", tier: "B", patterns: ["pennapps"] },
    { label: "CalHacks", tier: "B", patterns: ["calhacks", "cal hacks"] },
    { label: "HackNY", tier: "B", patterns: ["hackny"] },
    { label: "HackPrinceton", tier: "B", patterns: ["hackprinceton"] },
    { label: "Hackathon Grand Prize", tier: "B", patterns: ["grand prize", "1st place hackathon", "first place hackathon", "best overall hackathon"] },
    { label: "Phi Beta Kappa", tier: "B", patterns: ["phi beta kappa"] },
    { label: "Tau Beta Pi", tier: "B", patterns: ["tau beta pi"] },
    { label: "Dean's List (top school)", tier: "C", patterns: ["dean's list", "deans list"] },
    { label: "Devpost Winner", tier: "C", patterns: ["devpost winner", "devpost finalist"] },
  ],
};

// =============================================================================
// FOUNDER
// =============================================================================
const FOUNDER: CategoryRubric = {
  key: "founder",
  label: "Founder",
  cap: 15,
  aggregate: { topN: 1, weights: [1.0] },
  fallback: { tier: "D", label: "No founder signal" },
  entries: [
    { label: "Exited Founder ($100M+)", tier: "S", patterns: ["acquired by", "exit", "exited", "acquisition"], regex: [/raised\s+\$1[0-9]{2,}\s?m/i, /raised\s+\$\d+\s?b/i] },
    { label: "Thiel Fellow + Active Co", tier: "S", patterns: ["thiel fellow"] },
    { label: "YC W/S Founder", tier: "A", patterns: ["y combinator", "ycombinator", " yc w", " yc s", "yc batch"] },
    { label: "Founders Inc", tier: "A", patterns: ["founders inc", "founders, inc"] },
    { label: "Neo", tier: "A", patterns: ["neo accelerator"] },
    { label: "On Deck", tier: "A", patterns: ["on deck fellowship", "on deck ", "ondeck"] },
    { label: "Z Fellows", tier: "A", patterns: ["z fellows"] },
    { label: "Pioneer", tier: "A", patterns: ["pioneer.app"] },
    { label: "Raised Seed $1M+", tier: "A", patterns: [], regex: [/raised\s+\$[1-9][0-9]?\s?m/i, /seed\s+round/i] },
    { label: "Co-founder", tier: "B", patterns: ["co-founder", "cofounder", "founder &", "founder, "] },
    { label: "Founder", tier: "B", patterns: ["founder of", "ceo & founder", "founder/ceo"] },
    { label: "Indie Hacker", tier: "C", patterns: ["indie hacker", "bootstrapped", "side project"] },
  ],
};

// =============================================================================
// OPEN SOURCE
// =============================================================================
const OPEN_SOURCE: CategoryRubric = {
  key: "openSource",
  label: "Open Source",
  cap: 10,
  aggregate: { topN: 1, weights: [1.0] },
  fallback: { tier: "D", label: "GitHub presence" },
  entries: [
    { label: "Core OSS Contributor", tier: "S", patterns: ["pytorch contributor", "react core team", "rust language team", "kubernetes maintainer", "linux kernel", "postgres committer", "node.js core", "deno core team", "bun contributor"] },
    { label: "Hugging Face Core", tier: "S", patterns: ["transformers maintainer", "huggingface core"] },
    { label: "5k+ Star Project", tier: "A", patterns: [], regex: [/\b([5-9]|[1-9]\d)k\s+(github\s+)?stars/i, /\b\d{4,}\s+(github\s+)?stars/i] },
    { label: "Popular Package Author", tier: "A", patterns: ["npm author", "pypi maintainer", "crates.io"] },
    { label: "1k+ Star Project", tier: "B", patterns: [], regex: [/\b[1-4]k\s+(github\s+)?stars/i, /\b\d{3,}\s+(github\s+)?stars/i] },
    { label: "Active Contributor", tier: "B", patterns: ["open source contributor", "open-source contributor"] },
    { label: "Personal Projects", tier: "C", patterns: ["github.com/"] },
  ],
};

// =============================================================================
// SIGNAL (online presence, talks, publications, viral output)
// Largely judged by the LLM via the X-factor field, but we list known venues.
// =============================================================================
const SIGNAL: CategoryRubric = {
  key: "signal",
  label: "Signal",
  cap: 10,
  aggregate: { topN: 3, weights: [1.0, 0.5, 0.3] },
  fallback: { tier: "D", label: "Online presence" },
  entries: [
    { label: "100k+ Twitter Following", tier: "S", patterns: [], regex: [/\b[1-9]\d{2,}k?\s+followers/i, /\b\d+m\s+followers/i] },
    { label: "NeurIPS / ICML Speaker", tier: "S", patterns: ["neurips speaker", "icml speaker", "keynote"] },
    { label: "10k+ Twitter Following", tier: "A", patterns: [], regex: [/\b[1-9]\d?k\s+followers/i] },
    { label: "Strange Loop / JSConf Speaker", tier: "A", patterns: ["strange loop", "jsconf", "react conf", "pycon keynote"] },
    { label: "Published Paper", tier: "A", patterns: ["arxiv.org", "published in ", "co-author of"] },
    { label: "Conference Talk", tier: "B", patterns: ["conference speaker", "tech talk", "invited talk"] },
    { label: "Blog / Substack", tier: "C", patterns: ["substack.com", "personal blog"] },
  ],
};

export const RUBRIC: CategoryRubric[] = [EDUCATION, WORK, ACCOLADES, FOUNDER, OPEN_SOURCE, SIGNAL];

/**
 * Match a raw signal string against a category's rubric.
 * Returns the highest-tier entry that matches, or the fallback.
 */
export function matchEntry(raw: string, rubric: CategoryRubric): { tier: Tier; label: string } {
  const lower = raw.toLowerCase();
  const tierRank: Record<Tier, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };
  let best: { tier: Tier; label: string } | null = null;

  for (const entry of rubric.entries) {
    const hitPattern = entry.patterns.some((p) => lower.includes(p.toLowerCase()));
    const hitRegex = entry.regex?.some((r) => r.test(raw)) ?? false;
    if (hitPattern || hitRegex) {
      if (!best || tierRank[entry.tier] > tierRank[best.tier]) {
        best = { tier: entry.tier, label: entry.label };
      }
    }
  }

  return best ?? rubric.fallback;
}

export function tierFromTotal(total: number): Tier {
  if (total >= 90) return "S";
  if (total >= 75) return "A";
  if (total >= 60) return "B";
  if (total >= 40) return "C";
  return "D";
}
