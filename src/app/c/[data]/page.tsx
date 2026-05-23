// /c/[data] — the v1.0 share card view route.
//
// Decodes the share blob (gzip+base64 from src/lib/encode.ts), renders
// the v1.0 card composition: FamilyBadge + TierBadge + PercentileTrio +
// ChainBanner + SubStatRow + MissingAchievements. Backwards-compatible
// with v0.7 share URLs (which lack family/percentiles — defaults applied).
//
// OG metadata points to /api/og/[data] which renders the same data as
// a StaticCard PNG for Twitter/X/iMessage previews.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShareBar } from "@/components/ShareBar";
import { decodeResult } from "@/lib/encode";
import { getLeague } from "@/data/leagues";
import { FAMILIES_META } from "@/data/families";
import { HoloCardV1 } from "@/components/HoloCardV1";
import { CeremonyReveal } from "@/components/card/CeremonyReveal";
import { formatTier } from "@/lib/types";
import type { Metadata } from "next";
import type { CrackedResultV1, Family, PercentileTrio as Trio } from "@/lib/types";

interface PageProps {
  params: Promise<{ data: string }>;
}

const DEFAULT_FAMILY: Family = "engineering";
const DEFAULT_TRIO: Trio = {
  withinFamilyCohort: 50,
  crossFamilyCohort: 50,
  global: 50,
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const result = decodeResult(data) as CrackedResultV1 | null;
  if (!result) return { title: "Cracked · result not found" };

  const family = result.primaryFamily ?? DEFAULT_FAMILY;
  const familyName = FAMILIES_META[family]?.name ?? "Cracked";
  const cohortLabel = result.league ? getLeague(result.league.league).label : "";
  const pct = result.percentiles?.withinFamilyCohort ?? 50;
  const topPct = (100 - pct).toFixed(1);

  const tierLabel = formatTier(result.tier, result.tierStars);
  const title = `${result.name} is ${tierLabel} in ${familyName}`;
  const description = `${result.name} — top ${topPct}% of ${cohortLabel || "their cohort"} in ${familyName}. How cracked are you?`;

  return {
    title: `${title} · Cracked`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/og/${data}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${data}`],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { data } = await params;
  const result = decodeResult(data) as CrackedResultV1 | null;
  if (!result) notFound();

  const family: Family = result.primaryFamily ?? DEFAULT_FAMILY;
  const secondary: Family | undefined = result.secondaryFamily;
  const familyMeta = FAMILIES_META[family];
  const percentiles: Trio = result.percentiles ?? DEFAULT_TRIO;
  const cohortLabel = result.league ? getLeague(result.league.league).label : "all cohorts";
  const headlineChain = result.families?.find((f) => f.family === family)?.activeChains[0];

  return (
    <div className="px-5 sm:px-8 pt-12 pb-16">
      {/* HOLO CARD — Pokemon-TCG-grade v1.0 composition */}
      <section className="max-w-xl mx-auto">
        <CeremonyReveal tier={result.tier}>
          <HoloCardV1 result={result} />
        </CeremonyReveal>

        {/* Verdict / flavor — outside the card so they don't compete with the holo */}
        {(result.verdict || result.flavor) && (
          <div className="mt-6 text-center max-w-md mx-auto">
            {result.verdict && (
              <p className="text-sm text-white/80 italic leading-relaxed">
                "{result.verdict}"
              </p>
            )}
            {result.flavor && (
              <p className="mt-2 font-display italic text-amber-foil/70">
                {result.flavor}
              </p>
            )}
          </div>
        )}

        {result.calibrating && (
          <div className="mt-4 text-center">
            <span className="px-3 py-1 rounded-md bg-amber-foil/15 text-amber-foil font-mono text-[10px] tracking-[0.15em] uppercase">
              calibrating · re-score when claude reconnects
            </span>
          </div>
        )}
      </section>

      {/* SHARE */}
      <section className="mt-8 max-w-2xl mx-auto">
        <ShareBar result={result} />
      </section>

      {/* LEAGUE EXPLAINER */}
      {result.league && (
        <section className="mt-12 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80 mb-2">
              Two grades, one you.
            </div>
            <p className="text-[14px] text-white/70 leading-relaxed">
              You landed{" "}
              <span className="text-white font-medium">tier {formatTier(result.tier, result.tierStars)}</span> in{" "}
              <span className="text-white">{familyMeta.name}</span>. At{" "}
              <span className="text-white">{getLeague(result.league.league).label}</span>{" "}
              you're more cracked than{" "}
              <span className="text-amber-foil font-medium">
                {percentiles.withinFamilyCohort.toFixed(1)}%
              </span>{" "}
              of your cohort in {familyMeta.shortName}. Older cohorts aren't more cracked,
              they've just had more time to stack signals — so the bar moves with you.{" "}
              {result.league.ageSource === "inferred" && (
                <>
                  Age was inferred as <span className="text-white">{result.league.age}</span>.
                  Click the age pill on the card to correct it.
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-20 max-w-2xl mx-auto text-center">
        <div className="font-display italic text-white/55 mb-4">
          Built for screenshotting and arguing about.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-3 rounded-md bg-gradient-to-br from-amber-foil to-foil-pink text-black font-mono text-[12px] tracking-[0.18em] uppercase hover:brightness-110 transition"
          >
            Crack someone else
          </Link>
          <Link
            href={`/dex/family/${familyMeta.slug}`}
            className="px-5 py-3 rounded-md border border-white/15 text-white/85 font-mono text-[12px] tracking-[0.18em] uppercase hover:border-amber-foil/40 hover:text-amber-foil transition"
          >
            What gets you to {nextTierLabel(result.tier)}?
          </Link>
          <Link
            href="/leaderboard"
            className="px-5 py-3 rounded-md border border-white/15 text-white/85 font-mono text-[12px] tracking-[0.18em] uppercase hover:border-amber-foil/40 hover:text-amber-foil transition"
          >
            Leaderboard
          </Link>
        </div>
      </section>
    </div>
  );
}

function nextTierLabel(t: string): string {
  switch (t) {
    case "ASCENDED": return "the next legend";
    case "MYTHIC": return "ASCENDED";
    case "S": return "MYTHIC";
    case "A": return "S";
    case "B": return "A";
    case "C": return "B";
    default: return "C";
  }
}
