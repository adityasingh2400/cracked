"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface HoloTileProps {
  href: string;
  foil: { primary: string; secondary: string; tertiary: string };
  accent: string;
  glyph: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  caption?: string;
  count?: number;
  className?: string;
  /** Tier distribution mini-meter (S/A/B/C/D counts) shown along bottom. */
  tiers?: { S: number; A: number; B: number; C: number; D: number };
  aspect?: "square" | "card" | "wide";
  /** Reserved for parity with old API. Has no effect on the arcade card. */
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
}: HoloTileProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (y - 0.5) * -8, ry: (x - 0.5) * 12, active: true });
    setMx(x * 100);
    setMy(y * 100);
  };
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, active: false });
    setMx(50); setMy(50);
  };

  // tint the card background using the accent color so each tile reads as a
  // distinct type at a glance
  const tint = withAlpha(accent, 0.22);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={clsx("group relative block", ASPECT[aspect], className)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative h-full w-full rounded-[20px] overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #FFFAF2 0%, ${tint} 100%)`,
          border: "3px solid var(--ink)",
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${tilt.active ? "translateY(-4px)" : ""}`,
          transformStyle: "preserve-3d",
          transition: tilt.active ? "transform 80ms linear, box-shadow 200ms" : "transform 500ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms",
          boxShadow: tilt.active ? "9px 9px 0 #3C1F15" : "6px 6px 0 #3C1F15",
          willChange: "transform",
        }}
      >
        {/* Cursor-tracked holographic foil — radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.55) 0%, transparent 35%)`,
            mixBlendMode: "overlay",
            opacity: tilt.active ? 1 : 0,
            transition: "opacity 250ms",
          }}
        />

        {/* Cursor-tracked holographic foil — conic rainbow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `conic-gradient(from ${(mx + my) * 1.5}deg at ${mx}% ${my}%,
              transparent 0deg,
              ${foil.primary}88 60deg,
              ${foil.secondary}88 120deg,
              ${foil.tertiary}88 180deg,
              ${foil.primary}88 240deg,
              transparent 360deg)`,
            mixBlendMode: "color-dodge",
            opacity: tilt.active ? 0.42 : 0,
            transition: "opacity 300ms",
          }}
        />

        {/* Content */}
        <div
          className="relative h-full w-full flex flex-col p-5 sm:p-6"
          style={{ transform: "translateZ(20px)" }}
        >
          {(eyebrow || count !== undefined) && (
            <div className="flex items-start justify-between gap-2">
              {eyebrow && (
                <span
                  className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: accent }}
                >
                  {eyebrow}
                </span>
              )}
              {count !== undefined && (
                <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-ink/80 px-2 py-0.5 rounded-full border-2 border-ink bg-paper">
                  {count} {count === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div
              className="font-display leading-none mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              style={{
                fontSize: "clamp(60px, 10vw, 100px)",
                color: accent,
                textShadow: `3px 3px 0 var(--ink)`,
              }}
            >
              {glyph}
            </div>
            <h3 className="font-display text-[24px] sm:text-[30px] text-ink leading-none">
              {title.toUpperCase()}
            </h3>
            {subtitle && (
              <p className="mt-2 font-serif italic text-[14px] text-ink-soft">
                {subtitle}
              </p>
            )}
          </div>

          {body && (
            <p className="text-[13px] leading-snug text-ink-soft text-center text-pretty">
              {body}
            </p>
          )}

          {tiers ? (
            <div className="mt-3">
              <TierMeter tiers={tiers} />
            </div>
          ) : caption ? (
            <div className="mt-3 text-center font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-ink-soft">
              {caption}
            </div>
          ) : null}
        </div>

        {/* Foil strip along bottom — animated rainbow */}
        <div
          className="absolute left-0 right-0 bottom-0 h-1.5 animate-holo-pan"
          style={{
            background: `linear-gradient(90deg, ${foil.primary}, ${foil.secondary}, ${foil.tertiary}, ${foil.primary})`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </Link>
  );
}

function TierMeter({
  tiers,
}: {
  tiers: { S: number; A: number; B: number; C: number; D: number };
}) {
  const total = tiers.S + tiers.A + tiers.B + tiers.C + tiers.D;
  if (total === 0) return null;
  const rows: { label: string; n: number; color: string }[] = [
    { label: "S", n: tiers.S, color: "#FF6B5C" },
    { label: "A", n: tiers.A, color: "#FFA532" },
    { label: "B", n: tiers.B, color: "#FFC53D" },
    { label: "C", n: tiers.C, color: "#9C7560" },
    { label: "D", n: tiers.D, color: "#6E3F2E" },
  ];
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center gap-1 font-mono text-[10px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded border-2 border-ink"
          style={{ background: r.color, color: r.label === "C" || r.label === "D" ? "#FFFAF2" : "#3C1F15" }}
        >
          <span>{r.label}</span>
          <span className="tabular-nums">{r.n}</span>
        </div>
      ))}
    </div>
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
