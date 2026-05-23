// CardBack — the flip-side of the holo card. Shows the full inventory the
// front-side compresses into a single chain banner:
//   - All unlocked chains (grouped, color-dotted by family)
//   - All matched achievements grouped by family
//   - Tier breakdown across families (the dossier view)
//
// Visually mirrors the front card's overall frame so the flip feels continuous.
// No mouse-tilt, no foil — back stays calm so the back is readable.

import clsx from "clsx";
import type { CrackedResultV1, Family, Tier } from "@/lib/types";
import { formatTier } from "@/lib/types";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";

interface CardBackProps {
  result: CrackedResultV1;
  className?: string;
}

const TIER_COLOR: Record<Tier, string> = {
  ASCENDED: "#FFD27A",
  MYTHIC: "#E8B547",
  S: "#C2A0FF",
  A: "#7ED4FF",
  B: "#9FE3B8",
  C: "#C7C9CE",
  D: "#6F7178",
};

export function CardBack({ result, className }: CardBackProps) {
  const chains = result.chainsAll ?? [];
  const achievements = result.achievementsAll ?? [];

  // Group achievements by family for the dossier view.
  const grouped: Partial<Record<Family, typeof achievements>> = {};
  for (const a of achievements) {
    if (!grouped[a.family]) grouped[a.family] = [];
    grouped[a.family]!.push(a);
  }
  const familyOrder = FAMILIES_ORDERED.filter((f) => (grouped[f]?.length ?? 0) > 0);

  return (
    <div
      className={clsx(
        "relative w-full h-full overflow-hidden rounded-3xl flex flex-col p-4 sm:p-5 gap-3",
        className
      )}
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(58, 38, 28, 0.85) 0%, rgba(20, 14, 10, 1) 60%, rgba(8, 6, 4, 1) 100%)",
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.7)",
      }}
      data-testid="card-back"
    >
      {/* faint scanline */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,213,122,0.6) 0px, rgba(255,213,122,0.6) 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* HEADER */}
      <div className="relative flex items-baseline justify-between gap-2 z-10">
        <div className="font-display text-lg sm:text-xl text-white truncate">
          {result.name}
        </div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/55 shrink-0">
          dossier
        </div>
      </div>

      {/* TIER BREAKDOWN — per-family final tier */}
      <div className="relative z-10">
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/45 mb-1.5">
          tier by family
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(result.families ?? []).map((fs) => {
            const meta = FAMILIES_META[fs.family];
            const tColor = TIER_COLOR[fs.finalTier];
            return (
              <div
                key={fs.family}
                className="flex items-center gap-1.5 px-2 py-1 rounded border"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                <span
                  className="text-xs leading-none shrink-0"
                  style={{ color: meta.accent }}
                  aria-hidden
                >
                  {meta.glyph}
                </span>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/70 truncate flex-1">
                  {meta.shortName}
                </span>
                <span
                  className="font-display text-[11px] font-bold leading-none shrink-0"
                  style={{ color: tColor }}
                >
                  {formatTier(fs.finalTier, fs.tierStars)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAINS unlocked */}
      {chains.length > 0 && (
        <div className="relative z-10">
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/45 mb-1.5">
            chains unlocked ({chains.length})
          </div>
          <div className="flex flex-col gap-1">
            {chains.map((c) => {
              const meta = FAMILIES_META[c.family];
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-2 py-1 rounded border text-left"
                  style={{
                    borderColor: `${meta.accent}40`,
                    background: `${meta.accent}10`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-xs sm:text-sm leading-tight text-white truncate">
                      {c.name}
                    </div>
                    {c.description && (
                      <div className="font-mono text-[9px] leading-snug text-white/55 line-clamp-1 mt-0.5">
                        {c.description}
                      </div>
                    )}
                  </div>
                  <span
                    className="font-mono text-[8px] tracking-[0.18em] uppercase px-1.5 py-[2px] rounded shrink-0"
                    style={{
                      color: TIER_COLOR[c.bumpTo],
                      border: `1px solid ${TIER_COLOR[c.bumpTo]}50`,
                    }}
                  >
                    {c.bumpTo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACHIEVEMENT GRID */}
      {familyOrder.length > 0 && (
        <div className="relative z-10 flex-1 overflow-hidden">
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/45 mb-1.5">
            achievements ({achievements.length})
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[200px] pr-1">
            {familyOrder.map((fam) => {
              const meta = FAMILIES_META[fam];
              const items = grouped[fam]!;
              return (
                <div key={fam} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] leading-none"
                      style={{ color: meta.accent }}
                      aria-hidden
                    >
                      {meta.glyph}
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-[0.18em] uppercase"
                      style={{ color: meta.accent }}
                    >
                      {meta.shortName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pl-2">
                    {items.map((a) => (
                      <span
                        key={a.id}
                        className="font-mono text-[9px] px-1.5 py-[2px] rounded border text-white/85"
                        style={{
                          borderColor: `${meta.accent}30`,
                          background: `${meta.accent}08`,
                        }}
                        title={a.id}
                      >
                        {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="relative z-10 mt-auto flex items-center justify-between pt-1 border-t border-white/10">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/40">
          cracked.com · v1.0
        </div>
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/40">
          tap to flip
        </div>
      </div>
    </div>
  );
}
