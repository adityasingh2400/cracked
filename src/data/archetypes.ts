// THE CRACKED DEX — archetypes of cracked-ness, ordered ascending by tier.
// Number = relative ranking. #001 is least cracked, the highest number is most cracked.
// Every archetype has a justification so readers can fight about it instead of raging.
//
// Examples use only well-known, public-facing figures who are already objects of
// discourse. For lower tiers we use composite descriptions instead of naming people.

import type { Tier, SubStats } from "@/lib/types";

export type ArchetypeType =
  | "Hacker"      // technical builders
  | "Quant"       // math/finance
  | "Founder"     // startup operator
  | "Scholar"     // academic / olympiad
  | "Operator"    // big-co PM / consulting / strategy
  | "Influencer"  // online presence / community
  | "Researcher"; // ML / academic publishing

export interface Archetype {
  /** 1-indexed dex number. Order matters: ascending = more cracked. */
  number: number;
  slug: string;
  name: string;
  /** Short tagline. Italic on the card. */
  tagline: string;
  types: ArchetypeType[];
  tier: Tier;
  /** Expected total-score range for this archetype. */
  scoreRange: [number, number];
  /** Typical sub-stats distribution. Used by the matcher. */
  typicalStats: SubStats;
  /** 2-3 sentence profile. Specific, not generic. */
  profile: string;
  /** Why this archetype ranks where it ranks. Defensible. */
  justification: string;
  /** Real-world examples. Use only well-known public figures, else composite descriptions. */
  examples: string[];
  /** Career path that produces this archetype. */
  trajectory: string[];
  /** What this archetype evolves into (slug references). */
  evolvesInto?: string[];
  /** Where this archetype came from (slug references). */
  evolvedFrom?: string[];
  /** Glyph or icon hint — emoji ok but kept tasteful (single char). */
  glyph: string;
}

