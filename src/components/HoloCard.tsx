"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { CrackedResult, Tier } from "@/lib/types";
import type { Archetype } from "@/data/archetypes";
import { getLeague } from "@/data/leagues";

interface HoloCardProps {
  result: CrackedResult;
  archetype: Archetype;
  interactive?: boolean;
  className?: string;
  /**
   * Encoded share blob — used to swap the user's age via /api/place from the
   * card's edit affordance. Pass null on already-resolved or read-only pages.
   */
  encoded?: string | null;
}

// =============================================================================
// CARD GRADE — Pokemon-style rarity progression.
// mega-s = absolute S-tier overall (the rarest, most ornate, full-effect frame)
// s      = league S but not absolute S — really cool, less extreme
// a/b/c/d = ordinary tiers, descending
// =============================================================================
type CardGrade = "mega-s" | "s" | "a" | "b" | "c" | "d";

function getCardGrade(result: CrackedResult): CardGrade {
  const lt = result.league?.leagueTier;
  if (result.tier === "S") return "mega-s";
  if (lt === "S") return "s";
  return result.tier.toLowerCase() as CardGrade;
}

interface GradeTheme {
  // Rarity label
  rarity: string;
  stars: string;
  // Palette
  primary: string;
  secondary: string;
  deep: string;
  ring: string;
  // Score gradient
  scoreFrom: string;
  scoreMid: string;
  scoreTo: string;
  // Card base background
  baseGradient: string;
  // Foil
  foilIntensity: number;
  foilColors: string[]; // conic gradient stops
  desaturate: number;
  // Effects
  sparkleCount: number;
  sparkleColor: string;
  embers: number;
  haloBurst: boolean;
  cornerCrests: boolean;
  // Border
  borderStyle: "fade" | "hairline" | "single" | "double" | "double-gold";
  // Tier badge style
  badgeAnimate: boolean;
  // Drop shadow / glow intensity
  cardGlow: number; // 0-1
}

