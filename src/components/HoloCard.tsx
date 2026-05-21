"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { CrackedResult, Tier, SubStats } from "@/lib/types";
import type { Archetype } from "@/data/archetypes";

interface HoloCardProps {
  result: CrackedResult;
  archetype: Archetype;
  interactive?: boolean;
  className?: string;
}

const TIER_INTENSITY: Record<Tier, { foil: number; glow: number; speed: string }> = {
  S: { foil: 0.85, glow: 1.0, speed: "8s" },
  A: { foil: 0.6, glow: 0.7, speed: "10s" },
  B: { foil: 0.4, glow: 0.45, speed: "12s" },
  C: { foil: 0.25, glow: 0.25, speed: "14s" },
  D: { foil: 0.12, glow: 0.1, speed: "18s" },
};

const TIER_COLOR: Record<Tier, { from: string; to: string; ring: string }> = {
  S: { from: "#FCD34D", to: "#F59E0B", ring: "rgba(252, 211, 77, 0.6)" },
  A: { from: "#A78BFA", to: "#7C3AED", ring: "rgba(167, 139, 250, 0.5)" },
  B: { from: "#22D3EE", to: "#0891B2", ring: "rgba(34, 211, 238, 0.45)" },
  C: { from: "#94A3B8", to: "#475569", ring: "rgba(148, 163, 184, 0.35)" },
  D: { from: "#71717A", to: "#3F3F46", ring: "rgba(113, 113, 122, 0.25)" },
};

