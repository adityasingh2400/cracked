// /dex — the v1.0 family grid. 9 tiles, each linking to its family ladder.
// Arcade chrome: holo-foil family cards with chunky ink shadows.

import Link from "next/link";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";
import { FamilyTile } from "@/components/dex/FamilyTile";

export const metadata = {
  title: "The Cracked Dex — 9 families, 7 tiers",
  description:
    "What does it take to be S-tier in Engineering? Or ASCENDED in Founder? The cracked field guide for ambition.",
};

export default function DexIndex() {
  return (
    <div className="px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="arcade-stamp mb-6">★ The Cracked Dex · A Field Guide</div>
          <h1 className="font-display text-[56px] sm:text-[88px] leading-[0.9] tracking-tight text-ink">
            NINE{" "}
            <span
              className="inline-block px-3 -rotate-1 border-[3px] border-ink"
              style={{ background: "var(--marigold)", boxShadow: "5px 5px 0 var(--cherry)" }}
            >
              FAMILIES
            </span>
            <br />
            SEVEN <span className="text-arcade-holo inline-block">TIERS</span>
          </h1>
          <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[18px] font-serif italic text-ink-soft text-balance leading-snug">
            Click into a family. See exactly what it takes to land each tier —
            from D to <span className="not-italic font-bold text-arcade-holo">ASCENDED</span> —
            with named achievements and the chains that bump them higher.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <span className="arcade-stamp">9 FAMILIES</span>
            <span className="arcade-stamp" style={{ background: "var(--marigold)" }}>7 TIERS</span>
            <span className="arcade-stamp" style={{ background: "var(--cherry)", color: "var(--paper)" }}>★ ACHIEVEMENT-NATIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FAMILIES_ORDERED.map((f) => (
            <FamilyTile key={f} meta={FAMILIES_META[f]} />
          ))}
        </div>
      </div>
    </div>
  );
}
