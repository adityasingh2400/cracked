// Athletics & Performance family - starter achievement library for v1.0 launch.

import type { Achievement, Chain } from "@/lib/types";

export const ATHLETICS_PERFORMANCE_ACHIEVEMENTS: Achievement[] = [
  // ASCENDED
  {
    id: "ath_olympic_gold",
    family: "athletics_performance",
    tier: "ASCENDED",
    label: "Olympic Gold Medal",
    description: "Lifetime-defining athletic achievement.",
    signals: [{ kind: "award", match: ["Olympic Gold Medal", "Olympic Champion"] }],
    evidence: ["Simone Biles", "Michael Phelps"],
  },
  {
    id: "ath_world_champion",
    family: "athletics_performance",
    tier: "ASCENDED",
    label: "World Champion (major sport)",
    description: "World championship in a major sport.",
    signals: [{ kind: "free_text", patterns: [/World Champion|World Championship|Heavyweight Champion|World Title/i] }],
    evidence: ["broad"],
  },
  {
    id: "ath_nba_nfl_champion",
    family: "athletics_performance",
    tier: "ASCENDED",
    label: "NBA / NFL / MLB / NHL Champion",
    description: "Major pro league title winner.",
    signals: [{ kind: "free_text", patterns: [/NBA Champion|Super Bowl Champion|World Series Champion|Stanley Cup Champion/i] }],
    evidence: ["narrow"],
  },
  {
    id: "ath_grand_slam_champion",
    family: "athletics_performance",
    tier: "ASCENDED",
    label: "Grand Slam Champion (tennis / golf)",
    description: "Grand Slam tennis or Major golf championship winner.",
    signals: [{ kind: "free_text", patterns: [/Wimbledon|US Open|Australian Open|French Open|The Masters|PGA Championship/i] }],
    evidence: ["narrow"],
  },
  {
    id: "ath_pulitzer_or_grammy",
    family: "athletics_performance",
    tier: "ASCENDED",
    label: "Grammy / Tony / Oscar (performance)",
    description: "Major performing-arts top prize.",
    signals: [{ kind: "award", match: ["Grammy", "Tony Award", "Academy Award", "Oscar"] }],
    evidence: ["narrow"],
  },
  // MYTHIC
  {
    id: "ath_olympic_medal",
    family: "athletics_performance",
    tier: "MYTHIC",
    label: "Olympic Silver/Bronze",
    description: "Olympic medalist (any color).",
    signals: [{ kind: "award", match: ["Olympic Silver", "Olympic Bronze", "Olympic Medal", "Olympic Medalist"] }],
    evidence: ["broad"],
  },
  {
    id: "ath_pro_starter",
    family: "athletics_performance",
    tier: "MYTHIC",
    label: "Pro starter (NBA/NFL/MLB/NHL)",
    description: "Active or retired starter in a major pro league.",
    signals: [{ kind: "company", match: [""], title: ["NBA Player", "NFL Player", "MLB Player", "NHL Player", "Professional Athlete"] }],
    evidence: ["broad"],
  },
  {
    id: "ath_met_opera_soloist",
    family: "athletics_performance",
    tier: "MYTHIC",
    label: "Met Opera / ABT soloist",
    description: "Soloist at the Metropolitan Opera or American Ballet Theatre.",
    signals: [
      { kind: "company", match: ["Metropolitan Opera", "American Ballet Theatre", "New York City Ballet"], title: ["Soloist", "Principal"] },
    ],
    evidence: ["narrow"],
  },
  // S
  {
    id: "ath_d1_athlete",
    family: "athletics_performance",
    tier: "S",
    label: "D1 athlete at major program",
    description: "Division I athlete in a Power 5 conference.",
    signals: [{ kind: "free_text", patterns: [/D1 athlete|NCAA Division I|Power 5|SEC|Big Ten|Big 12|ACC|Pac-12/i] }],
    evidence: ["broad"],
  },
  {
    id: "ath_juilliard_curtis",
    family: "athletics_performance",
    tier: "S",
    label: "Juilliard / Curtis / RAM graduate",
    description: "Graduate of a top-3 performing arts conservatory.",
    signals: [{ kind: "school", match: ["Juilliard", "Curtis Institute", "Royal Academy of Music", "Eastman School"] }],
    evidence: ["broad"],
  },
  {
    id: "ath_national_champion_amateur",
    family: "athletics_performance",
    tier: "S",
    label: "National champion (amateur / college)",
    description: "National championship in a competitive sport (NCAA, USA, etc.).",
    signals: [{ kind: "free_text", patterns: [/National Champion|NCAA Champion|US National Champion/i] }],
    evidence: ["broad"],
  },
  // A
  {
    id: "ath_pro_minor_league",
    family: "athletics_performance",
    tier: "A",
    label: "Pro athlete (minor / development league)",
    description: "Paid professional athlete below major-league level.",
    signals: [{ kind: "free_text", patterns: [/G League|Triple-A|minor league|developmental league/i] }],
    evidence: ["broad"],
  },
  // B
  {
    id: "ath_d3_d2_athlete",
    family: "athletics_performance",
    tier: "B",
    label: "D2 / D3 college athlete",
    description: "Lower-division college athlete.",
    signals: [{ kind: "free_text", patterns: [/D2 athlete|D3 athlete|NCAA Division II|NCAA Division III/i] }],
    evidence: ["large"],
  },
  // C
  {
    id: "ath_varsity_hs",
    family: "athletics_performance",
    tier: "C",
    label: "Varsity high school athlete (multi-year)",
    description: "Multi-year varsity letter winner.",
    signals: [{ kind: "free_text", patterns: [/varsity|team captain/i] }],
    evidence: ["very large"],
  },
  // D
  {
    id: "ath_hobbyist",
    family: "athletics_performance",
    tier: "D",
    label: "Recreational athlete / hobbyist",
    description: "Plays sports recreationally.",
    signals: [{ kind: "free_text", patterns: [/intramural|club sport|recreation/i] }],
    evidence: ["very large"],
  },
];

export const ATHLETICS_PERFORMANCE_CHAINS: Chain[] = [
  {
    id: "ath_chain_olympic_pro",
    name: "Olympic to Pro",
    family: "athletics_performance",
    requires: ["ath_olympic_medal", "ath_pro_starter"],
    bumpTo: "ASCENDED",
    description: "Olympic medalist + pro starter - career-defining athletic trajectory.",
  },
  {
    id: "ath_chain_conservatory_soloist",
    name: "Conservatory to Stage",
    family: "athletics_performance",
    requires: ["ath_juilliard_curtis", "ath_met_opera_soloist"],
    bumpTo: "ASCENDED",
    description: "Top conservatory + Met/ABT soloist - the classical apex.",
  },
  {
    id: "ath_chain_d1_pro",
    name: "D1 to Pro",
    family: "athletics_performance",
    requires: ["ath_d1_athlete", "ath_pro_minor_league"],
    bumpTo: "MYTHIC",
    description: "D1 athlete + pro contract - made it past college.",
  },
];
