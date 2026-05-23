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
const tierBg: Record<string, string> = {
  S: "#FF6B5C", A: "#FFA532", B: "#FFC53D", C: "#9C7560", D: "#6E3F2E",
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
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.22em] uppercase">
        <Link href="/dex" className="text-ink-soft hover:text-cherry transition">dex</Link>
        <span className="text-ink/25">/</span>
        <Link
          href={`/dex/types/${primaryType.slug}`}
          className="transition hover:opacity-80"
          style={{ color: primaryType.accent }}
        >
          {primaryType.name}
        </Link>
        <span className="text-ink/25">/</span>
        <span className="text-ink">#{String(a.number).padStart(3, "0")}</span>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span
                className="font-display text-[16px] px-3 py-1 rounded-md border-[3px] border-ink bg-ink text-paper leading-none"
              >
                #{String(a.number).padStart(3, "0")}
              </span>
              {allTypes.map((m, i) => (
                <Fragment key={m.key}>
                  {i > 0 && <span className="font-mono text-[12px] font-bold text-ink-soft">+</span>}
                  <Link
                    href={`/dex/types/${m.slug}`}
                    className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md border-2 border-ink transition hover:-translate-y-0.5"
                    style={{ background: m.accent, color: "var(--ink)" }}
                  >
                    {m.glyph} {m.name}
                  </Link>
                </Fragment>
              ))}
            </div>
            <h1 className="font-display text-[52px] sm:text-[88px] leading-[0.9] tracking-tight text-ink">
              {a.name.toUpperCase()}
            </h1>
            <p className="mt-4 font-serif italic text-[22px] text-ink-soft max-w-xl">
              &ldquo;{a.tagline}&rdquo;
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              <Stat label="Score" value={`${a.scoreRange[0]}–${a.scoreRange[1]}`} unit="/100" />
              <Stat label="Tier" value={a.tier} unit={tierLabel[a.tier]} bg={tierBg[a.tier]} />
              <Stat label="Dex" value={`#${a.number}`} unit={`/${ARCHETYPES.length}`} />
            </div>
          </div>

          {/* Holo tile preview */}
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
            />
          </div>
        </div>
      </section>

      {/* STAT PILLS */}
      <section className="max-w-3xl mx-auto mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="HACK" value={a.typicalStats.hack} color="#8B5CF6" />
          <StatPill label="GRIND" value={a.typicalStats.grind} color="#FF6B5C" />
          <StatPill label="TASTE" value={a.typicalStats.taste} color="#FFC53D" />
          <StatPill label="RIZZ" value={a.typicalStats.rizz} color="#06B6D4" />
        </div>
        <div className="mt-3 text-center font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-soft">
          typical sub-stat profile · used by the archetype matcher
        </div>
      </section>

      <Section title="Profile">
        <p className="text-[17px] text-ink leading-relaxed text-pretty">{a.profile}</p>
      </Section>

      <Section title="Why this archetype ranks here" accent={primaryType.accent}>
        <p className="text-[17px] text-ink leading-relaxed text-pretty">{a.justification}</p>
      </Section>

      <Section title="Notable examples">
        <ul className="space-y-2">
          {a.examples.map((e, i) => (
            <li key={i} className="text-[15px] text-ink flex gap-3">
              <span style={{ color: primaryType.accent }} className="mt-0.5">▸</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-ink-soft font-mono">
          examples are illustrative · the dex grades the archetype, not the person
        </p>
      </Section>

      <Section title="Canonical trajectory">
        <div className="flex flex-wrap items-center gap-2">
          {a.trajectory.map((stage, i) => (
            <Fragment key={i}>
              <span
                className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full bg-cream text-ink border-2 border-ink"
                style={{ boxShadow: "2px 2px 0 var(--ink)" }}
              >
                {stage}
              </span>
              {i < a.trajectory.length - 1 && (
                <span style={{ color: primaryType.accent }}>→</span>
              )}
            </Fragment>
          ))}
        </div>
      </Section>

      {evolvesInto.length > 0 && (
        <Section title="Evolves into">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evolvesInto.map((ev) => (ev ? <ArchetypeMini key={ev.slug} archetype={ev} /> : null))}
          </div>
        </Section>
      )}

      {/* PREV / NEXT */}
      <section className="max-w-3xl mx-auto mt-16 pt-8 border-t-2 border-ink/15 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/dex/${prev.slug}`}
            className="group flex-1 rounded-2xl border-[3px] border-ink bg-cream p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "4px 4px 0 var(--ink)" }}
          >
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-soft uppercase">
              ← prev #{String(prev.number).padStart(3, "0")}
            </div>
            <div className="mt-1 font-display text-lg text-ink">{prev.name.toUpperCase()}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/dex/${next.slug}`}
            className="group flex-1 rounded-2xl border-[3px] border-ink bg-cream p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5 text-right"
            style={{ boxShadow: "4px 4px 0 var(--ink)" }}
          >
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-soft uppercase">
              next #{String(next.number).padStart(3, "0")} →
            </div>
            <div className="mt-1 font-display text-lg text-ink">{next.name.toUpperCase()}</div>
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
        className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase mb-3"
        style={{ color: accent ?? "var(--cherry)" }}
      >
        // {title} //
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, unit, bg }: { label: string; value: string; unit?: string; bg?: string }) {
  return (
    <div
      className="rounded-2xl p-3 border-2 border-ink"
      style={{ background: bg ?? "var(--cream)", boxShadow: "3px 3px 0 var(--ink)" }}
    >
      <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-ink-soft">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl text-ink leading-none">{value}</span>
        {unit && <span className="font-mono text-[11px] text-ink-soft">{unit}</span>}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-2xl border-[3px] border-ink bg-cream p-3"
      style={{ boxShadow: "4px 4px 0 var(--ink)" }}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-soft uppercase">{label}</span>
        <span className="font-display text-[16px] tabular-nums text-ink" style={{ color }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink/10 overflow-hidden border-2 border-ink">
        <div
          className="h-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }}
        />
      </div>
    </div>
  );
}