export const ARCHETYPES: Archetype[] = [
  // ===========================================================================
  // D-TIER · The Long Tail (#001-#010)
  // The signals haven't shown up yet. Or they showed up in places that don't count.
  // ===========================================================================
  {
    number: 1,
    slug: "linkedin-influencer",
    name: "The LinkedIn Devotee",
    tagline: "Has a content strategy. No commits.",
    types: ["Influencer"],
    tier: "D",
    scoreRange: [10, 25],
    typicalStats: { hack: 8, grind: 35, taste: 12, rizz: 55 },
    profile:
      "Posts daily about leadership, AI, and 'the future of work'. Has 12k LinkedIn followers and zero GitHub commits. Job title is some flavor of Growth Strategist or Vibe Architect.",
    justification:
      "Performance of being technical without the underlying technical reality. The follower count buys some Rizz but every other axis is empty. Ranks here, not lower, because the audience is real and audiences are leverage.",
    examples: ["Composite of mid-career LinkedInfluencers", "Any 'Top Voice' badge holder who can't FizzBuzz"],
    trajectory: ["Liberal arts degree", "Marketing role at mid-co", "Personal brand pivot", "AI consultant"],
    evolvesInto: ["bootcamp-grad", "saas-bro"],
    glyph: "◯",
  },
  {
    number: 2,
    slug: "bootcamp-grad",
    name: "The Bootcamp Grad",
    tagline: "Twelve weeks. Real determination. Mid output.",
    types: ["Hacker"],
    tier: "D",
    scoreRange: [15, 30],
    typicalStats: { hack: 22, grind: 45, taste: 10, rizz: 18 },
    profile:
      "Did App Academy / Hack Reactor / Lambda. Knows React + Express. First job is at a 50-person consultancy nobody has heard of. Will probably level up — most do.",
    justification:
      "Pure grind, low signal density. The career switch took guts but it didn't come with the credentialing or competition wins that move the needle. Cracked people respect the hustle; the dex doesn't reward it yet.",
    examples: ["Tens of thousands of post-2020 bootcamp grads"],
    trajectory: ["Non-CS undergrad", "Bootcamp", "Junior dev at consultancy", "?"],
    evolvesInto: ["faang-swe-no-other-signal", "indie-hacker-100-users"],
    glyph: "△",
  },
  {
    number: 3,
    slug: "coursera-completionist",
    name: "The Coursera Completionist",
    tagline: "47 certificates. One side project.",
    types: ["Scholar"],
    tier: "D",
    scoreRange: [12, 28],
    typicalStats: { hack: 18, grind: 60, taste: 14, rizz: 8 },
    profile:
      "Has finished every Andrew Ng course, the Deep Learning specialization, the IBM Data Engineering track, three Google certificates, and a Meta Frontend course. Has not shipped.",
    justification:
      "Mistaking input for output. Real cracked people use courses as scaffolding to build things; the completionist treats the course as the thing. Grind is high, hack is low because none of it compiles into a portfolio.",
    examples: ["The career-changer LinkedIn shows you weekly"],
    trajectory: ["Career change at 28", "MOOC binge", "Junior data analyst", "?"],
    evolvesInto: ["bootcamp-grad", "self-taught-side-hustler"],
    glyph: "▱",
  },
  {
    number: 4,
    slug: "senior-it-manager",
    name: "The Senior IT Manager",
    tagline: "Twenty years. SharePoint. ITIL certified.",
    types: ["Operator"],
    tier: "D",
    scoreRange: [10, 25],
    typicalStats: { hack: 12, grind: 70, taste: 20, rizz: 5 },
    profile:
      "Runs IT for a 400-person manufacturing company. Manages a team that manages a team that maintains a SQL Server from 2009. Genuinely competent at a thing the cracked discourse pretends doesn't exist.",
    justification:
      "Stable, paid, important, and nobody on Twitter calls you cracked for it. Twenty years of grind earns respect, but the absence of any prestige-axis (school, modern tech co, accolades) means the dex rates you on the cracked-spectrum, not the life-spectrum.",
    examples: ["Half the IT departments in every Fortune 500"],
    trajectory: ["State school IT", "Helpdesk", "Sysadmin", "IT Manager", "Sr IT Manager"],
    glyph: "▭",
  },
  {
    number: 5,
    slug: "self-taught-side-hustler",
    name: "The Self-Taught Side Hustler",
    tagline: "Has shipped a thing. To three users.",
    types: ["Hacker"],
    tier: "D",
    scoreRange: [18, 32],
    typicalStats: { hack: 28, grind: 50, taste: 18, rizz: 22 },
    profile:
      "Day job in something boring. Nights and weekends: a SaaS for dentists. Three trial users, one paying. Will either grind into the next tier or quit in 18 months.",
    justification:
      "Real builder energy and the right instincts (ship, iterate, sell). But the absence of a portfolio of compounding signals means this archetype's expected value is wide. They might be #027 in two years.",
    examples: ["The IndieHackers forum, 9 PM on a Tuesday"],
    trajectory: ["Boring day job", "MicroSaaS attempt", "Slow MRR", "?"],
    evolvesInto: ["indie-hacker-30k", "discord-bot-hobbyist"],
    glyph: "◇",
  },
  {
    number: 6,
    slug: "discord-bot-hobbyist",
    name: "The Discord Bot Hobbyist",
    tagline: "OAuth tokens younger than they are.",
    types: ["Hacker"],
    tier: "D",
    scoreRange: [16, 30],
    typicalStats: { hack: 38, grind: 35, taste: 14, rizz: 20 },
    profile:
      "Sixteen, building bots for their friend group. Knows discord.py inside out. Will probably end up at #017 or #027 in five years if they keep going.",
    justification:
      "High latent talent, zero credentialed signal yet. The dex grades present state, not potential. But the trajectory is good — most people who build Discord bots at 16 build other things at 22.",
    examples: ["Composite of thousands of high school hackers"],
    trajectory: ["High school", "Discord bots → Roblox → side projects", "→ college admit"],
    evolvesInto: ["devpost-serial-winner", "waterloo-co-op-grinder"],
    glyph: "✱",
  },
  {
    number: 7,
    slug: "liberal-arts-pivot",
    name: "The Liberal Arts → Tech Pivot",
    tagline: "Read Foucault. Now writes React.",
    types: ["Hacker", "Operator"],
    tier: "D",
    scoreRange: [18, 35],
    typicalStats: { hack: 25, grind: 45, taste: 35, rizz: 25 },
    profile:
      "Bowdoin English major who learned to code at 27, joined a Series B as a PM, then bullied their way onto the eng team. Reads better than the engineers, codes worse, has surprising taste.",
    justification:
      "Taste premium from the humanities background lifts this above the bootcamp grad, but the absence of formal CS or competition wins keeps it here. Often evolves into great PMs or designers.",
    examples: ["A surprising number of Stripe writers", "Notion early hires"],
    trajectory: ["Liberal arts at Bowdoin/Williams/Reed", "Marketing/ops job", "PM at startup", "Wedge into eng"],
    evolvesInto: ["stripe-apm", "notion-designer-with-cult-twitter"],
    glyph: "◈",
  },
  {
    number: 8,
    slug: "full-stack-fve-yoe",
    name: "The 5 YOE Full-Stack",
    tagline: "Same job since college. Updates LinkedIn quarterly.",
    types: ["Hacker"],
    tier: "D",
    scoreRange: [22, 38],
    typicalStats: { hack: 35, grind: 55, taste: 18, rizz: 12 },
    profile:
      "Five years at the same regional SaaS. Title went from Software Engineer to Software Engineer II to Senior Software Engineer. Has shipped real code. Has not shipped a side project since 2019.",
    justification:
      "Competence without ambition. The years count for something — they really do know the codebase — but the absence of velocity (no job change, no side project, no learning) caps this at D.",
    examples: ["Most software engineers, statistically"],
    trajectory: ["State school CS", "First job out of college", "Five years later, same job"],
    evolvesInto: ["faang-swe-no-other-signal"],
    glyph: "◯",
  },
  {
    number: 9,
    slug: "phd-no-papers",
    name: "The Stalled PhD",
    tagline: "Year seven. Advisor on sabbatical.",
    types: ["Scholar"],
    tier: "D",
    scoreRange: [20, 38],
    typicalStats: { hack: 30, grind: 40, taste: 30, rizz: 8 },
    profile:
      "Computer science PhD candidate at a top-30 program. Year seven. One workshop paper. Advisor unresponsive. The grind is real but the output isn't compounding.",
    justification:
      "PhD admission was a signal but stalling without publications nullifies it. Cracked PhDs publish at NeurIPS in year three and start companies in year five. This one is going to defend, then disappear.",
    examples: ["You know one"],
    trajectory: ["Top undergrad", "Top-30 PhD program", "Years of grinding", "Stall"],
    evolvesInto: ["microsoft-research-startup"],
    glyph: "▱",
  },
  {
    number: 10,
    slug: "saas-bro",
    name: "The SaaS Bro",
    tagline: "Build in public. No public.",
    types: ["Founder", "Influencer"],
    tier: "D",
    scoreRange: [22, 38],
    typicalStats: { hack: 25, grind: 60, taste: 20, rizz: 50 },
    profile:
      "Tweets MRR screenshots from a $200/month coffee shop CRM. Calls themselves a founder. Has 3000 followers and a Stripe Atlas LLC. Real revenue, real grind, low ceiling.",
    justification:
      "The 'build in public' culture rewards visibility over substance. Genuine MRR matters, but a $5k MRR coffee CRM is not what cracked means. Lifestyle business ≠ founder archetype. Solid people, wrong axis.",
    examples: ["Twitter, 11 PM, any night"],
    trajectory: ["Tech job", "Quit to indie hack", "$5k MRR", "Twitter persona"],
    evolvesInto: ["indie-hacker-30k"],
    glyph: "◇",
  },

  // ===========================================================================
  // C-TIER · The Believers (#011-#020)
  // Real signal, often early-career. The trajectory is good. Watch this space.
  // ===========================================================================
  {
    number: 11,
    slug: "state-school-cs-startup",
    name: "The State School CS → Startup",
    tagline: "Florida State CS. Now at a Series B.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [32, 48],
    typicalStats: { hack: 50, grind: 55, taste: 35, rizz: 20 },
    profile:
      "Went to UCF, ASU, or Pitt for CS. Did a few internships nobody recognizes. Now an engineer at a Series B that's pre-IPO. Earns more than their entire family does combined.",
    justification:
      "The school doesn't carry prestige weight but the startup placement signals real ability. The American Dream archetype of tech. Will likely break into B-tier with one or two big-co stints.",
    examples: ["Composite — see your friend at a Series B"],
    trajectory: ["State school CS", "Internships", "Series B job", "?"],
    evolvesInto: ["cornell-cs-coinbase-senior", "faang-swe-no-other-signal"],
    glyph: "◇",
  },
  {
    number: 12,
    slug: "indie-hacker-30k",
    name: "The Indie Hacker at $30k MRR",
    tagline: "Quit FAANG. Sells calendars to dentists.",
    types: ["Founder", "Hacker"],
    tier: "C",
    scoreRange: [35, 52],
    typicalStats: { hack: 55, grind: 70, taste: 35, rizz: 45 },
    profile:
      "Was a senior engineer somewhere normal. Built a niche tool (booking software for orthodontists, invoice templates for plumbers). Now makes $30-50k MRR solo from a beach in Lisbon.",
    justification:
      "Genuine entrepreneurship at a level most people don't reach, but the cracked ladder rewards venture-scale ambition specifically. Lifestyle freedom doesn't compound the way YC + funding does. Top of C tier.",
    examples: ["Pieter Levels (Nomad List)", "Tyler Tringas (Storemapper, early)"],
    trajectory: ["Tech job", "Quit at 28", "MicroSaaS grind 2 years", "$30k MRR"],
    evolvesInto: ["z-fellow-seed", "ycombinator-vet"],
    glyph: "◈",
  },
  {
    number: 13,
    slug: "phd-no-pubs",
    name: "The PhD Student Posting on r/MachineLearning",
    tagline: "Long-effortpost about RLHF. No first-author paper yet.",
    types: ["Scholar", "Researcher"],
    tier: "C",
    scoreRange: [35, 50],
    typicalStats: { hack: 50, grind: 55, taste: 50, rizz: 30 },
    profile:
      "Second-year PhD at a top-30 program in ML. Hasn't published yet but posts long Reddit comments that get 800 upvotes. Knows their stuff, hasn't proven it institutionally.",
    justification:
      "The taste is real (the Reddit posts are good). The credentialing is in progress. If they ship a NeurIPS paper next year, they leap to A-tier. Right now: respected, not cracked.",
    examples: ["You've upvoted them"],
    trajectory: ["Top-30 undergrad", "Top-30 ML PhD", "Reddit influence first"],
    evolvesInto: ["deepmind-research-scientist", "openai-resident"],
    glyph: "▰",
  },
  {
    number: 14,
    slug: "mit-grad-deloitte",
    name: "The MIT Grad → McKinsey/Deloitte",
    tagline: "Course 6 then advisory.",
    types: ["Operator"],
    tier: "C",
    scoreRange: [40, 55],
    typicalStats: { hack: 35, grind: 65, taste: 60, rizz: 30 },
    profile:
      "Got into MIT (huge S-tier signal), graduated in CS or EECS, and then... took the consulting job. Tells everyone they'll start a company in 'two more years'. They will not.",
    justification:
      "The MIT name is permanent leverage, but the consulting path systematically destroys cracked velocity. The dex penalizes the post-MIT choice, not the MIT itself. Will probably end up rich and boring.",
    examples: ["A measurable percentage of every Course 6 graduating class"],
    trajectory: ["MIT 6-3", "Summer at top bank or McKinsey", "Full-time at McKinsey", "MBA at HBS", "VP at F500"],
    glyph: "◇",
  },
  {
    number: 15,
    slug: "self-taught-faang",
    name: "The Self-Taught FAANG",
    tagline: "No degree. Passed every loop.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [40, 55],
    typicalStats: { hack: 60, grind: 70, taste: 45, rizz: 25 },
    profile:
      "Skipped college. Spent four years grinding LeetCode, contributing to one open source project, and applying to FAANG. Got a junior offer at Amazon, leveled to L5 in three years.",
    justification:
      "Pure ability + grind without the credentialing scaffolding most cracked people have. Respected in code review, invisible on LinkedIn. The lack of school/accolade signals caps the score even though the engineer is real.",
    examples: ["Composite of self-taught engineers at AMZN/MSFT"],
    trajectory: ["High school", "Self-study", "FAANG offer at 22", "Senior at 25"],
    evolvesInto: ["cornell-cs-coinbase-senior"],
    glyph: "▱",
  },
  {
    number: 16,
    slug: "local-hackathon-king",
    name: "The Local Hackathon King",
    tagline: "Six wins. None named hackathons.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [38, 52],
    typicalStats: { hack: 60, grind: 60, taste: 35, rizz: 30 },
    profile:
      "Won the university hackathon four times. Won a state-level hackathon twice. Has built 30 things. None are deployed anywhere or have users. Hasn't graduated yet.",
    justification:
      "The output is impressive but the venues don't carry prestige. Cracked people who win hackathons win NAMED hackathons (HackMIT, TreeHacks, PennApps). Local wins are practice. This person becomes #029 in two years if they level up.",
    examples: ["Composite of every CS school's hackathon scene"],
    trajectory: ["Sophomore CS", "Hackathon obsession", "Local wins", "Looking for the next level"],
    evolvesInto: ["devpost-serial-winner", "hackmit-stripe"],
    glyph: "✱",
  },
  {
    number: 17,
    slug: "faang-swe-no-other-signal",
    name: "The FAANG SWE (Plain)",
    tagline: "Senior Engineer II. That's the resume.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [42, 58],
    typicalStats: { hack: 55, grind: 60, taste: 50, rizz: 18 },
    profile:
      "Went to a decent school, joined Google or Meta out of college, has been there six years, is L5/E5. No side projects, no founder energy, no accolades. The job is the whole resume.",
    justification:
      "FAANG carries B-tier weight on its own but with zero secondary signal, the score caps in low C. Cracked people use FAANG as a launchpad; this archetype treats it as the destination. The TC is great. The dex doesn't care.",
    examples: ["Half of the workforce of MountainView and Seattle"],
    trajectory: ["Decent school CS", "Internship", "New grad at Google", "L4 → L5 over 5 years"],
    evolvesInto: ["cornell-cs-coinbase-senior", "berkeley-anthropic"],
    glyph: "◇",
  },
  {
    number: 18,
    slug: "cs-builder",
    name: "The CS Major Building For Friends",
    tagline: "Built a class registration tool. Used by 400 people.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [40, 55],
    typicalStats: { hack: 65, grind: 50, taste: 45, rizz: 35 },
    profile:
      "Sophomore at a top-30 university. Built a better course registration tool, or a campus food review app, or a Discord bot the whole school uses. Real users. Real shipping cadence.",
    justification:
      "Distribution at the campus scale is a credible signal. With one named hackathon win or a serious internship, jumps to B. The score floor is held up by the fact that they're early — runway matters.",
    examples: ["The kid who built UnofficialRensselaer / Yale Daily News tools / etc."],
    trajectory: ["Top-30 university CS", "Campus-scale tools", "Internship hunting"],
    evolvesInto: ["hackmit-stripe", "stripe-apm"],
    glyph: "✱",
  },
  {
    number: 19,
    slug: "long-tail-oss",
    name: "The Long-Tail OSS Contributor",
    tagline: "47 merged PRs across 30 repos.",
    types: ["Hacker"],
    tier: "C",
    scoreRange: [42, 56],
    typicalStats: { hack: 65, grind: 70, taste: 45, rizz: 20 },
    profile:
      "Fixes typos in popular READMEs. Has a few drive-by bug fixes in real codebases. Did a Google Summer of Code once. The contributions are real but tangential — not maintainer-level.",
    justification:
      "Real engagement with open source counts, but the dex separates 'contributor' from 'core contributor' from 'maintainer'. This is solid C — the kind of engineer who'd thrive at a real startup, just not (yet) at a frontier lab.",
    examples: ["Many GSoC alumni"],
    trajectory: ["CS undergrad", "GSoC", "Drive-by PRs", "Junior at startup"],
    evolvesInto: ["hugging-face-maintainer"],
    glyph: "▰",
  },
  {
    number: 20,
    slug: "indie-hacker-100-users",
    name: "The Solo Founder With 100 Users",
    tagline: "Built it alone. Loves the 100.",
    types: ["Founder", "Hacker"],
    tier: "C",
    scoreRange: [40, 55],
    typicalStats: { hack: 55, grind: 65, taste: 45, rizz: 35 },
    profile:
      "Quit their job at 26. Built a tool for a vertical they know (real estate, accounting, fitness). 100 users, 30 paying, $2k MRR. Hasn't given up, hasn't broken out.",
    justification:
      "More founder energy than 95% of people who call themselves founders, but pre-product-market-fit revenue caps the founder-axis score. One year out is the inflection point — either #024 (the $30k MRR) or back to the day job.",
    examples: ["Most of the actual indie hacker community"],
    trajectory: ["Tech job", "Quit", "MicroSaaS", "$2k MRR", "Crossroads"],
    evolvesInto: ["indie-hacker-30k", "saas-bro"],
    glyph: "◇",
  },

  // ===========================================================================
  // B-TIER · The Top 10% (#021-#032)
  // Strong stack. Multiple signals. The kind of resume that gets every interview.
  // ===========================================================================
  {
    number: 21,
    slug: "hackmit-stripe",
    name: "The HackMIT Champion → Stripe",
    tagline: "TreeHacks. Then Stripe new grad.",
    types: ["Hacker"],
    tier: "B",
    scoreRange: [55, 70],
    typicalStats: { hack: 75, grind: 70, taste: 70, rizz: 40 },
    profile:
      "Won HackMIT and TreeHacks in college, parlayed it into a Stripe new grad offer. Junior engineer at one of the most-respected companies in tech. The world is open.",
    justification:
      "Named hackathon wins stack into accolades; Stripe is A-tier work. Combined, this archetype clears B. Lacks the founder/olympiad axis to break into A, but the platform is set.",
    examples: ["The named profile in every Stripe new grad cohort"],
    trajectory: ["Top-20 CS school", "Hackathon circuit", "Stripe SWE 1", "?"],
    evolvesInto: ["stripe-early-engineer", "ycombinator-vet"],
    glyph: "◈",
  },
  {
    number: 22,
    slug: "waterloo-co-op-grinder",
    name: "The Waterloo Co-op Grinder",
    tagline: "Four FAANGs in six terms.",
    types: ["Hacker"],
    tier: "B",
    scoreRange: [58, 72],
    typicalStats: { hack: 78, grind: 85, taste: 65, rizz: 30 },
    profile:
      "Waterloo CS. Did six co-ops: Stripe, Google, Meta, Jane Street, Anthropic, and a stealth startup. Hasn't graduated. Has 4 returning offers. Will pick the most cracked one.",
    justification:
      "The Waterloo co-op machine is the most efficient cracked-engineer pipeline in the world. Hits A-tier internships repeatedly, which is harder than getting one. Justifies high B / low A on grind alone.",
    examples: ["A measurable portion of every Waterloo CS cohort"],
    trajectory: ["Waterloo CS", "Co-op 1 (Stripe)", "Co-op 2 (Jane St)", "Co-op 3 (Anthropic)", "..."],
    evolvesInto: ["berkeley-anthropic", "stripe-early-engineer"],
    glyph: "◈",
  },
  {
    number: 23,
    slug: "iit-stanford-ml",
    name: "The IIT → Stanford MS → ML",
    tagline: "Two top-3 universities on three continents.",
    types: ["Scholar", "Hacker"],
    tier: "B",
    scoreRange: [60, 73],
    typicalStats: { hack: 75, grind: 75, taste: 75, rizz: 35 },
    profile:
      "IIT Bombay or Madras CS undergrad. Stanford or CMU MS in CS or AI. Now an ML engineer at a frontier-adjacent company (Hugging Face, Together, Mistral). Speaks four languages.",
    justification:
      "The school stack alone (IIT + Stanford) is hard to top. The frontier-adjacent placement holds it just under A-tier — needs Anthropic/OpenAI proper or a paper to break through. Future evolution highly likely.",
    examples: ["Many ML researcher career paths"],
    trajectory: ["IIT CS", "Stanford MS", "Mid-tier ML role", "?"],
    evolvesInto: ["berkeley-anthropic", "deepmind-research-scientist"],
    glyph: "▰",
  },
  {
    number: 24,
    slug: "olympiad-pivot-founder",
    name: "The Olympiad Kid Who Quit Math",
    tagline: "USAMO. Then bored. Now ships.",
    types: ["Scholar", "Founder"],
    tier: "B",
    scoreRange: [60, 75],
    typicalStats: { hack: 70, grind: 70, taste: 80, rizz: 50 },
    profile:
      "Qualified for USAMO. Got into MIT for math. Took one semester of analysis and decided to drop out and build a company. Currently raising a seed round.",
    justification:
      "Olympiad credential is permanent S-tier signal. The pivot to founder maintains the cracked archetype rather than dimming it. Sub-A only because the company hasn't proven itself yet.",
    examples: ["The kind of founder Paul Graham writes essays about"],
    trajectory: ["USAMO qualifier", "MIT admit", "Dropped out semester 2", "Pre-seed"],
    evolvesInto: ["thiel-unicorn", "ycombinator-vet"],
    glyph: "★",
  },
  {
    number: 25,
    slug: "cornell-cs-coinbase-senior",
    name: "The Cornell CS → Senior at Coinbase",
    tagline: "Crypto bag included.",
    types: ["Hacker", "Operator"],
    tier: "B",
    scoreRange: [55, 68],
    typicalStats: { hack: 65, grind: 70, taste: 60, rizz: 35 },
    profile:
      "Cornell CS. Junior engineer at Coinbase in 2020. Senior by 2023. Crypto bag fully vested. Now considering whether to start a company or join an AI lab.",
    justification:
      "Ivy League CS + senior at a recognized tech company = B-tier. Crypto-cycle timing isn't really cracked-signal — it's lucky, not skilled. Needs a next move to break into A.",
    examples: ["Many Cornell CS '17-'19 grads"],
    trajectory: ["Cornell CS", "Coinbase L3 → L5", "Stock vested", "Crossroads"],
    evolvesInto: ["ycombinator-vet", "berkeley-anthropic"],
    glyph: "◈",
  },
  {
    number: 26,
    slug: "mckinsey-builder",
    name: "The McKinsey BA Who Builds AI Tools",
    tagline: "Slides by day. GPT wrappers by night.",
    types: ["Operator", "Hacker"],
    tier: "B",
    scoreRange: [55, 68],
    typicalStats: { hack: 50, grind: 65, taste: 75, rizz: 50 },
    profile:
      "Princeton econ, McKinsey BA, two years in, building AI side projects after hours. Has shipped three internal tools that partners actually use. Will leave for a startup soon.",
    justification:
      "McKinsey carries A-tier prestige but the dex weighs against pure operator paths. The side-project shipping rescues the score — actually building things in your free time is a real cracked signal. Border B/A.",
    examples: ["Specific McKinsey associates who left to do AI"],
    trajectory: ["Top-10 econ undergrad", "McKinsey BA", "Side projects", "Startup PM"],
    evolvesInto: ["stripe-apm", "harvard-30u30-operator"],
    glyph: "◇",
  },
  {
    number: 27,
    slug: "stripe-apm",
    name: "The Stripe APM",
    tagline: "Two years at Stripe. Already a manager.",
    types: ["Operator"],
    tier: "B",
    scoreRange: [60, 72],
    typicalStats: { hack: 45, grind: 70, taste: 85, rizz: 50 },
    profile:
      "Got into the Stripe Associate Product Manager program out of a top school. Rotated through three teams. Two years in, leading a small team. Will be CPO of someone's company in five years.",
    justification:
      "Stripe APM admission is itself a credential — they take ~25 a year from thousands. High taste, low technical score. B-tier because the cracked spectrum favors builders; A would require eng founder pivot.",
    examples: ["Each Stripe APM cohort"],
    trajectory: ["Top-10 school", "Stripe APM offer", "Stripe APM", "Director at company"],
    evolvesInto: ["harvard-30u30-operator"],
    glyph: "◈",
  },
  {
    number: 28,
    slug: "notion-designer-with-cult-twitter",
    name: "The Notion Designer With Cult Twitter",
    tagline: "Two thousand followers. All of them designers you respect.",
    types: ["Influencer", "Operator"],
    tier: "B",
    scoreRange: [58, 70],
    typicalStats: { hack: 30, grind: 60, taste: 90, rizz: 80 },
    profile:
      "Designer at Notion, Linear, or Vercel. 2-5k Twitter followers, every single one is a designer or PM at a place you'd want to work. Posts dribbble-quality work weekly.",
    justification:
      "Sub-stat asymmetry: taste is 90, hack is 30. The cracked spectrum is broad enough to include this. The audience itself is leverage — being known by the right 2000 people matters more than 200k random.",
    examples: ["Many Linear / Notion / Figma designers"],
    trajectory: ["RISD or CMU design", "Top-tier design role", "Twitter persona", "?"],
    evolvesInto: ["vincent-vanderbilt-designer-founder"],
    glyph: "◈",
  },
  {
    number: 29,
    slug: "devpost-serial-winner",
    name: "The Devpost Serial Winner",
    tagline: "Twelve grand prizes by 21.",
    types: ["Hacker"],
    tier: "B",
    scoreRange: [58, 72],
    typicalStats: { hack: 80, grind: 80, taste: 55, rizz: 40 },
    profile:
      "Won eight named hackathons including TreeHacks twice, HackMIT, HackHarvard, and CalHacks. Hasn't graduated. Has $40k in prize money. Should probably stop and start a real company.",
    justification:
      "Hackathon dominance is real cracked signal but it's volume-of-noise. The dex rewards the wins (B-tier) but caps it because shipping → users matters more than shipping → judging panels. Right at the edge of A.",
    examples: ["You know the type — the one who wins at every event"],
    trajectory: ["High school", "Top CS school", "Hackathon dominance", "?"],
    evolvesInto: ["ycombinator-vet", "thiel-unicorn"],
    glyph: "★",
  },
  {
    number: 30,
    slug: "cmu-scs-notion",
    name: "The CMU SCS → Notion Backend",
    tagline: "School of Computer Science. Real systems.",
    types: ["Hacker"],
    tier: "B",
    scoreRange: [62, 75],
    typicalStats: { hack: 80, grind: 75, taste: 75, rizz: 30 },
    profile:
      "CMU School of Computer Science (one of the hardest CS programs to get into). Now a backend engineer at Notion, Linear, or Stripe. Deeply technical, doesn't tweet.",
    justification:
      "CMU SCS is borderline S-tier school signal. Top startup placement holds the line at B. To break into A would need either a Distinguished tag or a founder pivot or a NeurIPS paper.",
    examples: ["A meaningful share of CMU SCS '20-'22"],
    trajectory: ["CMU SCS", "Notion / Linear / Stripe SWE", "Senior in 4 years"],
    evolvesInto: ["stripe-early-engineer", "berkeley-anthropic"],
    glyph: "◈",
  },
  {
    number: 31,
    slug: "openai-resident",
    name: "The OpenAI Resident",
    tagline: "Six month program. Wrote a paper. Tweets memes.",
    types: ["Researcher", "Influencer"],
    tier: "B",
    scoreRange: [62, 75],
    typicalStats: { hack: 70, grind: 65, taste: 85, rizz: 65 },
    profile:
      "Did the OpenAI Residency program out of undergrad or a master's. Has one paper. 8k Twitter followers, half of whom are at frontier labs. Will probably be a full-time researcher in a year.",
    justification:
      "Residency at OpenAI/Anthropic is real S-tier signal but the residency itself is a 6-12 month thing — the conversion to full-time researcher is what would push to A. Currently the resume is loaded but unproven.",
    examples: ["Many OpenAI / Anthropic residents from recent cohorts"],
    trajectory: ["Top-20 undergrad", "OpenAI Residency", "Paper", "Full-time research?"],
    evolvesInto: ["deepmind-research-scientist", "anthropic-researcher-100k"],
    glyph: "★",
  },
  {
    number: 32,
    slug: "microsoft-research-startup",
    name: "The MSR Researcher → Startup",
    tagline: "Three published papers. Now seed-stage CTO.",
    types: ["Researcher", "Founder"],
    tier: "B",
    scoreRange: [60, 73],
    typicalStats: { hack: 70, grind: 70, taste: 75, rizz: 40 },
    profile:
      "Microsoft Research scientist for four years, three NeurIPS papers, now CTO of a six-person AI startup raising a seed round. Has the credentials and the wedge.",
    justification:
      "MSR is high-A signal; pivoting to startup typically lifts cracked-score (founder axis). Held at B until the funding closes — capital is signal in itself.",
    examples: ["A measurable percentage of MSR alumni"],
    trajectory: ["PhD", "MSR", "Papers", "Co-founded AI startup"],
    evolvesInto: ["thiel-unicorn", "anthropic-researcher-100k"],
    glyph: "★",
  },

  // ===========================================================================
  // A-TIER · The Real Heat (#033-#044)
  // Multiple stacked S-tier signals. The kind of person mentioned by name on group chats.
  // ===========================================================================
  {
    number: 33,
    slug: "vincent-vanderbilt-designer-founder",
    name: "The Designer Who Founded",
    tagline: "Shipped pixels. Then shipped a company.",
    types: ["Founder", "Influencer"],
    tier: "A",
    scoreRange: [70, 82],
    typicalStats: { hack: 55, grind: 75, taste: 95, rizz: 75 },
    profile:
      "Designer at Stripe, Figma, or Vercel for 3-5 years. Co-founded a design tool that raised a Series A. 15k Twitter followers, all of them in the inner orbit of the design world.",
    justification:
      "Founder + top-tier prior + cult audience = solid A. Not S because the design vertical is narrower than the AI/founder mainline. But the taste premium is enormous and that translates into compounding leverage.",
    examples: ["Soleio (early Facebook designer → AngelList → investor)", "Ryo Lu (early Notion designer)"],
    trajectory: ["RISD / CMU design", "Stripe / Figma design", "Founded a tool", "Series A"],
    evolvesInto: ["two-time-unicorn-founder"],
    glyph: "★",
  },
  {
    number: 34,
    slug: "berkeley-anthropic",
    name: "The Berkeley EECS → Anthropic",
    tagline: "Honors EECS. Now AI safety.",
    types: ["Hacker", "Researcher"],
    tier: "A",
    scoreRange: [72, 85],
    typicalStats: { hack: 90, grind: 75, taste: 85, rizz: 30 },
    profile:
      "Berkeley EECS honors program. ML research with a famous professor. Now ML engineer at Anthropic, OpenAI, or DeepMind. Doesn't tweet, ships papers.",
    justification:
      "School (A) + frontier lab (S) + research output = A-tier reliable. Becomes S only with first-author paper at NeurIPS, viral side project, or founder pivot.",
    examples: ["A meaningful share of Anthropic ML eng hires from Berkeley"],
    trajectory: ["Berkeley EECS honors", "Research with prof", "Anthropic/OpenAI"],
    evolvesInto: ["anthropic-researcher-100k", "thiel-unicorn"],
    glyph: "★",
  },
  {
    number: 35,
    slug: "stanford-dropout-yc",
    name: "The Stanford CS Dropout YC Founder",
    tagline: "Three semesters. Then Demo Day.",
    types: ["Founder", "Hacker"],
    tier: "A",
    scoreRange: [70, 85],
    typicalStats: { hack: 75, grind: 80, taste: 85, rizz: 75 },
    profile:
      "Got into Stanford CS, did three semesters, dropped out for YC W23. Raised a seed. Five engineers, a Stripe Atlas LLC, and a Twitter following that grew alongside the company.",
    justification:
      "Dropout-for-YC is a canonical cracked pattern. School signal + accelerator + founder = stacked. Sub-S because the company itself hasn't exited or hit unicorn status; that's where the gap is.",
    examples: ["Many YC founders match this profile"],
    trajectory: ["Stanford CS admit", "Dropped for YC", "Seed round", "?"],
    evolvesInto: ["thiel-unicorn", "two-time-unicorn-founder"],
    glyph: "★",
  },
  {
    number: 36,
    slug: "cmu-citadel-quant",
    name: "The CMU SCS → Citadel Quant",
    tagline: "Pittsburgh to Chicago. $400k base.",
    types: ["Quant"],
    tier: "A",
    scoreRange: [72, 84],
    typicalStats: { hack: 80, grind: 80, taste: 90, rizz: 25 },
    profile:
      "CMU School of Computer Science, math minor. Citadel new grad, $400k base + bonus. Three years in, second quant strategist on a desk. Wrote one paper in undergrad.",
    justification:
      "School (S) + Citadel (S) is one of the strongest two-signal stacks possible. Doesn't break into top-S because the trajectory is well-trodden — to be S you need an axis these archetypes don't (paper, fellowship, dropout-founder, etc.).",
    examples: ["A common CMU SCS trajectory"],
    trajectory: ["CMU SCS + math", "Citadel new grad", "Senior quant in 4 years"],
    evolvesInto: ["putnam-jane-street-partner"],
    glyph: "★",
  },
  {
    number: 37,
    slug: "cornell-phd-google-brain",
    name: "The Cornell PhD → Google Brain",
    tagline: "Five years, eight NeurIPS papers.",
    types: ["Researcher", "Scholar"],
    tier: "A",
    scoreRange: [74, 86],
    typicalStats: { hack: 80, grind: 85, taste: 85, rizz: 30 },
    profile:
      "Cornell ML PhD. Eight first-author NeurIPS/ICML papers. Now research scientist at Google Brain / DeepMind / Anthropic. The kind of person professors recommend to professors.",
    justification:
      "Heavy paper output + frontier lab = A-tier guaranteed. Sub-S because it's the conventional research path — viral output, founder pivot, or a famous paper would push to top S.",
    examples: ["Many Brain / DeepMind / FAIR research scientists"],
    trajectory: ["Top undergrad", "Cornell PhD", "Eight papers", "Research scientist"],
    evolvesInto: ["deepmind-research-scientist"],
    glyph: "★",
  },
  {
    number: 38,
    slug: "z-fellow-seed",
    name: "The Z Fellow With $1M Seed",
    tagline: "Z Fellows summer. Then real money.",
    types: ["Founder", "Hacker"],
    tier: "A",
    scoreRange: [70, 83],
    typicalStats: { hack: 70, grind: 80, taste: 80, rizz: 70 },
    profile:
      "Did Z Fellows or Neo Scholars. Wedged into an SF founder community. Raised $1M+ pre-seed. Building in AI infrastructure or vertical AI. Knows everyone.",
    justification:
      "Selective accelerator + real funding = A. Z Fellows acceptance rate is ~2%, comparable signal to a top YC batch. Held just under S because the company is unproven and the founder is early in their second decade.",
    examples: ["Z Fellows / Neo cohorts have many"],
    trajectory: ["Top-20 undergrad", "Z Fellows", "Pre-seed", "Building"],
    evolvesInto: ["thiel-unicorn", "ycombinator-vet"],
    glyph: "★",
  },
  {
    number: 39,
    slug: "olympiad-usamo",
    name: "The USAMO Qualifier",
    tagline: "30 kids in the country. They were one.",
    types: ["Scholar"],
    tier: "A",
    scoreRange: [70, 82],
    typicalStats: { hack: 60, grind: 70, taste: 85, rizz: 25 },
    profile:
      "Qualified for USAMO in high school (top ~30 math students in the country). Now at MIT/Harvard/Princeton for math or CS. Hasn't decided on a path yet but every door is open.",
    justification:
      "USAMO is permanent A-tier accolade that pairs with whatever they do next. Sub-S only because the next move is undecided — IMO medal would have been S, and Putnam Fellow + Jane Street would push to S.",
    examples: ["Each year's USAMO qualifier list"],
    trajectory: ["High school math team", "USAMO qualifier", "Top university math/CS"],
    evolvesInto: ["putnam-jane-street-partner", "imo-mit-anthropic"],
    glyph: "★",
  },
  {
    number: 40,
    slug: "hugging-face-maintainer",
    name: "The Hugging Face Maintainer",
    tagline: "Owns transformers/utils. Speaks at PyData.",
    types: ["Hacker", "Researcher"],
    tier: "A",
    scoreRange: [72, 84],
    typicalStats: { hack: 95, grind: 80, taste: 75, rizz: 50 },
    profile:
      "Maintainer or core contributor of a widely-used ML library (transformers, datasets, accelerate). 50k+ commits across the ecosystem. Speaks at PyData. Quietly famous in the ML community.",
    justification:
      "Core OSS contribution to widely-used frontier-adjacent libraries is S-tier signal but it's narrow — fame is bounded by the community. Pairs with a Hugging Face/Anthropic full-time role to push to S.",
    examples: ["Stas Bekman", "Many Hugging Face core engineers"],
    trajectory: ["Industry ML role", "OSS contributions", "Maintainer status", "Speaking circuit"],
    evolvesInto: ["anthropic-researcher-100k"],
    glyph: "★",
  },
  {
    number: 41,
    slug: "harvard-30u30-operator",
    name: "The Harvard 30u30 Operator",
    tagline: "HBS. Forbes list. Six board seats.",
    types: ["Operator", "Founder"],
    tier: "A",
    scoreRange: [72, 85],
    typicalStats: { hack: 30, grind: 80, taste: 95, rizz: 90 },
    profile:
      "Harvard undergrad, McKinsey, HBS, scaled an operations function at a unicorn, made Forbes 30u30, now COO at a Series C and on three boards. The polished version of cracked.",
    justification:
      "Forbes 30u30 is S-tier accolade and the stack is high-prestige throughout. The dex docks the score slightly because the path is operator-heavy rather than builder-heavy — but it's clearly A.",
    examples: ["Forbes 30u30 has lists annually"],
    trajectory: ["Harvard undergrad", "McKinsey", "HBS", "COO at unicorn", "Forbes"],
    evolvesInto: ["two-time-unicorn-founder"],
    glyph: "★",
  },
  {
    number: 42,
    slug: "mercury-fellow-os",
    name: "The Mercury Fellow Who Shipped An OS",
    tagline: "Mercury Fellow. Then built something weird.",
    types: ["Hacker", "Founder"],
    tier: "A",
    scoreRange: [72, 85],
    typicalStats: { hack: 90, grind: 80, taste: 80, rizz: 60 },
    profile:
      "Mercury Fellow at 19. Built a real-time OS, or a database, or a compiler, or a programming language. Has a research-grade side project that 5k people use seriously. Founder-by-default.",
    justification:
      "Selective fellowship + ambitious systems work = A. The 'weird ambition' (OS / compiler / lang) is what separates this from the average Hugging Face maintainer. To be S, needs an exit or a viral release.",
    examples: ["Composite of selective fellowship grads building serious systems"],
    trajectory: ["Top-20 CS undergrad", "Mercury Fellow", "Shipped ambitious thing", "Founder"],
    evolvesInto: ["thiel-unicorn", "stripe-early-engineer"],
    glyph: "★",
  },
  {
    number: 43,
    slug: "optiver-to-founder",
    name: "The Optiver Trader → Founder",
    tagline: "Three years on the desk. Then quit to ship.",
    types: ["Quant", "Founder"],
    tier: "A",
    scoreRange: [70, 84],
    typicalStats: { hack: 70, grind: 80, taste: 85, rizz: 60 },
    profile:
      "MIT / CMU undergrad, Optiver or Jane Street junior trader, three years in, quit to start a fintech or trading-tools startup. Has $500k+ in savings, ten years of runway, and zero patience.",
    justification:
      "Quant background + voluntary exit + founder = the cracked-trader archetype. Sub-S because the company is early; an exit or viral product would push to S. The optionality is enormous.",
    examples: ["Many fintech founders fit this trajectory"],
    trajectory: ["Top CS/math undergrad", "Quant trader", "Quit at 26", "Founder"],
    evolvesInto: ["thiel-unicorn", "two-time-unicorn-founder"],
    glyph: "★",
  },
  {
    number: 44,
    slug: "ycombinator-vet",
    name: "The YC Vet (Three Batches)",
    tagline: "W19, W22, W25. Two exits. One ongoing.",
    types: ["Founder"],
    tier: "A",
    scoreRange: [75, 88],
    typicalStats: { hack: 65, grind: 90, taste: 85, rizz: 75 },
    profile:
      "Three YC batches. Two small exits ($5-30M acquihires). One company currently raising Series B with real ARR. Knows half of SF by first name. Hasn't slept since 2018.",
    justification:
      "Stacked founder credentials + repeat YC + real exits = top of A. The dex separates 'two small exits' from 'one unicorn' — the latter is what unlocks S.",
    examples: ["Many serial YC founders"],
    trajectory: ["YC batch 1 (exit)", "YC batch 2 (exit)", "YC batch 3 (current)"],
    evolvesInto: ["two-time-unicorn-founder"],
    glyph: "★",
  },

  // ===========================================================================
  // S-TIER · The Top 1% (#045-#054)
  // The names you hear at dinners. The references in pitch decks. The cracked-canon.
  // ===========================================================================
  {
    number: 45,
    slug: "putnam-jane-street-partner",
    name: "The Putnam Fellow Jane Street Partner",
    tagline: "Top 25 in Putnam. Now sets bonuses.",
    types: ["Quant", "Scholar"],
    tier: "S",
    scoreRange: [85, 95],
    typicalStats: { hack: 90, grind: 90, taste: 95, rizz: 35 },
    profile:
      "Putnam Top 25 in college (top 25 mathematicians of their year in the US/Canada). MIT or Harvard math. Joined Jane Street as a trader. Eight years later, partner. Earns more than your entire LinkedIn network combined.",
    justification:
      "Two S-tier signals (Putnam Fellow + Jane Street partner) compound. The trader-to-partner conversion at Jane Street is brutal. Held under top-S only because of the absence of a public-facing founder / researcher axis.",
    examples: ["Public Putnam Fellow lists; Jane Street partner roster"],
    trajectory: ["High school competition math", "Putnam Fellow", "Jane Street trader", "Partner"],
    glyph: "♛",
  },
  {
    number: 46,
    slug: "imo-mit-anthropic",
    name: "The IMO Gold → MIT → Anthropic",
    tagline: "Hardest exam in the world at 17. Hardest job in the world at 24.",
    types: ["Scholar", "Researcher", "Hacker"],
    tier: "S",
    scoreRange: [88, 97],
    typicalStats: { hack: 95, grind: 90, taste: 95, rizz: 40 },
    profile:
      "International Math Olympiad gold medal at 17. MIT 18C (math + CS). Anthropic ML researcher. Two first-author NeurIPS papers. The pure form.",
    justification:
      "IMO medal is permanent top-S, the rarest accolade most cracked people will encounter. MIT + Anthropic + research is the strongest possible career stack. Top-3 archetype on the dex.",
    examples: ["Several Anthropic / OpenAI researchers from competition math backgrounds"],
    trajectory: ["IMO team training", "IMO gold", "MIT", "Anthropic"],
    glyph: "♛",
  },
  {
    number: 47,
    slug: "thiel-unicorn",
    name: "The Thiel Fellow Who Built A Unicorn",
    tagline: "Skipped college. Built a $1B company.",
    types: ["Founder"],
    tier: "S",
    scoreRange: [88, 98],
    typicalStats: { hack: 80, grind: 95, taste: 95, rizz: 90 },
    profile:
      "Got the Thiel Fellowship at 19 (skipped college). Built a company. Took it past unicorn. Hasn't slept in a decade and seems unbothered by it.",
    justification:
      "Thiel Fellow + unicorn founder is the canonical anti-college cracked path. Both individual signals are top-S; combining them is rare. Among the top archetypes possible.",
    examples: ["Vitalik Buterin (Ethereum)", "Lucy Guo (Scale AI co-founder)", "Austin Russell (Luminar)"],
    trajectory: ["Thiel Fellow", "Built first company", "Scaled to unicorn"],
    glyph: "♛",
  },
  {
    number: 48,
    slug: "deepmind-research-scientist",
    name: "The DeepMind Research Scientist (10 NeurIPS Papers)",
    tagline: "Cited 8,000 times. Doesn't have a Twitter.",
    types: ["Researcher", "Scholar"],
    tier: "S",
    scoreRange: [85, 95],
    typicalStats: { hack: 90, grind: 95, taste: 95, rizz: 25 },
    profile:
      "Cambridge or Stanford ML PhD. 10+ first-author NeurIPS papers, 8000+ citations. Research scientist at DeepMind for six years. One of the people whose papers actually advance the field.",
    justification:
      "Citation count + frontier-lab tenure + paper density = S. Sub-top-S because the lack of public/founder axis means less name recognition outside the community. Inside the community: legend.",
    examples: ["Many senior DeepMind research scientists"],
    trajectory: ["Top undergrad", "Top PhD", "DeepMind", "Senior researcher"],
    glyph: "♛",
  },
  {
    number: 49,
    slug: "stripe-early-engineer",
    name: "The Stripe Early Engineer → CTO",
    tagline: "Employee #34. Now CTO of a unicorn.",
    types: ["Hacker", "Founder"],
    tier: "S",
    scoreRange: [85, 95],
    typicalStats: { hack: 90, grind: 90, taste: 95, rizz: 60 },
    profile:
      "Joined Stripe before 50 employees, stayed seven years, then left to be CTO of a Series B unicorn. Has eight figures vested and a Twitter account they barely use.",
    justification:
      "Early employee at one of the most-respected companies of the era + leadership at a unicorn = stacked S. Timing helps but you had to be cracked enough to get hired pre-50 in the first place.",
    examples: ["Many ex-early-Stripe CTOs at AI cos"],
    trajectory: ["Top CS school", "Stripe early hire", "Senior at Stripe", "CTO at unicorn"],
    glyph: "♛",
  },
  {
    number: 50,
    slug: "two-time-unicorn-founder",
    name: "The Two-Time Unicorn Founder",
    tagline: "Sold the first. Building the second. Bigger.",
    types: ["Founder"],
    tier: "S",
    scoreRange: [90, 99],
    typicalStats: { hack: 75, grind: 95, taste: 95, rizz: 95 },
    profile:
      "First company sold for $200M at 28. Took two years off. Started the second company. Currently at $2B valuation. Their group chats include three people you've read about in TechCrunch this month.",
    justification:
      "Repeat founder with two scale outcomes is among the rarest archetypes. Capital, network, taste — all compound. Justifies top-of-dex placement; only IMO + frontier-lab combos clear it.",
    examples: ["Patrick Collison", "Tobi Lutke (Shopify)", "Drew Houston (Dropbox, second venture)"],
    trajectory: ["First company exit", "Pause", "Second company", "Unicorn"],
    glyph: "♛",
  },
  {
    number: 51,
    slug: "anthropic-researcher-100k",
    name: "The Anthropic Researcher With 100k Followers",
    tagline: "Frontier paper authorship. Frontier discourse leader.",
    types: ["Researcher", "Influencer", "Scholar"],
    tier: "S",
    scoreRange: [88, 97],
    typicalStats: { hack: 90, grind: 90, taste: 95, rizz: 90 },
    profile:
      "Frontier-lab researcher who is also a public intellectual. 100k Twitter followers. Their papers move the field; their tweets move the discourse. Books written about their work.",
    justification:
      "Combining frontier research (S) with mass online influence (S) is exceptionally rare — most researchers can't write tweets, most tweeters can't write papers. Top-tier S.",
    examples: ["Andrej Karpathy", "Geoffrey Hinton (post-resignation era)", "Andrew Ng"],
    trajectory: ["PhD", "Frontier lab", "Papers + tweets compound", "Public intellectual"],
    glyph: "♛",
  },
  {
    number: 52,
    slug: "ioi-citadel-founder",
    name: "The IOI Gold → Citadel → Founder",
    tagline: "Won at 17. Quit Citadel at 25. $50M Series A at 28.",
    types: ["Scholar", "Quant", "Founder"],
    tier: "S",
    scoreRange: [90, 98],
    typicalStats: { hack: 95, grind: 95, taste: 95, rizz: 80 },
    profile:
      "International Olympiad in Informatics gold medal. MIT EECS. Citadel quant for four years (eight-figure comp). Quit at 25. $50M Series A for the AI company at 28. Sleeps in the office.",
    justification:
      "Triple-stacked S: olympiad medal + elite quant tenure + venture-scale founder. Each rarer than 1%. The combination is asymptotic — among the most cracked profiles on the dex.",
    examples: ["A small number of public-facing AI founders"],
    trajectory: ["IOI training", "IOI gold", "MIT EECS", "Citadel", "Founded AI co"],
    glyph: "♛",
  },
  {
    number: 53,
    slug: "macarthur-genius",
    name: "The MacArthur Genius Fellow",
    tagline: "Selected by a committee that doesn't exist.",
    types: ["Scholar", "Researcher"],
    tier: "S",
    scoreRange: [88, 98],
    typicalStats: { hack: 90, grind: 95, taste: 99, rizz: 75 },
    profile:
      "Awarded the MacArthur Fellowship for work in CS / mathematics / AI safety / biology. $800k grant, no strings attached. Their work has changed the field.",
    justification:
      "MacArthur is conferred by a secret nomination process and selects 20-30 people a year across all fields. Among the rarest single-credential signals. Justifies top-S.",
    examples: ["Daphne Koller", "Yann LeCun (Turing)", "Multiple CS / theoretical CS recipients"],
    trajectory: ["Top PhD", "Field-defining work", "MacArthur"],
    glyph: "♛",
  },
  {
    number: 54,
    slug: "triple-crown",
    name: "The Triple Crown",
    tagline: "Forbes + YC + Olympiad + Frontier lab. Quadruple, actually.",
    types: ["Scholar", "Founder", "Researcher", "Operator"],
    tier: "S",
    scoreRange: [92, 100],
    typicalStats: { hack: 95, grind: 95, taste: 98, rizz: 95 },
    profile:
      "USAMO winner. MIT EECS. YC alum. Forbes 30u30. Now at a frontier AI lab as both researcher and operator. The archetype that exists in concept more than reality, but the rare embodiment defines the ceiling.",
    justification:
      "Top of the dex. Every axis represented at S-tier. Effectively unbeatable on paper. The reason this archetype isn't more common is that the energy required to stack all four is finite — most people specialize earlier.",
    examples: ["A handful of public-facing AI founder-researchers"],
    trajectory: ["Olympiad", "MIT EECS", "YC founder", "Forbes 30u30", "Frontier lab"],
    glyph: "♛",
  },
];

// Quick lookup helpers
export function archetypeBySlug(slug: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.slug === slug);
}

export function archetypeByNumber(n: number): Archetype | undefined {
  return ARCHETYPES.find((a) => a.number === n);
}
