// /dex/family/[family] - vertical tier ladder for one career family.
// ASCENDED → MYTHIC → S → A → B → C → D. Full achievement library +
// chain combos from src/data/achievements/{family}.ts.

import Link from "next/link";
import { notFound } from "next/navigation";
import { FAMILIES_META, familyBySlug } from "@/data/families";
import { libraryForFamily } from "@/data/achievements";
import { TierDistributionPie } from "@/components/dex/TierDistributionPie";
import { FamilyTile } from "@/components/dex/FamilyTile";
import { TierLadder } from "@/components/dex/TierLadder";
import { buildDexLadder } from "@/lib/dex-views";
import { buildDexSampleResults } from "@/lib/dex-sample-results";
import type { Tier } from "@/lib/types";

interface PageProps {
  params: Promise<{ family: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { family: slug } = await params;
  const meta = familyBySlug(slug);
  if (!meta) return { title: "Family not found" };
  return {
    title: `${meta.name} - Cracked Dex`,
    description: `${meta.motto} - what it takes to be ASCENDED through D in ${meta.name}.`,
  };
}

export default async function FamilyLadder({ params }: PageProps) {
  const { family: slug } = await params;
  const meta = familyBySlug(slug);
  if (!meta) notFound();

  const library = libraryForFamily(meta.key);
  const ladder = buildDexLadder(meta, library.achievements, library.chains);
  const sampleResultsByTier = buildDexSampleResults(
    meta,
    ladder.achievementsByTier,
    ladder.chainsByTier
  );

  // Synthetic distribution — replaced by real KV data once empirical distributions land.
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
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dex"
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink-soft hover:text-cherry transition mb-7"
        >
          ← all families
        </Link>

        {/* HERO PANEL */}
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
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="arcade-stamp text-[10px]" style={{ background: "var(--marigold)" }}>
                  {ladder.stats.achievements} achievements
                </span>
                <span className="arcade-stamp text-[10px]" style={{ background: "var(--cherry)", color: "var(--paper)" }}>
                  {ladder.stats.chains} chains
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <TierDistributionPie distribution={placeholderDistribution} />
            </div>
          </div>
          <div
            className="absolute left-0 right-0 bottom-0 h-2 animate-holo-pan"
            style={{
              background: `linear-gradient(90deg, ${meta.foil.primary}, ${meta.foil.secondary}, ${meta.foil.tertiary}, ${meta.foil.primary})`,
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        {/* TIER LADDER — full achievement + chain library */}
        <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-5">
          // THE LADDER · TOP TO BOTTOM //
        </div>
        <TierLadder ladder={ladder} sampleResultsByTier={sampleResultsByTier} />

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
