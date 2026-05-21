"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface HoloTileProps {
  href: string;
  foil: { primary: string; secondary: string; tertiary: string };
  accent: string;
  glyph: string;
  eyebrow?: string;          // e.g. "TYPE 01 · QUANT"
  title: string;             // big display
  subtitle?: string;         // small italic
  body?: string;             // 1-3 lines descriptive
  caption?: string;          // bottom-right small caption
  count?: number;            // little dex count chip
  className?: string;
  /** Tier distribution mini-meter (S/A/B/C/D counts) shown along bottom. */
  tiers?: { S: number; A: number; B: number; C: number; D: number };
  /** Aspect ratio of the tile. */
  aspect?: "square" | "card" | "wide";
  /** Intensity of foil 0-1; defaults to 0.6 */
  intensity?: number;
}

const ASPECT: Record<NonNullable<HoloTileProps["aspect"]>, string> = {
  square: "aspect-square",
  card: "aspect-[5/7]",
  wide: "aspect-[5/3]",
};

export function HoloTile({
  href,
  foil,
  accent,
  glyph,
  eyebrow,
  title,
  subtitle,
  body,
  caption,
  count,
  className,
  tiers,
  aspect = "card",
  intensity = 0.6,
}: HoloTileProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (y - 0.5) * -10, ry: (x - 0.5) * 10, mx: x * 100, my: y * 100, active: true });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={clsx("group relative block", ASPECT[aspect], className)}
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative h-full w-full rounded-2xl overflow-hidden"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: tilt.active ? "transform 80ms linear" : "transform 600ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: `
            0 25px 60px -20px rgba(0,0,0,0.55),
            0 0 50px -5px ${accent}40,
            0 0 0 1px rgba(255,255,255,0.06) inset
          `,
        }}
      >
        {/* Base */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, #0E0E18 0%, #050509 100%)" }}
        />
        {/* Holo conic layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `conic-gradient(from 130deg at ${tilt.mx}% ${tilt.my}%,
              ${foil.primary} 0deg,
              ${foil.secondary} 90deg,
              ${foil.tertiary} 180deg,
              ${foil.primary} 270deg,
              ${foil.secondary} 360deg)`,
            opacity: intensity * (tilt.active ? 0.7 : 0.4),
            mixBlendMode: "screen",
            transition: "opacity 400ms",
          }}
        />
        {/* Cursor spotlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%,
              rgba(255,255,255,0.30) 0%,
              rgba(255,255,255,0.04) 30%,
              transparent 60%)`,
            mixBlendMode: "overlay",
            opacity: tilt.active ? 0.9 : 0.3,
            transition: "opacity 400ms",
          }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.4' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.07 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
            mixBlendMode: "overlay",
          }}
        />
        {/* Edge inner glow */}
        <div
          className="absolute inset-3 rounded-xl pointer-events-none"
          style={{
            border: `1px solid ${accent}40`,
            boxShadow: `inset 0 0 0 4px rgba(0,0,0,0.35)`,
          }}
        />

        {/* Content */}
        <div
          className="relative h-full w-full flex flex-col p-6 sm:p-7"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Top row: eyebrow + count chip */}
          {(eyebrow || count !== undefined) && (
            <div className="flex items-start justify-between">
              {eyebrow && (
                <span className="font-mono text-[10px] tracking-[0.24em] uppercase" style={{ color: accent }}>
                  {eyebrow}
                </span>
              )}
              {count !== undefined && (
                <span className="font-mono text-[10px] tracking-[0.18em] text-white/55 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  {count} {count === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>
          )}

          {/* Glyph hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div
              className="font-display leading-none mb-3"
              style={{
                fontSize: "clamp(72px, 12vw, 124px)",
                color: accent,
                textShadow: `0 0 40px ${accent}60, 0 4px 20px rgba(0,0,0,0.4)`,
                filter: `drop-shadow(0 0 12px ${accent}80)`,
              }}
            >
              {glyph}
            </div>
            <h3 className="font-display text-[28px] sm:text-[36px] font-semibold tracking-tight text-white leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1.5 font-display italic text-[14px] text-white/65 px-2">
                {subtitle}
              </p>
            )}
          </div>

          {/* Body text */}
          {body && (
            <p className="text-[13px] leading-relaxed text-white/70 text-center text-pretty">{body}</p>
          )}

          {/* Tier meter or caption */}
          {tiers ? (
            <div className="mt-4">
              <TierMeter tiers={tiers} accent={accent} />
            </div>
          ) : caption ? (
            <div className="mt-4 text-center font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
              {caption}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function TierMeter({
  tiers,
  accent,
}: {
  tiers: { S: number; A: number; B: number; C: number; D: number };
  accent: string;
}) {
  const total = tiers.S + tiers.A + tiers.B + tiers.C + tiers.D;
  if (total === 0) return null;
  const rows: { label: string; n: number; color: string }[] = [
    { label: "S", n: tiers.S, color: "#FCD34D" },
    { label: "A", n: tiers.A, color: "#A78BFA" },
    { label: "B", n: tiers.B, color: "#22D3EE" },
    { label: "C", n: tiers.C, color: "#94A3B8" },
    { label: "D", n: tiers.D, color: "#71717A" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex-1 flex items-center gap-1 font-mono text-[9px] tracking-[0.16em]">
          <span style={{ color: r.color }}>{r.label}</span>
          <span className="text-white/35 tabular">{r.n}</span>
        </div>
      ))}
    </div>
  );
}
