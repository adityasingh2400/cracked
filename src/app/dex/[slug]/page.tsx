import { notFound } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { archetypeBySlug, ARCHETYPES } from "@/data/archetypes";
import { TYPES_META } from "@/data/types-meta";
import { HoloTile } from "@/components/HoloTile";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARCHETYPES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = archetypeBySlug(slug);
  if (!a) return { title: "Not in the Dex" };
  return {
    title: `#${String(a.number).padStart(3, "0")} · ${a.name} · The Cracked Dex`,
    description: `${a.tagline} — ${a.profile.slice(0, 140)}`,
  };
}

const tierLabel: Record<string, string> = {
  S: "Mythic", A: "Rare", B: "Uncommon", C: "Common", D: "Basic",
};

export default async function DexEntry({ params }: Props) {
  const { slug } = await params;
  const a = archetypeBySlug(slug);
  if (!a) notFound();

  const primaryType = TYPES_META[a.types[0]];
  const allTypes = a.types.map((t) => TYPES_META[t]);
  const prev = ARCHETYPES.find((x) => x.number === a.number - 1);
  const next = ARCHETYPES.find((x) => x.number === a.number + 1);
  const evolvesInto = (a.evolvesInto ?? []).map(archetypeBySlug).filter(Boolean);

  return (
    <div className="px-5 sm:px-8 pt-10 pb-32">
      {/* BREADCRUMB */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase">
        <Link href="/dex" className="text-white/45 hover:text-white transition">dex</Link>
        <span className="text-white/25">/</span>
        <Link
          href={`/dex/types/${primaryType.slug}`}
          className="transition hover:opacity-80"
          style={{ color: `${primaryType.accent}cc` }}
        >
          {primaryType.name}
        </Link>
        <span className="text-white/25">/</span>
        <span className="text-white/70">#{String(a.number).padStart(3, "0")}</span>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 items-center">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="font-mono text-[11px] tracking-[0.28em] uppercase"
                style={{ color: primaryType.accent }}
              >
                #{String(a.number).padStart(3, "0")}
              </span>
              <span className="font-mono text-[10px] tracking-[0.22em] text-white/40">·</span>
              {allTypes.map((m, i) => (
                <Fragment key={m.key}>
                  {i > 0 && <span className="font-mono text-[10px] text-white/30">+</span>}
                  <Link
                    href={`/dex/types/${m.slug}`}
                    className="font-mono text-[10px] tracking-[0.22em] uppercase px-2 py-0.5 rounded border transition hover:brightness-125"
                    style={{
                      color: m.accent,
                      borderColor: `${m.accent}40`,
                      background: `${m.accent}10`,
                    }}
                  >
                    {m.glyph} {m.name}
                  </Link>
                </Fragment>
              ))}
            </div>
            <h1 className="font-display font-semibold text-[56px] sm:text-[88px] leading-[0.93] tracking-tight text-white">
              {a.name}
            </h1>
            <p className="mt-4 font-display italic text-[22px] text-white/65 max-w-xl">
              "{a.tagline}"
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="Score Range" value={`${a.scoreRange[0]}–${a.scoreRange[1]}`} unit="/100" />
              <Stat label="Tier" value={a.tier} unit={tierLabel[a.tier]} />
              <Stat label="Dex" value={`${a.number}`} unit={`/${ARCHETYPES.length}`} />
            </div>
          </div>

          {/* Right: holo tile */}
          <div className="mx-auto w-full max-w-md">
            <HoloTile
              href={`/dex/${a.slug}`}
              foil={primaryType.foil}
              accent={primaryType.accent}
              glyph={a.glyph}
              eyebrow={`#${String(a.number).padStart(3, "0")} · ${primaryType.name.toUpperCase()}`}
              title={a.name}
              subtitle={a.tagline}
              caption={`${a.scoreRange[0]}–${a.scoreRange[1]} / 100 · tier ${a.tier}`}
              aspect="card"
              intensity={0.85}
            />
          </div>
        </div>
      </section>

      {/* STAT PILLS */}
      <section className="max-w-3xl mx-auto mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="HACK" value={a.typicalStats.hack} color="#A78BFA" />
          <StatPill label="GRIND" value={a.typicalStats.grind} color="#EC4899" />
          <StatPill label="TASTE" value={a.typicalStats.taste} color="#FCD34D" />
          <StatPill label="RIZZ" value={a.typicalStats.rizz} color="#06B6D4" />
        </div>
        <div className="mt-3 text-center font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">
          typical sub-stat profile · used by the archetype matcher
        </div>
      </section>

      {/* PROFILE */}
      <Section title="Profile">
        <p className="text-[17px] text-white/85 leading-relaxed text-pretty">{a.profile}</p>
      </Section>

      {/* JUSTIFICATION */}
      <Section title="Why this archetype ranks here" accent={primaryType.accent}>
        <p className="text-[17px] text-white/85 leading-relaxed text-pretty">{a.justification}</p>
      </Section>

      {/* EXAMPLES */}
      <Section title="Notable examples">
        <ul className="space-y-2">
          {a.examples.map((e, i) => (
            <li key={i} className="text-[15px] text-white/80 flex gap-3">
              <span style={{ color: primaryType.accent }} className="mt-1">▸</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-white/40 font-mono">
          examples are illustrative · the dex grades the archetype, not the person
        </p>
      </Section>

      {/* TRAJECTORY */}
      <Section title="Canonical trajectory">
        <div className="flex flex-wrap items-center gap-2">
          {a.trajectory.map((stage, i) => (
            <Fragment key={i}>
              <span
                className="font-mono text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full bg-white/[0.02] text-white/85"
                style={{
                  border: `1px solid ${primaryType.accent}30`,
                  boxShadow: `0 0 12px ${primaryType.accent}15`,
                }}
              >
                {stage}
              </span>
              {i < a.trajectory.length - 1 && (
                <span style={{ color: `${primaryType.accent}80` }}>→</span>
              )}
            </Fragment>
          ))}
        </div>
      </Section>

      {/* EVOLUTION */}
      {evolvesInto.length > 0 && (
        <Section title="Evolves into">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evolvesInto.map((ev) => (ev ? <ArchetypeMini key={ev.slug} archetype={ev} /> : null))}
          </div>
        </Section>
      )}

      {/* PREV / NEXT */}
      <section className="max-w-3xl mx-auto mt-16 pt-8 border-t border-white/10 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/dex/${prev.slug}`}
            className="group flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/25 transition"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
              ← prev #{String(prev.number).padStart(3, "0")}
            </div>
            <div className="mt-1 font-display text-lg text-white group-hover:text-gold transition">
              {prev.name}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/dex/${next.slug}`}
            className="group flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/25 transition text-right"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
              next #{String(next.number).padStart(3, "0")} →
            </div>
            <div className="mt-1 font-display text-lg text-white group-hover:text-gold transition">
              {next.name}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </section>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <section className="max-w-3xl mx-auto mb-10">
      <div
        className="font-mono text-[10px] tracking-[0.24em] uppercase mb-3"
        style={{ color: accent ?? "rgba(255,255,255,0.45)" }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-3xl text-white">{value}</span>
        {unit && <span className="font-mono text-[11px] text-white/45">{unit}</span>}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase">{label}</span>
        <span className="font-mono text-[14px] tabular text-white" style={{ color }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}40, ${color})` }}
        />
      </div>
    </div>
  );
}
