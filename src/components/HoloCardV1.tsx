// HoloCardV1 — Pokemon-TCG-grade holographic v1.0 card.
//
// Layers (back to front):
//   1. base background gradient (per-tier)
//   2. conic foil that tracks cursor position (rainbow oilslick)
//   3. diagonal sheen that slides across as you tilt
//   4. radial spotlight following cursor
//   5. ASCENDED-only: animated cosmic shimmer (slowly rotating conic)
//   6. ASCENDED-only: aurora layer (slow drifting light sheets)
//   7. embers rising from bottom (ASCENDED + MYTHIC)
//   8. halo burst behind the tier badge
//   9. sparkle particles
//   10. composed v1.0 content layer (family / tier badge / chain / percentile / sub-stats)
//   11. ornate border frame
//
// Per-tier escalation:
//   ASCENDED → Molten Royal + cosmic shimmer + aurora + max embers (26) + sigil pulse + double-gold frame + 36 sparkles
//   MYTHIC   → Cathedral Glass palette + 14 embers + halo burst + 22 sparkles
//   S        → Standard heavy holo + 12 sparkles
//   A        → Rare holo (violet/pink foil) + 8 sparkles
//   B        → Cyan rare + 6 sparkles
//   C        → Uncommon (desaturated) + 3 sparkles
//   D        → Common (single-color foil, no shimmer)

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FAMILIES_META } from "@/data/families";
import { FAMILY_LIBRARY } from "@/data/achievements";
import type { CrackedResultV1, Family, Tier, TierStars, PercentileTrio as Trio } from "@/lib/types";
import { formatTier } from "@/lib/types";
import { getLeague } from "@/data/leagues";
import { AvatarBubble } from "@/components/card/AvatarBubble";
import { CrackednessLine } from "@/components/card/CrackednessLine";
import { SpecialityLine } from "@/components/card/SpecialityLine";
import { AchievementConstellation } from "@/components/card/AchievementConstellation";
import { BorderRing } from "@/components/card/BorderRing";
import { CardBack } from "@/components/card/CardBack";
import { FamilyParticles } from "@/components/card/FamilyParticles";

// =============================================================================
// PER-TIER THEMES
// =============================================================================

interface HoloTheme {
  rarity: string;
  baseGradient: string;
  foilColors: string[];
  foilIntensity: number;
  ringColor: string;
  sparkleCount: number;
  sparkleColor: string;
  embers: number;
  haloBurst: boolean;
  cornerCrests: boolean;
  borderStyle: "fade" | "hairline" | "single" | "double" | "double-gold" | "molten";
  cosmicShimmer: boolean;
  aurora: boolean;
  liquidChrome: boolean;
  cardGlow: number;
  desaturate: number;
  badgeAnimate: boolean;
}

