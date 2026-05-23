// /dex — the v1.0 family grid. 9 tiles, each linking to its family ladder.
// Replaces the v0.7 22-types grid + 196-archetype index.

import Link from "next/link";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";

export const metadata = {
  title: "The Cracked Dex — 9 families, 7 tiers",
  description:
    "What does it take to be S-tier in Engineering? Or ASCENDED in Founder? The cracked field guide for ambition.",
};

export default function DexIndex() {
  return (
    <div className="px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-4">
            THE CRACKED DEX · A FIELD GUIDE
          </div>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl text-white">
            Nine <span className="text-amber-foil">families</span>.
            <br />
            Seven <span className="text-amber-foil">tiers</span>.
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-white/65 leading-relaxed">
            Click into a family. See exactly what it takes to land each tier —
            from D to ASCENDED — with named achievements and the chains that
            bump them higher.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FAMILIES_ORDERED.map((f) => {
            const meta = FAMILIES_META[f];
            return (
              <Link
                key={f}
                href={`/dex/family/${meta.slug}`}
                className="group relative rounded-xl border bg-white/[0.02] p-6 hover:border-white/30 transition-all"
                style={{
                  borderColor: `${meta.accent}33`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="text-3xl leading-none"
                    style={{ color: meta.accent }}
                    aria-hidden
                  >
                    {meta.glyph}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/45">
                    {meta.shortName}
                  </div>
                </div>
                <h3 className="font-display text-2xl text-white mb-1">
                  {meta.name}
                </h3>
                <p className="text-xs italic text-white/55 mb-3">{meta.motto}</p>
                <p className="text-sm text-white/70 leading-snug line-clamp-3">
                  {meta.description}
                </p>
                <div
                  className="absolute inset-x-0 bottom-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${meta.accent} 50%, transparent 100%)`,
                    opacity: 0.6,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
