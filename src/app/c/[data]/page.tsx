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
import type { CategoryScore } from "@/lib/types";

interface PageProps {
  params: Promise<{ data: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const result = decodeResult(data);
  if (!result) return { title: "Cracked · result not found" };
  // Lead with the cohort grade when one exists — that's the product's headline
  // number. Fall back to absolute tier on the (rare) sparse-resume case where
  // age inference returned nothing usable.
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

  const sameTypeArchs = ARCHETYPES.filter((a) => a.types[0] === archetype.types[0]);
  const idx = sameTypeArchs.findIndex((a) => a.slug === archetype.slug);
  const above = sameTypeArchs[idx + 1] ?? ARCHETYPES.find((a) => a.number === archetype.number + 1);
  const below = sameTypeArchs[idx - 1] ?? ARCHETYPES.find((a) => a.number === archetype.number - 1);

  return (
    <div className="px-5 sm:px-8 pt-12 pb-16">
      {/* HOLO CARD — preserved exactly */}
      <section className="max-w-2xl mx-auto">
        <HoloCard result={result} archetype={archetype} encoded={data} />
      </section>

      {/* SHARE */}
      <section className="mt-10 max-w-2xl mx-auto">
        <ShareBar result={result} />
      </section>

      {/* LEAGUE EXPLAINER */}
      {result.league && (
        <section className="mt-12 max-w-2xl mx-auto">
          <div
            className="rounded-2xl border-[3px] border-ink bg-cream p-5 sm:p-6"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              // WHY TWO GRADES? //
            </div>
            <p className="text-[15px] text-ink leading-relaxed">
              You scored <span className="font-bold">{result.total}/100</span> against the absolute rubric (tier{" "}
              <span className="font-bold">{result.tier}</span>). At{" "}
              <span className="font-bold">{getLeague(result.league.league).label}</span> your cohort tier is{" "}
              <span className="font-bold">{result.league.leagueTier}</span> — same score, different bar. Older cohorts aren&apos;t more cracked, they&apos;ve just had more time to stack signals, so the bar moves with you.{" "}
              {result.league.ageSource === "inferred" && (
                <>
                  Age was inferred as <span className="font-bold">{result.league.age}</span>. Click the age pill on the card to correct it.
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* ARCHETYPE CALLOUT */}
      <section className="mt-20 max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div
            className="arcade-stamp inline-block mb-3"
            style={{ background: primaryType.accent, color: "var(--ink)" }}
          >
            ★ DEX MATCH · {Math.round(result.archetypeMatchScore * 100)}% CONFIDENCE
          </div>
          <h2 className="font-display text-[36px] sm:text-[48px] leading-[0.9] text-ink">
            YOU MOST RESEMBLE
            <br />
            <Link
              href={`/dex/${archetype.slug}`}
              className="inline-block px-4 -rotate-1 border-[3px] border-ink mt-3 hover:scale-[1.02] transition"
              style={{
                background: primaryType.accent,
                color: "var(--ink)",
                boxShadow: "5px 5px 0 var(--cherry)",
              }}
            >
              {archetype.name.toUpperCase()}
            </Link>
          </h2>
          <div className="mt-4 font-serif italic text-ink-soft">&ldquo;{archetype.tagline}&rdquo;</div>

          <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
            {allTypes.map((m) => (
              <Link
                key={m.key}
                href={`/dex/types/${m.slug}`}
                className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-md border-2 border-ink transition hover:-translate-y-0.5"
                style={{
                  background: m.accent,
                  color: "var(--ink)",
                  boxShadow: "2px 2px 0 var(--ink)",
                }}
              >
                {m.glyph} {m.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
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
            />
          </div>

          <div
            className="rounded-2xl p-6 sm:p-7 border-[3px] border-ink bg-cream"
            style={{ boxShadow: "6px 6px 0 var(--ink)" }}
          >
            <div className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-2">
              // THE PROFILE //
            </div>
            <p className="text-[15px] text-ink leading-relaxed mb-5 text-pretty">{archetype.profile}</p>
            <div
              className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase mb-2"
              style={{ color: primaryType.accent }}
            >
              // WHY THIS RANK //
            </div>
            <p className="text-[14px] text-ink-soft leading-relaxed text-pretty mb-5">{archetype.justification}</p>
            <Link
              href={`/dex/${archetype.slug}`}
              className="inline-block font-display text-[13px] px-4 py-2 rounded-full border-[3px] border-ink bg-ink text-paper transition hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ boxShadow: "4px 4px 0 var(--cherry)" }}
            >
              FULL ENTRY →
            </Link>
          </div>
        </div>
      </section>

      {/* NEIGHBORS */}
      {(below || above) && (
        <section className="mt-16 max-w-6xl mx-auto">
          <div className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-4 text-center">
            // ONE RANK BELOW · ONE RANK ABOVE //
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {below && <ArchetypeMini archetype={below} />}
            {above && <ArchetypeMini archetype={above} />}
          </div>
        </section>
      )}

      {/* BREAKDOWN */}
      <section className="mt-20 max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <h2 className="font-display text-[32px] text-ink leading-none">THE SIGNAL BREAKDOWN</h2>
          <div className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink-soft">
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
        <div className="font-serif italic text-ink-soft mb-5 text-[18px]">
          Built for screenshotting and arguing about.
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[13px] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            SCORE SOMEONE ELSE →
          </Link>
          <Link
            href="/dex"
            className="px-6 py-3 rounded-full border-[3px] border-ink bg-cream text-ink font-display text-[13px] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "5px 5px 0 var(--ink)" }}
          >
            BROWSE THE DEX →
          </Link>
        </div>
      </section>
    </div>
  );
}

const TIER_PILL: Record<string, { bg: string; color: string }> = {
  S: { bg: "#FF6B5C", color: "#FFFAF2" },
  A: { bg: "#FFA532", color: "#3C1F15" },
  B: { bg: "#FFC53D", color: "#3C1F15" },
  C: { bg: "#9C7560", color: "#FFFAF2" },
  D: { bg: "#6E3F2E", color: "#FFFAF2" },
};

function CategoryRow({ cat }: { cat: CategoryScore }) {
  const pct = Math.round((cat.credited / cat.cap) * 100);
  const top = TIER_PILL[cat.topTier];

  return (
    <details
      className="group rounded-2xl border-[3px] border-ink bg-cream overflow-hidden"
      style={{ boxShadow: "5px 5px 0 var(--ink)" }}
    >
      <summary className="cursor-pointer list-none p-5 flex items-center gap-4 hover:bg-blush/40 transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-[20px] text-ink leading-none">{cat.label.toUpperCase()}</span>
            <span
              className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-md border-2 border-ink"
              style={{ background: top.bg, color: top.color }}
            >
              TOP: {cat.topTier}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-ink/10 overflow-hidden max-w-md border-2 border-ink">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--marigold), var(--cherry))",
              }}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[24px] tabular text-ink leading-none">{cat.credited.toFixed(1)}</div>
          <div className="font-mono text-[10px] font-bold tracking-[0.18em] text-ink-soft uppercase mt-1">
            / {cat.cap}
          </div>
        </div>
        <div className="font-mono text-[14px] text-ink-soft ml-2 group-open:rotate-90 transition">▸</div>
      </summary>
      <div className="border-t-2 border-ink/15 p-5 space-y-2 bg-paper">
        {cat.signals.length === 0 ? (
          <div className="font-mono text-[12px] text-ink-soft">no signals detected</div>
        ) : (
          cat.signals.map((s, i) => (
            <div key={i} className="flex items-baseline gap-3 text-[14px]">
              <span
                className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase w-7 text-center rounded border-2 border-ink"
                style={{
                  background: TIER_PILL[s.tier]?.bg ?? "#9C7560",
                  color: TIER_PILL[s.tier]?.color ?? "#FFFAF2",
                }}
              >
                {s.tier}
              </span>
              <span className="text-ink flex-1">{s.raw}</span>
              {s.detail && <span className="text-ink-soft text-[12px]">· {s.detail}</span>}
              <span className="font-mono text-[12px] text-ink-soft tabular">{s.points}pt</span>
            </div>
          ))
        )}
      </div>
    </details>
  );
}
