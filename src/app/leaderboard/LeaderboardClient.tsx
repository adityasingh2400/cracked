"use client";

// Client-side leaderboard with tab strip across 9 families + 6 cohorts +
// Mount Olympus board. Reads from /api/olympus and /api/leaderboard (future).
// For v1.0 launch, renders empty states with copy explaining "no entries yet
// — be the first" until real users accumulate.

import { useState } from "react";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";
import { LEAGUES } from "@/data/leagues";
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
    <div className="flex flex-col gap-7 arcade-no-confetti">
      {/* Top-level chunky pill tabs: Mount Olympus vs Per-Family */}
      <div className="flex gap-3 flex-wrap">
        <ArcadeTab active={view.kind === "olympus"} onClick={() => setView({ kind: "olympus" })}>
          🏛 MOUNT OLYMPUS
        </ArcadeTab>
        <ArcadeTab
          active={view.kind === "family"}
          onClick={() =>
            setView({ kind: "family", family: "engineering", cohort: "all" })
          }
        >
          PER-FAMILY
        </ArcadeTab>
      </div>

      {view.kind === "olympus" ? (
        <OlympusBoard />
      ) : (
        <FamilyBoardSelector view={view} setView={setView} />
      )}
    </div>
  );
}

function ArcadeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-full border-[3px] border-ink font-display text-[13px] leading-none transition"
      style={{
        background: active ? "var(--cherry)" : "var(--cream)",
        color: active ? "var(--paper)" : "var(--ink)",
        boxShadow: active ? "5px 5px 0 var(--ink)" : "3px 3px 0 var(--ink-soft)",
        transform: active ? "translate(-1px,-1px)" : "",
      }}
    >
      {children}
    </button>
  );
}

function OlympusBoard() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-serif italic text-[16px] text-ink-soft text-center">
        Top 100 across all families and all time. MYTHIC and ASCENDED only.
      </p>
      <EmptyState
        title="NO LEGENDS YET."
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
  const familyMeta = FAMILIES_META[view.family];
  const cohortLabel =
    view.cohort === "all"
      ? "All-Time"
      : LEAGUES.find((l) => l.key === view.cohort)?.label ?? "All-Time";

  return (
    <div className="flex flex-col gap-6">
      {/* Family chunky chip strip */}
      <div>
        <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-3">
          // FAMILY //
        </div>
        <div className="flex flex-wrap gap-2.5">
          {FAMILIES_ORDERED.map((f) => {
            const meta = FAMILIES_META[f];
            const isActive = view.family === f;
            return (
              <button
                key={f}
                onClick={() => setView({ kind: "family", family: f, cohort: view.cohort })}
                className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-2 rounded-full border-[3px] border-ink transition"
                style={{
                  background: isActive ? meta.accent : "var(--cream)",
                  color: isActive ? "var(--paper)" : "var(--ink)",
                  boxShadow: isActive ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink-soft)",
                  transform: isActive ? "translate(-1px,-1px)" : "",
                }}
              >
                <span style={{ color: isActive ? "var(--paper)" : meta.accent }}>{meta.glyph}</span>{" "}
                {meta.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cohort sub-strip */}
      <div>
        <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-3">
          // COHORT //
        </div>
        <div className="flex flex-wrap gap-2">
          {COHORTS.map((c) => {
            const isActive = view.cohort === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setView({ kind: "family", family: view.family, cohort: c.key })}
                className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 rounded-full border-2 border-ink transition"
                style={{
                  background: isActive ? "var(--marigold)" : "var(--cream)",
                  color: "var(--ink)",
                  boxShadow: isActive ? "3px 3px 0 var(--ink)" : "1px 1px 0 var(--ink-soft)",
                  transform: isActive ? "translate(-1px,-1px)" : "",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <EmptyState
        title={`${familyMeta.name.toUpperCase()} · ${cohortLabel.toUpperCase()}`}
        copy="No entries yet for this slice. The board fills as people drop their LinkedIn — be the first."
        accent={familyMeta.accent}
      />
    </div>
  );
}

function EmptyState({
  title,
  copy,
  accent,
}: {
  title: string;
  copy: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-14 px-6 rounded-3xl border-[3px] border-dashed border-ink bg-blush text-center"
      style={{ boxShadow: "6px 6px 0 var(--ink)" }}
    >
      <div className="flex gap-2 opacity-50">
        <TierBadge tier="ASCENDED" size="sm" />
        <TierBadge tier="MYTHIC" size="sm" />
        <TierBadge tier="S" size="sm" />
      </div>
      <div className="font-display text-[26px] sm:text-[32px] text-ink leading-[0.95]">{title}</div>
      <div className="font-serif italic text-[15px] text-ink-soft max-w-md">{copy}</div>
      <a
        href="/"
        className="mt-2 px-6 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[13px] leading-none transition hover:-translate-x-0.5 hover:-translate-y-0.5"
        style={{ boxShadow: "5px 5px 0 var(--ink)", color: accent ? undefined : undefined }}
      >
        CRACK ME →
      </a>
    </div>
  );
}