const THEMES: Record<Tier, HoloTheme> = {
  ASCENDED: {
    rarity: "ASCENDED",
    baseGradient:
      "radial-gradient(ellipse at 50% 110%, #6A0E0E 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, #3A1F08 0%, transparent 60%), linear-gradient(155deg, #1C0A05 0%, #0A0402 100%)",
    foilColors: ["#FFD27A", "#FF5A2E", "#EC4899", "#8B5CF6", "#06B6D4", "#FCD34D", "#FF5A2E", "#FFD27A"],
    foilIntensity: 1.0,
    ringColor: "rgba(255, 197, 100, 0.95)",
    sparkleCount: 36,
    sparkleColor: "#FFE5A8",
    embers: 26,
    haloBurst: true,
    cornerCrests: true,
    borderStyle: "molten",
    cosmicShimmer: true,
    aurora: true,
    liquidChrome: false,
    cardGlow: 1.0,
    desaturate: 0,
    badgeAnimate: true,
  },
  MYTHIC: {
    rarity: "MYTHIC",
    baseGradient:
      "radial-gradient(ellipse at 50% 110%, rgba(232,181,71,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(232,181,71,0.10) 0%, transparent 55%), linear-gradient(155deg, #1C130A 0%, #0E0805 100%)",
    foilColors: ["#8B5CF6", "#EC4899", "#FCD34D", "#06B6D4", "#8B5CF6", "#FCD34D", "#8B5CF6"],
    foilIntensity: 0.88,
    ringColor: "rgba(232, 181, 71, 0.85)",
    sparkleCount: 22,
    sparkleColor: "#FFE5A8",
    embers: 14,
    haloBurst: true,
    cornerCrests: true,
    borderStyle: "double-gold",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.85,
    desaturate: 0,
    badgeAnimate: true,
  },
  S: {
    rarity: "S TIER",
    baseGradient:
      "radial-gradient(ellipse at 50% 0%, rgba(252,211,77,0.10) 0%, transparent 55%), linear-gradient(155deg, #1A1408 0%, #0A0805 100%)",
    foilColors: ["#FCD34D", "#F59E0B", "#FCD34D", "#FF9C2E", "#FCD34D"],
    foilIntensity: 0.78,
    ringColor: "rgba(252, 211, 77, 0.70)",
    sparkleCount: 14,
    sparkleColor: "#FFE5A8",
    embers: 6,
    haloBurst: true,
    cornerCrests: false,
    borderStyle: "double-gold",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.7,
    desaturate: 0,
    badgeAnimate: false,
  },
  A: {
    rarity: "A — RARE HOLO",
    baseGradient:
      "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 55%), linear-gradient(155deg, #1A1326 0%, #0A0610 100%)",
    foilColors: ["#8B5CF6", "#EC4899", "#A78BFA", "#06B6D4", "#8B5CF6"],
    foilIntensity: 0.65,
    ringColor: "rgba(167, 139, 250, 0.55)",
    sparkleCount: 10,
    sparkleColor: "#C4A0FF",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "double",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.55,
    desaturate: 0,
    badgeAnimate: false,
  },
  B: {
    rarity: "B — RARE",
    baseGradient: "linear-gradient(155deg, #0E1A1E 0%, #050A0C 100%)",
    foilColors: ["#06B6D4", "#7DD8E8", "#06B6D4", "#0891B2"],
    foilIntensity: 0.45,
    ringColor: "rgba(34, 211, 238, 0.45)",
    sparkleCount: 6,
    sparkleColor: "#7DD8E8",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "single",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.4,
    desaturate: 0.1,
    badgeAnimate: false,
  },
  C: {
    rarity: "C — UNCOMMON",
    baseGradient: "linear-gradient(155deg, #1A140E 0%, #0A0805 100%)",
    foilColors: ["#D9CCB8", "#A8987F", "#D9CCB8"],
    foilIntensity: 0.28,
    ringColor: "rgba(200, 184, 156, 0.35)",
    sparkleCount: 3,
    sparkleColor: "#D9CCB8",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "hairline",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.25,
    desaturate: 0.4,
    badgeAnimate: false,
  },
  D: {
    rarity: "D — COMMON",
    baseGradient: "linear-gradient(155deg, #15100D 0%, #080604 100%)",
    foilColors: ["#5E5046", "#8B7A6B"],
    foilIntensity: 0.14,
    ringColor: "rgba(139, 122, 107, 0.22)",
    sparkleCount: 0,
    sparkleColor: "#8B7A6B",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "fade",
    cosmicShimmer: false,
    aurora: false,
    liquidChrome: false,
    cardGlow: 0.15,
    desaturate: 0.7,
    badgeAnimate: false,
  },
};

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
      const k = 0.14;
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
      rx: Math.sin(t * 0.45) * 2.5,
      ry: Math.cos(t * 0.35) * 3.2,
      mx: 50 + Math.sin(t * 0.55) * 7,
      my: 50 + Math.cos(t * 0.42) * 6,
    }),
    [t]
  );
}

// Deterministic PRNG so sparkles / embers stay stable per result.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface HoloCardV1Props {
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

