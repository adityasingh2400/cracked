// /preview/tiers — static test page rendering all 7 tiers via HoloCardV2.
//
// No encoded URLs, no API calls — sample CrackedResultV1 data is built
// directly in this file and passed to HoloCardV2. Lets us eyeball tier
// progression (D-1★ → ASCENDED) at a glance.

import { FAMILIES_ORDERED } from "@/data/families";
import { HoloCardV2 } from "@/components/HoloCardV2";
import type { CrackedResultV1, Tier, TierStars, Family } from "@/lib/types";

export const metadata = {
  title: "Tier Ladder · Cracked Design Preview",
};

interface TierSample {
  tier: Tier;
  stars?: TierStars;
  label: string;
  verdict: string;
  flavor: string;
  family: Family;
  name: string;
  speciality: string;
  cohortPercentile: number;
}

const TIER_SAMPLES: TierSample[] = [
  {
    tier: "ASCENDED",
    label: "ASCENDED",
    verdict: "ASCENDED in Engineering. The 0.001%. Lifetime-defining trajectory.",
    flavor: "Once a decade. Built different.",
    family: "engineering",
    name: "Demis Hassabis",
    speciality: "Frontier Lab CEO · Nobel-Adjacent",
    cohortPercentile: 99.99,
  },
  {
    tier: "MYTHIC",
    label: "MYTHIC",
    verdict: "MYTHIC in Science & Academia. The 0.1%. Career-defining dossier.",
    flavor: "The ceiling for most. The floor for them.",
    family: "science_academia",
    name: "Dr. Mara Okonkwo",
    speciality: "Fields-Medal Polymath",
    cohortPercentile: 99.8,
  },
  {
    tier: "S",
    stars: 3,
    label: "S-3★",
    verdict: "S-3 in Founder. Top shelf before MYTHIC.",
    flavor: "One clean push from myth.",
    family: "founder",
    name: "Julian Hayes",
    speciality: "Decacorn Cofounder · YC W18",
    cohortPercentile: 99.0,
  },
  {
    tier: "A",
    stars: 2,
    label: "A-2★",
    verdict: "A-2 in Finance. Strong institutional signal with room to compound.",
    flavor: "Compounding. Quietly.",
    family: "finance",
    name: "Victor Kim",
    speciality: "Goldman TMT VP · Wharton MBA",
    cohortPercentile: 93.0,
  },
  {
    tier: "B",
    stars: 2,
    label: "B-2★",
    verdict: "B-2 in Law & Public Service. Real signal, real trajectory.",
    flavor: "Climbing the docket.",
    family: "law_public_service",
    name: "R. Sterling",
    speciality: "BigLaw Senior Associate",
    cohortPercentile: 80.0,
  },
  {
    tier: "C",
    stars: 2,
    label: "C-2★",
    verdict: "C-2 in Athletics & Performance. The foundation is visible.",
    flavor: "The arc is just beginning.",
    family: "athletics_performance",
    name: "Elena Raya",
    speciality: "Div-1 Track · State Champion",
    cohortPercentile: 60.0,
  },
  {
    tier: "D",
    stars: 1,
    label: "D-1★",
    verdict: "D-1 in Creative & Audience. Early signal, still gathering receipts.",
    flavor: "Day one is the best day to start.",
    family: "creative_audience",
    name: "Omar Bey",
    speciality: "Indie Designer · Self-Taught",
    cohortPercentile: 25.0,
  },
];

