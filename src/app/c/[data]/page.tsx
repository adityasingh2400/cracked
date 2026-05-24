// /c/[data] — the v1.0 share card view route.
//
// Decodes the share blob (gzip+base64 from src/lib/encode.ts) and renders the
// HoloCardV1 composition wrapped in CeremonyReveal. The card itself stays
// glossy + dark (a trading card is a trading card); the page chrome around
// it is Sunset Arcade — cherry hard shadows, marigold stamps, arcade CTAs.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShareBar } from "@/components/ShareBar";
import { decodeResult } from "@/lib/encode";
import { getLeague } from "@/data/leagues";
import { FAMILIES_META } from "@/data/families";
import { HoloCardV2 } from "@/components/HoloCardV2";
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
  const familyMeta = FAMILIES_META[family];
  const percentiles: Trio = result.percentiles ?? DEFAULT_TRIO;

  return (
    <div className="px-5 sm:px-8 pt-10 pb-16">
      {/* HOLO CARD — Pokemon-TCG-grade v1.0 composition */}
      <section className="max-w-xl mx-auto arcade-no-confetti">
        <CeremonyReveal tier={result.tier}>
          <HoloCardV2 result={result} />
        </CeremonyReveal>

        {/* Verdict + flavor — arcade card outside the holo so they don't compete */}
        {(result.verdict || result.flavor) && (
          <div
            className="mt-7 max-w-md mx-auto rounded-2xl border-[3px] border-ink bg-cream p-5 text-center"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            {result.verdict && (
              <p className="font-serif italic text-[15px] text-ink leading-relaxed">
                &ldquo;{result.verdict}&rdquo;
              </p>
            )}
            {result.flavor && (
              <p className="mt-3 font-display text-[14px] text-cherry-deep tracking-[0.02em]">
                {result.flavor}
              </p>
            )}
          </div>
        )}

        {result.calibrating && (
          <div className="mt-4 text-center">
            <span
              className="font-mono text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full bg-marigold text-ink border-2 border-ink"
              style={{ boxShadow: "2px 2px 0 var(--ink)" }}
            >
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
        <section className="mt-14 max-w-2xl mx-auto">
          <div
            className="rounded-2xl border-[3px] border-ink bg-cream p-5 sm:p-6"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              // TWO GRADES, ONE YOU //
            </div>
            <p className="text-[15px] text-ink leading-relaxed">
              You landed tier{" "}
              <span className="font-display text-[15px] text-cherry">
                {formatTier(result.tier, result.tierStars)}
              </span>{" "}
              in <span className="font-bold">{familyMeta.name}</span>. At{" "}
              <span className="font-bold">{getLeague(result.league.league).label}</span> you&apos;re more cracked than{" "}
              <span className="font-display text-arcade-holo">
                {percentiles.withinFamilyCohort.toFixed(1)}%
              </span>{" "}
              of your cohort in {familyMeta.shortName}. Older cohorts aren&apos;t more cracked, they&apos;ve just had more time to stack signals — so the bar moves with you.{" "}
              {result.league.ageSource === "inferred" && (
                <>
                  Age was inferred as <span className="font-bold">{result.league.age}</span>. Click the age pill on the card to correct it.
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* CTA — arcade button trio */}
      <section className="mt-20 max-w-2xl mx-auto text-center">
        <div className="font-serif italic text-ink-soft mb-5 text-[17px]">
          Built for screenshotting and arguing about.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-6 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[13px] leading-none transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            CRACK SOMEONE ELSE →
          </Link>
          <Link
            href={`/dex/family/${familyMeta.slug}`}
            className="px-6 py-3 rounded-full border-[3px] border-ink bg-cream text-ink font-display text-[13px] leading-none transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            {nextTierLabel(result.tier)}
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-3 rounded-full border-[3px] border-ink bg-marigold text-ink font-display text-[13px] leading-none transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            LEADERBOARD →
          </Link>
        </div>
      </section>
    </div>
  );
}

function nextTierLabel(t: string): string {
  switch (t) {
    case "ASCENDED": return "WHAT IS LEFT?";
    case "MYTHIC":   return "REACH ASCENDED →";
    case "S":        return "REACH MYTHIC →";
    case "A":        return "REACH S →";
    case "B":        return "REACH A →";
    case "C":        return "REACH B →";
    default:         return "REACH C →";
  }
}
