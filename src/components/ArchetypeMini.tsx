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

const TIER_RING: Record<Tier, string> = {
  S: "rgba(252, 211, 77, 0.55)",
  A: "rgba(167, 139, 250, 0.45)",
  B: "rgba(34, 211, 238, 0.40)",
  C: "rgba(148, 163, 184, 0.30)",
  D: "rgba(113, 113, 122, 0.20)",
};

export function ArchetypeMini({ archetype: a, className }: ArchetypeMiniProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const meta = TYPES_META[a.types[0]];

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (y - 0.5) * -8, ry: (x - 0.5) * 8, mx: x * 100, my: y * 100, active: true });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

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
        className="relative rounded-xl overflow-hidden p-5 h-full flex flex-col"
        style={{
          minHeight: 188,
          background: "linear-gradient(160deg, #0E0E18 0%, #06060B 100%)",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: tilt.active ? "transform 80ms linear" : "transform 500ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: `0 20px 50px -20px rgba(0,0,0,0.6), 0 0 0 1px ${TIER_RING[a.tier]}, 0 0 30px -8px ${meta.accent}55`,
        }}
      >
        {/* Holo overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `conic-gradient(from 130deg at ${tilt.mx}% ${tilt.my}%,
              ${meta.foil.primary} 0deg,
              ${meta.foil.secondary} 120deg,
              ${meta.foil.tertiary} 240deg,
              ${meta.foil.primary} 360deg)`,
            opacity: tilt.active ? 0.32 : 0.14,
            mixBlendMode: "screen",
            transition: "opacity 400ms",
          }}
        />
        {/* Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.22) 0%, transparent 50%)`,
            mixBlendMode: "overlay",
            opacity: tilt.active ? 0.9 : 0,
            transition: "opacity 400ms",
          }}
        />

        <div className="relative z-10 flex flex-col h-full" style={{ transform: "translateZ(20px)" }}>
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/45">
              #{String(a.number).padStart(3, "0")}
            </span>
            <TierBadge tier={a.tier} />
          </div>

          {/* Name */}
          <h3 className="font-display text-[20px] leading-tight text-white group-hover:text-gold transition mb-1.5">
            {a.name}
          </h3>
          <p className="font-display italic text-[12px] text-white/55 leading-snug mb-3 line-clamp-2">
            "{a.tagline}"
          </p>

          {/* Types row */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex gap-1.5">
              {a.types.slice(0, 2).map((t) => {
                const m = TYPES_META[t];
                return (
                  <span
                    key={t}
                    className="font-mono text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded border"
                    style={{
                      color: m.accent,
                      borderColor: `${m.accent}30`,
                      background: `${m.accent}08`,
                    }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
            <span className="font-mono text-[9px] text-white/30 group-hover:text-gold transition">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const conf: Record<Tier, { from: string; to: string }> = {
    S: { from: "#FCD34D", to: "#F59E0B" },
    A: { from: "#A78BFA", to: "#7C3AED" },
    B: { from: "#22D3EE", to: "#0891B2" },
    C: { from: "#94A3B8", to: "#475569" },
    D: { from: "#71717A", to: "#3F3F46" },
  };
  const c = conf[tier];
  return (
    <span
      className="inline-block w-6 h-6 rounded-md text-[11px] font-display font-bold leading-6 text-center"
      style={{
        background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
        color: "#0A0A0F",
        boxShadow: `0 0 10px ${c.from}40`,
      }}
    >
      {tier}
    </span>
  );
}