const GRADE_THEMES: Record<CardGrade, GradeTheme> = {
  "mega-s": {
    rarity: "ASCENDED",
    stars: "✦✦✦✦✦",
    primary: "#FFE5A8",
    secondary: "#E8B547",
    deep: "#7A1A1A",
    ring: "rgba(255, 197, 100, 0.95)",
    scoreFrom: "#FFFFFF",
    scoreMid: "#FFD27A",
    scoreTo: "#FF5A2E",
    baseGradient:
      "radial-gradient(ellipse at 50% 110%, #6A0E0E 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, #3A1F08 0%, transparent 60%), linear-gradient(155deg, #1C0A05 0%, #0A0402 100%)",
    foilIntensity: 1.0,
    foilColors: [
      "#FFD27A", "#FF5A2E", "#EC4899", "#8B5CF6",
      "#06B6D4", "#FCD34D", "#FF5A2E", "#FFD27A",
    ],
    desaturate: 0,
    sparkleCount: 36,
    sparkleColor: "#FFE5A8",
    embers: 26,
    haloBurst: true,
    cornerCrests: true,
    borderStyle: "double-gold",
    badgeAnimate: true,
    cardGlow: 1.0,
  },
  s: {
    rarity: "MYTHIC",
    stars: "★★★★★",
    primary: "#FFE5A8",
    secondary: "#E8B547",
    deep: "#B98A2E",
    ring: "rgba(232, 181, 71, 0.85)",
    scoreFrom: "#FFFFFF",
    scoreMid: "#FFE5A8",
    scoreTo: "#B98A2E",
    baseGradient:
      "radial-gradient(ellipse at 50% 110%, rgba(232,181,71,0.18) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(232,181,71,0.10) 0%, transparent 55%), linear-gradient(155deg, #1C130A 0%, #0E0805 100%)",
    foilIntensity: 0.88,
    foilColors: ["#8B5CF6", "#EC4899", "#FCD34D", "#06B6D4", "#8B5CF6", "#FCD34D", "#8B5CF6"],
    desaturate: 0,
    sparkleCount: 22,
    sparkleColor: "#FFE5A8",
    embers: 14,
    haloBurst: true,
    cornerCrests: true,
    borderStyle: "double-gold",
    badgeAnimate: false,
    cardGlow: 0.85,
  },
  a: {
    rarity: "RARE HOLO",
    stars: "★★★★",
    primary: "#C4A0FF",
    secondary: "#8B5CF6",
    deep: "#5B21B6",
    ring: "rgba(167, 139, 250, 0.55)",
    scoreFrom: "#FFFFFF",
    scoreMid: "#C4A0FF",
    scoreTo: "#7C3AED",
    baseGradient:
      "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 55%), linear-gradient(155deg, #1A1326 0%, #0A0610 100%)",
    foilIntensity: 0.65,
    foilColors: ["#8B5CF6", "#EC4899", "#A78BFA", "#06B6D4", "#8B5CF6"],
    desaturate: 0,
    sparkleCount: 12,
    sparkleColor: "#C4A0FF",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "double",
    badgeAnimate: false,
    cardGlow: 0.55,
  },
  b: {
    rarity: "RARE",
    stars: "★★★",
    primary: "#7DD8E8",
    secondary: "#06B6D4",
    deep: "#0E7490",
    ring: "rgba(34, 211, 238, 0.45)",
    scoreFrom: "#FFFFFF",
    scoreMid: "#7DD8E8",
    scoreTo: "#0891B2",
    baseGradient: "linear-gradient(155deg, #0E1A1E 0%, #050A0C 100%)",
    foilIntensity: 0.45,
    foilColors: ["#06B6D4", "#7DD8E8", "#06B6D4", "#0891B2"],
    desaturate: 0.1,
    sparkleCount: 6,
    sparkleColor: "#7DD8E8",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "single",
    badgeAnimate: false,
    cardGlow: 0.4,
  },
  c: {
    rarity: "UNCOMMON",
    stars: "★★",
    primary: "#D9CCB8",
    secondary: "#A8987F",
    deep: "#6E6354",
    ring: "rgba(200, 184, 156, 0.35)",
    scoreFrom: "#FFFFFF",
    scoreMid: "#D9CCB8",
    scoreTo: "#8B7A5E",
    baseGradient: "linear-gradient(155deg, #1A140E 0%, #0A0805 100%)",
    foilIntensity: 0.28,
    foilColors: ["#D9CCB8", "#A8987F", "#D9CCB8"],
    desaturate: 0.4,
    sparkleCount: 3,
    sparkleColor: "#D9CCB8",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "hairline",
    badgeAnimate: false,
    cardGlow: 0.25,
  },
  d: {
    rarity: "COMMON",
    stars: "★",
    primary: "#8B7A6B",
    secondary: "#5E5046",
    deep: "#3F352D",
    ring: "rgba(139, 122, 107, 0.22)",
    scoreFrom: "#D9CCB8",
    scoreMid: "#8B7A6B",
    scoreTo: "#5E5046",
    baseGradient: "linear-gradient(155deg, #15100D 0%, #080604 100%)",
    foilIntensity: 0.14,
    foilColors: ["#5E5046", "#8B7A6B"],
    desaturate: 0.7,
    sparkleCount: 0,
    sparkleColor: "#8B7A6B",
    embers: 0,
    haloBurst: false,
    cornerCrests: false,
    borderStyle: "fade",
    badgeAnimate: false,
    cardGlow: 0.15,
  },
};

// =============================================================================
// Motion hooks
// =============================================================================

// Spring-smoothed tilt for buttery motion instead of jittery snap.
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

// Idle breathing — a slow figure-eight when the card isn't being touched.
function useIdleDrift(active: boolean) {
  const [drift, setDrift] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const dt = (t - start) / 1000;
      const rx = Math.sin(dt * 0.6) * 2.2;
      const ry = Math.cos(dt * 0.5) * 3.2;
      const mx = 50 + Math.cos(dt * 0.4) * 18;
      const my = 50 + Math.sin(dt * 0.55) * 14;
      setDrift({ rx, ry, mx, my });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return drift;
}

// =============================================================================
// Main
// =============================================================================

