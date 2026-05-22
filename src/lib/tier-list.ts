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

    // S — law schools
    { label: "Yale Law", tier: "S", patterns: ["yale law school", "yls", "yale law"] },
    { label: "Harvard Law", tier: "S", patterns: ["harvard law school", "hls"] },
    { label: "Stanford Law", tier: "S", patterns: ["stanford law school", "stanford law"] },
    { label: "Columbia Law", tier: "S", patterns: ["columbia law school", "columbia law"] },
    { label: "Chicago Law", tier: "S", patterns: ["university of chicago law", "chicago law school"] },
    { label: "NYU Law", tier: "S", patterns: ["nyu law", "new york university school of law"] },

    // S — medical schools
    { label: "Harvard Medical School", tier: "S", patterns: ["harvard medical school", "harvard med", "hms"] },
    { label: "Johns Hopkins Med", tier: "S", patterns: ["johns hopkins school of medicine", "hopkins med"] },
    { label: "UCSF Medicine", tier: "S", patterns: ["ucsf school of medicine", "ucsf medical school"] },
    { label: "Stanford Medicine", tier: "S", patterns: ["stanford school of medicine", "stanford med"] },
    { label: "Penn Perelman", tier: "S", patterns: ["perelman school of medicine", "penn medicine"] },
    { label: "Columbia VP&S", tier: "S", patterns: ["columbia vagelos", "vp&s", "columbia college of physicians"] },
    { label: "WashU Medicine", tier: "S", patterns: ["washington university school of medicine"] },
    { label: "Yale Medicine", tier: "S", patterns: ["yale school of medicine", "yale med"] },
    { label: "Duke Medicine", tier: "S", patterns: ["duke school of medicine", "duke med"] },
    { label: "NYU Grossman", tier: "S", patterns: ["nyu grossman", "grossman school of medicine"] },

    // S — business schools
    { label: "Harvard Business School", tier: "S", patterns: ["harvard business school", "hbs"] },
    { label: "Stanford GSB", tier: "S", patterns: ["stanford gsb", "stanford graduate school of business"] },
    { label: "Wharton MBA", tier: "S", patterns: ["wharton mba", "wharton school"] },

    // S — policy / IR
    { label: "Georgetown SFS", tier: "S", patterns: ["georgetown school of foreign service", "sfs georgetown", "walsh school of foreign service"] },
    { label: "Harvard Kennedy School", tier: "S", patterns: ["harvard kennedy school", "kennedy school", "ksg"] },
    { label: "Princeton SPIA", tier: "S", patterns: ["princeton school of public", "spia", "woodrow wilson school", "wws"] },
    { label: "Yale Jackson", tier: "S", patterns: ["yale jackson", "jackson school of global affairs"] },
    { label: "Tufts Fletcher", tier: "S", patterns: ["fletcher school", "tufts fletcher"] },
    { label: "Johns Hopkins SAIS", tier: "S", patterns: ["sais", "school of advanced international studies"] },
    { label: "Oxford PPE", tier: "S", patterns: ["oxford ppe", "philosophy politics and economics"] },

    // S — service academies
    { label: "West Point", tier: "S", patterns: ["united states military academy", "west point", "usma"] },
    { label: "Annapolis", tier: "S", patterns: ["united states naval academy", "usna", "annapolis"] },
    { label: "Air Force Academy", tier: "S", patterns: ["united states air force academy", "usafa"] },

    // S — conservatories
    { label: "Juilliard", tier: "S", patterns: ["juilliard"] },
    { label: "Curtis Institute", tier: "S", patterns: ["curtis institute"] },
    { label: "AFI Conservatory", tier: "S", patterns: ["afi conservatory", "american film institute"] },

    // S — architecture
    { label: "Cooper Union B.Arch", tier: "S", patterns: ["cooper union"] },
    { label: "Harvard GSD", tier: "S", patterns: ["harvard gsd", "harvard graduate school of design"] },
    { label: "Yale SoA", tier: "S", patterns: ["yale school of architecture"] },
    { label: "Princeton SoA", tier: "S", patterns: ["princeton school of architecture"] },
    { label: "MIT M.Arch", tier: "S", patterns: ["mit architecture", "mit m.arch"] },
    { label: "AA London", tier: "S", patterns: ["architectural association school"] },
    { label: "RISD BFA", tier: "S", patterns: ["rhode island school of design", "risd"] },

    // S — Indian elite (extended)
    { label: "IIM Top", tier: "S", patterns: ["iim ahmedabad", "iim bangalore", "iim calcutta"] },

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

    // A — law schools
    { label: "Penn Carey Law", tier: "A", patterns: ["penn carey law", "university of pennsylvania law", "penn law"] },
    { label: "UVA Law", tier: "A", patterns: ["university of virginia school of law", "uva law"] },
    { label: "Michigan Law", tier: "A", patterns: ["university of michigan law", "michigan law school"] },
    { label: "Berkeley Law (Boalt)", tier: "A", patterns: ["berkeley law", "boalt hall", "uc berkeley school of law"] },
    { label: "Duke Law", tier: "A", patterns: ["duke law school", "duke university school of law"] },
    { label: "Northwestern Pritzker", tier: "A", patterns: ["northwestern pritzker", "pritzker school of law"] },
    { label: "Cornell Law", tier: "A", patterns: ["cornell law school"] },
    { label: "Georgetown Law", tier: "A", patterns: ["georgetown law", "georgetown university law center"] },

    // A — medical schools
    { label: "Michigan Med", tier: "A", patterns: ["university of michigan medical school"] },
    { label: "UCLA Geffen", tier: "A", patterns: ["david geffen school of medicine", "ucla medical school", "geffen school"] },
    { label: "Icahn Mount Sinai", tier: "A", patterns: ["icahn school of medicine", "mount sinai school of medicine"] },
    { label: "Northwestern Feinberg", tier: "A", patterns: ["feinberg school of medicine", "northwestern medical"] },
    { label: "Weill Cornell", tier: "A", patterns: ["weill cornell medicine", "weill cornell medical"] },
    { label: "Vanderbilt Med", tier: "A", patterns: ["vanderbilt school of medicine", "vanderbilt medical school"] },
    { label: "Mayo Med School", tier: "A", patterns: ["mayo clinic alix school of medicine", "mayo medical school"] },
    { label: "UNC Med", tier: "A", patterns: ["unc school of medicine", "university of north carolina school of medicine"] },
    { label: "Pitt Med", tier: "A", patterns: ["university of pittsburgh school of medicine", "pitt med"] },

    // A — MBA
    { label: "Chicago Booth", tier: "A", patterns: ["chicago booth", "booth school of business"] },
    { label: "Kellogg", tier: "A", patterns: ["kellogg school of management"] },
    { label: "MIT Sloan", tier: "A", patterns: ["mit sloan", "sloan school of management"] },
    { label: "Columbia Business School", tier: "A", patterns: ["columbia business school", "cbs mba"] },
    { label: "INSEAD", tier: "A", patterns: ["insead"] },
    { label: "London Business School", tier: "A", patterns: ["london business school", "lbs mba"] },

    // A — UG business
    { label: "Wharton UG", tier: "A", patterns: ["wharton undergraduate", "wharton bba"] },
    { label: "NYU Stern UG", tier: "A", patterns: ["stern school of business", "nyu stern"] },
    { label: "Ross BBA", tier: "A", patterns: ["ross school of business", "michigan ross"] },
    { label: "McIntire (UVA)", tier: "A", patterns: ["mcintire school of commerce"] },
    { label: "CMU Tepper", tier: "A", patterns: ["tepper school of business"] },
    { label: "MIT Sloan UG", tier: "A", patterns: ["mit sloan undergraduate"] },
    { label: "Berkeley Haas", tier: "A", patterns: ["haas school of business", "berkeley haas"] },

    // A — policy / IR
    { label: "Columbia SIPA", tier: "A", patterns: ["sipa", "school of international and public affairs"] },
    { label: "Cambridge HSPS", tier: "A", patterns: ["cambridge hsps", "human social and political"] },
    { label: "LSE", tier: "A", patterns: ["london school of economics", "lse "] },
    { label: "Sciences Po", tier: "A", patterns: ["sciences po"] },

    // A — mid-career mil
    { label: "War College", tier: "A", patterns: ["national war college", "naval war college", "army war college"] },

    // A — creative / arts
    { label: "NYU Tisch", tier: "A", patterns: ["nyu tisch", "tisch school of the arts"] },
    { label: "USC Cinematic Arts", tier: "A", patterns: ["usc cinematic arts", "usc school of cinematic"] },
    { label: "UCLA TFT", tier: "A", patterns: ["ucla school of theater", "ucla tft"] },
    { label: "CalArts", tier: "A", patterns: ["california institute of the arts", "calarts"] },
    { label: "Yale Drama", tier: "A", patterns: ["yale school of drama", "david geffen school of drama"] },
    { label: "Iowa Writers Workshop", tier: "A", patterns: ["iowa writers' workshop", "iowa writers workshop"] },
    { label: "Stanford Stegner", tier: "A", patterns: ["stegner fellowship", "stanford stegner"] },
    { label: "Michener (UT Austin)", tier: "A", patterns: ["michener center for writers"] },
    { label: "Royal College of Art", tier: "A", patterns: ["royal college of art"] },
    { label: "Central Saint Martins", tier: "A", patterns: ["central saint martins"] },
    { label: "Parsons MFA", tier: "A", patterns: ["parsons school of design", "parsons mfa"] },
    { label: "Pratt", tier: "A", patterns: ["pratt institute"] },
    { label: "Berklee", tier: "A", patterns: ["berklee college of music"] },

    // A — journalism
    { label: "Northwestern Medill", tier: "A", patterns: ["medill school of journalism", "northwestern medill"] },
    { label: "Mizzou J-School", tier: "A", patterns: ["missouri school of journalism", "mizzou j-school"] },
    { label: "Columbia Journalism", tier: "A", patterns: ["columbia journalism school", "columbia graduate school of journalism"] },

    // A — architecture
    { label: "Cornell B.Arch", tier: "A", patterns: ["cornell aap", "cornell architecture"] },
    { label: "Rice B.Arch", tier: "A", patterns: ["rice school of architecture"] },
    { label: "SCI-Arc", tier: "A", patterns: ["sci-arc", "southern california institute of architecture"] },
    { label: "Bartlett UCL", tier: "A", patterns: ["bartlett school of architecture"] },

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

    // B — law schools
    { label: "UCLA Law", tier: "B", patterns: ["ucla school of law"] },
    { label: "Vanderbilt Law", tier: "B", patterns: ["vanderbilt law school"] },
    { label: "USC Gould", tier: "B", patterns: ["usc gould", "gould school of law"] },
    { label: "Texas Law", tier: "B", patterns: ["university of texas school of law"] },
    { label: "WashU Law", tier: "B", patterns: ["washington university school of law"] },
    { label: "Notre Dame Law", tier: "B", patterns: ["notre dame law school"] },

    // B — UG business
    { label: "Cornell Dyson", tier: "B", patterns: ["dyson school of applied economics", "cornell dyson"] },
    { label: "Georgetown MSB", tier: "B", patterns: ["mcdonough school of business", "georgetown msb"] },
    { label: "Emory Goizueta", tier: "B", patterns: ["goizueta business school"] },
    { label: "Notre Dame Mendoza", tier: "B", patterns: ["mendoza college of business"] },
    { label: "IU Kelley", tier: "B", patterns: ["kelley school of business"] },
    { label: "Vanderbilt Owen", tier: "B", patterns: ["owen graduate school of management"] },
    { label: "USC Marshall", tier: "B", patterns: ["marshall school of business"] },

    // C — law schools
    { label: "Fordham Law", tier: "C", patterns: ["fordham law school", "fordham university school of law"] },
    { label: "Cardozo Law", tier: "C", patterns: ["cardozo school of law", "benjamin n. cardozo"] },
    { label: "BC / BU Law", tier: "C", patterns: ["boston college law", "boston university school of law"] },

    // D — Caribbean MD (cautionary)
    { label: "Caribbean MD", tier: "D", patterns: ["st. george's university", "sgu medical", "ross university school of medicine", "saba university school of medicine", "american university of the caribbean", "auc school of medicine"] },
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

    // S — elite boutique investment banks
    { label: "Centerview Partners", tier: "S", patterns: ["centerview partners", "centerview"] },
    { label: "Evercore", tier: "S", patterns: ["evercore"] },
    { label: "PJT Partners", tier: "S", patterns: ["pjt partners"] },
    { label: "Lazard", tier: "S", patterns: ["lazard"] },
    { label: "Moelis", tier: "S", patterns: ["moelis & company", "moelis"] },
    { label: "Perella Weinberg", tier: "S", patterns: ["perella weinberg"] },
    { label: "Allen & Co", tier: "S", patterns: ["allen & company", "allen and company"] },

    // S — elite GS/MS divisions
    { label: "Goldman TMT/HC/M&A", tier: "S", patterns: ["goldman sachs tmt", "goldman sachs healthcare", "goldman sachs m&a", "goldman sachs financial sponsors"] },
    { label: "Morgan Stanley M&A/Tech", tier: "S", patterns: ["morgan stanley m&a", "morgan stanley tech"] },
    { label: "JPM Sponsors/LevFin", tier: "S", patterns: ["jpm financial sponsors", "jpm leveraged finance", "jpmorgan sponsors", "jpmorgan levfin"] },

    // S — elite PE/VC/HF megafunds
    { label: "Sequoia Capital", tier: "S", patterns: ["sequoia capital"] },
    { label: "Benchmark", tier: "S", patterns: ["benchmark capital"] },
    { label: "Founders Fund", tier: "S", patterns: ["founders fund"] },
    { label: "a16z", tier: "S", patterns: ["andreessen horowitz", "a16z"] },
    { label: "Blackstone", tier: "S", patterns: ["blackstone group", "blackstone inc"] },
    { label: "KKR", tier: "S", patterns: ["kkr & co", "kohlberg kravis roberts"] },
    { label: "Apollo Global", tier: "S", patterns: ["apollo global management", "apollo management"] },
    { label: "Pershing Square", tier: "S", patterns: ["pershing square"] },
    { label: "Point72", tier: "S", patterns: ["point72"] },
    { label: "Millennium", tier: "S", patterns: ["millennium management"] },
    { label: "Coatue", tier: "S", patterns: ["coatue management", "coatue"] },
    { label: "Tiger Global", tier: "S", patterns: ["tiger global"] },
    { label: "Elliott Management", tier: "S", patterns: ["elliott management", "elliott investment"] },
    { label: "BDT & MSD", tier: "S", patterns: ["bdt & msd", "bdt capital", "msd partners"] },

    // S — law firms (white-shoe + litigation boutiques)
    { label: "Wachtell Lipton", tier: "S", patterns: ["wachtell lipton", "wachtell, lipton"] },
    { label: "Cravath", tier: "S", patterns: ["cravath, swaine", "cravath swaine"] },
    { label: "Sullivan & Cromwell", tier: "S", patterns: ["sullivan & cromwell", "sullivan and cromwell"] },
    { label: "Davis Polk", tier: "S", patterns: ["davis polk"] },
    { label: "Williams & Connolly", tier: "S", patterns: ["williams & connolly", "williams and connolly"] },
    { label: "Susman Godfrey", tier: "S", patterns: ["susman godfrey"] },

    // S — law gov apex
    { label: "Solicitor General Office", tier: "S", patterns: ["office of the solicitor general", "solicitor general"] },
    { label: "White House Counsel", tier: "S", patterns: ["white house counsel"] },
    { label: "DOJ Honors", tier: "S", patterns: ["doj honors program", "department of justice honors"] },

    // S — medical institutions
    { label: "Mass General", tier: "S", patterns: ["massachusetts general hospital", "mass general", "mgh"] },
    { label: "Brigham and Women's", tier: "S", patterns: ["brigham and women", "bwh"] },
    { label: "Johns Hopkins Hospital", tier: "S", patterns: ["johns hopkins hospital"] },
    { label: "UCSF Medical Center", tier: "S", patterns: ["ucsf medical center"] },
    { label: "Stanford Hospital", tier: "S", patterns: ["stanford hospital", "stanford health care"] },
    { label: "Cleveland Clinic", tier: "S", patterns: ["cleveland clinic"] },
    { label: "MSKCC", tier: "S", patterns: ["memorial sloan kettering", "msk cancer", "mskcc"] },
    { label: "MD Anderson", tier: "S", patterns: ["md anderson"] },
    { label: "HHMI Investigator", tier: "S", patterns: ["hhmi investigator", "howard hughes medical investigator"] },
    { label: "NIH PI", tier: "S", patterns: ["nih principal investigator", "nih pi", "nih intramural"] },

    // S — government apex
    { label: "National Security Council", tier: "S", patterns: ["national security council", "nsc director"] },
    { label: "State Dept (DAS+)", tier: "S", patterns: ["deputy assistant secretary of state", "assistant secretary of state"] },
    { label: "Treasury (Secretary)", tier: "S", patterns: ["secretary of the treasury", "treasury secretary"] },
    { label: "Fed Board Governor", tier: "S", patterns: ["federal reserve board", "federal reserve governor", "fed chair"] },
    { label: "CIA Chief of Station", tier: "S", patterns: ["chief of station", "cia chief"] },
    { label: "Dept of Defense (SecDef)", tier: "S", patterns: ["secretary of defense", "office of the secretary of defense"] },
    { label: "Supreme Court Justice", tier: "S", patterns: ["supreme court justice", "associate justice"] },

    // S — military
    { label: "Four-Star General", tier: "S", patterns: ["four-star general", "four star admiral", "combatant commander"] },

    // S — restaurants / hospitality
    { label: "Momofuku Group", tier: "S", patterns: ["momofuku"] },
    { label: "Daniel Boulud Restaurants", tier: "S", patterns: ["daniel boulud", "dinex group"] },
    { label: "Stephen Starr", tier: "S", patterns: ["starr restaurants", "stephen starr"] },
    { label: "Eleven Madison Park", tier: "S", patterns: ["eleven madison park"] },
    { label: "José Andrés Group", tier: "S", patterns: ["josé andrés", "jose andres group", "thinkfoodgroup"] },
    { label: "Thomas Keller Restaurant Group", tier: "S", patterns: ["thomas keller restaurant group", "per se restaurant", "french laundry"] },
    { label: "Three Michelin Stars", tier: "S", patterns: ["three michelin stars", "3 michelin stars", "three-michelin-starred"] },

    // S — DTC / brand apex
    { label: "Fenty Beauty", tier: "S", patterns: ["fenty beauty"] },
    { label: "SKIMS", tier: "S", patterns: ["skims "] },
    { label: "Spanx", tier: "S", patterns: ["spanx"] },
    { label: "Glossier (peak)", tier: "S", patterns: ["glossier"] },
    { label: "Warby Parker (peak)", tier: "S", patterns: ["warby parker"] },
    { label: "Telfar", tier: "S", patterns: ["telfar"] },
    { label: "Brunello Cucinelli", tier: "S", patterns: ["brunello cucinelli"] },
    { label: "Liquid Death post-billion", tier: "S", patterns: ["liquid death"] },

    // S — performance / conservatories
    { label: "NY Phil Principal", tier: "S", patterns: ["new york philharmonic principal", "ny philharmonic principal"] },
    { label: "Berlin/Vienna Phil Principal", tier: "S", patterns: ["berlin philharmonic", "vienna philharmonic"] },
    { label: "Metropolitan Opera Principal", tier: "S", patterns: ["metropolitan opera principal", "met opera principal"] },
    { label: "La Scala Lead", tier: "S", patterns: ["la scala"] },
    { label: "ABT Principal", tier: "S", patterns: ["american ballet theatre principal", "abt principal"] },
    { label: "NYCB Principal", tier: "S", patterns: ["new york city ballet principal", "nycb principal"] },

    // S — athletics apex
    { label: "NBA / NFL / MLB All-Star", tier: "S", patterns: ["nba all-star", "nfl pro bowl", "mlb all-star"] },
    { label: "Olympic Training Center", tier: "S", patterns: ["olympic training center"] },

    // S — esports / chess apex
    { label: "LoL Worlds Champion", tier: "S", patterns: ["lol worlds", "league of legends world championship", "t1 lol"] },
    { label: "CS Major Champion", tier: "S", patterns: ["counter-strike major", "cs major", "astralis", "na'vi roster"] },
    { label: "Dota International", tier: "S", patterns: ["dota international", "the international dota", "og dota"] },
    { label: "World Chess Champion", tier: "S", patterns: ["world chess champion", "world chess championship"] },

    // S — creator apex
    { label: "MrBeast Tier", tier: "S", patterns: ["mrbeast", "feastables"] },
    { label: "Mark Rober / Crunch Labs", tier: "S", patterns: ["crunch labs"] },
    { label: "Kurzgesagt", tier: "S", patterns: ["kurzgesagt"] },

    // S — writers / publishers apex
    { label: "The New Yorker (staff)", tier: "S", patterns: ["new yorker staff writer", "the new yorker staff"] },
    { label: "The Atlantic (cover)", tier: "S", patterns: ["the atlantic cover", "atlantic magazine cover"] },
    { label: "NYT Magazine", tier: "S", patterns: ["new york times magazine"] },
    { label: "Knopf", tier: "S", patterns: ["alfred a. knopf", "knopf publishing"] },
    { label: "FSG", tier: "S", patterns: ["farrar, straus and giroux", "fsg publishing"] },
    { label: "Riverhead", tier: "S", patterns: ["riverhead books"] },
    { label: "Pantheon", tier: "S", patterns: ["pantheon books"] },
    { label: "Granta", tier: "S", patterns: ["granta magazine", "granta books"] },
    { label: "n+1", tier: "S", patterns: ["n+1 magazine", "n plus one magazine"] },
    { label: "Harper's", tier: "S", patterns: ["harper's magazine", "harpers magazine"] },

    // S — design firms apex
    { label: "Pentagram (Partner)", tier: "S", patterns: ["pentagram partner"] },
    { label: "Apple Industrial Design Group", tier: "S", patterns: ["apple industrial design", "apple idg"] },
    { label: "Apple Human Interface", tier: "S", patterns: ["apple human interface", "apple hi team"] },
    { label: "Foster + Partners (Senior)", tier: "S", patterns: ["foster + partners senior", "foster and partners senior"] },
    { label: "Herzog & de Meuron", tier: "S", patterns: ["herzog & de meuron", "herzog and de meuron"] },
    { label: "OMA Partner", tier: "S", patterns: ["oma partner", "office for metropolitan architecture partner"] },
    { label: "Renzo Piano Building Workshop", tier: "S", patterns: ["renzo piano building workshop", "rpbw"] },

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

    // A — bulge brackets (specific divisions)
    { label: "BofA LevFin", tier: "A", patterns: ["bank of america leveraged finance", "bofa levfin"] },
    { label: "Citi M&A", tier: "A", patterns: ["citi m&a", "citigroup m&a"] },
    { label: "Barclays Nat Res", tier: "A", patterns: ["barclays natural resources", "barclays nat res"] },

    // A — specialty banks
    { label: "Houlihan Lokey FR", tier: "A", patterns: ["houlihan lokey", "houlihan lokey restructuring", "houlihan lokey fr"] },
    { label: "Guggenheim", tier: "A", patterns: ["guggenheim partners", "guggenheim securities"] },
    { label: "Jefferies LevFin", tier: "A", patterns: ["jefferies leveraged finance", "jefferies levfin"] },

    // A — top consulting (extended)
    { label: "Oliver Wyman", tier: "A", patterns: ["oliver wyman"] },
    { label: "Strategy& / Booz", tier: "A", patterns: ["strategy&", "booz & company"] },
    { label: "EY-Parthenon", tier: "A", patterns: ["ey-parthenon", "parthenon group"] },

    // A — top PE/VC/HF
    { label: "Index Ventures", tier: "A", patterns: ["index ventures"] },
    { label: "Accel", tier: "A", patterns: ["accel partners", "accel ventures"] },
    { label: "USV", tier: "A", patterns: ["union square ventures", "usv "] },
    { label: "Greylock", tier: "A", patterns: ["greylock partners"] },
    { label: "Lightspeed", tier: "A", patterns: ["lightspeed venture"] },
    { label: "Khosla Ventures", tier: "A", patterns: ["khosla ventures"] },
    { label: "Kleiner Perkins", tier: "A", patterns: ["kleiner perkins"] },
    { label: "Bessemer", tier: "A", patterns: ["bessemer venture"] },
    { label: "General Catalyst", tier: "A", patterns: ["general catalyst"] },
    { label: "Thrive Capital", tier: "A", patterns: ["thrive capital"] },
    { label: "Insight Partners", tier: "A", patterns: ["insight partners"] },
    { label: "General Atlantic", tier: "A", patterns: ["general atlantic"] },
    { label: "TCV", tier: "A", patterns: ["technology crossover ventures", "tcv "] },
    { label: "IVP", tier: "A", patterns: ["institutional venture partners", "ivp "] },
    { label: "Vista Equity", tier: "A", patterns: ["vista equity"] },
    { label: "Thoma Bravo", tier: "A", patterns: ["thoma bravo"] },
    { label: "Carlyle Group", tier: "A", patterns: ["carlyle group"] },
    { label: "TPG", tier: "A", patterns: ["tpg capital", "tpg inc"] },
    { label: "Bain Capital", tier: "A", patterns: ["bain capital"] },
    { label: "Silver Lake", tier: "A", patterns: ["silver lake partners"] },
    { label: "Warburg Pincus", tier: "A", patterns: ["warburg pincus"] },
    { label: "D1 Capital", tier: "A", patterns: ["d1 capital"] },
    { label: "Lone Pine", tier: "A", patterns: ["lone pine capital"] },
    { label: "Viking Global", tier: "A", patterns: ["viking global"] },
    { label: "Whale Rock", tier: "A", patterns: ["whale rock capital"] },
    { label: "Third Point", tier: "A", patterns: ["third point llc"] },
    { label: "Starboard Value", tier: "A", patterns: ["starboard value"] },
    { label: "ValueAct", tier: "A", patterns: ["valueact capital"] },
    { label: "Yale Investments", tier: "A", patterns: ["yale investments office", "yale endowment"] },
    { label: "MIT IMC", tier: "A", patterns: ["mit investment management", "mit imc"] },
    { label: "Princeton PRINCO", tier: "A", patterns: ["princeton university investment", "princo"] },
    { label: "Stanford SMC", tier: "A", patterns: ["stanford management company", "stanford smc"] },

    // A — law firms (V10/V20)
    { label: "Skadden", tier: "A", patterns: ["skadden, arps", "skadden arps"] },
    { label: "Kirkland & Ellis", tier: "A", patterns: ["kirkland & ellis", "kirkland and ellis"] },
    { label: "Latham & Watkins", tier: "A", patterns: ["latham & watkins", "latham and watkins"] },
    { label: "Paul Weiss", tier: "A", patterns: ["paul, weiss, rifkind", "paul weiss"] },
    { label: "Simpson Thacher", tier: "A", patterns: ["simpson thacher"] },
    { label: "Gibson Dunn", tier: "A", patterns: ["gibson, dunn & crutcher", "gibson dunn"] },
    { label: "Quinn Emanuel", tier: "A", patterns: ["quinn emanuel"] },

    // A — public sector law / impact
    { label: "USAO SDNY", tier: "A", patterns: ["usao sdny", "us attorney's office sdny", "southern district of new york us attorney"] },
    { label: "USAO EDNY", tier: "A", patterns: ["usao edny", "eastern district of new york us attorney"] },
    { label: "USAO DDC", tier: "A", patterns: ["usao d.d.c.", "us attorney district of columbia"] },
    { label: "ACLU", tier: "A", patterns: ["aclu", "american civil liberties union"] },
    { label: "NAACP LDF", tier: "A", patterns: ["naacp legal defense", "naacp ldf"] },
    { label: "EJI", tier: "A", patterns: ["equal justice initiative"] },

    // A — medical institutions
    { label: "Mayo Clinic", tier: "A", patterns: ["mayo clinic"] },
    { label: "NYU Langone", tier: "A", patterns: ["nyu langone"] },
    { label: "Cornell Weill Hospital", tier: "A", patterns: ["weill cornell hospital", "newyork-presbyterian weill"] },
    { label: "Northwestern Memorial", tier: "A", patterns: ["northwestern memorial hospital"] },
    { label: "UPenn Hospital", tier: "A", patterns: ["hospital of the university of pennsylvania", "penn presbyterian"] },

    // A — government / think tanks
    { label: "Council on Foreign Relations", tier: "A", patterns: ["council on foreign relations", "cfr senior fellow"] },
    { label: "Brookings", tier: "A", patterns: ["brookings institution", "brookings senior fellow"] },
    { label: "RAND", tier: "A", patterns: ["rand corporation"] },
    { label: "AEI", tier: "A", patterns: ["american enterprise institute"] },
    { label: "CSIS", tier: "A", patterns: ["center for strategic and international studies", "csis fellow"] },
    { label: "Hoover Institution", tier: "A", patterns: ["hoover institution"] },
    { label: "World Bank (MD)", tier: "A", patterns: ["world bank managing director"] },
    { label: "IMF (MD)", tier: "A", patterns: ["imf managing director", "international monetary fund managing"] },
    { label: "UN Asst SG", tier: "A", patterns: ["assistant secretary-general", "un assistant secretary"] },

    // A — restaurants / hospitality
    { label: "Single Michelin Star", tier: "A", patterns: ["one michelin star", "michelin-starred", "michelin star "] },
    { label: "Lilia / Misi", tier: "A", patterns: ["lilia brooklyn", "misi restaurant"] },
    { label: "Atelier Crenn", tier: "A", patterns: ["atelier crenn"] },
    { label: "Pujol", tier: "A", patterns: ["pujol restaurant", "enrique olvera"] },
    { label: "Sweetgreen founders", tier: "A", patterns: ["sweetgreen"] },
    { label: "Shake Shack early", tier: "A", patterns: ["shake shack early", "danny meyer"] },

    // A — DTC brands
    { label: "Olipop", tier: "A", patterns: ["olipop"] },
    { label: "Magic Spoon", tier: "A", patterns: ["magic spoon"] },
    { label: "Poppi", tier: "A", patterns: ["poppi beverage"] },
    { label: "Bobbie", tier: "A", patterns: ["bobbie formula"] },
    { label: "Rare Beauty", tier: "A", patterns: ["rare beauty"] },
    { label: "Drunk Elephant", tier: "A", patterns: ["drunk elephant"] },
    { label: "Allbirds peak", tier: "A", patterns: ["allbirds"] },
    { label: "Casper peak", tier: "A", patterns: ["casper sleep"] },

    // A — performance / conservatories
    { label: "ABT Soloist", tier: "A", patterns: ["abt soloist", "american ballet theatre soloist"] },
    { label: "NYCB Soloist", tier: "A", patterns: ["nycb soloist", "new york city ballet soloist"] },
    { label: "Juilliard Concert Artist", tier: "A", patterns: ["juilliard school concert", "juilliard concert artist"] },
    { label: "Curtis Touring Soloist", tier: "A", patterns: ["curtis touring soloist"] },

    // A — athletics
    { label: "NCAA D1 National Champion", tier: "A", patterns: ["ncaa d1 national champion", "ncaa division i national champion"] },
    { label: "NCAA D1 Conference POY", tier: "A", patterns: ["ncaa conference player of the year", "conference poy"] },
    { label: "NCAA D1 All-American", tier: "A", patterns: ["ncaa all-american", "ncaa all american"] },
    { label: "Olympic Team (no medal)", tier: "A", patterns: ["olympic team member", "olympic team selection"] },
    { label: "Pro Contract", tier: "A", patterns: ["mlb contract", "nba contract", "nfl roster", "nhl contract"] },

    // A — esports / chess
    { label: "Chess GM Title", tier: "A", patterns: ["chess grandmaster", "fide grandmaster", "gm title chess"] },
    { label: "Esports Tier-1 League", tier: "A", patterns: ["lcs championship", "lec championship", "csgo blast", "valorant champions"] },

    // A — creators
    { label: "5M+ YouTube w/ Prod Co", tier: "A", patterns: ["5m subscribers youtube", "5 million subscribers"] },
    { label: "Ali Abdaal", tier: "A", patterns: ["ali abdaal"] },
    { label: "Veritasium", tier: "A", patterns: ["veritasium", "derek muller"] },

    // A — writers / newsrooms
    { label: "NYT Staff", tier: "A", patterns: ["new york times staff writer", "nyt staff writer", "nyt staff reporter"] },
    { label: "Washington Post Staff", tier: "A", patterns: ["washington post staff"] },
    { label: "ProPublica", tier: "A", patterns: ["propublica"] },
    { label: "Bloomberg Long-form", tier: "A", patterns: ["bloomberg businessweek", "bloomberg long-form"] },
    { label: "WSJ A-hed", tier: "A", patterns: ["wall street journal a-hed"] },
    { label: "The Cut", tier: "A", patterns: ["the cut magazine"] },
    { label: "Paris Review", tier: "A", patterns: ["the paris review", "paris review"] },
    { label: "Tin House", tier: "A", patterns: ["tin house"] },
    { label: "McSweeney's", tier: "A", patterns: ["mcsweeney's", "mcsweeneys"] },
    { label: "Coffee House Press", tier: "A", patterns: ["coffee house press"] },
    { label: "Graywolf Press", tier: "A", patterns: ["graywolf press"] },

    // A — design firms
    { label: "Pentagram (Associate)", tier: "A", patterns: ["pentagram associate partner"] },
    { label: "COLLINS", tier: "A", patterns: ["collins design", "collins agency"] },
    { label: "IDEO Partner", tier: "A", patterns: ["ideo partner"] },
    { label: "Frog Design VP", tier: "A", patterns: ["frog design vp", "frog vp"] },
    { label: "BIG Architects", tier: "A", patterns: ["bjarke ingels group", "big architects"] },
    { label: "Snøhetta", tier: "A", patterns: ["snøhetta", "snohetta"] },
    { label: "SHoP Architects", tier: "A", patterns: ["shop architects"] },
    { label: "MOS Architects", tier: "A", patterns: ["mos architects"] },
    { label: "Diller Scofidio + Renfro", tier: "A", patterns: ["diller scofidio"] },
    { label: "Klim Type Foundry", tier: "A", patterns: ["klim type foundry"] },
    { label: "Commercial Type", tier: "A", patterns: ["commercial type foundry"] },
    { label: "Hoefler & Co", tier: "A", patterns: ["hoefler & co", "hoefler and co"] },

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

    // B — middle-market banks
    { label: "William Blair", tier: "B", patterns: ["william blair"] },
    { label: "Baird", tier: "B", patterns: ["robert w. baird", "baird investment"] },
    { label: "Harris Williams", tier: "B", patterns: ["harris williams"] },
    { label: "Piper Sandler", tier: "B", patterns: ["piper sandler"] },
    { label: "Raymond James", tier: "B", patterns: ["raymond james financial"] },
    { label: "Stifel", tier: "B", patterns: ["stifel financial", "stifel nicolaus"] },
    { label: "Lincoln International", tier: "B", patterns: ["lincoln international"] },

    // B — secondary PE/VC/HF
    { label: "Summit Partners", tier: "B", patterns: ["summit partners"] },
    { label: "TA Associates", tier: "B", patterns: ["ta associates"] },
    { label: "JMI Equity", tier: "B", patterns: ["jmi equity"] },
    { label: "Stripes Group", tier: "B", patterns: ["stripes group"] },
    { label: "Battery Ventures", tier: "B", patterns: ["battery ventures"] },
    { label: "Redpoint", tier: "B", patterns: ["redpoint ventures"] },
    { label: "NEA", tier: "B", patterns: ["new enterprise associates", "nea ventures"] },
    { label: "Madrona", tier: "B", patterns: ["madrona venture"] },
    { label: "Balyasny", tier: "B", patterns: ["balyasny asset"] },
    { label: "ExodusPoint", tier: "B", patterns: ["exoduspoint capital"] },
    { label: "Schonfeld", tier: "B", patterns: ["schonfeld strategic"] },

    // B — V100 law firms
    { label: "Jones Day", tier: "B", patterns: ["jones day"] },
    { label: "WilmerHale", tier: "B", patterns: ["wilmerhale", "wilmer cutler pickering"] },
    { label: "Covington & Burling", tier: "B", patterns: ["covington & burling", "covington and burling"] },

    // B — public sector law
    { label: "Federal Public Defender", tier: "B", patterns: ["federal public defender"] },
    { label: "Bronx Defenders", tier: "B", patterns: ["bronx defenders"] },
    { label: "PDS DC", tier: "B", patterns: ["public defender service dc", "pds dc"] },

    // B — consulting tier 2
    { label: "L.E.K. Consulting", tier: "B", patterns: ["l.e.k. consulting", "lek consulting"] },
    { label: "Roland Berger", tier: "B", patterns: ["roland berger"] },
    { label: "A.T. Kearney", tier: "B", patterns: ["a.t. kearney", "kearney consulting"] },
    { label: "ZS Associates", tier: "B", patterns: ["zs associates"] },
    { label: "Monitor Deloitte", tier: "B", patterns: ["monitor deloitte"] },

    // B — government mid-career
    { label: "Hill Chief of Staff", tier: "B", patterns: ["chief of staff congressional", "house chief of staff", "senate chief of staff"] },
    { label: "Mid-tier think tank", tier: "B", patterns: ["new america fellow", "cnas fellow", "atlantic council fellow"] },
    { label: "FSO Officer (mid)", tier: "B", patterns: ["foreign service officer mid", "fso fs-3", "fso fs-2"] },
    { label: "Pentagon J-staff", tier: "B", patterns: ["pentagon joint staff", "j-staff pentagon", "joint chiefs of staff"] },

    // B — performance / dance
    { label: "ABT Corps de Ballet", tier: "B", patterns: ["abt corps de ballet", "american ballet theatre corps"] },
    { label: "NYCB Corps de Ballet", tier: "B", patterns: ["nycb corps de ballet"] },
    { label: "Regional Orchestra Section", tier: "B", patterns: ["regional orchestra", "symphony orchestra section"] },

    // B — athletics
    { label: "D1 Starter Power 5", tier: "B", patterns: ["d1 starter", "division i starter", "power 5 starter"] },
    { label: "D1 Walk-on (scholarship)", tier: "B", patterns: ["d1 walk-on scholarship", "walk-on earned scholarship"] },
    { label: "Ivy Recruited Athlete", tier: "B", patterns: ["ivy league recruited athlete", "ivy recruit"] },

    // B — chess / esports
    { label: "Chess IM Title", tier: "B", patterns: ["chess international master", "fide international master", "im title chess"] },
    { label: "FaZe / 100T / TSM Roster", tier: "B", patterns: ["faze clan roster", "100 thieves roster", "tsm roster", "cloud9 roster", "t1 roster"] },

    // B — creators
    { label: "500k+ YouTube", tier: "B", patterns: ["500k subscribers youtube", "500,000 subscribers"] },
    { label: "1M+ TikTok", tier: "B", patterns: ["1m tiktok followers", "1 million tiktok"] },
    { label: "5k+ Paid Substack", tier: "B", patterns: ["5k paid subscribers substack", "5000 paid substack"] },

    // B — writers mid-tier
    { label: "Vox", tier: "B", patterns: ["vox media", "vox.com"] },
    { label: "The Verge", tier: "B", patterns: ["the verge"] },
    { label: "Wired", tier: "B", patterns: ["wired magazine"] },
    { label: "The Ringer", tier: "B", patterns: ["the ringer"] },
    { label: "Rolling Stone", tier: "B", patterns: ["rolling stone magazine"] },
    { label: "GQ", tier: "B", patterns: ["gq magazine"] },
    { label: "Vanity Fair", tier: "B", patterns: ["vanity fair"] },

    // B — design firms mid-tier
    { label: "Pentagram (Junior)", tier: "B", patterns: ["pentagram junior", "pentagram senior designer"] },
    { label: "KPF", tier: "B", patterns: ["kohn pedersen fox", "kpf architects"] },
    { label: "SOM", tier: "B", patterns: ["skidmore, owings & merrill", "som architects"] },
    { label: "Gensler", tier: "B", patterns: ["gensler design director", "gensler architecture"] },
    { label: "HOK", tier: "B", patterns: ["hok architects"] },
    { label: "Perkins+Will", tier: "B", patterns: ["perkins+will", "perkins and will"] },

    // B — brand/fashion mid-tier
    { label: "Jacquemus early", tier: "B", patterns: ["jacquemus"] },
    { label: "Eckhaus Latta", tier: "B", patterns: ["eckhaus latta"] },

    // C — generic consulting
    { label: "Deloitte Consulting", tier: "C", patterns: ["deloitte consulting"] },
    { label: "Accenture Strategy", tier: "C", patterns: ["accenture strategy"] },
    { label: "PwC Strategy", tier: "C", patterns: ["pwc strategy"] },

    // C — creators
    { label: "100k+ YouTube", tier: "C", patterns: ["100k subscribers youtube", "100,000 subscribers"] },
    { label: "100k+ TikTok", tier: "C", patterns: ["100k tiktok followers"] },

    // D — generic big-4 / regional banks
    { label: "KPMG", tier: "D", patterns: ["kpmg consulting"] },
    { label: "EY General", tier: "D", patterns: ["ey general", "ernst & young general"] },
    { label: "Fifth Third", tier: "D", patterns: ["fifth third bank"] },
    { label: "KeyBank", tier: "D", patterns: ["keybank capital", "keybanc capital"] },
    { label: "Comerica", tier: "D", patterns: ["comerica bank"] },
    { label: "BMO Capital", tier: "D", patterns: ["bmo capital markets non-sponsor"] },
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
    { label: "Schwarzman Scholar", tier: "S", patterns: ["schwarzman scholar", "schwarzman scholarship"] },
    { label: "Gates Cambridge", tier: "S", patterns: ["gates cambridge"] },
    { label: "Thiel Fellow", tier: "S", patterns: ["thiel fellow", "thiel fellowship"] },
    { label: "MacArthur Fellow", tier: "S", patterns: ["macarthur fellow", "macarthur \"genius\""] },
    { label: "Forbes 30 Under 30", tier: "S", patterns: ["forbes 30 under 30", "30 under 30"] },
    { label: "Forbes Midas List Top 10", tier: "S", patterns: ["forbes midas list", "midas list top"] },
    { label: "II Hedge Fund Rich List", tier: "S", patterns: ["ii hedge fund rich list", "institutional investor rich list"] },
    { label: "TIME 100", tier: "S", patterns: ["time 100"] },
    { label: "ISEF Top 5", tier: "S", patterns: ["isef first place", "isef grand award", "regeneron isef"] },
    { label: "Olympic Medalist", tier: "S", patterns: ["olympic gold", "olympic silver", "olympic bronze", "olympic medal"] },

    // S — law accolades
    { label: "SCOTUS Clerkship", tier: "S", patterns: ["scotus clerk", "supreme court clerk", "clerked for justice"] },
    { label: "Article III Judgeship", tier: "S", patterns: ["article iii judge", "federal article iii", "circuit court judge"] },
    { label: "Bigelow/Climenko/Furman Fellowship", tier: "S", patterns: ["bigelow fellow", "climenko fellow", "furman fellow"] },

    // S — medical accolades
    { label: "Nobel Medicine", tier: "S", patterns: ["nobel prize medicine", "nobel laureate medicine", "nobel in physiology"] },
    { label: "Lasker Award", tier: "S", patterns: ["lasker award", "lasker prize"] },
    { label: "Gairdner International", tier: "S", patterns: ["gairdner international", "canada gairdner"] },
    { label: "Breakthrough Prize Life Sci", tier: "S", patterns: ["breakthrough prize life sciences", "breakthrough prize in life"] },
    { label: "National Medal of Science", tier: "S", patterns: ["national medal of science"] },
    { label: "NIH Pioneer Award", tier: "S", patterns: ["nih pioneer award", "nih director's pioneer"] },

    // S — academic awards
    { label: "Nobel Prize (any)", tier: "S", patterns: ["nobel prize", "nobel laureate"] },
    { label: "Fields Medal", tier: "S", patterns: ["fields medal"] },
    { label: "Abel Prize", tier: "S", patterns: ["abel prize"] },
    { label: "Clark Medal", tier: "S", patterns: ["john bates clark medal", "clark medal economics"] },
    { label: "Wolf Prize", tier: "S", patterns: ["wolf prize"] },
    { label: "Crafoord Prize", tier: "S", patterns: ["crafoord prize"] },
    { label: "Breakthrough Prize", tier: "S", patterns: ["breakthrough prize"] },
    { label: "Holberg Prize", tier: "S", patterns: ["holberg prize"] },
    { label: "Kluge Prize", tier: "S", patterns: ["kluge prize"] },
    { label: "National Academy of Sciences", tier: "S", patterns: ["national academy of sciences elect", "nas member"] },

    // S — creative apex
    { label: "Pulitzer Prize", tier: "S", patterns: ["pulitzer prize", "pulitzer-winning"] },
    { label: "Booker Prize", tier: "S", patterns: ["booker prize", "man booker"] },
    { label: "National Book Award", tier: "S", patterns: ["national book award"] },
    { label: "Oscar Director/Picture/Screenplay", tier: "S", patterns: ["academy award best director", "academy award best picture", "academy award best screenplay", "oscar best director"] },
    { label: "Emmy Best Drama", tier: "S", patterns: ["emmy best drama", "emmy outstanding drama"] },
    { label: "Grammy Album of the Year", tier: "S", patterns: ["grammy album of the year"] },
    { label: "Polk Award (lifetime)", tier: "S", patterns: ["polk award lifetime", "polk career award"] },
    { label: "Peabody (lifetime)", tier: "S", patterns: ["peabody lifetime", "peabody career achievement"] },
    { label: "Kennedy Center Honoree", tier: "S", patterns: ["kennedy center honoree", "kennedy center honors"] },
    { label: "Van Cliburn Gold Medal", tier: "S", patterns: ["van cliburn gold", "cliburn competition gold"] },
    { label: "Avery Fisher Prize", tier: "S", patterns: ["avery fisher prize"] },
    { label: "EGOT", tier: "S", patterns: ["egot winner", "egot recipient"] },

    // S — design / architecture apex
    { label: "Pritzker Prize", tier: "S", patterns: ["pritzker prize", "pritzker architecture"] },
    { label: "AIA Gold Medal", tier: "S", patterns: ["aia gold medal"] },
    { label: "RIBA Royal Gold Medal", tier: "S", patterns: ["riba royal gold medal"] },
    { label: "AIGA Medal", tier: "S", patterns: ["aiga medal", "aiga medalist"] },
    { label: "Cooper Hewitt Lifetime", tier: "S", patterns: ["cooper hewitt national design lifetime"] },

    // S — government / military apex
    { label: "Presidential Medal of Freedom", tier: "S", patterns: ["presidential medal of freedom"] },
    { label: "Congressional Gold Medal", tier: "S", patterns: ["congressional gold medal"] },
    { label: "Medal of Honor", tier: "S", patterns: ["medal of honor"] },
    { label: "Distinguished Service Cross", tier: "S", patterns: ["distinguished service cross", "navy cross", "air force cross"] },
    { label: "White House Fellow", tier: "S", patterns: ["white house fellow"] },
    { label: "Senate-Confirmed Cabinet", tier: "S", patterns: ["senate-confirmed cabinet", "cabinet secretary"] },

    // S — athletics extended
    { label: "World Championship", tier: "S", patterns: ["world championship gold", "world championship title"] },
    { label: "World Record", tier: "S", patterns: ["world record holder"] },
    { label: "NCAA D1 National Champion (individual)", tier: "S", patterns: ["ncaa individual national champion"] },
    { label: "Heisman Trophy", tier: "S", patterns: ["heisman trophy"] },
    { label: "MVP Multi-Year", tier: "S", patterns: ["mvp multi-year", "league mvp"] },
    { label: "Hall of Fame", tier: "S", patterns: ["hall of fame induction", "naismith hall of fame", "baseball hall of fame", "pro football hall of fame"] },
    { label: "Chess Super-GM 2700+", tier: "S", patterns: ["super-gm", "2700 fide", "super grandmaster"] },
    { label: "Esports World Championship", tier: "S", patterns: ["esports world championship", "world esports champion"] },

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

    // A — extended fellowships
    { label: "Mitchell Scholar", tier: "A", patterns: ["mitchell scholar", "mitchell scholarship"] },
    { label: "Churchill Scholar", tier: "A", patterns: ["churchill scholar", "churchill scholarship"] },
    { label: "Henry Crown Aspen Fellow", tier: "A", patterns: ["henry crown fellow", "aspen henry crown"] },
    { label: "Sloan Fellow", tier: "A", patterns: ["sloan research fellow", "alfred p. sloan fellow"] },

    // A — law accolades
    { label: "Federal Appellate Clerkship", tier: "A", patterns: ["federal appellate clerk", "circuit clerkship", "court of appeals clerk"] },
    { label: "T6 Law Review Editor", tier: "A", patterns: ["law review articles editor", "law review editor-in-chief", "harvard law review", "yale law journal", "stanford law review", "columbia law review", "chicago law review", "nyu law review"] },
    { label: "Order of the Coif", tier: "A", patterns: ["order of the coif"] },
    { label: "LSAT 175+", tier: "A", patterns: ["lsat 175", "lsat 176", "lsat 177", "lsat 178", "lsat 179", "lsat 180"] },

    // A — medical accolades
    { label: "NAS/NAM/AAAS Fellow", tier: "A", patterns: ["national academy of medicine", "national academy of engineering", "aaas fellow"] },
    { label: "MacArthur Life Sci", tier: "A", patterns: ["macarthur fellow life sciences"] },
    { label: "ASCI Membership", tier: "A", patterns: ["american society for clinical investigation", "asci member"] },
    { label: "NIH K99/R00", tier: "A", patterns: ["nih k99", "nih r00", "k99/r00"] },
    { label: "NIH K08/K23", tier: "A", patterns: ["nih k08", "nih k23"] },
    { label: "CDC EIS", tier: "A", patterns: ["cdc epidemic intelligence", "eis officer"] },
    { label: "ASCO YIA", tier: "A", patterns: ["asco young investigator", "asco yia"] },
    { label: "Burroughs Wellcome CAMS", tier: "A", patterns: ["burroughs wellcome", "career award medical scientists"] },

    // A — creative accolades
    { label: "NBCC Award", tier: "A", patterns: ["national book critics circle"] },
    { label: "PEN/Faulkner", tier: "A", patterns: ["pen/faulkner", "pen faulkner award"] },
    { label: "PEN/Hemingway", tier: "A", patterns: ["pen/hemingway"] },
    { label: "Anisfield-Wolf Book Award", tier: "A", patterns: ["anisfield-wolf"] },
    { label: "Polk Single Award", tier: "A", patterns: ["george polk award"] },
    { label: "Peabody Single Award", tier: "A", patterns: ["peabody award"] },
    { label: "Sundance Grand Jury Prize", tier: "A", patterns: ["sundance grand jury prize"] },
    { label: "Cannes Palme d'Or", tier: "A", patterns: ["palme d'or", "palme dor cannes"] },
    { label: "Venice/Berlin Competition", tier: "A", patterns: ["venice film festival competition", "berlin film festival competition", "golden lion", "golden bear"] },
    { label: "DGA Award", tier: "A", patterns: ["directors guild of america award", "dga award"] },
    { label: "Oscar Nomination", tier: "A", patterns: ["academy award nomination", "oscar-nominated", "oscar nomination"] },
    { label: "Emmy Nomination", tier: "A", patterns: ["emmy nomination", "emmy-nominated"] },
    { label: "Grammy Nomination", tier: "A", patterns: ["grammy nomination", "grammy-nominated"] },
    { label: "Pitchfork BNM", tier: "A", patterns: ["pitchfork best new music", "pitchfork bnm"] },
    { label: "Sundance US Dramatic", tier: "A", patterns: ["sundance us dramatic competition", "sundance dramatic competition"] },

    // A — design / architecture
    { label: "AIA Honor Award", tier: "A", patterns: ["aia honor award"] },
    { label: "RIBA Stirling Shortlist", tier: "A", patterns: ["riba stirling prize shortlist", "stirling prize shortlist"] },
    { label: "Cooper Hewitt Award", tier: "A", patterns: ["cooper hewitt national design award"] },
    { label: "D&AD Black Pencil", tier: "A", patterns: ["d&ad black pencil"] },
    { label: "ADC Black Cube", tier: "A", patterns: ["adc black cube"] },
    { label: "Brand New Awards", tier: "A", patterns: ["brand new awards"] },

    // A — chef / hospitality
    { label: "James Beard Outstanding Chef", tier: "A", patterns: ["james beard outstanding chef"] },
    { label: "Beard Best Chef (regional)", tier: "A", patterns: ["james beard best chef"] },
    { label: "CFDA Designer of the Year", tier: "A", patterns: ["cfda designer of the year"] },
    { label: "CFDA Vogue Fashion Fund", tier: "A", patterns: ["cfda/vogue fashion fund", "cfda vogue fashion fund"] },
    { label: "LVMH Prize", tier: "A", patterns: ["lvmh prize"] },
    { label: "Michelin One or Two Stars", tier: "A", patterns: ["two michelin stars", "2 michelin stars"] },
    { label: "NYT Top 10 Restaurants", tier: "A", patterns: ["nyt top 10 restaurants", "new york times top 10 restaurants"] },
    { label: "CFDA Finalist", tier: "A", patterns: ["cfda finalist"] },
    { label: "Webby Award", tier: "A", patterns: ["webby award"] },
    { label: "CEW Achiever", tier: "A", patterns: ["cew achiever", "cosmetic executive women"] },

    // A — military mid-tier
    { label: "Silver Star", tier: "A", patterns: ["silver star medal"] },
    { label: "Bronze Star with V", tier: "A", patterns: ["bronze star with v", "bronze star with valor"] },
    { label: "Defense Distinguished Service", tier: "A", patterns: ["defense distinguished service medal"] },
    { label: "Sec State Distinguished Service", tier: "A", patterns: ["secretary of state's distinguished service"] },
    { label: "Henry L. Stimson Medal", tier: "A", patterns: ["henry l. stimson medal", "stimson medal"] },
    { label: "Order of the British Empire", tier: "A", patterns: ["order of the british empire", "cbe medal", "obe medal"] },
    { label: "Légion d'honneur", tier: "A", patterns: ["légion d'honneur", "legion of honor french"] },

    // A — undergrad merit
    { label: "Stamps Scholarship", tier: "A", patterns: ["stamps scholar", "stamps scholarship"] },
    { label: "Coca-Cola Scholarship", tier: "A", patterns: ["coca-cola scholar", "coca cola scholarship"] },
    { label: "Jefferson Scholar (UVA)", tier: "A", patterns: ["jefferson scholar"] },
    { label: "Morehead-Cain", tier: "A", patterns: ["morehead-cain", "morehead cain"] },
    { label: "Robertson Scholarship", tier: "A", patterns: ["robertson scholar", "robertson scholarship"] },
    { label: "Presidential Scholar", tier: "A", patterns: ["us presidential scholar", "presidential scholars program"] },

    // A — finance accolades
    { label: "Midas Brink", tier: "A", patterns: ["midas brink"] },
    { label: "II All-America Research", tier: "A", patterns: ["institutional investor all-america", "ii all-america research"] },
    { label: "Vault Banking 50", tier: "A", patterns: ["vault banking 50", "vault rankings"] },

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

    // B — law
    { label: "Federal District Clerkship", tier: "B", patterns: ["federal district clerk", "district court clerk"] },
    { label: "State Supreme Court Clerk", tier: "B", patterns: ["state supreme court clerk"] },
    { label: "Law Review (non-T6)", tier: "B", patterns: ["law review editor", "law review member"] },
    { label: "Moot Court Champion", tier: "B", patterns: ["moot court champion", "national moot court"] },
    { label: "AMTA All-American", tier: "B", patterns: ["amta all-american", "mock trial all-american"] },

    // B — medical
    { label: "AOA Membership", tier: "B", patterns: ["alpha omega alpha", "aoa medical honor"] },
    { label: "Gold Humanism", tier: "B", patterns: ["gold humanism honor society", "gold humanism"] },
    { label: "Cell/Nature/Science First-author", tier: "B", patterns: ["cell first author", "nature first author", "science first author", "first-author nature", "first-author science"] },
    { label: "Chief Resident", tier: "B", patterns: ["chief resident"] },

    // B — creative mid-tier
    { label: "James Beard Semifinalist", tier: "B", patterns: ["james beard semifinalist", "james beard nominee"] },
    { label: "CFDA Emerging Designer", tier: "B", patterns: ["cfda emerging designer"] },
    { label: "Bib Gourmand", tier: "B", patterns: ["bib gourmand", "michelin bib gourmand"] },
    { label: "Eater Young Gun", tier: "B", patterns: ["eater young gun"] },
    { label: "Architizer A+ Award", tier: "B", patterns: ["architizer a+ award"] },
    { label: "ArchDaily Building of the Year", tier: "B", patterns: ["archdaily building of the year"] },
    { label: "D&AD Yellow Pencil", tier: "B", patterns: ["d&ad yellow pencil"] },
    { label: "ADC Silver", tier: "B", patterns: ["adc silver cube"] },
    { label: "Print Regional Design Annual", tier: "B", patterns: ["print regional design"] },
    { label: "Fast Company IxD Finalist", tier: "B", patterns: ["fast company innovation by design"] },
    { label: "Pushcart Prize", tier: "B", patterns: ["pushcart prize"] },
    { label: "Best American Short Stories", tier: "B", patterns: ["best american short stories"] },
    { label: "NPR Tiny Desk", tier: "B", patterns: ["npr tiny desk"] },
    { label: "Coachella Mainstage", tier: "B", patterns: ["coachella mainstage"] },
    { label: "Pitchfork 7.5+ Indie", tier: "B", patterns: ["pitchfork 7.5", "pitchfork 8.0", "pitchfork 8.5", "pitchfork 9.0"] },
    { label: "Sundance NEXT / Slamdance", tier: "B", patterns: ["sundance next", "slamdance"] },
    { label: "A24 / NEON Acquisition", tier: "B", patterns: ["a24 acquired", "a24 distribution", "neon distribution", "neon acquired"] },
    { label: "Met Opera Debut Role", tier: "B", patterns: ["metropolitan opera debut"] },
    { label: "NY Phil Guest Soloist", tier: "B", patterns: ["new york philharmonic guest soloist"] },

    // B — undergrad merit
    { label: "Park Scholarship", tier: "B", patterns: ["park scholar", "park scholarship nc state"] },
    { label: "Jack Kent Cooke", tier: "B", patterns: ["jack kent cooke"] },

    // B — athletics extended
    { label: "Drafted MLB/NFL/NBA Late Round", tier: "B", patterns: ["drafted mlb", "drafted nba", "drafted nfl", "signed undrafted free agent"] },
    { label: "NCAA D2/D3 National Champion", tier: "B", patterns: ["ncaa d2 national champion", "ncaa d3 national champion", "division ii national champion", "division iii national champion"] },

    // C — generic
    { label: "Dean's List (top school)", tier: "C", patterns: ["dean's list", "deans list"] },
    { label: "Devpost Winner", tier: "C", patterns: ["devpost winner", "devpost finalist"] },
    { label: "National Merit Scholar", tier: "C", patterns: ["national merit scholar", "national merit finalist"] },
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
    { label: "Founded $1B+ Fund", tier: "S", patterns: ["founded fund", "founding partner of fund"], regex: [/founded\s+(a\s+)?\$\d+\s?b\+?\s+fund/i, /\$\d+\s?billion\s+fund/i] },
    { label: "Forbes Self-Made Consumer Billionaire", tier: "S", patterns: ["forbes self-made billionaire", "self-made consumer billionaire"] },
    { label: "YC W/S Founder", tier: "A", patterns: ["y combinator", "ycombinator", " yc w", " yc s", "yc batch"] },
    { label: "Founders Inc", tier: "A", patterns: ["founders inc", "founders, inc"] },
    { label: "Neo", tier: "A", patterns: ["neo accelerator"] },
    { label: "On Deck", tier: "A", patterns: ["on deck fellowship", "on deck ", "ondeck"] },
    { label: "Z Fellows", tier: "A", patterns: ["z fellows"] },
    { label: "Pioneer", tier: "A", patterns: ["pioneer.app"] },
    { label: "Raised Seed $1M+", tier: "A", patterns: [], regex: [/raised\s+\$[1-9][0-9]?\s?m/i, /seed\s+round/i] },
    { label: "Solo GP / Solo Capitalist", tier: "A", patterns: ["solo gp", "solo capitalist", "solo general partner"] },
    { label: "Search Fund / ETA", tier: "A", patterns: ["search fund", "entrepreneurship through acquisition", "eta searcher"] },
    { label: "F500 Spinout CEO", tier: "A", patterns: ["fortune 500 spinout", "f500 spinout ceo"] },
    { label: "Co-founder", tier: "B", patterns: ["co-founder", "cofounder", "founder &", "founder, "] },
    { label: "Founder", tier: "B", patterns: ["founder of", "ceo & founder", "founder/ceo"] },
    { label: "Rolling Fund", tier: "B", patterns: ["rolling fund", "angellist rolling fund"] },
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
    { label: "Davos Delegate", tier: "S", patterns: ["davos delegate", "world economic forum davos"] },
    { label: "WEF Young Global Leader", tier: "S", patterns: ["young global leader", "wef ygl"] },
    { label: "TED Main Stage Speaker", tier: "S", patterns: ["ted speaker", "ted main stage", "ted talk main stage"] },
    { label: "10k+ Twitter Following", tier: "A", patterns: [], regex: [/\b[1-9]\d?k\s+followers/i] },
    { label: "Strange Loop / JSConf Speaker", tier: "A", patterns: ["strange loop", "jsconf", "react conf", "pycon keynote"] },
    { label: "Published Paper", tier: "A", patterns: ["arxiv.org", "published in ", "co-author of"] },
    { label: "Op-Ed in WSJ/FT/Economist", tier: "A", patterns: ["wall street journal op-ed", "financial times op-ed", "economist op-ed", "ft op-ed"] },
    { label: "Public Co Board Director", tier: "A", patterns: ["board director public company", "public company board director", "nasdaq board director", "nyse board director"] },
    { label: "Substack 100k+ Paid", tier: "A", patterns: ["100k paid subscribers substack", "100,000 paid substack"] },
    { label: "Conference Talk", tier: "B", patterns: ["conference speaker", "tech talk", "invited talk"] },
    { label: "Aspen Ideas Speaker", tier: "B", patterns: ["aspen ideas festival", "aspen ideas speaker"] },
    { label: "Milken Conference Panelist", tier: "B", patterns: ["milken conference", "milken institute global"] },
    { label: "Substack 5k+ Paid", tier: "B", patterns: ["5k paid subscribers substack", "5000 paid substack"] },
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
