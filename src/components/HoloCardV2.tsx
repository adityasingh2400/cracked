// HoloCardV2 — god-tier S-3★ rebuild wired to real CrackedResultV1 data.
//
// Replaces HoloCardV1's visual stack with the research-synthesized champion
// design language (aurora bloom + V-Star sunpillar + conic foil with
// color-dodge + animated @property conic border + corner ornaments +
// microprint + Cinzel/Cormorant/Pinyon typography + laurel-wreathed tier
// badge). Per-tier escalation: ASCENDED gets max effects (cosmic shimmer,
// aurora at full intensity), MYTHIC + S layer halo burst, lower tiers ramp
// down sparkles/foil/border weight.
//
// The hero is the TIER + STARS lockup, NOT a 0-100 score numeral — numbers
// don't matter, the rank does. Photo of the user (LinkedIn mirror) sits as
// Ken Burns background behind the tier text. Click to flip 180° to the
// CardBack (chains + per-family tier breakdown + achievements). Mobile
// flips on X, desktop on Y.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FAMILIES_META } from "@/data/families";
import { FAMILY_LIBRARY } from "@/data/achievements";
import type { CrackedResultV1, Family, Tier, TierStars, PercentileTrio as Trio } from "@/lib/types";
import { formatTier, isSpecialTier } from "@/lib/types";
import { getLeague } from "@/data/leagues";
import { CardBack } from "@/components/card/CardBack";
import { CrackednessLine } from "@/components/card/CrackednessLine";
import { SpecialityLine } from "@/components/card/SpecialityLine";
import { FamilyParticles } from "@/components/card/FamilyParticles";

// =============================================================================
// THEME DERIVATION — family meta + tier intensity
// =============================================================================

interface TierIntensity {
  /** 0-1 — drives sparkle count, aurora opacity, foil intensity, halo presence. */
  level: number;
  /** Whether the tier gets the high-intensity cosmic shimmer + aurora. */
  cosmic: boolean;
  /** Whether the halo burst pulses behind the tier lockup. */
  halo: boolean;
  /** Whether the per-family corner ornaments render. */
  cornerOrnaments: boolean;
  /** Per-tier sparkle count. */
  sparkleCount: number;
  /** Border weight: thin / standard / heavy. */
  borderWeight: "fade" | "single" | "double" | "double-gold" | "molten";
  /** Bonus tier descriptor shown under the tier letter. */
  subtitle: string;
}

const TIER_INTENSITY: Record<Tier, TierIntensity> = {
  ASCENDED: {
    level: 1.0,
    cosmic: true,
    halo: true,
    cornerOrnaments: true,
    sparkleCount: 36,
    borderWeight: "molten",
    subtitle: "0.001% · lifetime-defining",
  },
  MYTHIC: {
    level: 0.88,
    cosmic: false,
    halo: true,
    cornerOrnaments: true,
    sparkleCount: 24,
    borderWeight: "double-gold",
    subtitle: "0.1% · career-defining",
  },
  S: {
    level: 0.76,
    cosmic: false,
    halo: true,
    cornerOrnaments: true,
    sparkleCount: 18,
    borderWeight: "double-gold",
    subtitle: "1% · obviously cracked",
  },
  A: {
    level: 0.6,
    cosmic: false,
    halo: false,
    cornerOrnaments: true,
    sparkleCount: 12,
    borderWeight: "double",
    subtitle: "top 5–10% · recognized",
  },
  B: {
    level: 0.42,
    cosmic: false,
    halo: false,
    cornerOrnaments: false,
    sparkleCount: 7,
    borderWeight: "single",
    subtitle: "top 10–20% · climbing",
  },
  C: {
    level: 0.26,
    cosmic: false,
    halo: false,
    cornerOrnaments: false,
    sparkleCount: 4,
    borderWeight: "single",
    subtitle: "top 30–50% · believer",
  },
  D: {
    level: 0.14,
    cosmic: false,
    halo: false,
    cornerOrnaments: false,
    sparkleCount: 0,
    borderWeight: "fade",
    subtitle: "day one · long tail",
  },
};

// Per-family corner ornament — locks each family to one ornament style.
const FAMILY_ORNAMENT: Record<Family, "fleur" | "laurel" | "acanthus" | "rosette" | "deco" | "bracket"> = {
  engineering: "bracket",
  science_academia: "laurel",
  founder: "deco",
  finance: "rosette",
  consulting_corporate: "fleur",
  law_public_service: "acanthus",
  medicine: "bracket",
  athletics_performance: "laurel",
  creative_audience: "deco",
};

// Per-family "metal" — the dominant accent for the tier badge, border, sparkles.
// Most families warm-gold; medicine/engineering get silver (research consensus
// on cold-precision families); creative gets rose-gold.
function metalFor(family: Family): { metal: string; metalDeep: string; metalKind: "gold" | "silver" | "rose-gold" } {
  switch (family) {
    case "engineering":
    case "medicine":
      return { metal: "#D8DDE3", metalDeep: "#7A8389", metalKind: "silver" };
    case "creative_audience":
      return { metal: "#E0A0AB", metalDeep: "#8B5E68", metalKind: "rose-gold" };
    default:
      return { metal: "#D4AF37", metalDeep: "#7A5C18", metalKind: "gold" };
  }
}

