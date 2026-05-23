// Server-renderable board components used by the Leaderboard page.
// Kept in a separate module because Next.js doesn't allow non-default exports
// from a route's page file.

import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";
import type { League } from "@/data/leagues";

const TIER_BG: Record<string, string> = {
  S: "#FF6B5C", A: "#FFA532", B: "#FFC53D", C: "#9C7560", D: "#6E3F2E",
};

export function AllTimeBoard() {
  return (
    <div>
      <div className="text-center mb-7">
        <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
          // ALL-TIME CRACKED · S-TIER CANON //
        </div>
        <p className="text-[15px] font-serif italic text-ink-soft max-w-lg mx-auto">
          The mythic peak of the Dex. While we wait for opt-in publishing, these are the archetypes that define the ceiling.
        </p>
      </div>

      <div className="space-y-3">
        {ARCHETYPES.filter((a) => a.tier === "S")
          .slice()
          .reverse()
          .map((a, i) => (
            <Link
              key={a.slug}
              href={`/dex/${a.slug}`}
              className="group flex items-center gap-4 rounded-2xl border-[3px] border-ink bg-cream p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ boxShadow: "5px 5px 0 var(--ink)" }}
            >
              <div
                className="font-display text-[28px] w-14 h-14 grid place-items-center rounded-xl border-2 border-ink leading-none"
                style={{
                  background: i === 0 ? "var(--cherry)" : i === 1 ? "var(--mango)" : "var(--marigold)",
                  color: i === 0 ? "var(--paper)" : "var(--ink)",
                  boxShadow: "2px 2px 0 var(--ink)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[20px] text-ink leading-none group-hover:text-cherry transition">
                  {a.name.toUpperCase()}
                </div>
                <div className="font-serif italic text-[14px] text-ink-soft mt-1 truncate">
                  &ldquo;{a.tagline}&rdquo;
                </div>
              </div>
              <div className="font-mono text-[11px] font-bold tracking-[0.18em] text-ink-soft whitespace-nowrap">
                #{String(a.number).padStart(3, "0")}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}

export function LeagueBoard({ league }: { league: League }) {
  return (
    <div>
      {/* League hero */}
      <div
        className="rounded-3xl border-[3px] border-ink bg-cream p-6 sm:p-8 mb-8"
        style={{ boxShadow: "6px 6px 0 var(--ink)" }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div
              className="arcade-stamp mb-3"
              style={{ background: league.accent, color: "var(--ink)" }}
            >
              {league.glyph} AGE COHORT
            </div>
            <div className="font-display text-[34px] text-ink leading-none mb-2">
              {league.label.toUpperCase()}
            </div>
            <div className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-soft mb-3">
              {league.tagline}
            </div>
            <p className="font-serif italic text-ink text-[15px] max-w-md leading-snug">
              &ldquo;{league.flavor}&rdquo;
            </p>
          </div>

          <div
            className="flex flex-col gap-1 font-mono text-[11px] font-bold tracking-[0.16em] uppercase rounded-2xl border-2 border-ink p-3"
            style={{ background: "var(--paper)" }}
          >
            <CutoffRow tier="S" cutoff={league.cutoffs.S} />
            <CutoffRow tier="A" cutoff={league.cutoffs.A} />
            <CutoffRow tier="B" cutoff={league.cutoffs.B} />
            <CutoffRow tier="C" cutoff={league.cutoffs.C} />
            <div className="text-ink-soft mt-1 text-[9px]">cutoffs / 100</div>
          </div>
        </div>
      </div>

      {/* S-tier exemplars */}
      <div className="mb-8">
        <div className="font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-3">
          // WHAT S-TIER LOOKS LIKE AT {league.label.toUpperCase()} //
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {league.sTierExemplars.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-ink bg-cream px-4 py-3 text-[14px] text-ink"
              style={{ boxShadow: "3px 3px 0 var(--ink)" }}
            >
              <span style={{ color: league.accent }} className="mr-2 font-bold">
                {league.glyph}
              </span>
              {ex}
            </div>
          ))}
        </div>
      </div>

      {/* Empty board placeholder */}
      <div
        className="rounded-3xl border-[3px] border-dashed border-ink bg-blush p-10 text-center"
        style={{ boxShadow: "6px 6px 0 var(--ink)" }}
      >
        <div className="font-display text-[26px] text-ink mb-2 leading-none">
          THE {league.label.toUpperCase()} BOARD IS OPEN
        </div>
        <p className="text-ink-soft text-[15px] max-w-md mx-auto mb-6 font-serif italic">
          Be the first cracked applicant to publish into this cohort. Your score lands on the wall the moment you opt in.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-cherry text-paper font-display text-[13px] border-[3px] border-ink transition hover:-translate-x-0.5 hover:-translate-y-0.5"
          style={{ boxShadow: "5px 5px 0 var(--ink)" }}
        >
          GET YOUR SCORE →
        </Link>
      </div>
    </div>
  );
}

function CutoffRow({ tier, cutoff }: { tier: string; cutoff: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-6 h-5 text-center rounded text-paper text-[10px] leading-5"
        style={{ background: TIER_BG[tier] }}
      >
        {tier}
      </span>
      <span className="text-ink-soft">≥</span>
      <span className="text-ink tabular-nums">{cutoff}</span>
    </div>
  );
}
