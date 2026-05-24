// CardBack - the flip-side of the holo card. Shows the full inventory the
// front-side compresses into a single chain banner:
//   - All unlocked chains (grouped, color-dotted by family)
//   - All matched achievements grouped by family
//   - Tier breakdown across families (the dossier view)
//
// Visually mirrors the front card's family/tier palette so the flip feels
// continuous, while making the person's milestones feel like collectible badges.

import clsx from "clsx";
import type { CrackedResultV1, Family, Tier } from "@/lib/types";
import { formatTier } from "@/lib/types";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";

interface CardBackProps {
  result: CrackedResultV1;
  className?: string;
  hoverX?: number;
  hoverY?: number;
  tiltRx?: number;
  tiltRy?: number;
  metal?: string;
  accent?: string;
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

export function CardBack({
  result,
  className,
  hoverX = 50,
  hoverY = 50,
  tiltRx = 0,
  tiltRy = 0,
  metal,
  accent,
}: CardBackProps) {
  const chains = result.chainsAll ?? [];
  const achievements = result.achievementsAll ?? [];
  const primaryFamily = result.primaryFamily ?? "engineering";
  const primaryMeta = FAMILIES_META[primaryFamily];
  const tierColor = TIER_COLOR[result.tier];
  const reactiveMetal = metal ?? tierColor;
  const reactiveAccent = accent ?? primaryMeta.accent;
  const bestAccolades = result.bestAccolades ?? [];
  const highlightAchievements = achievements.slice(0, 18);

  // Group achievements by family for the milestone wall.
  const grouped: Partial<Record<Family, typeof achievements>> = {};
  for (const a of highlightAchievements) {
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
          `radial-gradient(circle at ${hoverX}% ${hoverY}%, ${withAlpha(reactiveMetal, 0.42)} 0%, ${withAlpha(reactiveAccent, 0.14)} 26%, transparent 58%),
           radial-gradient(ellipse 90% 70% at 50% 0%, ${withAlpha(primaryMeta.foil.primary, 0.42)} 0%, transparent 58%),
           radial-gradient(ellipse 80% 70% at 18% 18%, ${withAlpha(primaryMeta.foil.secondary, 0.28)} 0%, transparent 52%),
           radial-gradient(ellipse 70% 60% at 82% 78%, ${withAlpha(primaryMeta.foil.tertiary, 0.24)} 0%, transparent 56%),
           linear-gradient(155deg, #160608 0%, #2A0B08 35%, #170B06 68%, #050204 100%)`,
        boxShadow: `inset 0 0 90px rgba(0,0,0,0.62), inset 0 0 0 1px ${withAlpha(reactiveMetal, 0.25)}, 0 0 65px -15px ${withAlpha(reactiveMetal, 0.55)}`,
        transform: `rotateX(${tiltRx * 0.28}deg) rotateY(${tiltRy * 0.28}deg)`,
        transformStyle: "preserve-3d",
        cursor: "none",
      }}
      data-testid="card-back"
    >
      {/* faint scanline + warm foil wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,213,122,0.6) 0px, rgba(255,213,122,0.6) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          background:
            `linear-gradient(${95 + tiltRy * 1.6}deg, transparent 0%, rgba(255,245,190,0.12) 42%, rgba(255,255,255,0.25) 50%, ${withAlpha(reactiveMetal, 0.12)} 58%, transparent 100%)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(from ${130 + tiltRy * 4}deg at ${hoverX}% ${hoverY}%, ${reactiveMetal}, ${primaryMeta.foil.primary}, ${primaryMeta.foil.secondary}, ${primaryMeta.foil.tertiary}, ${reactiveMetal})`,
          opacity: 0.22,
          mixBlendMode: "color-dodge",
        }}
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="font-display text-lg sm:text-xl truncate"
            style={{
              color: "#FFF6EC",
              textShadow: `0 0 18px ${withAlpha(tierColor, 0.45)}, 0 2px 0 rgba(0,0,0,0.45)`,
            }}
          >
            {result.name}
          </div>
          <div
            className="mt-1 font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ color: withAlpha(tierColor, 0.8) }}
          >
            milestone archive · {primaryMeta.shortName}
          </div>
        </div>
        <div
          className="shrink-0 rounded-full border px-2.5 py-1 font-display text-[12px] leading-none"
          style={{
            color: tierColor,
            borderColor: withAlpha(tierColor, 0.45),
            background: "rgba(0,0,0,0.34)",
            boxShadow: `0 0 18px ${withAlpha(tierColor, 0.18)}`,
          }}
        >
          {formatTier(result.tier, result.tierStars)}
        </div>
      </div>

      {/* HERO MILESTONES */}
      <div className="relative z-10 grid gap-2">
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "#FFE5A8" }}>
          highlighted accolades
        </div>
        {bestAccolades.length > 0 ? (
          <div className="grid gap-1.5">
            {bestAccolades.slice(0, 5).map((accolade, i) => {
              const meta = accolade.family ? FAMILIES_META[accolade.family] : primaryMeta;
              return (
                <div
                  key={`${accolade.title}-${i}`}
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: withAlpha(meta.accent, 0.5),
                    background: `linear-gradient(135deg, ${withAlpha(meta.accent, 0.25)}, rgba(0,0,0,0.34))`,
                    boxShadow: `0 0 20px ${withAlpha(meta.accent, 0.16)}`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-sm leading-none" style={{ color: meta.accent }} aria-hidden>
                      {meta.glyph}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[14px] leading-tight text-cream">
                        {accolade.title}
                      </div>
                      {accolade.detail && (
                        <div className="mt-1 font-mono text-[9px] leading-snug text-cream/72">
                          {accolade.detail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : chains.length > 0 ? (
          <div className="grid gap-1.5">
            {chains.slice(0, 3).map((c) => {
              const meta = FAMILIES_META[c.family];
            return (
              <div
                  key={c.id}
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: withAlpha(meta.accent, 0.45),
                    background: `linear-gradient(135deg, ${withAlpha(meta.accent, 0.24)}, rgba(0,0,0,0.34))`,
                    boxShadow: `0 0 18px ${withAlpha(meta.accent, 0.14)}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none" style={{ color: meta.accent }} aria-hidden>
                      {meta.glyph}
                    </span>
                    <div className="font-display text-[13px] leading-tight text-cream truncate">
                      {c.name}
                    </div>
                    <span
                      className="ml-auto rounded-full border px-1.5 py-[2px] font-mono text-[8px] tracking-[0.16em] uppercase"
                      style={{ color: TIER_COLOR[c.bumpTo], borderColor: withAlpha(TIER_COLOR[c.bumpTo], 0.55) }}
                    >
                      {c.bumpTo}
                    </span>
                  </div>
                  {c.description && (
                    <div className="mt-1 font-mono text-[9px] leading-snug text-cream/70 line-clamp-2">
                      {c.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-xl border px-3 py-3 font-serif italic text-[13px] leading-snug"
            style={{ color: "#FFF6EC", borderColor: withAlpha(tierColor, 0.28), background: "rgba(0,0,0,0.28)" }}
          >
            {result.speciality || result.verdict || "Signals recognized across the profile."}
          </div>
        )}
      </div>

      {/* ACHIEVEMENT GRID */}
      {familyOrder.length > 0 && (
        <div className="relative z-10 flex-1 overflow-hidden">
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase mb-1.5" style={{ color: "#FFE5A8" }}>
            achievements unlocked ({achievements.length})
          </div>
          <div className="flex flex-col gap-1.5 pr-1">
            {familyOrder.map((fam) => {
              const meta = FAMILIES_META[fam];
              const items = grouped[fam]!;
              return (
                <div
                  key={fam}
                  className="rounded-xl border p-2"
                  style={{
                    borderColor: withAlpha(meta.accent, 0.34),
                    background: `linear-gradient(135deg, ${withAlpha(meta.accent, 0.14)}, rgba(0,0,0,0.28))`,
                  }}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
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
                  <div className="flex flex-wrap gap-1">
                    {items.map((a) => (
                      <span
                        key={a.id}
                        className="font-mono text-[9px] px-1.5 py-[3px] rounded-full border"
                        style={{
                          color: "#FFF6EC",
                          borderColor: withAlpha(meta.accent, 0.38),
                          background: "rgba(255,250,242,0.07)",
                          boxShadow: `0 0 10px ${withAlpha(meta.accent, 0.08)}`,
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

      {/* TIER STRIP */}
      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-1.5">
          {(result.families ?? []).slice(0, 9).map((fs) => {
            const meta = FAMILIES_META[fs.family];
            const tColor = TIER_COLOR[fs.finalTier];
            return (
              <div
                key={fs.family}
                className="flex items-center gap-1.5 rounded border px-2 py-1"
                style={{
                  borderColor: withAlpha(meta.accent, 0.26),
                  background: "rgba(0,0,0,0.28)",
                }}
              >
                <span className="text-xs leading-none shrink-0" style={{ color: meta.accent }} aria-hidden>
                  {meta.glyph}
                </span>
                <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-cream/70 truncate flex-1">
                  {meta.shortName}
                </span>
                <span className="font-display text-[10px] font-bold leading-none shrink-0" style={{ color: tColor }}>
                  {formatTier(fs.finalTier, fs.tierStars)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-auto flex items-center justify-between pt-1 border-t border-white/10">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-cream/45">
          cracked.com · v1.0
        </div>
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-cream/45">
          interactive
        </div>
      </div>
    </div>
  );
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return hex;
  const h = hex.length === 4 ? hex.slice(1).split("").map((c) => c + c).join("") : hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