export function HoloCardV1({ result, interactive = true, className }: HoloCardV1Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [target, setTarget] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [mounted, setMounted] = useState(false);
  // Card flip state. While flipping (200ms after toggle), we cap mouse-tilt
  // and other expensive effects so the layout doesn't composite-stress.
  const [flipped, setFlipped] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const isMobile = mounted && typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(max-width: 640px)").matches
    : false;
  const onFlip = () => {
    if (!interactive) return;
    setFlipping(true);
    setFlipped((f) => !f);
    window.setTimeout(() => setFlipping(false), 750);
  };

  useEffect(() => setMounted(true), []);

  const drift = useIdleDrift(interactive && !hovering && mounted);
  const effective = hovering ? target : drift;
  const tilt = useSpringTilt(effective);

  const tier: Tier = result.tier;
  const tierStars = result.tierStars;
  const theme = THEMES[tier];

  const family: Family = result.primaryFamily ?? DEFAULT_FAMILY;
  const secondary: Family | undefined = result.secondaryFamily;
  const familyMeta = FAMILIES_META[family];
  const percentiles: Trio = result.percentiles ?? DEFAULT_TRIO;
  const cohortLabel = result.league ? getLeague(result.league.league).label : "all cohorts";
  const headlineChainId = result.families?.find((f) => f.family === family)?.activeChains[0];
  // Look up the chain object so we can display the human name + description
  // (e.g. "The Classic Pipeline") instead of the slug.
  const headlineChain = headlineChainId
    ? FAMILY_LIBRARY.chains.find((c) => c.id === headlineChainId)
    : undefined;

  // Stable particle seed — same card always looks the same.
  const seed = useMemo(() => {
    let s = result.signalScore * 1000;
    for (const ch of result.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return s;
  }, [result.signalScore, result.id]);

  const sparkles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: theme.sparkleCount }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * (tier === "ASCENDED" ? 3.2 : 2.4),
      delay: rng() * 4,
      duration: 1.4 + rng() * 2.4,
    }));
  }, [seed, theme.sparkleCount, tier]);

  const embers = useMemo(() => {
    const rng = mulberry32(seed + 7919);
    return Array.from({ length: theme.embers }, (_, i) => ({
      x: 4 + (i / Math.max(1, theme.embers - 1)) * 92 + (rng() - 0.5) * 8,
      delay: rng() * 3,
      duration: 2.2 + rng() * 1.6,
      size: tier === "ASCENDED" ? 3 + rng() * 4.5 : 2.5 + rng() * 3.5,
      hue: rng(),
    }));
  }, [seed, theme.embers, tier]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTarget({
      rx: (y - 0.5) * -18,
      ry: (x - 0.5) * 22,
      mx: x * 100,
      my: y * 100,
    });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactive || !wrapRef.current || !e.touches[0]) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) / rect.width;
    const y = (e.touches[0].clientY - rect.top) / rect.height;
    setHovering(true);
    setTarget({
      rx: (y - 0.5) * -18,
      ry: (x - 0.5) * 22,
      mx: x * 100,
      my: y * 100,
    });
  };

  const sheenAngle = 95 + tilt.ry * 1.4;
  const foilStops = theme.foilColors
    .map((c, i, arr) => `${c} ${(i / (arr.length - 1)) * 360}deg`)
    .join(", ");

  // Suppress mouse tilt while a flip is in progress — keeps composite cost
  // bounded and avoids the back jittering as it rotates into view.
  const effectiveTilt = flipping ? { rx: 0, ry: 0 } : tilt;
  // Mobile flips on X-axis (around horizontal), desktop on Y-axis.
  const flipAxis = isMobile ? "rotateX" : "rotateY";
  const flipDeg = flipped ? (isMobile ? 180 : 180) : 0;

  return (
    <div
      ref={wrapRef}
      className={clsx("holo-card-wrap select-none relative mx-auto", className)}
      style={{ perspective: "1600px", maxWidth: 560, width: "100%" }}
      onMouseEnter={() => interactive && !flipped && setHovering(true)}
      onMouseMove={(e) => !flipped && onMouseMove(e)}
      onMouseLeave={() => {
        setHovering(false);
        setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
      }}
      onTouchStart={() => interactive && !flipped && setHovering(true)}
      onTouchMove={(e) => !flipped && onTouchMove(e)}
      onTouchEnd={() => {
        setHovering(false);
        setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
      }}
    >
      {/* Flip-pivot wrapper — rotates the entire card 180° around Y/X axis */}
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
      <div
        className={clsx(
          "holo-card relative mx-auto",
          interactive && "cursor-pointer"
        )}
        onClick={onFlip}
        style={{
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
          // CRITICAL: clip all inner layers (aurora, foil, embers, sparkles)
          // to the card's rounded-rect shape. Without this, the aurora layer's
          // transform-based animation bleeds outside the card and appears as
          // rotating ghost rectangles.
          overflow: "hidden",
          boxShadow: `
            0 ${30 + Math.abs(tilt.rx)}px ${100 + Math.abs(tilt.rx) * 2}px -20px rgba(0,0,0,0.75),
            0 0 ${80 + theme.cardGlow * 120}px -10px ${theme.ringColor},
            0 0 0 1px rgba(232,181,71,0.12) inset
          `,
        }}
      >
        {/* L1: base background */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden"
          style={{ background: theme.baseGradient }}
        />

        {/* L6: ASCENDED aurora layer — slow drifting light sheets */}
        {theme.aurora && (
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,90,46,0) 0%, rgba(255,90,46,0.45) 25%, rgba(236,72,153,0.55) 50%, rgba(252,211,77,0.45) 75%, rgba(6,182,212,0) 100%)",
              backgroundSize: "200% 200%",
              mixBlendMode: "screen",
              animation: "holoAuroraDrift 14s ease-in-out infinite",
              filter: "blur(28px)",
              opacity: 0.7,
            }}
          />
        )}

        {/* L2: conic foil — rainbow oilslick anchored to cursor */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `conic-gradient(from ${130 + tilt.ry * 3}deg at ${tilt.mx}% ${tilt.my}%, ${foilStops})`,
            opacity: theme.foilIntensity * (0.4 + (hovering ? 0.3 : 0)),
            mixBlendMode: "screen",
            filter: theme.desaturate > 0 ? `saturate(${1 - theme.desaturate})` : undefined,
            transition: "opacity 400ms",
          }}
        />

        {/* L3: diagonal sheen — slides across as you tilt */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `linear-gradient(${sheenAngle}deg,
              transparent 0%,
              transparent 40%,
              rgba(255, 245, 220, ${0.18 * theme.foilIntensity}) 49%,
              rgba(255, 255, 255, ${0.5 * theme.foilIntensity}) 50%,
              rgba(255, 245, 220, ${0.18 * theme.foilIntensity}) 51%,
              transparent 60%,
              transparent 100%
            )`,
            mixBlendMode: "overlay",
            opacity: hovering ? 1 : 0.55,
            transition: "opacity 300ms",
          }}
        />

        {/* L4: radial spotlight following cursor */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%,
              rgba(255, 240, 200, 0.5) 0%,
              rgba(255, 240, 200, 0.12) 28%,
              transparent 60%)`,
            mixBlendMode: "overlay",
            opacity: hovering ? 1 : 0.7,
            transition: "opacity 300ms",
          }}
        />

        {/* L5: ASCENDED cosmic shimmer — slowly rotating conic gradient */}
        {theme.cosmicShimmer && (
          <div
            className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(255,90,46,0.0) 0deg, rgba(255,90,46,0.35) 60deg, rgba(255,210,122,0.0) 120deg, rgba(139,92,246,0.32) 180deg, rgba(6,182,212,0.0) 240deg, rgba(252,211,77,0.32) 300deg, rgba(255,90,46,0.0) 360deg)",
              mixBlendMode: "screen",
              animation: "holoMegaShimmer 9s linear infinite",
              opacity: 0.55,
            }}
          />
        )}

        {/* L6.5: family-specific particle category. Maps each of the 9 career
            families to one of 3 visual languages: rising / drift / code-rain.
            Replaces the generic ember sheet for non-fire families. */}
        <FamilyParticles family={family} tier={tier} seed={seed} />

        {/* L7: embers rising from bottom (ASCENDED + MYTHIC + S) */}
        {theme.embers > 0 && (
          <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
            {embers.map((e, i) => {
              const isAscended = tier === "ASCENDED";
              const hot = isAscended || e.hue > 0.5;
              const grad = hot
                ? "radial-gradient(circle, #FFFEF2 0%, #FFE5A8 22%, #FFA53E 48%, #FF5A2E 72%, rgba(176,30,30,0.6) 88%, transparent 100%)"
                : "radial-gradient(circle, #FFF8D9 0%, #FFD27A 30%, #E8B547 60%, rgba(184,134,43,0.5) 85%, transparent 100%)";
              return (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    left: `${e.x}%`,
                    bottom: -4,
                    width: e.size,
                    height: e.size * 1.7,
                    borderRadius: "50%",
                    background: grad,
                    boxShadow: `0 0 ${e.size * 3}px ${e.size * 0.8}px ${hot ? "rgba(255,150,60,0.55)" : "rgba(232,181,71,0.45)"}`,
                    filter: "blur(0.4px)",
                    opacity: 0,
                    mixBlendMode: "screen",
                    animation: `holoEmberRise ${e.duration}s ease-out ${e.delay}s infinite`,
                  }}
                />
              );
            })}
            {/* warm floor glow */}
            <div
              className="absolute left-0 right-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background:
                  tier === "ASCENDED"
                    ? "radial-gradient(ellipse 80% 100% at 50% 110%, rgba(255,140,60,0.65) 0%, rgba(255,90,46,0.30) 35%, rgba(178,30,30,0.0) 75%)"
                    : "radial-gradient(ellipse 70% 100% at 50% 110%, rgba(255,210,122,0.55) 0%, rgba(232,181,71,0.25) 40%, transparent 75%)",
                mixBlendMode: "screen",
                animation: "holoFloorBreathe 3.2s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* L8: halo burst behind the tier badge */}
        {theme.haloBurst && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: "42%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "78%",
              height: "32%",
              background:
                tier === "ASCENDED"
                  ? "radial-gradient(ellipse, rgba(255,90,46,0.45) 0%, rgba(255,210,122,0.25) 30%, transparent 65%)"
                  : "radial-gradient(ellipse, rgba(232,181,71,0.35) 0%, rgba(232,181,71,0.0) 70%)",
              mixBlendMode: "screen",
              filter: "blur(10px)",
              animation: "holoHaloPulse 3.6s ease-in-out infinite",
            }}
          />
        )}

        {/* L9: sparkles */}
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
                  background: theme.sparkleColor,
                  boxShadow: `0 0 ${s.size * 4}px ${s.size}px ${withAlpha(theme.sparkleColor, 0.7)}`,
                  opacity: 0,
                  animation: `holoTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* L11: ornate border frame — corner crests for ASCENDED + MYTHIC */}
        {theme.cornerCrests && (
          <>
            <CornerCrest position="tl" tier={tier} />
            <CornerCrest position="tr" tier={tier} />
            <CornerCrest position="bl" tier={tier} />
            <CornerCrest position="br" tier={tier} />
          </>
        )}
        <BorderFrame style={theme.borderStyle} />
        {/* L11.5: animated border ring — runs glowing segments around the
            perimeter for ASCENDED/MYTHIC/S. Stroke-dashoffset only — no
            translates, so no ghost-rectangle escape. */}
        <BorderRing tier={tier} accent={familyMeta.accent} />

        {/* L10: content layer — v1.0 TCG anatomy with new simplified stats
            ───────────────────────────────────────────────────────────────
            (1) Name bar:    avatar + name (left)  +  cohort stamp (right)
            (2) Type bar:    family glyph + family name + secondary + rarity
            (3) Illustration: tier badge (photo background slot added in Phase 3)
            (4) Crackedness flex: single "top X% most cracked Y-year-olds" line
            (5) Ability band: chain (if any)
            (6) Speciality:  single labeled phrase from LLM extraction
            (7) Footer:      card-id · rarity dots · cracked.com · v1.0
        */}
        <div
          className="relative z-10 px-4 sm:px-5 py-4 sm:py-5 h-full flex flex-col gap-2"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* (1) NAME BAR — avatar + name + cohort stamp */}
          <div
            className="flex items-center justify-between gap-3"
            style={{ transform: "translateZ(25px)" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AvatarBubble
                name={result.name}
                photoUrl={result.photoUrl}
                tier={tier}
                family={family}
                size={40}
              />
              <div className="font-display text-lg sm:text-xl text-white leading-tight truncate">
                {result.name}
              </div>
            </div>
            <CohortStamp label={cohortLabel} accent={theme.sparkleColor} />
          </div>

          {/* (2) TYPE BAR — family glyph + name + optional secondary + rarity */}
          <div
            className="flex items-center justify-between gap-2"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-base leading-none shrink-0"
                style={{ color: familyMeta.accent }}
                aria-hidden
              >
                {familyMeta.glyph}
              </span>
              <span
                className="font-mono text-[10px] tracking-[0.18em] uppercase truncate"
                style={{ color: familyMeta.accent }}
              >
                {familyMeta.name}
              </span>
              {secondary && (
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/35 truncate">
                  · also {FAMILIES_META[secondary].shortName}
                </span>
              )}
            </div>
            <RarityStamp tier={tier} tierStars={tierStars} theme={theme} />
          </div>

          {/* (3) ILLUSTRATION — tier badge with photo + constellation overlay */}
          <div
            className="flex-1 flex items-center justify-center py-1"
            style={{ transform: "translateZ(40px)" }}
          >
            <TierIllustration
              tier={tier}
              tierStars={tierStars}
              theme={theme}
              photoUrl={result.photoUrl}
              name={result.name}
              achievements={result.achievementsAll}
              family={family}
            />
          </div>

          {/* (4) CRACKEDNESS FLEX — the single screenshot-bait line */}
          <div style={{ transform: "translateZ(18px)" }}>
            <CrackednessLine
              percentiles={percentiles}
              cohortLabel={cohortLabel}
              family={family}
              age={result.league?.age}
            />
          </div>

          {/* (5) ABILITY BAND — chain unlocked (only if a chain matched) */}
          {headlineChain && (
            <div
              className="rounded-md px-2.5 py-1.5 border"
              style={{
                background: withAlpha(theme.sparkleColor, 0.1),
                borderColor: withAlpha(theme.sparkleColor, 0.4),
                transform: "translateZ(15px)",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-[9px] tracking-[0.2em] uppercase font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: "#1C0A05", background: theme.sparkleColor }}
                >
                  CHAIN
                </span>
                <span
                  className="font-display text-base leading-tight truncate"
                  style={{ color: theme.sparkleColor }}
                >
                  {headlineChain.name}
                </span>
              </div>
              {headlineChain.description && (
                <div className="font-mono text-[10px] leading-snug text-white/65 mt-1 line-clamp-2">
                  {headlineChain.description}
                </div>
              )}
            </div>
          )}

          {/* (6) SPECIALITY — LLM-derived phrase, regex template fallback */}
          <div style={{ transform: "translateZ(10px)" }}>
            <SpecialityLine
              speciality={result.speciality}
              family={family}
              calibrating={result.calibrating}
            />
          </div>

          {/* (7) FOOTER — card-id · rarity dots · cracked.com · v1.0 */}
          <div
            className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-white/45 pt-1 border-t border-white/10 mt-auto"
            style={{ transform: "translateZ(5px)" }}
          >
            <span>{result.id.slice(0, 6)} / ∞</span>
            <span className="flex items-center gap-2">
              <span style={{ color: theme.sparkleColor, fontSize: "12px" }}>{rarityDot(tier)}</span>
              <span>cracked.com · v1.0</span>
            </span>
          </div>
        </div>
      </div>
      {/* BACK FACE — pre-rotated 180° so when the flip pivot rotates, the back
          presents the right way around. Same cursor & click handler. */}
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
          boxShadow: `0 30px 100px -20px rgba(0,0,0,0.75), 0 0 80px -10px ${theme.ringColor}`,
        }}
      >
        <CardBack result={result} />
      </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function BorderFrame({ style }: { style: HoloTheme["borderStyle"] }) {
  if (style === "fade") {
    return (
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
      />
    );
  }
  if (style === "hairline") {
    return (
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
      />
    );
  }
  if (style === "single") {
    return (
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(252,211,77,0.25), inset 0 0 0 3px rgba(252,211,77,0.05)",
        }}
      />
    );
  }
  if (style === "double") {
    return (
      <>
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(167,139,250,0.5)" }}
        />
        <div
          className="absolute rounded-[20px] pointer-events-none"
          style={{
            inset: 4,
            boxShadow: "inset 0 0 0 1px rgba(167,139,250,0.25)",
          }}
        />
      </>
    );
  }
  if (style === "double-gold") {
    return (
      <>
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 2px #D4AF37, inset 0 0 0 3px rgba(255,229,168,0.4)",
          }}
        />
        <div
          className="absolute rounded-[18px] pointer-events-none"
          style={{
            inset: 6,
            boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.45)",
          }}
        />
      </>
    );
  }
  // molten — ASCENDED. Layered amber → coral filigree.
  return (
    <>
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 2px #FFD27A, inset 0 0 0 4px #FF5A2E, inset 0 0 0 5px rgba(255,229,168,0.5)",
        }}
      />
      <div
        className="absolute rounded-[18px] pointer-events-none"
        style={{
          inset: 7,
          boxShadow:
            "inset 0 0 0 1px rgba(255,210,122,0.65), inset 0 0 14px rgba(255,90,46,0.25)",
        }}
      />
    </>
  );
}

