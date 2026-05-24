// /dex/family/[family] — vertical tier ladder for one career family.
// ASCENDED → MYTHIC → S → A → B → C → D. Sunset Arcade chrome around the
// existing data layer: chunky cherry shadows, arcade tier stamps, foil-
// edged hero panel with the family glyph.

import Link from "next/link";
import { notFound } from "next/navigation";
import { FAMILIES_META, familyBySlug } from "@/data/families";
import { TierBadge } from "@/components/card/TierBadge";
import { TierDistributionPie } from "@/components/dex/TierDistributionPie";
import { FamilyTile } from "@/components/dex/FamilyTile";
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

// Per-tier accent colors for the arcade tier stamp. ASCENDED/MYTHIC use the
// premium gradient treatments; S/A/B grade down the warm spectrum; C/D fade
// toward ink so the visual hierarchy mirrors the rarity hierarchy.
const TIER_ACCENT: Record<Tier, { bg: string; color: string }> = {
  ASCENDED: { bg: "linear-gradient(135deg, #FFE5A8 0%, #E8B547 50%, #B98A2E 100%)", color: "#3C1F15" },
  MYTHIC:   { bg: "linear-gradient(135deg, #FF6B5C 0%, #FFC53D 100%)", color: "#3C1F15" },
  S:        { bg: "#FF6B5C", color: "#FFFAF2" },
  A:        { bg: "#FFA532", color: "#3C1F15" },
  B:        { bg: "#FFC53D", color: "#3C1F15" },
  C:        { bg: "#9C7560", color: "#FFFAF2" },
  D:        { bg: "#6E3F2E", color: "#FFFAF2" },
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

  const adjacent = meta.adjacent.map((k) => FAMILIES_META[k]).filter(Boolean);

  return (
    <div className="px-5 sm:px-8 pt-10 sm:pt-14 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dex"
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink-soft hover:text-cherry transition mb-7"
        >
          ← all families
        </Link>

        {/* HERO PANEL — chunky arcade card with foil edge */}
        <div
          className="relative rounded-3xl border-[3px] border-ink overflow-hidden mb-12"
          style={{
            background: `linear-gradient(160deg, var(--cream) 0%, ${withAlpha(meta.accent, 0.20)} 100%)`,
            boxShadow: "8px 8px 0 var(--ink)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-6 p-6 sm:p-8">
            <div
              className="font-display leading-none shrink-0"
              style={{
                fontSize: "84px",
                color: meta.accent,
                textShadow: "4px 4px 0 var(--ink)",
              }}
            >
              {meta.glyph}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="arcade-stamp mb-3"
                style={{ background: meta.accent, color: "var(--paper)" }}
              >
                {meta.shortName} · CRACKED DEX
              </div>
              <h1 className="font-display text-[44px] sm:text-[64px] text-ink leading-[0.9]">
                {meta.name.toUpperCase()}
              </h1>
              <p className="font-serif italic text-[17px] text-ink-soft mt-2">
                {meta.motto}
              </p>
              <p className="text-[15px] text-ink mt-4 leading-relaxed">
                {meta.description}
              </p>
            </div>
            <div className="shrink-0">
              <TierDistributionPie distribution={placeholderDistribution} />
            </div>
          </div>
          {/* Foil strip */}
          <div
            className="absolute left-0 right-0 bottom-0 h-2 animate-holo-pan"
            style={{
              background: `linear-gradient(90deg, ${meta.foil.primary}, ${meta.foil.secondary}, ${meta.foil.tertiary}, ${meta.foil.primary})`,
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        {/* TIER LADDER */}
        <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-5">
          // THE LADDER · TOP TO BOTTOM //
        </div>
        <div className="flex flex-col gap-5">
          {TIER_ORDER.map((tier, i) => (
            <TierRow
              key={tier}
              tier={tier}
              description={TIER_DESCRIPTIONS[tier]}
              accent={TIER_ACCENT[tier]}
              rotate={i % 2 === 0 ? -0.4 : 0.5}
            />
          ))}
        </div>

        {adjacent.length > 0 && (
          <div className="mt-16">
            <div className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-cherry-deep mb-5">
              // ADJACENT FAMILIES //
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {adjacent.map((a) => (
                <FamilyTile key={a.key} meta={a} />
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
  accent,
  rotate,
}: {
  tier: Tier;
  description: string;
  accent: { bg: string; color: string };
  rotate: number;
}) {
  return (
    <section
      className="flex items-start gap-5 rounded-2xl p-5 border-[3px] border-ink"
      data-tier-row={tier}
      style={{
        background: "var(--cream)",
        boxShadow: "5px 5px 0 var(--ink)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div
          className="rounded-xl border-[3px] border-ink grid place-items-center font-display leading-none"
          style={{
            width: 72,
            height: 72,
            background: accent.bg,
            color: accent.color,
            boxShadow: "3px 3px 0 var(--ink)",
            fontSize: tier === "ASCENDED" ? 14 : tier === "MYTHIC" ? 16 : 32,
            letterSpacing: tier === "ASCENDED" || tier === "MYTHIC" ? "0.05em" : "0",
            textAlign: "center",
            padding: tier === "ASCENDED" || tier === "MYTHIC" ? "4px 6px" : 0,
          }}
        >
          {tier}
        </div>
        {/* TierBadge from V1 — used for component-library parity (kept lightweight). */}
        <div className="hidden sm:block opacity-0">
          <TierBadge tier={tier} size="sm" />
        </div>
      </div>
      <div className="flex-1 pt-1">
        <div className="font-serif italic text-[15px] text-ink-soft leading-snug mb-3">
          {description}
        </div>
        <div className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink-fade">
          achievement library generating · check back during launch week
        </div>
      </div>
    </section>
  );
}

function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
