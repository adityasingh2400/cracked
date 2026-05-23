import Link from "next/link";
import { ARCHETYPES, type Archetype, type ArchetypeType } from "@/data/archetypes";
import { TYPES_META, TYPES_ORDERED } from "@/data/types-meta";
import { HoloTile } from "@/components/HoloTile";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import type { Tier } from "@/lib/types";

export const metadata = {
  title: "The Cracked Dex · A field guide to crackedness",
  description:
    "Nine elemental types, thirty-three archetypes, one defensible ranking of how cracked is possible.",
};

function archsForType(t: ArchetypeType): Archetype[] {
  return ARCHETYPES.filter((a) => a.types[0] === t).sort((a, b) => b.number - a.number);
}

function tierCounts(arr: Archetype[]): Record<Tier, number> {
  return {
    S: arr.filter((a) => a.tier === "S").length,
    A: arr.filter((a) => a.tier === "A").length,
    B: arr.filter((a) => a.tier === "B").length,
    C: arr.filter((a) => a.tier === "C").length,
    D: arr.filter((a) => a.tier === "D").length,
  };
}

export default function DexIndex() {
  const canon = ARCHETYPES.filter((a) => a.tier === "S").slice().reverse().slice(0, 6);

  return (
    <div className="px-5 sm:px-8 pt-12 pb-32">
      {/* HEADER */}
      <section className="max-w-5xl mx-auto text-center mb-16">
        <div className="arcade-stamp mb-6">
          ★ The Cracked Dex · Vol. I
        </div>
        <h1 className="font-display text-[56px] sm:text-[100px] leading-[0.9] tracking-tight text-ink">
          A{" "}
          <span
            className="inline-block px-3 -rotate-1 border-[3px] border-ink"
            style={{ background: "var(--marigold)", boxShadow: "5px 5px 0 var(--cherry)" }}
          >
            FIELD GUIDE
          </span>
          <br />
          TO <span className="text-arcade-holo inline-block">CRACKEDNESS</span>
        </h1>
        <p className="mt-7 max-w-2xl mx-auto text-[16px] sm:text-[18px] font-serif italic text-ink-soft text-balance leading-snug">
          Nine elemental types. {ARCHETYPES.length} archetypes. One defensible ranking of how cracked it&apos;s possible to be. Pick a type to drill in — or read straight through, least to most.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <span className="arcade-stamp">{TYPES_ORDERED.length} TYPES</span>
          <span className="arcade-stamp" style={{ background: "var(--marigold)" }}>{ARCHETYPES.length} ARCHETYPES</span>
          <span className="arcade-stamp" style={{ background: "var(--cherry)", color: "var(--paper)" }}>★ TIER RANKED</span>
        </div>
      </section>

      {/* THE 9 TYPES */}
      <section className="max-w-6xl mx-auto mb-24">
        <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-5">
          // THE {TYPES_ORDERED.length} ELEMENTAL TYPES //
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TYPES_ORDERED.map((t, i) => {
            const meta = TYPES_META[t];
            const arr = archsForType(t);
            return (
              <HoloTile
                key={t}
                href={`/dex/types/${meta.slug}`}
                foil={meta.foil}
                accent={meta.accent}
                glyph={meta.glyph}
                eyebrow={`TYPE · ${String(i + 1).padStart(2, "0")}`}
                title={meta.name}
                subtitle={meta.motto}
                body={meta.description.split(". ")[0] + "."}
                tiers={tierCounts(arr)}
                count={arr.length}
                aspect="card"
              />
            );
          })}
        </div>
      </section>

      {/* CANON */}
      <section className="max-w-6xl mx-auto mb-24">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              ★ S-TIER CANON
            </div>
            <h2 className="font-display text-[40px] text-ink leading-none">THE MYTHIC TIER</h2>
          </div>
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-ink-soft">
            {ARCHETYPES.filter((a) => a.tier === "S").length} entries · the names you hear at dinners
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canon.map((a) => (
            <ArchetypeMini key={a.slug} archetype={a} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="#all"
            className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink hover:text-cherry transition"
          >
            see all {ARCHETYPES.length} below ↓
          </Link>
        </div>
      </section>

      {/* ALL ARCHETYPES — LINEAR INDEX */}
      <section id="all" className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6 pb-4 border-b-2 border-ink/15 flex-wrap gap-3">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              // THE LINEAR INDEX //
            </div>
            <h2 className="font-display text-[36px] text-ink leading-none">
              ALL {ARCHETYPES.length}, ASCENDING
            </h2>
          </div>
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-ink-soft">
            #001 → #{String(ARCHETYPES.length).padStart(3, "0")} · least to most cracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHETYPES.map((a) => (
            <ArchetypeMini key={a.slug} archetype={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