// =============================================================================
// TCG-ANATOMY SUB-COMPONENTS
// =============================================================================

const TIER_GRADIENT: Record<Tier, string> = {
  ASCENDED: "linear-gradient(135deg, #FFD27A 0%, #FF5A2E 45%, #EC4899 100%)",
  MYTHIC:   "linear-gradient(135deg, #FFE5A8 0%, #E8B547 100%)",
  S:        "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
  A:        "linear-gradient(135deg, #C4A0FF 0%, #7C3AED 100%)",
  B:        "linear-gradient(135deg, #7DD8E8 0%, #0891B2 100%)",
  C:        "linear-gradient(135deg, #D9CCB8 0%, #8B7A5E 100%)",
  D:        "linear-gradient(135deg, #6B5C50 0%, #2A211C 100%)",
};

const TIER_TEXT_COLOR: Record<Tier, string> = {
  ASCENDED: "#1C0A05",
  MYTHIC:   "#1C0A05",
  S:        "#1C0A05",
  A:        "#FFFFFF",
  B:        "#FFFFFF",
  C:        "#1C140E",
  D:        "#D9CCB8",
};

const TIER_STARS: Record<Tier, string> = {
  ASCENDED: "",
  MYTHIC:   "",
  S:        "★ ★ ★",
  A:        "★ ★ ★",
  B:        "★ ★ ★",
  C:        "★ ★ ★",
  D:        "★ ★ ★",
};