export function HoloCard({
  result,
  archetype,
  interactive = true,
  className,
  encoded,
}: HoloCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [target, setTarget] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const drift = useIdleDrift(interactive && !hovering && mounted);
  const effective = hovering ? target : drift;
  const tilt = useSpringTilt(effective);

  const grade = getCardGrade(result);
  const theme = GRADE_THEMES[grade];

  // Visible tier inside the card content — leads with league when available.
  const displayTier: Tier = result.league?.leagueTier ?? result.tier;
  const league = result.league ? getLeague(result.league.league) : null;

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

  const topSignals = [...result.categories]
    .flatMap((c) => c.signals.slice(0, 1))
    .filter((s) => s.tier === "S" || s.tier === "A")
    .slice(0, 4);

  // Stable sparkle layout — deterministic per archetype.
  const sparkles = useMemo(() => {
    const rng = mulberry32(result.total * 1000 + archetype.number);
    return Array.from({ length: theme.sparkleCount }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * (grade === "mega-s" ? 3.2 : 2.5),
      delay: rng() * 4,
      duration: 1.4 + rng() * 2.4,
    }));
  }, [theme.sparkleCount, result.total, archetype.number, grade]);

  // Stable ember positions — anchored to the bottom edge. Bigger + brighter
  // for higher grades so the fire is unmistakable.
  const embers = useMemo(() => {
    const rng = mulberry32(result.total * 7919 + archetype.number);
    return Array.from({ length: theme.embers }, (_, i) => ({
      x: 4 + (i / Math.max(1, theme.embers - 1)) * 92 + (rng() - 0.5) * 8,
      delay: rng() * 3,
      duration: 2.2 + rng() * 1.6,
      size: grade === "mega-s" ? 3 + rng() * 4.5 : 2.5 + rng() * 3.5,
      hue: rng(),
    }));
  }, [theme.embers, result.total, archetype.number, grade]);

  const sheenAngle = 95 + tilt.ry * 1.4;

  // Conic foil stops — built from the theme palette.
  const foilStops = theme.foilColors
    .map((c, i, arr) => `${c} ${(i / (arr.length - 1)) * 360}deg`)
    .join(", ");

  return (
    <div
      className={clsx("holo-card-wrap select-none relative", className)}
      style={{ perspective: "1600px" }}
    >
      <div
        ref={wrapRef}
        onMouseEnter={() => interactive && setHovering(true)}
        onMouseMove={onMouseMove}
        onMouseLeave={() => {
          setHovering(false);
          setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
        }}
        onTouchStart={() => interactive && setHovering(true)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => {
          setHovering(false);
          setTarget({ rx: 0, ry: 0, mx: 50, my: 50 });
        }}
        className={clsx(
          "holo-card relative",
          interactive && "cursor-grab active:cursor-grabbing",
          grade === "mega-s" && "holo-mega",
        )}
        style={{
          aspectRatio: "2 / 3",
          width: "100%",
          maxWidth: 480,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          willChange: "transform",
          borderRadius: 24,
          boxShadow: `
            0 ${30 + Math.abs(tilt.rx)}px ${80 + Math.abs(tilt.rx) * 2}px -20px rgba(0,0,0,0.7),
            0 0 ${80 + theme.cardGlow * 80}px -10px ${theme.ring},
            0 0 0 1px rgba(232,181,71,0.10) inset
          `,
        }}
      >
        {/* Base background */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden"
          style={{ background: theme.baseGradient }}
        />

        {/* Foil 1 — conic rainbow built from theme palette */}
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

        {/* Foil 2 — diagonal sheen */}
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

        {/* Foil 3 — radial spotlight following cursor */}
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

        {/* MEGA-only: animated cosmic shimmer behind everything */}
        {grade === "mega-s" && (
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

        {/* Ember layer — fire rising from bottom (mythic + ascended) */}
        {theme.embers > 0 && (
          <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none z-[5]">
            {embers.map((e, i) => {
              const isMega = grade === "mega-s";
              const hot = isMega || e.hue > 0.5;
              const grad = hot
                ? `radial-gradient(circle, #FFFEF2 0%, #FFE5A8 22%, #FFA53E 48%, #FF5A2E 72%, rgba(176,30,30,0.6) 88%, transparent 100%)`
                : `radial-gradient(circle, #FFF8D9 0%, #FFD27A 30%, #E8B547 60%, rgba(184,134,43,0.5) 85%, transparent 100%)`;
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
            {/* warm floor glow — thicker and brighter */}
            <div
              className="absolute left-0 right-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background:
                  grade === "mega-s"
                    ? "radial-gradient(ellipse 80% 100% at 50% 110%, rgba(255,140,60,0.65) 0%, rgba(255,90,46,0.30) 35%, rgba(178,30,30,0.0) 75%)"
                    : "radial-gradient(ellipse 70% 100% at 50% 110%, rgba(255,210,122,0.55) 0%, rgba(232,181,71,0.25) 40%, transparent 75%)",
                mixBlendMode: "screen",
                animation: "holoFloorBreathe 3.2s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* halo burst behind the name (radial cosmic flare) */}
        {theme.haloBurst && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: "23%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "82%",
              height: "30%",
              background:
                grade === "mega-s"
                  ? "radial-gradient(ellipse, rgba(255,90,46,0.45) 0%, rgba(255,210,122,0.25) 30%, transparent 65%)"
                  : "radial-gradient(ellipse, rgba(232,181,71,0.35) 0%, rgba(232,181,71,0.0) 70%)",
              mixBlendMode: "screen",
              filter: "blur(8px)",
              animation: "holoHaloPulse 3.6s ease-in-out infinite",
            }}
          />
        )}

        {/* Sparkles */}
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

        {/* Subtle grain */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.2' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.95 0 0 0 0 0.85 0 0 0 0.08 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")",
            mixBlendMode: "overlay",
            opacity: 0.5,
          }}
        />

        {/* Border frame — switches design per grade */}
        <BorderFrame style={theme.borderStyle} primary={theme.primary} secondary={theme.secondary} />

        {/* MEGA-only: corner crests (Mega EX style flourish) */}
        {theme.cornerCrests && (
          <>
            <CornerCrest position="tl" color={theme.primary} grade={grade} />
            <CornerCrest position="tr" color={theme.primary} grade={grade} />
            <CornerCrest position="bl" color={theme.primary} grade={grade} />
            <CornerCrest position="br" color={theme.primary} grade={grade} />
          </>
        )}

        {/* Edge light */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background: `linear-gradient(${90 + tilt.ry * 3}deg,
              ${withAlpha(theme.primary, Math.max(0, tilt.ry / 60))} 0%,
              transparent 25%,
              transparent 75%,
              ${withAlpha(theme.primary, Math.max(0, -tilt.ry / 60))} 100%
            )`,
            mixBlendMode: "screen",
            opacity: hovering ? 1 : 0.4,
            transition: "opacity 300ms",
          }}
        />

        {/* Content */}
        <div
          className="relative h-full w-full flex flex-col p-7 pt-5 z-10"
          style={{ transform: "translateZ(50px)" }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start gap-1" style={{ transform: "translateZ(20px)" }}>
              <TierBadge tier={displayTier} theme={theme} grade={grade} />
              {league && (
                <div
                  className="mt-1 font-mono text-[9px] tracking-[0.22em] uppercase whitespace-nowrap"
                  style={{ color: league.accent }}
                >
                  {league.glyph} Age {league.shortLabel}
                </div>
              )}
            </div>
            <div
              className="flex flex-col items-end gap-1"
              style={{ transform: "translateZ(20px)" }}
            >
              <div className="font-mono text-[10px] tracking-[0.18em]" style={{ color: theme.primary }}>
                CRACKED · #{String(archetype.number).padStart(3, "0")}
              </div>
              <RarityBadge theme={theme} grade={grade} />
              {result.league && (
                <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-cream/45 mt-0.5">
                  OVERALL {result.tier} · {result.total}/100
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mt-3 text-center" style={{ transform: "translateZ(35px)" }}>
            <h1
              className={clsx(
                "font-display text-[34px] leading-[1.05] tracking-tight",
                grade === "mega-s" ? "text-cream" : "text-cream",
              )}
              style={{
                fontWeight: 600,
                textShadow:
                  grade === "mega-s"
                    ? "0 0 24px rgba(255,210,122,0.55), 0 0 6px rgba(255,90,46,0.45)"
                    : grade === "s"
                    ? "0 0 18px rgba(232,181,71,0.35)"
                    : undefined,
              }}
            >
              {result.name}
            </h1>
            <div className="mt-1.5 font-mono text-[10px] tracking-[0.32em] uppercase text-cream/60">
              {archetype.name.toUpperCase()}
            </div>
          </div>

          {/* Score */}
          <div
            className="mt-4 flex items-end justify-center gap-2 relative"
            style={{ transform: "translateZ(60px)" }}
          >
            <ScoreNumeral total={result.total} theme={theme} />
          </div>

          {/* League placement pill */}
          {result.league && league && (
            <div className="mt-1 flex justify-center" style={{ transform: "translateZ(40px)" }}>
              <LeagueBadge
                encoded={encoded ?? null}
                age={result.league.age}
                ageSource={result.league.ageSource}
                percentile={result.league.percentile}
                leagueLabel={league.label}
                accent={league.accent}
                editable={interactive}
              />
            </div>
          )}

          {/* Stats */}
          <div
            className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5"
            style={{ transform: "translateZ(30px)" }}
          >
            <StatBar label="HACK" value={result.subStats.hack} color="#C4A0FF" />
            <StatBar label="GRIND" value={result.subStats.grind} color="#F4A6C8" />
            <StatBar label="TASTE" value={result.subStats.taste} color="#FFE5A8" />
            <StatBar label="RIZZ" value={result.subStats.rizz} color="#7DD8E8" />
          </div>

          {/* Top signals */}
          {topSignals.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center">
              {topSignals.map((s, i) => (
                <div
                  key={i}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-1 rounded-full"
                  style={{
                    border: `1px solid ${s.tier === "S" ? theme.ring : "rgba(242,232,220,0.20)"}`,
                    color: s.tier === "S" ? theme.primary : "rgba(242,232,220,0.88)",
                    background:
                      s.tier === "S"
                        ? withAlpha(theme.secondary, 0.12)
                        : "rgba(242,232,220,0.05)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {s.tier} · {s.matched}
                </div>
              ))}
            </div>
          )}

          {/* Verdict */}
          <p
            className="mt-auto pt-3 text-center font-display italic text-[14px] leading-[1.4] text-cream/90"
            style={{ fontWeight: 400, transform: "translateZ(20px)" }}
          >
            {result.verdict}
          </p>

          {/* Bottom: flavor + edition */}
          <div className="mt-3 flex items-end justify-between pt-2 border-t border-amber/15">
            <div
              className="font-display italic text-[11px] max-w-[60%] leading-tight"
              style={{ color: theme.primary }}
            >
              &ldquo;{result.flavor}&rdquo;
            </div>
            <div className="font-mono text-[9px] tracking-[0.16em] text-cream/45 text-right">
              {result.modelUsed === "claude" ? "JUDGED BY CLAUDE" : "AUTO-EXTRACT"}
              <br />
              {new Date(result.createdAt).toISOString().slice(0, 10).replace(/-/g, " · ")}
            </div>
          </div>
        </div>
      </div>

      {/* Cast shadow */}
      <div
        aria-hidden
        className="mx-auto rounded-[50%] pointer-events-none"
        style={{
          width: `${70 - Math.abs(tilt.ry) * 0.5}%`,
          height: 22,
          marginTop: -10,
          marginLeft: `${tilt.ry * 0.6}%`,
          background:
            grade === "mega-s"
              ? "radial-gradient(ellipse, rgba(255,90,46,0.55) 0%, rgba(255,90,46,0.15) 45%, transparent 80%)"
              : "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 50%, transparent 80%)",
          filter: "blur(14px)",
          transition: "width 200ms",
        }}
      />

      {mounted && interactive && (
        <div
          className="mt-5 text-center font-mono text-[10px] tracking-[0.22em] uppercase"
          style={{ color: withAlpha(theme.primary, 0.75) }}
        >
          tilt the card &middot; {theme.rarity.toLowerCase()} grade
        </div>
      )}

      <style jsx>{`
        @keyframes holoTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%      { opacity: 0.95; transform: scale(1); }
        }
        @keyframes holoEmberRise {
          0%   { transform: translateY(0) scale(1.2); opacity: 0; }
          8%   { opacity: 1; }
          40%  { transform: translateY(-160px) scale(0.85); opacity: 0.9; }
          75%  { transform: translateY(-300px) scale(0.45); opacity: 0.5; }
          100% { transform: translateY(-420px) scale(0.1); opacity: 0; }
        }
        @keyframes holoFloorBreathe {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50%      { opacity: 1; transform: scaleY(1.08); }
        }
        @keyframes holoHaloPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.95; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes holoMegaShimmer {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes holoBadgePulse {
          0%, 100% { box-shadow: 0 0 30px ${theme.ring}, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.35); }
          50%      { box-shadow: 0 0 50px ${theme.ring}, 0 0 90px ${theme.ring}, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.45); }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function BorderFrame({
  style,
  primary,
  secondary,
}: {
  style: GradeTheme["borderStyle"];
  primary: string;
  secondary: string;
}) {
  if (style === "double-gold") {
    return (
      <div
        className="absolute rounded-[16px] pointer-events-none"
        style={{
          inset: 14,
          border: `1px solid ${primary}`,
          boxShadow: `inset 0 0 0 4px rgba(0,0,0,0.4), inset 0 0 0 5px ${withAlpha(secondary, 0.35)}, inset 0 0 60px ${withAlpha(secondary, 0.12)}`,
        }}
      />
    );
  }

  if (style === "double") {
    return (
      <div
        className="absolute rounded-[16px] pointer-events-none"
        style={{
          inset: 14,
          border: `1px solid ${withAlpha(primary, 0.45)}`,
          boxShadow: `inset 0 0 0 3px rgba(0,0,0,0.35), inset 0 0 0 4px ${withAlpha(secondary, 0.22)}`,
        }}
      />
    );
  }

  if (style === "single") {
    return (
      <div
        className="absolute rounded-[16px] pointer-events-none"
        style={{
          inset: 14,
          border: `1px solid ${withAlpha(primary, 0.45)}`,
        }}
      />
    );
  }

  if (style === "hairline") {
    return (
      <div
        className="absolute rounded-[16px] pointer-events-none"
        style={{
          inset: 14,
          border: `1px solid ${withAlpha(primary, 0.22)}`,
        }}
      />
    );
  }

  // fade — no visible border, only the subtle outer card shadow.
  return null;
}

function CornerCrest({
  position,
  color,
  grade,
}: {
  position: "tl" | "tr" | "bl" | "br";
  color: string;
  grade: CardGrade;
}) {
  const flipX = position === "tr" || position === "br";
  const flipY = position === "bl" || position === "br";
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: position.startsWith("t") ? 14 : undefined,
        bottom: position.startsWith("b") ? 14 : undefined,
        left: position.endsWith("l") ? 14 : undefined,
        right: position.endsWith("r") ? 14 : undefined,
        width: 28,
        height: 28,
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 2 2 L 14 2 M 2 2 L 2 14 M 2 2 L 10 10"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity={grade === "mega-s" ? 0.95 : 0.65}
        />
        {grade === "mega-s" && (
          <circle cx="2" cy="2" r="2.2" fill={color} opacity="0.85" />
        )}
      </svg>
    </div>
  );
}

function TierBadge({
  tier,
  theme,
  grade,
}: {
  tier: Tier;
  theme: GradeTheme;
  grade: CardGrade;
}) {
  return (
    <div className="relative">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-[28px] leading-none"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          boxShadow: theme.badgeAnimate
            ? undefined
            : `0 0 28px ${theme.ring}, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.35)`,
          color: "#1F1612",
          animation: theme.badgeAnimate ? "holoBadgePulse 2.4s ease-in-out infinite" : undefined,
        }}
      >
        {tier}
      </div>
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.22em] whitespace-nowrap"
        style={{ color: withAlpha(theme.primary, 0.6) }}
      >
        {grade === "mega-s" ? "ASCENDED" : "TIER"}
      </div>
    </div>
  );
}

function RarityBadge({ theme, grade }: { theme: GradeTheme; grade: CardGrade }) {
  const isMega = grade === "mega-s";
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{
        background: isMega ? withAlpha(theme.secondary, 0.18) : withAlpha(theme.secondary, 0.10),
        border: `1px solid ${withAlpha(theme.secondary, isMega ? 0.55 : 0.30)}`,
      }}
    >
      <span
        className="font-mono text-[8px] tracking-[0.18em]"
        style={{
          color: theme.primary,
          textShadow: isMega ? `0 0 8px ${theme.ring}` : undefined,
        }}
      >
        {theme.stars}
      </span>
      <span className="font-mono text-[8px] tracking-[0.2em] text-cream/90">{theme.rarity}</span>
    </div>
  );
}

function ScoreNumeral({ total, theme }: { total: number; theme: GradeTheme }) {
  return (
    <div className="relative">
      <div
        className="font-display leading-none"
        style={{
          fontSize: "120px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          background: `linear-gradient(180deg, ${theme.scoreFrom} 0%, ${theme.scoreMid} 55%, ${theme.scoreTo} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 4px 28px ${theme.ring})`,
        }}
      >
        {total}
      </div>
      <div className="absolute -right-7 bottom-3 font-mono text-[14px] tracking-tight text-cream/60">
        /100
      </div>
    </div>
  );
}

function LeagueBadge({
  encoded,
  age,
  ageSource,
  percentile,
  leagueLabel,
  accent,
  editable,
}: {
  encoded: string | null;
  age: number;
  ageSource: "user" | "inferred";
  percentile: number;
  leagueLabel: string;
  accent: string;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(age));
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canEdit = editable && !!encoded;
  const submit = async () => {
    setErr(null);
    const n = Math.round(Number(draft));
    if (!Number.isFinite(n) || n < 8 || n > 100) {
      setErr("8 - 100");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/place", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ encoded, age: n }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { encoded: next } = (await res.json()) as { encoded: string };
      window.location.assign(`/c/${next}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  };

  return (
    <div
      className="mt-1 mx-auto flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-[0.16em] uppercase"
      style={{
        color: accent,
        border: `1px solid ${accent}50`,
        background: `${accent}10`,
        backdropFilter: "blur(4px)",
      }}
    >
      <span>Top {100 - percentile}%</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{leagueLabel}</span>
      {!editing && canEdit && (
        <>
          <span style={{ opacity: 0.5 }}>·</span>
          <button
            type="button"
            className="cursor-pointer hover:opacity-80 transition"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            style={{ color: accent }}
            title={ageSource === "inferred" ? "Age was inferred — click to correct" : "Edit age"}
          >
            age {age}{ageSource === "inferred" ? "?" : ""} ✎
          </button>
        </>
      )}
      {editing && (
        <span className="flex items-center gap-1.5">
          <span style={{ opacity: 0.5 }}>·</span>
          <input
            type="number"
            min={8}
            max={100}
            autoFocus
            disabled={pending}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-12 bg-transparent border-b text-center outline-none disabled:opacity-50"
            style={{ borderColor: `${accent}60`, color: accent }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="hover:opacity-80 transition disabled:opacity-40"
            style={{ color: accent }}
          >
            {pending ? "…" : "ok"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDraft(String(age));
              setErr(null);
            }}
            className="text-white/45 hover:text-white/70 transition"
          >
            ×
          </button>
          {err && <span className="text-red-400 normal-case tracking-normal text-[9px]">{err}</span>}
        </span>
      )}
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Math.max(0, Math.min(99, value));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[9px] tracking-[0.22em] text-cream/65 uppercase">{label}</span>
        <span className="font-mono text-[12px] tabular-nums" style={{ color }}>
          {String(v).padStart(2, "0")}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-cream/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 8px ${color}88`,
            transition: "width 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

// Convert a #rrggbb hex to rgba(... , a).
function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Deterministic small PRNG so sparkle layout is stable across renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default HoloCard;
