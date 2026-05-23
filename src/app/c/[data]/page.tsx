import { notFound } from "next/navigation";
import Link from "next/link";
import { HoloCard } from "@/components/HoloCard";
import { ShareBar } from "@/components/ShareBar";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import { HoloTile } from "@/components/HoloTile";
import { decodeResult } from "@/lib/encode";
import { archetypeBySlug, ARCHETYPES } from "@/data/archetypes";
import { TYPES_META } from "@/data/types-meta";
import { getLeague } from "@/data/leagues";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ data: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const result = decodeResult(data);
  if (!result) return { title: "Cracked · result not found" };
  // Lead with the cohort grade when one exists — that's the product's headline
  // number. Fall back to the absolute tier on the (rare) sparse-resume case
  // where age inference returned nothing usable.
  const headline = result.league
    ? `TIER ${result.league.leagueTier} at ${getLeague(result.league.league).label}`
    : `TIER ${result.tier}`;
  return {
    title: `${result.name} · ${result.total}/100 · ${headline} · Cracked`,
    description: result.verdict,
    openGraph: {
      title: `${result.name} · ${result.total}/100 · ${headline} on Cracked`,
      description: result.verdict,
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { data } = await params;
  const result = decodeResult(data);
  if (!result) notFound();

  const archetype = archetypeBySlug(result.matchedArchetype) ?? ARCHETYPES[0];
  const primaryType = TYPES_META[archetype.types[0]];
  const allTypes = archetype.types.map((t) => TYPES_META[t]);

  // Neighbors: one above, one below in the dex, same type if possible
  const sameTypeArchs = ARCHETYPES.filter((a) => a.types[0] === archetype.types[0]);
  const idx = sameTypeArchs.findIndex((a) => a.slug === archetype.slug);
  const above = sameTypeArchs[idx + 1] ?? ARCHETYPES.find((a) => a.number === archetype.number + 1);
  const below = sameTypeArchs[idx - 1] ?? ARCHETYPES.find((a) => a.number === archetype.number - 1);

  return (
    <div className="px-5 sm:px-8 pt-12 pb-16">
      {/* HOLO CARD */}
      <section className="max-w-2xl mx-auto">
        <HoloCard result={result} archetype={archetype} />
      </section>

      {/* SHARE */}
      <section className="mt-10 max-w-2xl mx-auto">
        <ShareBar result={result} />
      </section>

      {/* LEAGUE EXPLAINER — only when a placement exists */}
      {result.league && (
        <section className="mt-12 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80 mb-2">
              Why two grades?
            </div>
            <p className="text-[14px] text-white/70 leading-relaxed">
              You scored <span className="text-white font-medium">{result.total}/100</span>{" "}
              against the absolute rubric (tier{" "}
              <span className="text-white">{result.tier}</span>). At{" "}
              <span className="text-white">
                {getLeague(result.league.league).label}
              </span>{" "}
              your cohort tier is{" "}
              <span className="text-white">{result.league.leagueTier}</span> — same score, different
              bar. Older cohorts aren&apos;t more cracked, they&apos;ve just had more time to stack
              signals, so the bar moves with you.{" "}
              {result.league.ageSource === "inferred" && (
                <>
                  Age was inferred as <span className="text-white">{result.league.age}</span>.
                  Click the age pill on the card to correct it.
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* ARCHETYPE CALLOUT — type-themed */}
      <section className="mt-20 max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div
            className="font-mono text-[10px] tracking-[0.28em] uppercase"
            style={{ color: primaryType.accent }}
          >
            Dex match · {Math.round(result.archetypeMatchScore * 100)}% confidence
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-white">
            You most resemble{" "}
            <Link
              href={`/dex/${archetype.slug}`}
              className="transition hover:opacity-80"
              style={{
                background: `linear-gradient(90deg, ${primaryType.accent}, #fff)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {archetype.name}
            </Link>
          </h2>
          <div className="mt-1.5 font-display italic text-white/55">"{archetype.tagline}"</div>

          {/* type chips */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            {allTypes.map((m) => (
              <Link
                key={m.key}
                href={`/dex/types/${m.slug}`}
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded border transition hover:brightness-125"
                style={{
                  color: m.accent,
                  borderColor: `${m.accent}40`,
                  background: `${m.accent}08`,
                }}
              >
                {m.glyph} {m.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
          {/* Holo tile preview */}
          <div className="mx-auto w-full max-w-md">
            <HoloTile
              href={`/dex/${archetype.slug}`}
              foil={primaryType.foil}
              accent={primaryType.accent}
              glyph={archetype.glyph}
              eyebrow={`#${String(archetype.number).padStart(3, "0")} · ${primaryType.name.toUpperCase()}`}
              title={archetype.name}
              subtitle={archetype.tagline}
              caption={`${archetype.scoreRange[0]}–${archetype.scoreRange[1]} / 100 · tier ${archetype.tier}`}
              aspect="card"
              intensity={0.7}
            />
          </div>

          {/* Profile + justification */}
          <div
            className="rounded-2xl p-6 sm:p-7 border bg-white/[0.02]"
            style={{
              borderColor: `${primaryType.accent}25`,
              boxShadow: `0 0 32px ${primaryType.accent}10`,
            }}
          >
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 mb-2">
              The profile
            </div>
            <p className="text-[15px] text-white/85 leading-relaxed mb-5 text-pretty">{archetype.profile}</p>
            <div
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
              style={{ color: primaryType.accent }}
            >
              Why this rank
            </div>
            <p className="text-[14px] text-white/70 leading-relaxed text-pretty mb-5">{archetype.justification}</p>
            <Link
              href={`/dex/${archetype.slug}`}
              className="inline-block font-mono text-[11px] tracking-[0.18em] uppercase transition hover:opacity-80"
              style={{ color: primaryType.accent }}
            >
              full entry →
            </Link>
          </div>
        </div>
      </section>

      {/* NEIGHBORING ARCHETYPES */}
      {(below || above) && (
        <section className="mt-16 max-w-6xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 mb-4 text-center">
            One rank below · one rank above
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {below && <ArchetypeMini archetype={below} />}
            {above && <ArchetypeMini archetype={above} />}
          </div>
        </section>
      )}

      {/* BREAKDOWN */}
      <section className="mt-20 max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-3xl text-white">The signal breakdown</h2>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
            6 categories · {result.categories.reduce((n, c) => n + c.signals.length, 0)} signals
          </div>
        </div>
        <div className="space-y-3">
          {result.categories.map((c) => (
            <CategoryRow key={c.key} cat={c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 max-w-2xl mx-auto text-center">
        <div className="font-display italic text-white/55 mb-4">
          Built for screenshotting and arguing about.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-3 rounded-md bg-gradient-to-br from-foil-violet to-foil-pink text-white font-mono text-[12px] tracking-[0.18em] uppercase hover:brightness-110 transition"
          >
            Score someone else
          </Link>
          <Link
            href="/dex"
            className="px-5 py-3 rounded-md border border-white/15 text-white/85 font-mono text-[12px] tracking-[0.18em] uppercase hover:border-gold/40 hover:text-gold transition"
          >
            Browse the Dex
          </Link>
        </div>
      </section>
    </div>
  );
}

import type { CategoryScore } from "@/lib/types";

function CategoryRow({ cat }: { cat: CategoryScore }) {
  const tierColor: Record<string, string> = {
    S: "text-foil-gold",
    A: "text-foil-violet",
    B: "text-foil-cyan",
    C: "text-slate-300",
    D: "text-zinc-500",
  };
  const pct = Math.round((cat.credited / cat.cap) * 100);

  return (
    <details className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <summary className="cursor-pointer list-none p-5 flex items-center gap-4 hover:bg-white/[0.02] transition">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl text-white">{cat.label}</span>
            <span className={`font-mono text-[10px] tracking-[0.18em] uppercase ${tierColor[cat.topTier]}`}>
              top tier: {cat.topTier}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden max-w-md">
            <div
              className="h-full bg-gradient-to-r from-foil-violet to-foil-pink rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular text-white">{cat.credited.toFixed(1)}</div>
          <div className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
            / {cat.cap}
          </div>
        </div>
        <div className="font-mono text-[10px] text-white/40 ml-2 group-open:rotate-90 transition">▸</div>
      </summary>
      <div className="border-t border-white/8 p-5 space-y-2">
        {cat.signals.length === 0 ? (
          <div className="font-mono text-[12px] text-white/35">no signals detected</div>
        ) : (
          cat.signals.map((s, i) => (
            <div key={i} className="flex items-baseline gap-3 text-[13px]">
              <span
                className={`font-mono text-[10px] tracking-[0.18em] uppercase w-6 ${tierColor[s.tier]}`}
              >
                {s.tier}
              </span>
              <span className="text-white/80 flex-1">{s.raw}</span>
              {s.detail && <span className="text-white/40 text-[12px]">· {s.detail}</span>}
              <span className="font-mono text-[11px] text-white/50 tabular">{s.points}pt</span>
            </div>
          ))
        )}
      </div>
    </details>
  );
}