const TIER_SUBTITLE: Record<Tier, string> = {
  ASCENDED: "0.001% — lifetime-defining",
  MYTHIC:   "0.1% — career-defining",
  S:        "1% — obviously cracked",
  A:        "top 5-10% — recognized",
  B:        "top 10-20% — climbing",
  C:        "top 30-50% — believer",
  D:        "long tail — day one",
};

/** Per-tier photo treatment — controls how the LinkedIn profile picture is
 *  composited behind the tier text. Higher tiers get warmer/brighter grades. */
function photoTreatment(tier: Tier): {
  filter: string;
  overlay: string;
  bgOpacity: number;
  textShadow: string;
} {
  switch (tier) {
    case "ASCENDED":
      return {
        filter: "saturate(1.25) contrast(1.08) brightness(0.95)",
        overlay:
          "linear-gradient(180deg, rgba(255, 142, 70, 0.55) 0%, rgba(255, 90, 46, 0.40) 50%, rgba(180, 50, 20, 0.55) 100%)",
        bgOpacity: 0.45,
        textShadow:
          "0 2px 0 rgba(0,0,0,0.45), 0 0 18px rgba(255,213,122,0.9), 0 0 32px rgba(255,180,90,0.6)",
      };
    case "MYTHIC":
      return {
        filter: "saturate(1.1) contrast(1.05) brightness(0.92) sepia(0.10)",
        overlay:
          "linear-gradient(180deg, rgba(232, 181, 71, 0.55) 0%, rgba(184, 132, 50, 0.42) 50%, rgba(120, 80, 30, 0.55) 100%)",
        bgOpacity: 0.50,
        textShadow: "0 2px 0 rgba(0,0,0,0.5), 0 0 14px rgba(255,210,122,0.75)",
      };
    case "S":
      return {
        filter: "saturate(1.0) contrast(1.04) brightness(0.85)",
        overlay:
          "linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.30) 50%, rgba(0, 0, 0, 0.55) 100%)",
        bgOpacity: 0.55,
        textShadow: "0 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(255,255,255,0.3)",
      };
    case "A":
      return {
        filter: "saturate(0.95) contrast(1.0) brightness(0.80)",
        overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.65) 100%)",
        bgOpacity: 0.60,
        textShadow: "0 2px 4px rgba(0,0,0,0.7)",
      };
    case "B":
    case "C":
    case "D":
    default:
      return {
        filter: "saturate(0.7) contrast(0.95) brightness(0.65) grayscale(0.3)",
        overlay: "linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.78) 100%)",
        bgOpacity: 0.70,
        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
      };
  }
}

