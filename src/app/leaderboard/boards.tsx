// Server-renderable board components used by the Leaderboard page.
// Kept in a separate module because Next.js doesn't allow non-default exports
// from a route's page file.

import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";
import type { League } from "@/data/leagues";

export function AllTimeBoard() {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80 mb-2">
          All-Time Cracked · S-Tier Canon
        </div>
        <p className="text-[14px] text-white/55 max-w-lg mx-auto">
          The mythic peak of the Dex. While we wait for opt-in publishing,
          these are the archetypes that define the ceiling.
        </p>
      </div>

      <div className="space-y-2">
        {ARCHETYPES.filter((a) => a.tier === "S")
          .slice()
          .reverse()
          .map((a, i) => (
            <Link
              key={a.slug}
              href={`/dex/${a.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-gold/30 hover:bg-gold/[0.02] transition"
            >
              <div className="font-display text-3xl text-foil w-12 text-center">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg text-white group-hover:text-gold transition">
                  {a.name}
                </div>
                <div className="font-display italic text-[13px] text-white/50">
                  &quot;{a.tagline}&quot;
                </div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-gold/80">
                #{String(a.number).padStart(3, "0")}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export function LeagueBoard({ league }: { league: League }) {
  const ageRange = league.ageMax
    ? `ages ${league.ageMin}-${league.ageMax}`
    : `ages ${league.ageMin}+`;
  return (
    <div>
      {/* League hero */}
      <div
        className="rounded-2xl border p-6 sm:p-8 mb-8"
        style={{
          borderColor: `${league.accent}30`,
          background: `linear-gradient(135deg, ${league.accent}08, transparent 60%)`,
          boxShadow: `0 0 40px ${league.accent}10`,
        }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-2"
              style={{ color: league.accent }}
            >
              {league.glyph} {league.label}
            </div>
            <div className="font-display text-3xl text-white mb-1">{league.shortLabel}</div>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 mb-3">
              {ageRange} · {league.tagline}
            </div>
            <p className="font-display italic text-white/75 text-[14px] max-w-md leading-snug">
              &quot;{league.flavor}&quot;
            </p>
          </div>

          <div className="flex flex-col gap-1 font-mono text-[10px] tracking-[0.18em] uppercase">
            <CutoffRow tier="S" cutoff={league.cutoffs.S} accent={league.accent} />
            <CutoffRow tier="A" cutoff={league.cutoffs.A} />
            <CutoffRow tier="B" cutoff={league.cutoffs.B} />
            <CutoffRow tier="C" cutoff={league.cutoffs.C} />
            <div className="text-white/30 mt-1 text-[9px]">cutoffs / 100</div>
          </div>
        </div>
      </div>

      {/* S-tier exemplars */}
      <div className="mb-8">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 mb-3">
          What S-tier looks like in {league.shortLabel} League
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {league.sTierExemplars.map((ex, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-[14px] text-white/75"
            >
              <span style={{ color: league.accent }} className="mr-2">
                {league.glyph}
              </span>
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Empty board placeholder */}
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-10 text-center">
        <div className="font-display text-xl text-white mb-2">
          The {league.shortLabel} League board is open
        </div>
        <p className="text-white/55 text-[14px] max-w-md mx-auto mb-5">
          Be the first cracked applicant to publish into this league. Your
          score lands on the wall the moment you opt in.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-md bg-gradient-to-br from-foil-violet to-foil-pink text-white font-mono text-[11px] tracking-[0.18em] uppercase hover:brightness-110 transition"
        >
          Get your score →
        </Link>
      </div>
    </div>
  );
}

function CutoffRow({
  tier,
  cutoff,
  accent,
}: {
  tier: string;
  cutoff: number;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-5 text-right"
        style={{ color: accent ?? "rgba(255,255,255,0.7)" }}
      >
        {tier}
      </span>
      <span className="text-white/30">≥</span>
      <span className="text-white tabular-nums">{cutoff}</span>
    </div>
  );
}
