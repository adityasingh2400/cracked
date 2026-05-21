import { notFound } from "next/navigation";
import Link from "next/link";
import { HoloCard } from "@/components/HoloCard";
import { ShareBar } from "@/components/ShareBar";
import { decodeResult } from "@/lib/encode";
import { archetypeBySlug, ARCHETYPES } from "@/data/archetypes";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ data: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const result = decodeResult(data);
  if (!result) return { title: "Cracked · result not found" };
  return {
    title: `${result.name} · ${result.total}/100 · TIER ${result.tier} · Cracked`,
    description: result.verdict,
    openGraph: {
      title: `${result.name} scored ${result.total}/100 on Cracked`,
      description: result.verdict,
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { data } = await params;
  const result = decodeResult(data);
  if (!result) notFound();

  const archetype = archetypeBySlug(result.matchedArchetype) ?? ARCHETYPES[0];

  return (
    <div className="px-5 sm:px-8 pt-12 pb-16">
      {/* HOLO CARD */}
      <section className="max-w-2xl mx-auto">
        <HoloCard result={result} archetype={archetype} />
      </section>

      {/* SHARE BAR */}
      <section className="mt-10 max-w-2xl mx-auto">
        <ShareBar result={result} />
      </section>

      {/* ARCHETYPE CALLOUT */}
      <section className="mt-16 max-w-3xl mx-auto">
        <div className="text-center mb-5">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
            Dex match · {Math.round(result.archetypeMatchScore * 100)}% confidence
          </div>
          <h2 className="mt-2 font-display text-3xl text-white">
            You most resemble <Link href={`/dex/${archetype.slug}`} className="text-foil">{archetype.name}</Link>
          </h2>
          <div className="mt-1.5 font-display italic text-white/55">"{archetype.tagline}"</div>
        </div>
        <Link
          href={`/dex/${archetype.slug}`}
          className="block rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-gold/30 hover:bg-gold/[0.02] transition group"
        >
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/45">
              #{String(archetype.number).padStart(3, "0")} · {archetype.types.join(" · ").toUpperCase()}
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-white/45 group-hover:text-gold">
              full entry →
            </span>
          </div>
          <p className="text-[15px] text-white/80 leading-relaxed mb-3 text-pretty">{archetype.profile}</p>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">
            Why this archetype ranks here
          </div>
          <p className="text-[14px] text-white/65 leading-relaxed text-pretty">{archetype.justification}</p>
        </Link>
      </section>

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