/** The big illustration-area tier badge. Dominates the upper-mid of the card.
 *  Phase 3: photo background with per-tier treatment + Ken Burns drift +
 *  achievement constellation overlay (only S+ tiers). */
function TierIllustration({
  tier,
  tierStars,
  theme,
  photoUrl,
  name,
  achievements,
  family,
}: {
  tier: Tier;
  tierStars?: TierStars;
  theme: HoloTheme;
  photoUrl?: string;
  name?: string;
  achievements?: Array<{ id: string; label: string; family: Family; tier: Tier }>;
  family?: Family;
}) {
  const hasPhoto = !!photoUrl;
  const treat = photoTreatment(tier);
  return (
    <div
      className="relative w-[92%] max-w-[440px] aspect-[5/3] rounded-2xl flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: hasPhoto ? "#0a0a0a" : TIER_GRADIENT[tier],
        boxShadow:
          tier === "ASCENDED"
            ? "0 12px 32px rgba(255, 90, 46, 0.55), inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -8px 24px rgba(0,0,0,0.25)"
            : tier === "MYTHIC"
            ? "0 8px 24px rgba(232, 181, 71, 0.45), inset 0 2px 6px rgba(255,255,255,0.3), inset 0 -6px 18px rgba(0,0,0,0.2)"
            : "0 6px 18px rgba(0,0,0,0.35), inset 0 2px 5px rgba(255,255,255,0.25), inset 0 -4px 14px rgba(0,0,0,0.18)",
      }}
    >
      {/* PHOTO LAYER — illustration background. Ken Burns scale+drift loop. */}
      {hasPhoto && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%", // bias up since face is usually upper half
              filter: treat.filter,
              animation: "photoKenBurns 28s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          {/* per-tier color grade overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: treat.overlay,
              opacity: treat.bgOpacity,
            }}
          />
          {/* For lower tiers — keep a faint tier gradient sheen on top so the
              card still has a tier-colored mood when photo is dim. */}
          {(tier === "A" || tier === "B" || tier === "C" || tier === "D") && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: TIER_GRADIENT[tier],
                opacity: 0.18,
                mixBlendMode: "color",
              }}
            />
          )}
        </>
      )}
      {/* internal shimmer for ASCENDED+MYTHIC — gives the badge surface life */}
      {(tier === "ASCENDED" || tier === "MYTHIC") && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              tier === "ASCENDED"
                ? "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.0) 0deg, rgba(255,255,255,0.35) 60deg, rgba(255,255,255,0.0) 120deg, rgba(255,255,255,0.25) 240deg, rgba(255,255,255,0.0) 360deg)"
                : "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.0) 0deg, rgba(255,255,255,0.25) 90deg, rgba(255,255,255,0.0) 180deg, rgba(255,255,255,0.15) 270deg, rgba(255,255,255,0.0) 360deg)",
            mixBlendMode: "overlay",
            animation: "holoMegaShimmer 12s linear infinite",
          }}
        />
      )}

      {/* ACHIEVEMENT CONSTELLATION — stars representing matched achievements,
          deterministic positions via hash. Tier-gated (S+) inside the component. */}
      {family && achievements && achievements.length > 0 && (
        <AchievementConstellation
          achievements={achievements}
          seed={name ?? "anon"}
          cardTier={tier}
          family={family}
        />
      )}

      {/* faint scanline grid behind the text — pokemon illustration vibe */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <div
        className="relative font-display tracking-[0.18em] font-bold leading-none"
        style={{
          color: hasPhoto ? "#FFFFFF" : TIER_TEXT_COLOR[tier],
          fontSize: tier === "ASCENDED" ? "44px" : tier === "MYTHIC" ? "40px" : "36px",
          textShadow: hasPhoto ? treat.textShadow : (tier === "ASCENDED" ? "0 2px 0 rgba(0,0,0,0.15)" : undefined),
        }}
      >
        {formatTier(tier, tierStars)}
      </div>
      {tierStars && TIER_STARS[tier] && (
        <div
          className="relative mt-2 font-display text-base sm:text-lg"
          style={{
            color: hasPhoto ? "#FFFFFF" : TIER_TEXT_COLOR[tier],
            opacity: 0.85,
            letterSpacing: "0.1em",
            textShadow: hasPhoto ? "0 1px 2px rgba(0,0,0,0.5)" : undefined,
          }}
          aria-hidden
        >
          {starGlyphs(tierStars)}
        </div>
      )}
      <div
        className="relative mt-3 font-mono text-[9px] sm:text-[10px] tracking-[0.18em] uppercase"
        style={{
          color: hasPhoto ? "#FFFFFF" : TIER_TEXT_COLOR[tier],
          opacity: 0.7,
          textShadow: hasPhoto ? "0 1px 2px rgba(0,0,0,0.5)" : undefined,
        }}
      >
        {TIER_SUBTITLE[tier]}
      </div>
    </div>
  );
}