export function HoloCard({ result, archetype, interactive = true, className }: HoloCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (y - 0.5) * -14,
      ry: (x - 0.5) * 14,
      mx: x * 100,
      my: y * 100,
    });
  };

  const onMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  };

  const intensity = TIER_INTENSITY[result.tier];
  const tierColor = TIER_COLOR[result.tier];

  // Top signals across categories (most prestigious shown)
  const topSignals = [...result.categories]
    .flatMap((c) => c.signals.slice(0, 1))
    .filter((s) => s.tier === "S" || s.tier === "A")
    .slice(0, 4);

  return (
    <div
      className={clsx("holo-card-wrap select-none", className)}
      style={{ perspective: "1400px" }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="holo-card relative"
        style={{
          aspectRatio: "2 / 3",
          width: "100%",
          maxWidth: 480,
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: tilt.rx === 0 ? "transform 600ms cubic-bezier(0.22,1,0.36,1)" : "transform 80ms linear",
          borderRadius: 24,
          boxShadow: `
            0 30px 80px -20px rgba(0,0,0,0.6),
            0 0 80px -10px ${tierColor.ring},
            0 0 0 1px rgba(255,255,255,0.06) inset
          `,
        }}
      >
        {/* Base background — deep ink */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden"
          style={{ background: "linear-gradient(155deg, #0E0E18 0%, #050509 100%)" }}
        />

        {/* Holographic foil layer 1 — conic rainbow */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `conic-gradient(from 130deg at ${tilt.mx}% ${tilt.my}%,
              #8B5CF6 0deg,
              #EC4899 60deg,
              #FCD34D 120deg,
              #06B6D4 180deg,
              #8B5CF6 240deg,
              #FCD34D 300deg,
              #8B5CF6 360deg
            )`,
            opacity: intensity.foil * 0.55,
            mixBlendMode: "screen",
            filter: result.tier === "D" ? "grayscale(0.8)" : undefined,
            transition: "opacity 600ms",
          }}
        />

        {/* Holographic foil layer 2 — radial spotlight that follows cursor */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%,
              rgba(255,255,255,0.35) 0%,
              rgba(255,255,255,0.05) 30%,
              transparent 60%)`,
            mixBlendMode: "overlay",
            opacity: interactive ? 0.9 : 0.5,
          }}
        />

        {/* Subtle grain */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.2' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")",
            mixBlendMode: "overlay",
            opacity: 0.6,
          }}
        />

        {/* Gold double-line inner frame */}
        <div
          className="absolute rounded-[16px] pointer-events-none"
          style={{
            inset: 14,
            border: "1px solid rgba(212, 175, 55, 0.55)",
            boxShadow: "inset 0 0 0 4px rgba(0,0,0,0.4), inset 0 0 0 5px rgba(212,175,55,0.25)",
          }}
        />

        {/* Content */}
        <div className="relative h-full w-full flex flex-col p-7 pt-5 z-10" style={{ transform: "translateZ(40px)" }}>
          {/* Top row: tier badge + dex number + rarity */}
          <div className="flex items-start justify-between">
            <TierBadge tier={result.tier} colors={tierColor} />
            <div className="flex flex-col items-end gap-0.5">
              <div className="font-mono text-[10px] tracking-[0.18em] text-gold/80">
                CRACKED · #{String(archetype.number).padStart(3, "0")}
              </div>
              <RarityBadge tier={result.tier} />
            </div>
          </div>

          {/* Name */}
          <div className="mt-3 text-center">
            <h1
              className="font-display text-[34px] leading-[1.05] tracking-tight text-white"
              style={{ fontWeight: 600 }}
            >
              {result.name}
            </h1>
            <div className="mt-1.5 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
              {archetype.name.toUpperCase()}
            </div>
          </div>

          {/* Score hero */}
          <div className="mt-4 flex items-end justify-center gap-2 relative">
            <ScoreNumeral total={result.total} tier={result.tier} colors={tierColor} />
          </div>

          {/* Stat block */}
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5">
            <StatBar label="HACK" value={result.subStats.hack} color="#A78BFA" />
            <StatBar label="GRIND" value={result.subStats.grind} color="#EC4899" />
            <StatBar label="TASTE" value={result.subStats.taste} color="#FCD34D" />
            <StatBar label="RIZZ" value={result.subStats.rizz} color="#06B6D4" />
          </div>

          {/* Top signals — small chips with the S/A entries */}
          {topSignals.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center">
              {topSignals.map((s, i) => (
                <div
                  key={i}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-1 rounded-full"
                  style={{
                    border: `1px solid ${s.tier === "S" ? tierColor.ring : "rgba(255,255,255,0.18)"}`,
                    color: s.tier === "S" ? "#FCD34D" : "rgba(255,255,255,0.85)",
                    background: s.tier === "S" ? "rgba(252,211,77,0.08)" : "rgba(255,255,255,0.04)",
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
            className="mt-auto pt-3 text-center font-display italic text-[14px] leading-[1.4] text-white/85"
            style={{ fontWeight: 400 }}
          >
            {result.verdict}
          </p>

          {/* Bottom: flavor + edition */}
          <div className="mt-3 flex items-end justify-between pt-2 border-t border-white/10">
            <div className="font-display italic text-[11px] text-gold/90 max-w-[60%] leading-tight">
              "{result.flavor}"
            </div>
            <div className="font-mono text-[9px] tracking-[0.16em] text-white/40 text-right">
              {result.modelUsed === "claude" ? "JUDGED BY CLAUDE" : "AUTO-EXTRACT"}
              <br />
              {new Date(result.createdAt).toISOString().slice(0, 10).replace(/-/g, " · ")}
            </div>
          </div>
        </div>
      </div>

      {mounted && interactive && (
        <div className="mt-4 text-center font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
          tilt the card · holo {result.tier}-rank
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function TierBadge({ tier, colors }: { tier: Tier; colors: { from: string; to: string; ring: string } }) {
  return (
    <div className="relative">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-[28px] leading-none"
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          boxShadow: `0 0 24px ${colors.ring}, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)`,
          color: "#0A0A0F",
        }}
      >
        {tier}
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.22em] text-white/50 whitespace-nowrap">
        TIER
      </div>
    </div>
  );
}

function RarityBadge({ tier }: { tier: Tier }) {
  const label = ({ S: "MYTHIC", A: "RARE", B: "UNCOMMON", C: "COMMON", D: "BASIC" } as const)[tier];
  const stars = ({ S: "★★★★★", A: "★★★★", B: "★★★", C: "★★", D: "★" } as const)[tier];
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
      <span className="font-mono text-[8px] tracking-[0.18em] text-gold">{stars}</span>
      <span className="font-mono text-[8px] tracking-[0.2em] text-white/80">{label}</span>
    </div>
  );
}

function ScoreNumeral({ total, colors }: { total: number; tier: Tier; colors: { from: string; to: string; ring: string } }) {
  return (
    <div className="relative">
      <div
        className="font-display leading-none"
        style={{
          fontSize: "120px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          background: `linear-gradient(180deg, #ffffff 0%, ${colors.from} 60%, ${colors.to} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 4px 20px ${colors.ring})`,
        }}
      >
        {total}
      </div>
      <div className="absolute -right-7 bottom-3 font-mono text-[14px] tracking-tight text-white/55">
        /100
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Math.max(0, Math.min(99, value));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[9px] tracking-[0.22em] text-white/65 uppercase">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-white" style={{ color }}>
          {String(v).padStart(2, "0")}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 8px ${color}80`,
            transition: "width 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default HoloCard;
