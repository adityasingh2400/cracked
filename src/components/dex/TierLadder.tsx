"use client";

import { useState } from "react";
import { HoloCardV2 } from "@/components/HoloCardV2";
import type { CrackedResultV1, Tier } from "@/lib/types";
import type { DexFamilyLadder } from "@/lib/dex-views";
import { DEX_TIER_ORDER } from "@/lib/dex-views";
import { TierOrbitMap } from "./TierOrbitMap";

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  ASCENDED:
    "the 0.001%. lifetime-defining. decacorn / Nobel / category-defining platform. capped at ~5-15 per family.",
  MYTHIC:
    "the 0.1%. career-defining. unicorn founder. IPO. IMO Gold. YC Series B+. Marshall Scholar. Pulitzer.",
  S: "the 1%. obviously cracked. Stanford + FAANG L5+. NeurIPS first-author. Goldman TMT analyst. McKinsey partner-track. BigLaw partner. Forbes 30U30.",
  A: "the climbers' ceiling. Top 5-10%. Recognized institutional credentials with multiple S-adjacent moves.",
  B: "the climbers. Top 10-20%. Stacked dossier, on the way up.",
  C: "the believers. Real signal, on the way up. Top 30-50%.",
  D: "the long tail. Signals haven't shown up yet. Day one is the best day to start.",
};

const TIER_ACCENT: Record<Tier, { bg: string; color: string }> = {
  ASCENDED: { bg: "linear-gradient(135deg, #FFE5A8 0%, #E8B547 50%, #B98A2E 100%)", color: "#3C1F15" },
  MYTHIC: { bg: "linear-gradient(135deg, #FF6B5C 0%, #FFC53D 100%)", color: "#3C1F15" },
  S: { bg: "#FF6B5C", color: "#FFFAF2" },
  A: { bg: "#FFA532", color: "#3C1F15" },
  B: { bg: "#FFC53D", color: "#3C1F15" },
  C: { bg: "#9C7560", color: "#FFFAF2" },
  D: { bg: "#6E3F2E", color: "#FFFAF2" },
};

interface TierLadderProps {
  ladder: DexFamilyLadder;
  sampleResultsByTier: Partial<Record<Tier, CrackedResultV1>>;
}

export function TierLadder({ ladder, sampleResultsByTier }: TierLadderProps) {
  const { meta, achievementsByTier, chainsByTier, stats } = ladder;
  const [collapsed, setCollapsed] = useState<Partial<Record<Tier, boolean>>>(() => {
    const initial: Partial<Record<Tier, boolean>> = {};
    for (const t of DEX_TIER_ORDER) {
      if (t === "B" || t === "C" || t === "D") initial[t] = true;
    }
    return initial;
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-bold tracking-[0.14em] uppercase">
        <span className="arcade-stamp" style={{ background: meta.accent, color: "var(--paper)" }}>
          {stats.achievements} milestones
        </span>
        <span className="arcade-stamp" style={{ background: "var(--marigold)" }}>
          {stats.chains} chains
        </span>
        <span className="text-ink-fade normal-case tracking-normal font-serif italic text-[13px]">
          Holo card per tier · orbit map for every signal · click card to flip
        </span>
      </div>

      {DEX_TIER_ORDER.map((tier, i) => {
        const achievements = achievementsByTier[tier];
        const chains = chainsByTier[tier];
        const sample = sampleResultsByTier[tier];
        if (achievements.length === 0 && chains.length === 0) return null;

        const isCollapsed = collapsed[tier] ?? false;
        const accent = TIER_ACCENT[tier];

        return (
          <section key={tier} data-tier-section={tier}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [tier]: !c[tier] }))}
              className="w-full flex items-start gap-4 rounded-2xl p-4 sm:p-5 border-[3px] border-ink text-left mb-5 hover:translate-y-[-1px] transition-transform"
              style={{
                background: "var(--cream)",
                boxShadow: "5px 5px 0 var(--ink)",
                transform: `rotate(${i % 2 === 0 ? -0.3 : 0.35}deg)`,
              }}
            >
              <div
                className="shrink-0 rounded-xl border-[3px] border-ink grid place-items-center font-display leading-none"
                style={{
                  width: 64,
                  height: 64,
                  background: accent.bg,
                  color: accent.color,
                  boxShadow: "3px 3px 0 var(--ink)",
                  fontSize: tier === "ASCENDED" ? 11 : tier === "MYTHIC" ? 13 : 28,
                  letterSpacing: tier === "ASCENDED" || tier === "MYTHIC" ? "0.05em" : 0,
                  textAlign: "center",
                  padding: tier === "ASCENDED" || tier === "MYTHIC" ? "4px 6px" : 0,
                }}
              >
                {tier}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-cherry-deep">
                    {achievements.length} milestone{achievements.length !== 1 ? "s" : ""}
                  </span>
                  {chains.length > 0 && (
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-ink-fade">
                      · {chains.length} chain{chains.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="font-serif italic text-[14px] sm:text-[15px] text-ink-soft leading-snug">
                  {TIER_DESCRIPTIONS[tier]}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-bold text-ink-fade mt-2">
                {isCollapsed ? "▼" : "▲"}
              </span>
            </button>

            {!isCollapsed && sample && (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_1fr] gap-5 sm:gap-6 items-start">
                <div
                  className="rounded-2xl border-[3px] border-ink p-4 sm:p-5 flex flex-col items-center"
                  style={{ background: "#040206", boxShadow: "6px 6px 0 var(--ink)" }}
                >
                  <div className="font-mono text-[9px] font-bold tracking-[0.22em] uppercase mb-3 text-center" style={{ color: meta.accent }}>
                    // {tier} holo card //
                  </div>
                  <div className="w-full max-w-[300px]">
                    <HoloCardV2 result={sample} />
                  </div>
                  <p className="mt-3 font-serif italic text-[11px] text-center leading-snug" style={{ color: "rgba(232,181,71,0.65)" }}>
                    What this tier looks like on your card. Flip for dossier.
                  </p>
                </div>

                <TierOrbitMap
                  tier={tier}
                  achievements={achievements}
                  chains={chains}
                  accent={meta.accent}
                  foil={meta.foil}
                />
              </div>
            )}
          </section>
        );
      })}

      <div
        className="rounded-2xl border-[3px] border-ink p-5 sm:p-6"
        style={{ background: "var(--cream)", boxShadow: "5px 5px 0 var(--ink)" }}
      >
        <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-2">
          // How scoring works //
        </div>
        <p className="font-serif text-[14px] text-ink-soft leading-relaxed">
          Match any milestone to land at that tier.{" "}
          <strong className="text-ink font-normal">Chains</strong> (inner orbit) combine requirements
          and bump you higher. A/S tiers stack{" "}
          <strong className="text-ink font-normal">crowns</strong>: 4 B → 1 A crown, 4 A → 1 S crown.
        </p>
      </div>
    </div>
  );
}
