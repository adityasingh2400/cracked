import { notFound } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { archetypeBySlug, ARCHETYPES } from "@/data/archetypes";
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

  const prev = ARCHETYPES.find((x) => x.number === a.number - 1);
  const next = ARCHETYPES.find((x) => x.number === a.number + 1);

  return (
    <div className="px-5 sm:px-8 pt-10 pb-24">
      {/* BREADCRUMB */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link
          href="/dex"
          className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 hover:text-white transition"
        >
          ← back to the dex
        </Link>
      </div>

      {/* HEADER */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <span className="font-mono text-[11px] tracking-[0.24em] text-gold/80 uppercase">
            #{String(a.number).padStart(3, "0")} · {a.types.join(" · ")}
          </span>
          <TierStamp tier={a.tier} />
        </div>
        <h1 className="font-display font-semibold text-[56px] sm:text-[76px] leading-[0.95] tracking-tight text-white">
          {a.name}
        </h1>
        <p className="mt-4 font-display italic text-[22px] text-white/55">"{a.tagline}"</p>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-3xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <Stat label="Score Range" value={`${a.scoreRange[0]}–${a.scoreRange[1]}`} unit="/ 100" />
          <Stat label="Tier" value={a.tier} unit={tierLabel[a.tier]} />
          <Stat label="Dex Position" value={`${a.number}`} unit={`/ ${ARCHETYPES.length}`} />
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="HACK" value={a.typicalStats.hack} color="#A78BFA" />
          <StatPill label="GRIND" value={a.typicalStats.grind} color="#EC4899" />
          <StatPill label="TASTE" value={a.typicalStats.taste} color="#FCD34D" />
          <StatPill label="RIZZ" value={a.typicalStats.rizz} color="#06B6D4" />
        </div>
      </section>

      {/* PROFILE */}
      <Section title="Profile">
        <p className="text-[17px] text-white/85 leading-relaxed text-pretty">{a.profile}</p>
      </Section>

      {/* JUSTIFICATION */}
      <Section title="Why this archetype ranks here" accent="gold">
        <p className="text-[17px] text-white/85 leading-relaxed text-pretty">{a.justification}</p>
      </Section>

      {/* EXAMPLES */}
      <Section title="Notable examples">
        <ul className="space-y-2">
          {a.examples.map((e, i) => (
            <li key={i} className="text-[15px] text-white/75 flex gap-3">
              <span className="text-gold mt-1">▸</span>
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
              <span className="font-mono text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.02] text-white/80">
                {stage}
              </span>
              {i < a.trajectory.length - 1 && (
                <span className="text-white/30">→</span>
              )}
            </Fragment>
          ))}
        </div>
      </Section>

      {/* EVOLUTION */}
      {a.evolvesInto && a.evolvesInto.length > 0 && (
        <Section title="Evolves into">
          <div className="grid sm:grid-cols-2 gap-3">
            {a.evolvesInto.map((slug) => {
              const ev = archetypeBySlug(slug);
              if (!ev) return null;
              return (
                <Link
                  key={slug}
                  href={`/dex/${slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-gold/30 hover:bg-gold/[0.02] transition group"
                >
                  <div className="font-mono text-[10px] tracking-[0.18em] text-white/40 mb-1">
                    #{String(ev.number).padStart(3, "0")}
                  </div>
                  <div className="font-display text-lg text-white group-hover:text-gold transition">
                    {ev.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* PREV / NEXT */}
      <section className="max-w-3xl mx-auto mt-16 pt-8 border-t border-white/10 flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/dex/${prev.slug}`}
            className="group flex-1 rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
              ← prev #{String(prev.number).padStart(3, "0")}
            </div>
            <div className="mt-1 font-display text-lg text-white group-hover:text-gold transition">
              {prev.name}
            </div>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link
            href={`/dex/${next.slug}`}
            className="group flex-1 rounded-xl border border-white/10 p-4 hover:border-white/25 transition text-right"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
              next #{String(next.number).padStart(3, "0")} →
            </div>
            <div className="mt-1 font-display text-lg text-white group-hover:text-gold transition">
              {next.name}
            </div>
          </Link>
        ) : <div className="flex-1" />}
      </section>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent?: "gold"; children: React.ReactNode }) {
  return (
    <section className="max-w-3xl mx-auto mb-10">
      <div className={`font-mono text-[10px] tracking-[0.24em] uppercase mb-3 ${accent === "gold" ? "text-gold/85" : "text-white/45"}`}>
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
      <div className="h-[3px] rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}40, ${color})` }}
        />
      </div>
    </div>
  );
}

function TierStamp({ tier }: { tier: string }) {
  const conf: Record<string, { from: string; to: string; ring: string }> = {
    S: { from: "#FCD34D", to: "#F59E0B", ring: "rgba(252,211,77,0.5)" },
    A: { from: "#A78BFA", to: "#7C3AED", ring: "rgba(167,139,250,0.4)" },
    B: { from: "#22D3EE", to: "#0891B2", ring: "rgba(34,211,238,0.35)" },
    C: { from: "#94A3B8", to: "#475569", ring: "rgba(148,163,184,0.25)" },
    D: { from: "#71717A", to: "#3F3F46", ring: "rgba(113,113,122,0.2)" },
  };
  const c = conf[tier];
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-2xl"
      style={{
        background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
        boxShadow: `0 0 20px ${c.ring}`,
        color: "#0A0A0F",
      }}
    >
      {tier}
    </div>
  );
}
