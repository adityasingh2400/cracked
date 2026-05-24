// /preview/champions — design regression preview for HoloCardV2.
//
// Renders the production HoloCardV2 with mock CrackedResultV1 data, one per
// family at S-3★ champion tier. Lets us eyeball all 9 family aesthetics
// side-by-side without needing real share blobs. This is the canonical
// "what does our top card look like" page.

import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";
import { HoloCardV2 } from "@/components/HoloCardV2";
import type { CrackedResultV1, Family } from "@/lib/types";

export const metadata = {
  title: "Champion Cabinet · Cracked Design Preview",
};

// Sample champions per family — used purely for the regression preview.
const SAMPLES: Record<Family, { name: string; speciality: string; verdict: string; flavor: string; serial: string }> = {
  engineering: {
    name: "Alex Chen",
    speciality: "Frontier Lab Cofounder",
    verdict: "Built it. Shipped it. Open-sourced the proof.",
    flavor: "the cathedral builds itself.",
    serial: "ENG-0218",
  },
  science_academia: {
    name: "Dr. Mara Okonkwo",
    speciality: "Fields-Medal Polymath",
    verdict: "Citations stretch across the discipline like a constellation.",
    flavor: "cited by the citers.",
    serial: "ACA-0214",
  },
  founder: {
    name: "Julian Hayes",
    speciality: "Decacorn Cofounder · YC W18",
    verdict: "Three exits. Two unicorns. One reputation that opens any term sheet.",
    flavor: "the market clears at his price.",
    serial: "FND-0210",
  },
  finance: {
    name: "Victor Kim",
    speciality: "Quant Fund CIO",
    verdict: "Made the right call when nobody else would touch it.",
    flavor: "bps compound. quietly.",
    serial: "FIN-0207",
  },
  consulting_corporate: {
    name: "Amara Obi",
    speciality: "Fortune 50 COO · Wharton MBA",
    verdict: "Frames the room before the room knows what to think.",
    flavor: "the deck wins the meeting.",
    serial: "CON-0198",
  },
  law_public_service: {
    name: "Hon. R. Sterling",
    speciality: "Chief Justice · Yale Law",
    verdict: "Wrote the opinion the dissent will cite for forty years.",
    flavor: "stare decisis, signed in red wax.",
    serial: "LAW-0212",
  },
  medicine: {
    name: "Dr. Sarah Nguyen, MD PhD",
    speciality: "Hopkins Neurosurg Chair · NIH R01",
    verdict: "Saved the case the textbook said was unsalvageable.",
    flavor: "the scalpel never blinks.",
    serial: "MED-0193",
  },
  athletics_performance: {
    name: "Elena Raya",
    speciality: "Olympic Gold · World Record Holder",
    verdict: "Crossed the line before the timer realized it was over.",
    flavor: "the medal hits the chest with a click.",
    serial: "ATH-0216",
  },
  creative_audience: {
    name: "Omar Bey",
    speciality: "Cultural Architect · Off-White Alumni",
    verdict: "Invented the category three years before the rest noticed.",
    flavor: "the audience is the medium.",
    serial: "CRE-0205",
  },
};

function sampleResult(family: Family): CrackedResultV1 {
  const s = SAMPLES[family];
  return {
    id: s.serial,
    name: s.name,
    tier: "S",
    tierStars: 3,
    signalScore: 95,
    league: {
      league: "pro",
      leagueLabel: "23-26",
      leagueTier: "S",
      leagueTierStars: 3,
      percentile: 99,
      age: 25,
      ageSource: "user",
      ageConfidence: 1,
    },
    verdict: s.verdict,
    flavor: s.flavor,
    createdAt: new Date().toISOString(),
    modelUsed: "claude",
    primaryFamily: family,
    families: FAMILIES_ORDERED.map((f) => ({
      family: f,
      baseTier: f === family ? "S" : "B",
      chainTier: f === family ? "S" : "C",
      finalTier: f === family ? "S" : "B",
      tierStars: f === family ? 3 : 2,
      matched: [],
      activeChains: [],
    })),
    percentiles: {
      withinFamilyCohort: 99.4,
      crossFamilyCohort: 98.8,
      global: 99.1,
    },
    speciality: s.speciality,
    scoringTier: "anthropic-api",
    chainsAll: [],
    achievementsAll: [],
  };
}

export default function ChampionPreviewPage() {
  return (
    <div className="min-h-screen px-5 sm:px-8 py-14 pb-32" style={{ background: "#040206" }}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <div
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ fontFamily: "var(--font-plex-mono)", color: "#C5A24D" }}
          >
            HoloCardV2 · S-3★ regression
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
            Champion Cabinet
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
            Nine Families. Nine Apex.
          </h2>
          <p
            className="mt-7 max-w-2xl mx-auto text-[15px] italic leading-snug"
            style={{ fontFamily: "var(--font-cormorant)", color: "rgba(232,181,71,0.85)" }}
          >
            Each card is the S-3★ champion of its career family, rendered through the same
            HoloCardV2 component that ships on /c/[data]. Hover to feel the foil. Click any
            card to flip and see the dossier on the back.
          </p>
        </header>

        <div className="grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIES_ORDERED.map((f) => (
            <HoloCardV2 key={f} result={sampleResult(f)} />
          ))}
        </div>

        <footer className="mt-24 text-center">
          <div
            className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] tracking-[0.25em] uppercase"
            style={{ fontFamily: "var(--font-plex-mono)", color: "rgba(232,181,71,0.45)" }}
          >
            {FAMILIES_ORDERED.map((f) => {
              const m = FAMILIES_META[f];
              return (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <span style={{ color: m.accent, fontSize: 14 }}>{m.glyph}</span>
                  <span style={{ color: m.accent }}>{m.shortName}</span>
                </span>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}