function sampleResult(s: TierSample): CrackedResultV1 {
  return {
    id: `tier-${s.tier}-${s.stars ?? 0}`,
    name: s.name,
    tier: s.tier,
    tierStars: s.stars,
    signalScore: s.cohortPercentile,
    league: {
      league: "pro",
      leagueLabel: "23-26",
      leagueTier: s.tier,
      leagueTierStars: s.stars,
      percentile: Math.round(s.cohortPercentile),
      age: 25,
      ageSource: "user",
      ageConfidence: 1,
    },
    verdict: s.verdict,
    flavor: s.flavor,
    createdAt: new Date().toISOString(),
    modelUsed: "claude",
    primaryFamily: s.family,
    families: FAMILIES_ORDERED.map((f) => ({
      family: f,
      baseTier: f === s.family ? s.tier : "C",
      chainTier: f === s.family ? s.tier : "D",
      finalTier: f === s.family ? s.tier : "C",
      tierStars: f === s.family ? s.stars : 1,
      matched: [],
      activeChains: [],
    })),
    percentiles: {
      withinFamilyCohort: s.cohortPercentile,
      crossFamilyCohort: s.cohortPercentile - 1,
      global: s.cohortPercentile - 2,
    },
    speciality: s.speciality,
    scoringTier: "anthropic-api",
    chainsAll: [],
    achievementsAll: [],
  };
}

export default function TierLadderPage() {
  return (
    <div className="min-h-screen px-5 sm:px-8 py-14 pb-32" style={{ background: "#040206" }}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <div
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ fontFamily: "var(--font-plex-mono)", color: "#C5A24D" }}
          >
            HoloCardV2 · The Tier Ladder
          </div>
          <h1
            className="leading-[0.92]"
            style={{
              fontFamily: "var(--font-cinzel)",
              fontWeight: 900,
              fontSize: "clamp(48px, 7vw, 110px)",
              letterSpacing: "0.04em",
              background: "linear-gradient(165deg, #FFF1A8 0%, #E8C36A 30%, #D4AF37 55%, #FFE5A8 75%, #7A5C18 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 24px rgba(232,181,71,0.45)) drop-shadow(0 2px 0 rgba(60,30,0,0.8))",
              textTransform: "uppercase",
            }}
          >
            Seven Tiers
          </h1>
          <h2
            className="leading-[0.92] mt-1 italic"
            style={{
              fontFamily: "var(--font-pinyon)",
              fontSize: "clamp(34px, 4.6vw, 70px)",
              color: "#E8C36A",
              textShadow: "0 0 28px rgba(232,181,71,0.5)",
            }}
          >
            From Day One to Ascended.
          </h2>
          <p
            className="mt-7 max-w-2xl mx-auto text-[15px] italic leading-snug"
            style={{ fontFamily: "var(--font-cormorant)", color: "rgba(232,181,71,0.85)" }}
          >
            Tier progression rendered through HoloCardV2 — the same component shipping on
            /c/[data]. ASCENDED gets cosmic shimmer + max effects, MYTHIC layers a halo, S+
            keeps corner ornaments, and the lower tiers ramp down on sparkles, foil, and
            border weight. Hover to feel the foil. Click to flip.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] tracking-[0.25em] uppercase"
            style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(232,181,71,0.75)" }}>
            <a href="/preview" className="hover:text-amber-200 transition">← /preview index</a>
            <span style={{ color: "rgba(232,181,71,0.3)" }}>·</span>
            <a href="/preview/champions" className="hover:text-amber-200 transition">/preview/champions →</a>
          </div>
        </header>

        <div className="grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {TIER_SAMPLES.map((s) => (
            <div key={`${s.tier}-${s.stars ?? 0}`} className="flex flex-col items-center">
              <div
                className="text-[11px] tracking-[0.35em] uppercase mb-3"
                style={{
                  fontFamily: "var(--font-plex-mono)",
                  color: "#E8C36A",
                  textShadow: "0 0 8px rgba(232,181,71,0.5)",
                }}
              >
                {s.label}
              </div>
              <HoloCardV2 result={sampleResult(s)} />
            </div>
          ))}
        </div>

        <footer className="mt-24 text-center text-[11px] italic"
          style={{ fontFamily: "var(--font-cormorant)", color: "rgba(232,181,71,0.55)" }}>
          cracked · the tier ladder · vol. i
        </footer>
      </div>
    </div>
  );
}