/** Top-right HP stamp equivalent — shows the user's cohort age range. */
function CohortStamp({ label, accent }: { label: string; accent: string }) {
  return (
    <div
      className="font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded shrink-0"
      style={{
        color: accent,
        border: `1px solid ${withAlpha(accent, 0.4)}`,
        background: "rgba(0,0,0,0.4)",
      }}
    >
      {label}
    </div>
  );
}

/** Tiny rarity stamp shown next to the family — like Pokemon's "Stage 1" / "Basic" label. */
function RarityStamp({ tier, tierStars, theme }: { tier: Tier; tierStars?: TierStars; theme: HoloTheme }) {
  return (
    <span
      className="font-mono text-[8px] tracking-[0.22em] uppercase font-bold px-1.5 py-[3px] rounded"
      style={{
        color: TIER_TEXT_COLOR[tier],
        background: TIER_GRADIENT[tier],
        boxShadow: `0 0 8px ${withAlpha(theme.sparkleColor, 0.4)}`,
      }}
    >
      {formatTier(tier, tierStars)}
    </span>
  );
}

function starGlyphs(stars: TierStars): string {
  return Array.from({ length: stars }, () => "★").join(" ");
}

function rarityDot(tier: Tier): string {
  switch (tier) {
    case "ASCENDED": return "✦ ✦";
    case "MYTHIC":   return "★ ★";
    case "S":        return "★";
    case "A":        return "◆";
    case "B":        return "◆";
    case "C":        return "○";
    case "D":        return "·";
  }
}

function CornerCrest({
  position,
  tier,
}: {
  position: "tl" | "tr" | "bl" | "br";
  tier: Tier;
}) {
  const posClasses: Record<typeof position, string> = {
    tl: "top-2 left-2",
    tr: "top-2 right-2",
    bl: "bottom-2 left-2",
    br: "bottom-2 right-2",
  };
  const rotation = position === "tr" ? 90 : position === "br" ? 180 : position === "bl" ? 270 : 0;
  const color = tier === "ASCENDED" ? "#FFD27A" : "#E8B547";
  return (
    <svg
      className={clsx("absolute pointer-events-none z-[6]", posClasses[position])}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{ transform: `rotate(${rotation}deg)`, color }}
    >
      <path
        d="M 1 1 L 8 1 L 8 3 L 3 3 L 3 8 L 1 8 Z M 6 5 L 8 5 L 8 6 L 6 6 Z M 5 6 L 6 6 L 6 8 L 5 8 Z"
        fill="currentColor"
        opacity="0.92"
      />
      <circle cx="3.5" cy="3.5" r="0.8" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