// Gold-leaf foil — 3-tone vertical gradient. Real-feeling gilt, not flat yellow.
function foilGradient(metalKind: "gold" | "silver" | "rose-gold"): string {
  switch (metalKind) {
    case "silver":
      return "linear-gradient(165deg, #FFFFFF 0%, #D8DDE3 28%, #6E7378 52%, #F0F2F5 70%, #4A5057 100%)";
    case "rose-gold":
      return "linear-gradient(165deg, #FFE8E8 0%, #E0A0AB 28%, #8B5E68 52%, #FFE0D8 70%, #5A3640 100%)";
    case "gold":
    default:
      return "linear-gradient(165deg, #FFF1A8 0%, #E8C36A 28%, #B8860B 52%, #FFE5A8 70%, #7A5C18 100%)";
  }
}

// =============================================================================
// MOTION HOOKS
// =============================================================================

function useSpringTilt(target: { rx: number; ry: number; mx: number; my: number }) {
  const [val, setVal] = useState(target);
  const valRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const cur = valRef.current;
      const k = 0.16;
      const next = {
        rx: cur.rx + (target.rx - cur.rx) * k,
        ry: cur.ry + (target.ry - cur.ry) * k,
        mx: cur.mx + (target.mx - cur.mx) * k,
        my: cur.my + (target.my - cur.my) * k,
      };
      valRef.current = next;
      setVal(next);
      const settled =
        Math.abs(next.rx - target.rx) < 0.02 &&
        Math.abs(next.ry - target.ry) < 0.02 &&
        Math.abs(next.mx - target.mx) < 0.05 &&
        Math.abs(next.my - target.my) < 0.05;
      if (!settled) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);
  return val;
}

