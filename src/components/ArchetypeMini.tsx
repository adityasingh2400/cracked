"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Archetype } from "@/data/archetypes";
import { TYPES_META } from "@/data/types-meta";
import type { Tier } from "@/lib/types";

interface ArchetypeMiniProps {
  archetype: Archetype;
  className?: string;
}

// Arcade-palette tier badge colors — match the trading card stamp aesthetic
const TIER_BG: Record<Tier, string> = {
  S: "#FF6B5C",
  A: "#FFA532",
  B: "#FFC53D",
  C: "#9C7560",
  D: "#6E3F2E",
};
const TIER_FG: Record<Tier, string> = {
  S: "#FFFAF2",
  A: "#3C1F15",
  B: "#3C1F15",
  C: "#FFFAF2",
  D: "#FFFAF2",
};

export function ArchetypeMini({ archetype: a, className }: ArchetypeMiniProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });
  const meta = TYPES_META[a.types[0]];

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (y - 0.5) * -6, ry: (x - 0.5) * 8, active: true });
    setMx(x * 100); setMy(y * 100);
  };
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, active: false });
    setMx(50); setMy(50);
  };

  const tint = withAlpha(meta.accent, 0.18);

  return (
    <Link
      ref={ref}
      href={`/dex/${a.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={clsx("group relative block", className)}
      style={{ perspective: "1100px" }}
    >
      <div
        className="relative rounded-xl p-5 h-full flex flex-col overflow-hidden"
        style={{
          minHeight: 188,
          background: `linear-gradient(160deg, var(--cream) 0%, ${tint} 100%)`,
          border: "3px solid var(--ink)",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.active ? "translateY(-3px)" : ""}`,
          transformStyle: "preserve-3d",
          transition: tilt.active ? "transform 80ms linear, box-shadow 200ms" : "transform 400ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms",
          boxShadow: tilt.active ? "8px 8px 0 var(--ink)" : "5px 5px 0 var(--ink)",
        }}
      >
        {/* Cursor-tracked holographic foil */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.5) 0%, transparent 35%)`,
            mixBlendMode: "overlay",
            opacity: tilt.active ? 1 : 0,
            transition: "opacity 250ms",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `conic-gradient(from ${(mx + my) * 1.5}deg at ${mx}% ${my}%,
              transparent 0deg,
              ${meta.foil.primary}88 90deg,
              ${meta.foil.secondary}88 180deg,
              ${meta.foil.tertiary}88 270deg,
              transparent 360deg)`,
            mixBlendMode: "color-dodge",
            opacity: tilt.active ? 0.35 : 0,
            transition: "opacity 300ms",
          }}
        />

        <div className="relative z-10 flex flex-col h-full" style={{ transform: "translateZ(15px)" }}>
          {/* Top row: dex number + tier badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-soft">
              #{String(a.number).padStart(3, "0")}
            </span>
            <TierBadge tier={a.tier} />
          </div>

          {/* Name */}
          <h3 className="font-display text-[20px] leading-none text-ink mb-2">
            {a.name.toUpperCase()}
          </h3>
          <p className="font-serif italic text-[13px] text-ink-soft leading-snug mb-3 line-clamp-2">
            &ldquo;{a.tagline}&rdquo;
          </p>

          {/* Bottom: type chips + arrow */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {a.types.slice(0, 2).map((t) => {
                const m = TYPES_META[t];
                return (
                  <span
                    key={t}
                    className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded border-2"
                    style={{
                      borderColor: "var(--ink)",
                      background: m.accent,
                      color: "var(--ink)",
                    }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
            <span className="font-display text-[14px] text-ink-soft group-hover:text-cherry transition">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-block w-7 h-7 rounded-md text-[14px] font-display leading-7 text-center border-2 border-ink"
      style={{
        background: TIER_BG[tier],
        color: TIER_FG[tier],
        boxShadow: "2px 2px 0 var(--ink)",
      }}
    >
      {tier}
    </span>
  );
}

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
