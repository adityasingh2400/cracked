import { notFound } from "next/navigation";
import Link from "next/link";
import { ARCHETYPES, type Archetype } from "@/data/archetypes";
import { TYPES_META, TYPES_ORDERED, typeBySlug } from "@/data/types-meta";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import { HoloTile } from "@/components/HoloTile";
import type { Tier } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return TYPES_ORDERED.map((t) => ({ type: TYPES_META[t].slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type: slug } = await params;
  const meta = typeBySlug(slug);
  if (!meta) return { title: "Not a type" };
  return {
    title: `${meta.name} · The Cracked Dex`,
    description: `${meta.motto} — ${meta.description}`,
  };
}

const tierOrder: Tier[] = ["S", "A", "B", "C", "D"];

export default async function TypePage({ params }: Props) {
  const { type: slug } = await params;
  const meta = typeBySlug(slug);
  if (!meta) notFound();

  const inType: Archetype[] = ARCHETYPES.filter((a) => a.types[0] === meta.key).sort(
    (a, b) => b.number - a.number
  );
  const secondaryInType = ARCHETYPES.filter(
    (a) => a.types[0] !== meta.key && a.types.includes(meta.key)
  );

  const byTier: Record<Tier, Archetype[]> = {
    S: [], A: [], B: [], C: [], D: [],
  };
  for (const a of inType) byTier[a.tier].push(a);

  return (
    <div className="px-5 sm:px-8 pt-10 pb-32">
      {/* BREADCRUMB */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/dex"
          className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 hover:text-white transition"
        >
          ← all types
        </Link>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-12 items-center">
          {/* Left: text */}
          <div>
            <div
              className="font-mono text-[11px] tracking-[0.28em] uppercase mb-4"
              style={{ color: meta.accent }}
            >
              TYPE · {meta.name.toUpperCase()}
            </div>
            <h1 className="font-display font-semibold text-[64px] sm:text-[92px] leading-[0.93] tracking-tight text-white">
              {meta.name}
            </h1>
            <p className="mt-4 font-display italic text-[22px] text-white/65">"{meta.motto}"</p>
            <p className="mt-6 max-w-xl text-[16px] text-white/75 leading-relaxed text-pretty">
              {meta.description}
            </p>

            {/* Signature sub-stat */}
            <div className="mt-7 flex items-center gap-4">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">
                Signature sub-stat
              </div>
              <div
                className="font-display text-2xl tracking-tight"
                style={{ color: meta.accent }}
              >
                {meta.signature.toUpperCase()}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
              <Stat label="Archetypes" value={String(inType.length)} />
              <Stat label="Cross-type" value={String(secondaryInType.length)} />
              <Stat label="S-tier" value={String(byTier.S.length)} />
            </div>
          </div>

          {/* Right: glyph tile */}
          <div className="mx-auto w-full max-w-md">
            <HoloTile
              href={`/dex/types/${meta.slug}`}
              foil={meta.foil}
              accent={meta.accent}
              glyph={meta.glyph}
              eyebrow={`TYPE · ${meta.name.toUpperCase()}`}
              title={meta.name}
              subtitle={meta.motto}
              tiers={{
                S: byTier.S.length,
                A: byTier.A.length,
                B: byTier.B.length,
                C: byTier.C.length,
                D: byTier.D.length,
              }}
              count={inType.length}
              aspect="card"
              intensity={0.85}
            />
          </div>
        </div>
      </section>

      {/* TIER BANDS */}
      <section className="max-w-6xl mx-auto space-y-12">
        {tierOrder.map((t) => {
          const arr = byTier[t];
          if (arr.length === 0) return null;
          return (
            <div key={t}>
              <div className="flex items-end justify-between mb-4 pb-3 border-b border-white/10">
                <h2
                  className="font-display text-3xl"
                  style={{
                    background: `linear-gradient(90deg, ${meta.accent}, #fff)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Tier {t}
                </h2>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
                  {arr.length} {arr.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {arr.map((a) => (
                  <ArchetypeMini key={a.slug} archetype={a} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* CROSS-TYPE */}
      {secondaryInType.length > 0 && (
        <section className="max-w-6xl mx-auto mt-20">
          <div className="flex items-end justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40">
                Cross-type
              </div>
              <h2 className="mt-1 font-display text-2xl text-white">
                Primarily other types — also {meta.name}
              </h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
              {secondaryInType.length} {secondaryInType.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {secondaryInType.map((a) => (
              <ArchetypeMini key={a.slug} archetype={a} />
            ))}
          </div>
        </section>
      )}

      {/* ADJACENT */}
      <section className="max-w-6xl mx-auto mt-24">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/40 mb-5">
          Adjacent types
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meta.adjacent.map((t) => {
            const m = TYPES_META[t];
            const arr = ARCHETYPES.filter((a) => a.types[0] === t);
            const tiers = {
              S: arr.filter((a) => a.tier === "S").length,
              A: arr.filter((a) => a.tier === "A").length,
              B: arr.filter((a) => a.tier === "B").length,
              C: arr.filter((a) => a.tier === "C").length,
              D: arr.filter((a) => a.tier === "D").length,
            };
            return (
              <HoloTile
                key={t}
                href={`/dex/types/${m.slug}`}
                foil={m.foil}
                accent={m.accent}
                glyph={m.glyph}
                eyebrow={`SEE ALSO`}
                title={m.name}
                subtitle={m.motto}
                count={arr.length}
                tiers={tiers}
                aspect="wide"
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</div>
      <div className="mt-1 font-display text-3xl text-white">{value}</div>
    </div>
  );
}