function useIdleDrift(active: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let id: number;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
  return useMemo(
    () => ({
      rx: Math.sin(t * 0.45) * 2.2,
      ry: Math.cos(t * 0.35) * 2.8,
      mx: 50 + Math.sin(t * 0.55) * 8,
      my: 50 + Math.cos(t * 0.42) * 6,
    }),
    [t]
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return hex;
  const h = hex.length === 4 ? hex.slice(1).split("").map((c) => c + c).join("") : hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface HoloCardV2Props {
  result: CrackedResultV1;
  interactive?: boolean;
  className?: string;
}

const DEFAULT_FAMILY: Family = "engineering";
const DEFAULT_TRIO: Trio = {
  withinFamilyCohort: 50,
  crossFamilyCohort: 50,
  global: 50,
};

export function HoloCardV2({ result, interactive = true, className }: HoloCardV2Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [target, setTarget] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => setMounted(true), []);

  const isMobile =
    mounted && typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 640px)").matches
      : false;

  const onFlip = () => {
    if (!interactive) return;
    setFlipping(true);
    setFlipped((f) => !f);
    window.setTimeout(() => setFlipping(false), 750);
  };

  const drift = useIdleDrift(interactive && !hovering && mounted && !flipped);
  const effective = hovering ? target : drift;
  const tilt = useSpringTilt(effective);

  const tier: Tier = result.tier;
  const tierStars = result.tierStars;
  const intensity = TIER_INTENSITY[tier];
  const family: Family = result.primaryFamily ?? DEFAULT_FAMILY;
  const secondary: Family | undefined = result.secondaryFamily;
  const familyMeta = FAMILIES_META[family];
  const { metal, metalKind, metalDeep: _metalDeep } = metalFor(family);
  const foil = foilGradient(metalKind);
  const accent = familyMeta.accent;
  const percentiles: Trio = result.percentiles ?? DEFAULT_TRIO;
  const cohortLabel = result.league ? getLeague(result.league.league).label : "all cohorts";
  const headlineChainId = result.families?.find((f) => f.family === family)?.activeChains[0];
  const headlineChain = headlineChainId
    ? FAMILY_LIBRARY.chains.find((c) => c.id === headlineChainId)
    : undefined;
  const ornament = FAMILY_ORNAMENT[family];

  // Stable particle seed per result
  const seed = useMemo(() => {
    let s = result.signalScore * 1000;
    for (const ch of result.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return s;
  }, [result.signalScore, result.id]);

  const sparkles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: intensity.sparkleCount }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * (tier === "ASCENDED" ? 3.2 : 2.4),
      delay: rng() * 4,
      duration: 1.4 + rng() * 2.4,
    }));
  }, [seed, intensity.sparkleCount, tier]);

  const starfield = useMemo(() => {
    const rng = mulberry32(seed + 4831);
    const count = tier === "ASCENDED" ? 50 : tier === "MYTHIC" ? 40 : tier === "S" ? 28 : 0;
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      r: 0.3 + rng() * 1.3,
      delay: rng() * 5,
      duration: 2.6 + rng() * 3,
    }));
  }, [seed, tier]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !wrapRef.current || flipped) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTarget({
      rx: (y - 0.5) * -14,
      ry: (x - 0.5) * 18,
      mx: x * 100,
      my: y * 100,
    });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactive || !wrapRef.current || !e.touches[0] || flipped) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) / rect.width;
    const y = (e.touches[0].clientY - rect.top) / rect.height;
    setHovering(true);
    setTarget({
      rx: (y - 0.5) * -14,
      ry: (x - 0.5) * 18,
      mx: x * 100,
      my: y * 100,
    });
  };

  const effectiveTilt = flipping ? { rx: 0, ry: 0, mx: 50, my: 50 } : tilt;
  const flipAxis = isMobile ? "rotateX" : "rotateY";
  const flipDeg = flipped ? 180 : 0;
  const distance = Math.hypot(effectiveTilt.mx - 50, effectiveTilt.my - 50) / 50;

  // Aurora bloom: 3 blurred radials using the family's foil palette
  const aurora = useMemo(
    () => `
      radial-gradient(at 22% 28%, ${familyMeta.foil.primary} 0%, transparent 48%),
      radial-gradient(at 78% 22%, ${familyMeta.foil.secondary} 0%, transparent 52%),
      radial-gradient(at 42% 82%, ${familyMeta.foil.tertiary} 0%, transparent 50%)
    `,
    [familyMeta.foil.primary, familyMeta.foil.secondary, familyMeta.foil.tertiary]
  );

  // Deep base gradient — family-tinted void
  const baseGradient = useMemo(
    () => `
      radial-gradient(ellipse at 50% 0%, ${withAlpha(familyMeta.foil.primary, 0.18 * intensity.level)} 0%, transparent 55%),
      radial-gradient(ellipse at 50% 100%, ${withAlpha(familyMeta.foil.secondary, 0.22 * intensity.level)} 0%, transparent 60%),
      linear-gradient(160deg, #050208 0%, #000 100%)
    `,
    [familyMeta.foil.primary, familyMeta.foil.secondary, intensity.level]
  );

  return (
    <div
      ref={wrapRef}
      className={clsx("holo-card-wrap select-none relative mx-auto", className)}
      style={{ perspective: "1800px", maxWidth: 560, width: "100%" }}
      onMouseEnter={() => interactive && !flipped && setHovering(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        setHovering(false);
        setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
      }}
      onTouchStart={() => interactive && !flipped && setHovering(true)}
      onTouchMove={onTouchMove}
      onTouchEnd={() => {
        setHovering(false);
        setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
      }}
    >
      {/* Flip pivot */}
      <div
        style={{
          aspectRatio: "2 / 3",
          width: "100%",
          transform: `${flipAxis}(${flipDeg}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 700ms cubic-bezier(0.4, 0.0, 0.2, 1)",
          willChange: "transform",
          position: "relative",
        }}
      >
        {/* FRONT FACE */}
        <div
          className={clsx("holo-cardv2 relative mx-auto", interactive && "cursor-pointer")}
          onClick={onFlip}
          style={
            {
              aspectRatio: "2 / 3",
              width: "100%",
              maxWidth: 560,
              transform: `rotateX(${effectiveTilt.rx}deg) rotateY(${effectiveTilt.ry}deg)`,
              transformStyle: "preserve-3d",
              willChange: "transform",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              overflow: "hidden",
              isolation: "isolate",
              boxShadow: `
                0 ${30 + Math.abs(effectiveTilt.rx)}px ${100 + Math.abs(effectiveTilt.rx) * 2}px -20px rgba(0,0,0,0.85),
                0 0 ${80 + intensity.level * 90}px -10px ${withAlpha(metal, 0.7)},
                0 0 0 1px ${withAlpha(metal, 0.15)} inset
              `,
              "--mx": `${effectiveTilt.mx}%`,
              "--my": `${effectiveTilt.my}%`,
            } as React.CSSProperties
          }
        >
          {/* L1: base background gradient */}
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden"
            style={{ background: baseGradient }}
          />

          {/* L2: aurora bloom — 3 blurred radials of family foil */}
          <div
            className="absolute inset-[-15%] rounded-[24px] pointer-events-none"
            style={{
              background: aurora,
              filter: "blur(60px) saturate(170%)",
              opacity: 0.55 * intensity.level + (hovering ? 0.15 : 0),
              animation: "holoV2Aurora 22s linear infinite",
              transition: "opacity 400ms",
            }}
          />

          {/* L3: V-Star sunpillar — Simey pattern, family-tinted */}
          {intensity.level > 0.5 && (
            <div
              className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent 0,
                    transparent 6%,
                    ${withAlpha(accent, 0.18)} 8%,
                    transparent 10%,
                    transparent 16%,
                    ${withAlpha(metal, 0.22)} 18%,
                    transparent 20%
                  ),
                  repeating-linear-gradient(
                    133deg,
                    transparent 0,
                    transparent 1.4%,
                    rgba(255,255,255,0.06) 1.6%,
                    transparent 1.8%
                  )
                `,
                backgroundSize: "100% 220%, 240% 100%",
                backgroundPosition: `0 ${50 + effectiveTilt.ry * 1.2}%, ${effectiveTilt.mx}% 0`,
                mixBlendMode: "soft-light",
                opacity: 0.7 * intensity.level,
                transition: "background-position 240ms ease-out",
              }}
            />
          )}

          {/* L4: conic foil rainbow — color-dodge over base */}
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
            style={{
              background: `conic-gradient(from ${130 + effectiveTilt.ry * 4}deg at ${effectiveTilt.mx}% ${effectiveTilt.my}%,
                ${metal},
                ${familyMeta.foil.primary},
                ${familyMeta.foil.secondary},
                ${familyMeta.foil.tertiary},
                ${metal})`,
              opacity: 0.3 * intensity.level + (hovering ? 0.18 : 0),
              mixBlendMode: "color-dodge",
              transition: "opacity 380ms",
            }}
          />

          {/* L5: diagonal mirror sheen */}
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
            style={{
              background: `linear-gradient(${95 + effectiveTilt.ry * 1.6}deg,
                transparent 0%,
                transparent 38%,
                rgba(255, 248, 220, 0.34) 49%,
                rgba(255, 255, 255, 0.72) 50%,
                rgba(255, 248, 220, 0.34) 51%,
                transparent 62%,
                transparent 100%
              )`,
              mixBlendMode: "overlay",
              opacity: hovering ? 0.9 * intensity.level + 0.2 : 0.5 * intensity.level,
              transition: "opacity 320ms",
            }}
          />

          {/* L6: cursor spotlight */}
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${effectiveTilt.mx}% ${effectiveTilt.my}%,
                ${withAlpha(metal, 0.5)} 0%,
                ${withAlpha(accent, 0.14)} 28%,
                transparent 62%)`,
              mixBlendMode: "overlay",
              opacity: hovering ? 1 : 0.65,
              transition: "opacity 320ms",
            }}
          />

          {/* L7: ASCENDED cosmic shimmer — slowly rotating conic */}
          {intensity.cosmic && (
            <div
              className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(255,90,46,0) 0deg, rgba(255,90,46,0.35) 60deg, rgba(255,210,122,0) 120deg, rgba(139,92,246,0.32) 180deg, rgba(6,182,212,0) 240deg, rgba(252,211,77,0.32) 300deg, rgba(255,90,46,0) 360deg)",
                mixBlendMode: "screen",
                animation: "holoV2CosmicSpin 9s linear infinite",
                opacity: 0.55,
              }}
            />
          )}

          {/* L8: family particles (rising/drift/code-rain) */}
          <FamilyParticles family={family} tier={tier} seed={seed} />

          {/* L9: starfield (S+ tier) */}
          {starfield.length > 0 && (
            <div className="absolute inset-0 pointer-events-none rounded-[24px] overflow-hidden">
              {starfield.map((s, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: s.r,
                    height: s.r,
                    background: "#FFFFFF",
                    boxShadow: `0 0 ${s.r * 4}px ${s.r}px rgba(255,255,255,0.7), 0 0 ${s.r * 6}px ${s.r * 0.5}px ${withAlpha(metal, 0.4)}`,
                    opacity: 0,
                    animation: `holoV2Twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* L10: halo burst behind tier lockup */}
          {intensity.halo && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "82%",
                height: "38%",
                background:
                  tier === "ASCENDED"
                    ? "radial-gradient(ellipse, rgba(255,90,46,0.5) 0%, rgba(255,210,122,0.28) 30%, transparent 65%)"
                    : `radial-gradient(ellipse, ${withAlpha(metal, 0.45)} 0%, ${withAlpha(metal, 0)} 70%)`,
                mixBlendMode: "screen",
                filter: "blur(14px)",
                animation: "holoV2HaloBreathe 3.2s ease-in-out infinite",
              }}
            />
          )}

          {/* L11: sparkles (metal-colored) */}
          {sparkles.length > 0 && (
            <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
              {sparkles.map((s, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: s.size,
                    height: s.size,
                    background: metal,
                    boxShadow: `0 0 ${s.size * 4}px ${s.size}px ${withAlpha(metal, 0.8)}`,
                    opacity: 0,
                    animation: `holoV2Twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* L12: subtle grain noise */}
          <div
            className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.6' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.97 0 0 0 0 0.86 0 0 0 0.08 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")",
              mixBlendMode: "overlay",
              opacity: 0.32,
            }}
          />

          {/* L13: animated conic border (S+ tier) */}
          {intensity.level > 0.5 && <ConicBorder accent={metal} />}

          {/* L14: inner frame */}
          <BorderFrame weight={intensity.borderWeight} metal={metal} accent={accent} />

          {/* L15: corner ornaments (S+ tier) */}
          {intensity.cornerOrnaments && (
            <>
              <CornerOrnament position="tl" kind={ornament} metal={metal} />
              <CornerOrnament position="tr" kind={ornament} metal={metal} />
              <CornerOrnament position="bl" kind={ornament} metal={metal} />
              <CornerOrnament position="br" kind={ornament} metal={metal} />
            </>
          )}

          {/* L16: edge raking light */}
          <div
            className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              background: `linear-gradient(${90 + effectiveTilt.ry * 3}deg,
                ${withAlpha(metal, Math.max(0, effectiveTilt.ry / 50))} 0%,
                transparent 22%,
                transparent 78%,
                ${withAlpha(metal, Math.max(0, -effectiveTilt.ry / 50))} 100%
              )`,
              mixBlendMode: "screen",
              opacity: hovering ? 1 : 0.4,
              transition: "opacity 320ms",
            }}
          />

          {/* L17: microprint along bottom */}
          <Microprint result={result} metal={metal} />

          {/* L18: CONTENT */}
          <div
            className="relative z-20 p-4 sm:p-5 h-full flex flex-col gap-2"
            style={{ transformStyle: "preserve-3d", color: "#FFFAF2" }}
          >
            {/* Top row */}
            <TopRow
              family={family}
              familyMeta={familyMeta}
              secondary={secondary}
              cohortLabel={cohortLabel}
              serial={result.id}
              metal={metal}
              accent={accent}
            />

            {/* Hero illustration: photo + tier+stars lockup */}
            <HeroBlock
              tier={tier}
              tierStars={tierStars}
              intensity={intensity}
              photoUrl={result.photoUrl}
              name={result.name}
              metal={metal}
              accent={accent}
              foil={foil}
              distance={distance}
            />

            {/* Crackedness line */}
            <div style={{ transform: "translateZ(18px)" }}>
              <CrackednessLine
                percentiles={percentiles}
                cohortLabel={cohortLabel}
                family={family}
                age={result.league?.age}
              />
            </div>

            {/* Chain banner */}
            {headlineChain && (
              <ChainBanner
                name={headlineChain.name}
                description={headlineChain.description}
                metal={metal}
              />
            )}

            {/* Speciality */}
            <div style={{ transform: "translateZ(10px)" }}>
              <SpecialityLine
                speciality={result.speciality}
                family={family}
                calibrating={result.calibrating}
              />
            </div>

            {/* Footer */}
            <Footer id={result.id} metal={metal} accent={accent} interactive={interactive} />
          </div>
        </div>

        {/* BACK FACE — pre-rotated 180° */}
        <div
          onClick={onFlip}
          style={{
            position: "absolute",
            inset: 0,
            aspectRatio: "2 / 3",
            width: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: `${flipAxis}(180deg)`,
            cursor: interactive ? "pointer" : "default",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 30px 100px -20px rgba(0,0,0,0.85), 0 0 80px -10px ${withAlpha(metal, 0.6)}`,
          }}
        >
          <CardBack result={result} />
        </div>
      </div>

      <style jsx global>{`
        @property --holov2-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes holoV2Aurora {
          0%   { transform: translate(0, 0) rotate(0deg); }
          50%  { transform: translate(-3%, 4%) rotate(180deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        @keyframes holoV2Twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%      { opacity: 0.95; transform: scale(1); }
        }
        @keyframes holoV2ConicSpin {
          to { --holov2-angle: 360deg; }
        }
        @keyframes holoV2HaloBreathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.95; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes holoV2CosmicSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes holoV2HaloPulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes holoV2TierGlow {
          0%, 100% { filter: drop-shadow(0 0 22px var(--metal-glow, rgba(212,175,55,0.7))) drop-shadow(0 3px 0 rgba(0,0,0,0.55)); }
          50%      { filter: drop-shadow(0 0 32px var(--metal-glow, rgba(212,175,55,0.95))) drop-shadow(0 0 6px var(--metal-glow, rgba(212,175,55,1))) drop-shadow(0 3px 0 rgba(0,0,0,0.55)); }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// TOP ROW — family badge + cohort/serial
// =============================================================================

function TopRow({
  family: _family,
  familyMeta,
  secondary,
  cohortLabel,
  serial,
  metal,
  accent,
}: {
  family: Family;
  familyMeta: typeof FAMILIES_META[Family];
  secondary?: Family;
  cohortLabel: string;
  serial: string;
  metal: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-start justify-between gap-2"
      style={{ transform: "translateZ(22px)" }}
    >
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm min-w-0"
        style={{
          background: withAlpha(accent, 0.10),
          border: `1px solid ${withAlpha(accent, 0.4)}`,
        }}
      >
        <span
          style={{
            color: accent,
            fontSize: 18,
            lineHeight: 1,
            textShadow: `0 0 8px ${withAlpha(accent, 0.7)}`,
          }}
        >
          {familyMeta.glyph}
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-[8px] tracking-[0.26em] uppercase truncate"
            style={{
              fontFamily: "var(--font-plex-mono)",
              color: withAlpha("#FFFAF2", 0.65),
            }}
          >
            &ldquo;{familyMeta.shortName}&rdquo;
            {secondary && (
              <span style={{ color: withAlpha("#FFFAF2", 0.4) }}>
                {" · also "}
                {FAMILIES_META[secondary].shortName}
              </span>
            )}
          </span>
          <span
            className="text-[11px] tracking-[0.12em] uppercase truncate"
            style={{ fontFamily: "var(--font-cinzel)", color: "#FFFAF2" }}
          >
            {familyMeta.name}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div
          className="text-[8px] tracking-[0.22em] uppercase leading-none"
          style={{ fontFamily: "var(--font-plex-mono)", color: withAlpha(metal, 0.85) }}
        >
          LOT {serial.slice(0, 4).toUpperCase()}
        </div>
        <div
          className="text-[9px] tracking-[0.18em] uppercase mt-0.5 px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-plex-mono)",
            color: metal,
            border: `1px solid ${withAlpha(metal, 0.45)}`,
            background: "rgba(0,0,0,0.45)",
          }}
        >
          {cohortLabel}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HERO BLOCK — photo + tier+stars+laurel lockup
// =============================================================================

function HeroBlock({
  tier,
  tierStars,
  intensity,
  photoUrl,
  name,
  metal,
  accent,
  foil,
  distance,
}: {
  tier: Tier;
  tierStars?: TierStars;
  intensity: TierIntensity;
  photoUrl?: string;
  name: string;
  metal: string;
  accent: string;
  foil: string;
  distance: number;
}) {
  const tierLabel = formatTier(tier, tierStars);
  const isSpecial = isSpecialTier(tier);

  // Chromatic aberration intensifies as cursor leaves center.
  const ca = Math.min(2.6, 1 + distance * 1.6);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center relative my-1"
      style={{ transform: "translateZ(48px)" }}
    >
      {/* Photo background — Ken Burns drift, family tinted */}
      {photoUrl && (
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            inset: "0 12px",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center 28%",
              filter: tierPhotoFilter(tier),
              animation: "photoKenBurns 28s ease-in-out infinite",
              opacity: 0.55,
            }}
          />
          {/* Color grade overlay tinted to family/metal */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${withAlpha(accent, 0.45)} 0%, rgba(0,0,0,0.5) 50%, ${withAlpha(metal, 0.4)} 100%)`,
              mixBlendMode: "multiply",
            }}
          />
        </div>
      )}

      {/* Name strip */}
      <div
        className="relative px-2 text-center leading-none mb-1"
        style={{
          fontFamily: "var(--font-cinzel)",
          fontWeight: 700,
          fontSize: name.length > 22 ? 14 : 17,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: foil,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: `0 0 18px ${withAlpha(metal, 0.5)}`,
          filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.55))",
          maxWidth: "94%",
        }}
      >
        {name}
      </div>

      {/* Laurel-wrapped tier lockup */}
      <div className="relative flex items-end justify-center gap-1.5 sm:gap-2 mt-1">
        <LaurelHalf side="left" color={metal} size={48} />

        <div className="relative flex flex-col items-center">
          {/* Stars row */}
          {!isSpecial && tierStars && (
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < tierStars ? metal : withAlpha(metal, 0.18),
                    fontSize: 14,
                    lineHeight: 1,
                    textShadow:
                      i < tierStars
                        ? `0 0 8px ${withAlpha(metal, 0.95)}, 0 0 14px ${withAlpha(metal, 0.5)}`
                        : undefined,
                    animation:
                      i < tierStars
                        ? `holoV2HaloPulse 2.6s ease-in-out ${i * 0.35}s infinite`
                        : undefined,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Tier letter / word */}
          <div className="relative">
            <div
              className="relative leading-none whitespace-nowrap"
              style={
                {
                  fontFamily: "var(--font-cinzel)",
                  fontWeight: 900,
                  fontSize: isSpecial ? (tier === "ASCENDED" ? 38 : 42) : 84,
                  letterSpacing: isSpecial ? "0.06em" : "-0.02em",
                  background: foil,
                  backgroundSize: "100% 250%",
                  backgroundPosition: "0% 35%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: `drop-shadow(0 0 22px ${withAlpha(metal, 0.85)}) drop-shadow(0 3px 0 ${withAlpha("#3a2a08", 0.85)})`,
                  "--metal-glow": withAlpha(metal, 0.85),
                  animation:
                    intensity.level >= 0.7 ? "holoV2TierGlow 3.4s ease-in-out infinite" : undefined,
                } as React.CSSProperties
              }
            >
              {tier === "ASCENDED" ? "ASCENDED" : tier === "MYTHIC" ? "MYTHIC" : tier}
            </div>
            {/* Chromatic-aberration ghost */}
            <div
              className="absolute inset-0 leading-none pointer-events-none whitespace-nowrap"
              aria-hidden
              style={{
                fontFamily: "var(--font-cinzel)",
                fontWeight: 900,
                fontSize: isSpecial ? (tier === "ASCENDED" ? 38 : 42) : 84,
                letterSpacing: isSpecial ? "0.06em" : "-0.02em",
                color: "transparent",
                textShadow: `
                  ${-ca}px 0 0 ${withAlpha("#FF00B8", 0.55)},
                  ${ca}px 0 0 ${withAlpha("#00E0FF", 0.55)}
                `,
                opacity: 0.6,
                zIndex: -1,
              }}
            >
              {tier === "ASCENDED" ? "ASCENDED" : tier === "MYTHIC" ? "MYTHIC" : tier}
            </div>
          </div>

          {/* Subtitle */}
          <div
            className="mt-1.5 text-[8.5px] tracking-[0.28em] uppercase"
            style={{
              fontFamily: "var(--font-plex-mono)",
              color: withAlpha(metal, 0.82),
            }}
          >
            {intensity.subtitle}
          </div>
        </div>

        <LaurelHalf side="right" color={metal} size={48} />
      </div>
    </div>
  );
}

