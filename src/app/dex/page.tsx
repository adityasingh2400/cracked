import Link from "next/link";
import { ARCHETYPES, type Archetype, type ArchetypeType } from "@/data/archetypes";
import { TYPES_META, TYPES_ORDERED } from "@/data/types-meta";
import { HoloTile } from "@/components/HoloTile";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import type { Tier } from "@/lib/types";

export const metadata = {
  title: "The Cracked Dex · A field guide to crackedness",
  description:
    "Twenty-two elemental types, two hundred archetypes, one defensible ranking of how cracked is possible.",
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
  // featured S-tier archetypes for the "canon" strip
  const canon = ARCHETYPES.filter((a) => a.tier === "S")
    .slice()
    .reverse()
    .slice(0, 6);

  return (
    <div className="px-5 sm:px-8 pt-16 pb-32">
      {/* HEADER */}
      <section className="max-w-5xl mx-auto text-center mb-16">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-5">
          The Cracked Dex · Vol. I
        </div>
        <h1 className="font-display font-semibold text-[64px] sm:text-[112px] leading-[0.93] tracking-tight text-white">
          A <span className="text-foil">field guide</span><br />to crackedness
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-[16px] sm:text-[17px] text-white/65 text-balance leading-relaxed">
          Twenty-two elemental types. Nearly two hundred archetypes. One
          defensible ranking of how cracked it's possible to be. Pick a type to
          drill in — or read straight through, least to most.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
          <span>{TYPES_ORDERED.length} types</span>
          <span className="text-gold/60">·</span>
          <span>{ARCHETYPES.length} archetypes</span>
          <span className="text-gold/60">·</span>
          <span>tier ranked</span>
        </div>
      </section>

      {/* THE 7 TYPES */}
      <section className="max-w-6xl mx-auto mb-24">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-5">
          The twenty-two types
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
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
              S-tier canon
            </div>
            <h2 className="mt-2 font-display text-3xl text-white">The mythic tier</h2>
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
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
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition"
          >
            see all {ARCHETYPES.length} below ↓
          </Link>
        </div>
      </section>

      {/* ALL ARCHETYPES — LINEAR INDEX */}
      <section id="all" className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-5 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">
              the linear index
            </div>
            <h2 className="mt-2 font-display text-3xl text-white">All {ARCHETYPES.length}, ascending</h2>
          </div>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
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
