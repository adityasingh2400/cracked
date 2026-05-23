"use client";

// Client-side leaderboard with tab strip across 9 families + 6 cohorts +
// Mount Olympus board. Reads from /api/olympus and /api/leaderboard (future).
// For v1.0 launch, renders empty states with copy explaining "no entries yet —
// be the first" until real users accumulate.

import { useState } from "react";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";
import { LEAGUES, getLeague } from "@/data/leagues";
import type { Family, LeagueKey } from "@/lib/types";
import { TierBadge } from "@/components/card/TierBadge";

type View =
  | { kind: "olympus" }
  | { kind: "family"; family: Family; cohort: LeagueKey | "all" };

const COHORTS: { key: LeagueKey | "all"; label: string }[] = [
  { key: "all", label: "All-Time" },
  ...LEAGUES.map((l) => ({ key: l.key, label: l.shortLabel })),
];

export function LeaderboardClient() {
  const [view, setView] = useState<View>({ kind: "olympus" });

  return (
    <div className="flex flex-col gap-6">
      {/* Top-level: Mount Olympus vs Per-Family/Cohort */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          className={tabClass(view.kind === "olympus")}
          onClick={() => setView({ kind: "olympus" })}
        >
          🏛 Mount Olympus
        </button>
        <button
          className={tabClass(view.kind === "family")}
          onClick={() =>
            setView({ kind: "family", family: "engineering", cohort: "all" })
          }
        >
          Per-Family
        </button>
      </div>

      {view.kind === "olympus" ? (
        <OlympusBoard />
      ) : (
        <FamilyBoardSelector view={view} setView={setView} />
      )}
    </div>
  );
}

function tabClass(active: boolean): string {
  return [
    "px-3 py-1.5 rounded-md font-mono text-[12px] uppercase tracking-[0.1em] transition",
    active
      ? "bg-white/10 text-white"
      : "text-white/55 hover:text-white hover:bg-white/[0.04]",
  ].join(" ");
}

function OlympusBoard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-white/65 italic">
        Top 100 across all families and all time. MYTHIC and ASCENDED only.
      </div>
      <EmptyState
        title="No legends yet."
        copy="Mount Olympus opens once enough users have unlocked MYTHIC or ASCENDED. Be the first — drop your LinkedIn."
      />
    </div>
  );
}

function FamilyBoardSelector({
  view,
  setView,
}: {
  view: { kind: "family"; family: Family; cohort: LeagueKey | "all" };
  setView: (v: View) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Family tab strip */}
      <div className="flex flex-wrap gap-1.5">
        {FAMILIES_ORDERED.map((f) => {
          const meta = FAMILIES_META[f];
          return (
            <button
              key={f}
              onClick={() =>
                setView({ kind: "family", family: f, cohort: view.cohort })
              }
              className={[
                "px-2.5 py-1 rounded-md font-mono text-[11px] uppercase tracking-[0.1em] border transition",
                view.family === f
                  ? "text-white border-white/40 bg-white/5"
                  : "text-white/55 border-white/10 hover:text-white hover:border-white/30",
              ].join(" ")}
              style={view.family === f ? { borderColor: `${meta.accent}80` } : undefined}
            >
              <span style={{ color: meta.accent }}>{meta.glyph}</span>{" "}
              {meta.shortName}
            </button>
          );
        })}
      </div>

      {/* Cohort sub-tab strip */}
      <div className="flex flex-wrap gap-1.5">
        {COHORTS.map((c) => (
          <button
            key={c.key}
            onClick={() =>
              setView({ kind: "family", family: view.family, cohort: c.key })
            }
            className={[
              "px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-[0.1em] border transition",
              view.cohort === c.key
                ? "text-white border-white/30 bg-white/5"
                : "text-white/45 border-white/5 hover:text-white/85 hover:border-white/20",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      <EmptyState
        title={`${FAMILIES_META[view.family].name} · ${view.cohort === "all" ? "All-Time" : LEAGUES.find((l) => l.key === view.cohort)?.label}`}
        copy="No entries yet for this slice. The board fills as people drop their LinkedIn — be the first."
      />
    </div>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex gap-2 opacity-30">
        <TierBadge tier="ASCENDED" size="sm" />
        <TierBadge tier="MYTHIC" size="sm" />
        <TierBadge tier="S" size="sm" />
      </div>
      <div className="font-display text-2xl text-white text-center">{title}</div>
      <div className="font-mono text-sm text-white/55 text-center max-w-md">{copy}</div>
      <a
        href="/"
        className="mt-2 px-4 py-2 rounded-md border border-amber-foil/50 text-amber-foil font-mono text-[11px] tracking-[0.15em] uppercase hover:bg-amber-foil/10"
      >
        crack me
      </a>
    </div>
  );
}