function tierPhotoFilter(tier: Tier): string {
  switch (tier) {
    case "ASCENDED":
      return "saturate(1.3) contrast(1.05) brightness(0.85)";
    case "MYTHIC":
      return "saturate(1.15) contrast(1.05) brightness(0.82)";
    case "S":
      return "saturate(1.05) contrast(1.0) brightness(0.78)";
    case "A":
      return "saturate(0.9) contrast(0.95) brightness(0.7)";
    case "B":
      return "saturate(0.85) contrast(0.9) brightness(0.65)";
    case "C":
    case "D":
    default:
      return "saturate(0.6) contrast(0.85) brightness(0.55) grayscale(0.35)";
  }
}

function LaurelHalf({ side, color, size }: { side: "left" | "right"; color: string; size: number }) {
  const id = `laurel-v2-${side}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      width={size * 0.55}
      height={size}
      viewBox="0 0 22 40"
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined, flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* central stem */}
      <path d="M 20 4 Q 16 20 18 36" fill="none" stroke={`url(#${id})`} strokeWidth="0.9" />
      {/* leaves */}
      {[5, 11, 17, 23, 29, 33].map((y, i) => (
        <path
          key={i}
          d={`M ${20 - i * 0.3} ${y} Q ${10 - i} ${y - 2 + (i % 2)} ${4 + i * 0.4} ${y + 1}`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// =============================================================================
// CHAIN BANNER
// =============================================================================

function ChainBanner({
  name,
  description,
  metal,
}: {
  name: string;
  description?: string;
  metal: string;
}) {
  return (
    <div
      className="rounded-md px-2.5 py-1.5 border"
      style={{
        background: withAlpha(metal, 0.10),
        borderColor: withAlpha(metal, 0.45),
        transform: "translateZ(15px)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] tracking-[0.22em] uppercase font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{
            fontFamily: "var(--font-plex-mono)",
            color: "#1C0A05",
            background: metal,
          }}
        >
          CHAIN
        </span>
        <span
          className="text-base leading-tight truncate"
          style={{ fontFamily: "var(--font-cinzel)", color: metal, fontWeight: 700 }}
        >
          {name}
        </span>
      </div>
      {description && (
        <div
          className="text-[10px] leading-snug mt-1 line-clamp-2 italic"
          style={{ fontFamily: "var(--font-cormorant)", color: withAlpha("#FFFAF2", 0.7) }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer({
  id,
  metal,
  accent: _accent,
  interactive,
}: {
  id: string;
  metal: string;
  accent: string;
  interactive: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between text-[9px] tracking-[0.22em] uppercase pt-1.5 border-t mt-auto"
      style={{
        fontFamily: "var(--font-plex-mono)",
        color: withAlpha("#FFFAF2", 0.45),
        borderColor: withAlpha(metal, 0.18),
        transform: "translateZ(5px)",
      }}
    >
      <span>{id.slice(0, 6)} · ∞</span>
      <span style={{ color: withAlpha(metal, 0.7) }}>cracked.com · v1</span>
      {interactive && (
        <span style={{ color: withAlpha(metal, 0.85) }}>↻ tap to flip</span>
      )}
    </div>
  );
}

// =============================================================================
// ANIMATED CONIC BORDER
// =============================================================================

function ConicBorder({ accent }: { accent: string }) {
  return (
    <div
      className="absolute inset-[-1px] rounded-[25px] pointer-events-none"
      style={{
        background: `conic-gradient(from var(--holov2-angle, 0deg),
          ${withAlpha(accent, 0)} 0%,
          ${withAlpha(accent, 0.85)} 10%,
          ${withAlpha(accent, 0)} 25%,
          ${withAlpha(accent, 0.55)} 50%,
          ${withAlpha(accent, 0)} 65%,
          ${withAlpha(accent, 0.85)} 85%,
          ${withAlpha(accent, 0)} 100%)`,
        animation: "holoV2ConicSpin 9s linear infinite",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
        padding: 2,
      }}
    />
  );
}

// =============================================================================
// INNER BORDER FRAME (per intensity)
// =============================================================================

function BorderFrame({
  weight,
  metal,
  accent,
}: {
  weight: TierIntensity["borderWeight"];
  metal: string;
  accent: string;
}) {
  if (weight === "fade") {
    return (
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
      />
    );
  }
  if (weight === "single") {
    return (
      <div
        className="absolute rounded-[18px] pointer-events-none"
        style={{
          inset: 8,
          boxShadow: `inset 0 0 0 1px ${withAlpha(accent, 0.35)}, inset 0 0 0 2px ${withAlpha(metal, 0.10)}`,
        }}
      />
    );
  }
  if (weight === "double") {
    return (
      <>
        <div
          className="absolute rounded-[18px] pointer-events-none"
          style={{
            inset: 8,
            boxShadow: `inset 0 0 0 1px ${withAlpha(metal, 0.55)}`,
          }}
        />
        <div
          className="absolute rounded-[14px] pointer-events-none"
          style={{
            inset: 12,
            boxShadow: `inset 0 0 0 1px ${withAlpha(metal, 0.25)}`,
          }}
        />
      </>
    );
  }
  if (weight === "double-gold") {
    return (
      <>
        <div
          className="absolute rounded-[18px] pointer-events-none"
          style={{
            inset: 8,
            boxShadow: `inset 0 0 0 2px ${metal}, inset 0 0 0 3px ${withAlpha(metal, 0.4)}, inset 0 0 60px ${withAlpha(metal, 0.18)}`,
          }}
        />
        <div
          className="absolute rounded-[14px] pointer-events-none"
          style={{
            inset: 12,
            boxShadow: `inset 0 0 0 1px ${withAlpha(metal, 0.45)}`,
          }}
        />
      </>
    );
  }
  // molten — ASCENDED layered amber → coral filigree
  return (
    <>
      <div
        className="absolute rounded-[18px] pointer-events-none"
        style={{
          inset: 8,
          boxShadow:
            "inset 0 0 0 2px #FFD27A, inset 0 0 0 4px #FF5A2E, inset 0 0 0 5px rgba(255,229,168,0.5), inset 0 0 80px rgba(255,90,46,0.25)",
        }}
      />
      <div
        className="absolute rounded-[14px] pointer-events-none"
        style={{
          inset: 12,
          boxShadow: `inset 0 0 0 1px rgba(255,210,122,0.65)`,
        }}
      />
    </>
  );
}

// =============================================================================
// CORNER ORNAMENT
// =============================================================================

function CornerOrnament({
  position,
  kind,
  metal,
}: {
  position: "tl" | "tr" | "bl" | "br";
  kind: "fleur" | "laurel" | "acanthus" | "rosette" | "deco" | "bracket";
  metal: string;
}) {
  const flipX = position === "tr" || position === "br";
  const flipY = position === "bl" || position === "br";
  const pad = 6;
  return (
    <div
      className="absolute pointer-events-none z-15"
      style={{
        top: position.startsWith("t") ? pad : undefined,
        bottom: position.startsWith("b") ? pad : undefined,
        left: position.endsWith("l") ? pad : undefined,
        right: position.endsWith("r") ? pad : undefined,
        width: 34,
        height: 34,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
    >
      {renderOrnament(kind, metal)}
    </div>
  );
}

function renderOrnament(kind: string, metal: string) {
  const c = metal;
  const cd = withAlpha(metal, 0.55);
  const glow = withAlpha(metal, 0.6);
  switch (kind) {
    case "fleur":
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 4 L 12 4 M 4 4 L 4 12" stroke={cd} strokeWidth="1" />
          <path
            d="M 16 6 Q 14 12 17 16 Q 20 12 18 6 M 14 10 Q 10 12 12 16 M 20 10 Q 24 12 22 16 M 16 16 L 18 16 M 15 18 L 19 18"
            fill="none"
            stroke={c}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <circle cx="17" cy="6" r="0.9" fill={c} />
        </svg>
      );
    case "laurel":
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 4 L 14 4 M 4 4 L 4 14" stroke={cd} strokeWidth="1" />
          <path d="M 4 4 Q 20 6 28 18" fill="none" stroke={c} strokeWidth="0.9" strokeLinecap="round" />
          {[8, 12, 16, 20, 24].map((x, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={6 + i * 2.2}
              rx="2.2"
              ry="1"
              fill={c}
              transform={`rotate(${30 + i * 8} ${x} ${6 + i * 2.2})`}
              opacity="0.82"
            />
          ))}
        </svg>
      );
    case "acanthus":
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 4 L 12 4 M 4 4 L 4 12" stroke={cd} strokeWidth="1" />
          <path
            d="M 6 6 Q 12 6 14 12 Q 12 16 16 20 Q 20 16 18 12 Q 20 6 24 6"
            fill="none"
            stroke={c}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 14 12 Q 16 8 20 12 M 18 12 Q 20 16 24 14"
            fill="none"
            stroke={c}
            strokeWidth="0.65"
            opacity="0.7"
          />
        </svg>
      );
    case "rosette":
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 4 L 14 4 M 4 4 L 4 14" stroke={cd} strokeWidth="1" />
          <g transform="translate(12 12)">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-3.5"
                rx="1.4"
                ry="3.2"
                fill={c}
                transform={`rotate(${(i / 8) * 360})`}
                opacity="0.8"
              />
            ))}
            <circle r="1.9" fill={c} />
          </g>
        </svg>
      );
    case "deco":
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 4 L 16 4 M 4 4 L 4 16" stroke={c} strokeWidth="1.1" />
          <path
            d="M 4 12 L 12 12 L 12 4 M 4 20 L 20 20 L 20 4 M 4 8 L 8 8 L 8 4"
            fill="none"
            stroke={c}
            strokeWidth="0.55"
            opacity="0.7"
          />
          <circle cx="4" cy="4" r="1.7" fill={c} />
        </svg>
      );
    case "bracket":
    default:
      return (
        <svg viewBox="0 0 34 34" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
          <path d="M 4 12 V 4 H 12" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="4" cy="4" r="1.9" fill={c} />
          <line x1="4" y1="8" x2="8" y2="4" stroke={cd} strokeWidth="0.7" />
        </svg>
      );
  }
}

// =============================================================================
// MICROPRINT (along bottom border)
// =============================================================================

function Microprint({ result, metal }: { result: CrackedResultV1; metal: string }) {
  const text = `★ ${result.name.toUpperCase()} · LOT ${result.id.slice(0, 4).toUpperCase()} · TIER ${formatTier(result.tier, result.tierStars)} · CRACKED v1 · `;
  const repeated = text.repeat(3);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 18,
        right: 18,
        bottom: 4,
        height: 8,
        overflow: "hidden",
        zIndex: 14,
      }}
    >
      <div
        className="whitespace-nowrap"
        style={{
          fontFamily: "var(--font-plex-mono)",
          fontSize: 4.5,
          letterSpacing: "0.04em",
          color: withAlpha(metal, 0.72),
          textTransform: "uppercase",
        }}
      >
        {repeated}
      </div>
    </div>
  );
}

export default HoloCardV2;
