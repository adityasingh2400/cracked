import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";
import type { Tier } from "@/lib/types";

export const metadata = {
  title: "The Cracked Dex · A field guide to crackedness",
  description:
    "54 archetypes of cracked. Ranked ascending. Every entry has examples and a defensible justification.",
};

const tierOrder: Record<Tier, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };

export default function DexIndex() {
  // Group by tier for the banded layout
  const tiers: Tier[] = ["S", "A", "B", "C", "D"];

  return (
    <div className="px-5 sm:px-8 pt-16 pb-24">
      {/* HEADER */}
      <section className="max-w-5xl mx-auto text-center mb-14">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-5">
          The Cracked Dex · vol. I
        </div>
        <h1 className="font-display font-semibold text-[64px] sm:text-[88px] leading-[0.95] tracking-tight text-white">
          A <span className="text-foil">field guide</span><br/>to crackedness
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-[16px] text-white/65 text-balance leading-relaxed">
          Fifty-four archetypes, ranked from least to most cracked. Every entry has a
          tagline, a profile, real examples, and a defensible justification. Read it like
          a book or argue with it like a list — both are correct.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-white/45">
          <span>read order</span>
          <span className="text-gold">↓</span>
          <span>least → most cracked</span>
        </div>
      </section>

      {/* TIER BANDS */}
      <section className="max-w-6xl mx-auto space-y-16">
        {tiers
          .slice()
          .reverse()
          .map((tier) => {
            const inTier = ARCHETYPES.filter((a) => a.tier === tier);
            if (inTier.length === 0) return null;
            return (
              <div key={tier}>
                <TierHeader tier={tier} count={inTier.length} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inTier.map((a) => (
                    <DexCard key={a.slug} a={a} />
                  ))}
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}

function TierHeader({ tier, count }: { tier: Tier; count: number }) {
  const conf: Record<Tier, { label: string; color: string }> = {
    S: { label: "S · The Mythic Tier", color: "from-foil-gold to-amber-500" },
    A: { label: "A · The Real Heat", color: "from-foil-violet to-purple-700" },
    B: { label: "B · The Top 10%", color: "from-foil-cyan to-cyan-700" },
    C: { label: "C · The Believers", color: "from-slate-400 to-slate-600" },
    D: { label: "D · The Long Tail", color: "from-zinc-500 to-zinc-700" },
  };
  return (
    <div className="flex items-end justify-between mb-5 border-b border-white/10 pb-4">
      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40">
          {count} {count === 1 ? "archetype" : "archetypes"}
        </div>
        <h2 className={`mt-1 font-display text-3xl bg-gradient-to-r ${conf[tier].color} bg-clip-text text-transparent`}>
          {conf[tier].label}
        </h2>
      </div>
    </div>
  );
}

import type { Archetype } from "@/data/archetypes";

function DexCard({ a }: { a: Archetype }) {
  return (
    <Link
      href={`/dex/${a.slug}`}
      className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-gold/30 hover:bg-gold/[0.025] transition flex flex-col"
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
          #{String(a.number).padStart(3, "0")}
        </span>
        <div className="flex items-center gap-1.5">
          {a.types.slice(0, 2).map((t) => (
            <span
              key={t}
              className="font-mono text-[8px] tracking-[0.18em] uppercase text-white/55 px-1.5 py-0.5 rounded border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="font-display text-xl text-white group-hover:text-gold transition mb-1.5 leading-tight">
        {a.name}
      </div>
      <div className="font-display italic text-[13px] text-white/55 leading-snug mb-3">
        "{a.tagline}"
      </div>
      <div className="mt-auto pt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-white/35">
        <span>{a.scoreRange[0]}–{a.scoreRange[1]}/100</span>
        <span className="text-gold/70">enter →</span>
      </div>
    </Link>
  );
}
