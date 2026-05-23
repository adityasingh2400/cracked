// /dex/family/[family] — vertical tier ladder for one career family.
// ASCENDED → MYTHIC → S → A → B → C → D. Achievement chips + Chain combos
// per tier. Pie chart of tier distribution. "You are here" overlay for
// visitors with a saved card.

import Link from "next/link";
import { notFound } from "next/navigation";
import { FAMILIES_META, familyBySlug, FAMILIES_ORDERED } from "@/data/families";
import { TierBadge } from "@/components/card/TierBadge";
import { TierDistributionPie } from "@/components/dex/TierDistributionPie";
import type { Tier } from "@/lib/types";

const TIER_ORDER: Tier[] = ["ASCENDED", "MYTHIC", "S", "A", "B", "C", "D"];

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  ASCENDED:
    "the 0.001%. lifetime-defining stuff. Nobel Peace Prize. Unicorn founder ($1B+). NBA Champion. MacArthur Fellow. SCOTUS Justice. Capped at ~5-15 per family.",
  MYTHIC:
    "the 0.1%. unmistakable career-defining. IMO Gold. YC Series B+. SCOTUS clerk. Marshall Scholar. Olympic medalist. Pulitzer. Sloan Research Fellow. Top of LinkedIn-respectable.",
  S: "the 1%. obviously cracked. Stanford + FAANG L5+. NeurIPS first-author. Goldman TMT analyst. McKinsey partner-track. BigLaw partner. Forbes 30U30.",
  A: "the climbers' ceiling. Top 5-10%. Recognized institutional credentials with multiple S-adjacent moves.",
  B: "the climbers. Top 10-20%. Stacked dossier, on the way up.",
  C: "the believers. Real signal, on the way up. Top 30-50%.",
  D: "the long tail. Signals haven't shown up yet. Day one is the best day to start.",
};

interface PageProps {
  params: Promise<{ family: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { family: slug } = await params;
  const meta = familyBySlug(slug);
  if (!meta) return { title: "Family not found" };
  return {
    title: `${meta.name} — Cracked Dex`,
    description: `${meta.motto} — what it takes to be ASCENDED through D in ${meta.name}.`,
  };
}

export default async function FamilyLadder({ params }: PageProps) {
  const { family: slug } = await params;
  const meta = familyBySlug(slug);
  if (!meta) notFound();

  // Placeholder synthetic distribution — replaced by real KV data once
  // T-API's empirical distributions land.
  const placeholderDistribution: Record<Tier, number> = {
    ASCENDED: 0.001,
    MYTHIC: 0.1,
    S: 1.0,
    A: 4,
    B: 15,
    C: 30,
    D: 49.899,
  };

  // Adjacent family links from FAMILIES_META.
  const adjacent = meta.adjacent
    .map((k) => FAMILIES_META[k])
    .filter(Boolean);

  return (
    <div className="px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dex"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition mb-6"
        >
          ← all families
        </Link>

        <div
          className="flex items-start gap-6 mb-12 p-6 rounded-xl border"
          style={{
            background: `${meta.accent}0A`,
            borderColor: `${meta.accent}40`,
          }}
        >
          <div className="text-6xl" style={{ color: meta.accent }} aria-hidden>
            {meta.glyph}
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/45">
              {meta.shortName} · CRACKED DEX
            </div>
            <h1 className="font-display text-5xl text-white mt-1">
              {meta.name}
            </h1>
            <p className="font-mono text-sm italic text-white/65 mt-2">
              {meta.motto}
            </p>
            <p className="text-base text-white/80 mt-4 leading-relaxed">
              {meta.description}
            </p>
          </div>
          <TierDistributionPie distribution={placeholderDistribution} />
        </div>

        <div className="flex flex-col gap-8">
          {TIER_ORDER.map((tier) => (
            <TierRow
              key={tier}
              tier={tier}
              description={TIER_DESCRIPTIONS[tier]}
              familySlug={meta.slug}
            />
          ))}
        </div>

        {adjacent.length > 0 && (
          <div className="mt-16">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/45 mb-4">
              adjacent families
            </div>
            <div className="flex flex-wrap gap-3">
              {adjacent.map((a) => (
                <Link
                  key={a.key}
                  href={`/dex/family/${a.slug}`}
                  className="px-3 py-1.5 rounded-md border border-white/15 text-sm text-white/75 hover:border-white/40 transition"
                  style={{ borderColor: `${a.accent}40` }}
                >
                  <span style={{ color: a.accent }}>{a.glyph}</span>{" "}
                  {a.shortName}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TierRow({
  tier,
  description,
  familySlug,
}: {
  tier: Tier;
  description: string;
  familySlug: string;
}) {
  // Achievement chips are populated by the data layer once T4 lands.
  // Until then, the row renders empty with a placeholder message.
  const placeholderChips: string[] = [];

  return (
    <section
      className="flex items-start gap-6"
      data-tier-row={tier}
    >
      <div className="shrink-0">
        <TierBadge tier={tier} size="sm" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-white/65 italic mb-3">{description}</div>
        {placeholderChips.length === 0 ? (
          <div className="font-mono text-[11px] tracking-wider text-white/35">
            achievement library generating · check back during launch week
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {placeholderChips.map((chip) => (
              <span
                key={chip}
                className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs text-white/85"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
