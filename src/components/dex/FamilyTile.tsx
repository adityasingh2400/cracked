"use client";

// FamilyTile — arcade-styled card for /dex grid + adjacency rows.
// Cursor-tracked holographic foil (radial + conic), chunky ink border with
// hard shadow, animated foil strip along the bottom edge.

import Link from "next/link";
import { useRef, useState } from "react";
import type { FamilyMeta } from "@/data/families";

export function FamilyTile({ meta }: { meta: FamilyMeta }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setMx(x); setMy(y); setActive(true);
    const xRot = (y / 100 - 0.5) * -8;
    const yRot = (x / 100 - 0.5) * 12;
    ref.current.style.transform = `perspective(900px) rotateY(${yRot}deg) rotateX(${xRot}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (!ref.current) return;
    setActive(false);
    setMx(50); setMy(50);
    ref.current.style.transform = "";
  };

  const tint = withAlpha(meta.accent, 0.22);

  return (
    <Link
      ref={ref}
      href={`/dex/family/${meta.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative block rounded-[20px] overflow-hidden"
      style={{
        background: `linear-gradient(160deg, var(--cream) 0%, ${tint} 100%)`,
        border: "3px solid var(--ink)",
        boxShadow: active ? "9px 9px 0 var(--ink)" : "6px 6px 0 var(--ink)",
        transition: active ? "transform 80ms linear, box-shadow 200ms" : "transform 500ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Cursor radial highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.55) 0%, transparent 35%)`,
          mixBlendMode: "overlay",
          opacity: active ? 1 : 0,
          transition: "opacity 250ms",
        }}
      />
      {/* Cursor conic foil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `conic-gradient(from ${(mx + my) * 1.5}deg at ${mx}% ${my}%,
            transparent 0deg,
            ${meta.foil.primary}88 60deg,
            ${meta.foil.secondary}88 120deg,
            ${meta.foil.tertiary}88 180deg,
            ${meta.foil.primary}88 240deg,
            transparent 360deg)`,
          mixBlendMode: "color-dodge",
          opacity: active ? 0.42 : 0,
          transition: "opacity 300ms",
        }}
      />

      <div className="relative p-6 flex flex-col gap-3" style={{ transform: "translateZ(20px)" }}>
        <div className="flex items-start justify-between">
          <span
            className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md border-2 border-ink text-paper"
            style={{ background: meta.accent }}
          >
            {meta.shortName}
          </span>
          <span
            className="font-display leading-none transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            style={{
              fontSize: "44px",
              color: meta.accent,
              textShadow: "3px 3px 0 var(--ink)",
            }}
          >
            {meta.glyph}
          </span>
        </div>
        <h3 className="font-display text-[28px] text-ink leading-none mt-1">
          {meta.name.toUpperCase()}
        </h3>
        <p className="font-serif italic text-[13px] text-ink-soft leading-tight">
          {meta.motto}
        </p>
        <p className="text-[13px] text-ink leading-snug line-clamp-3 mt-1">
          {meta.description}
        </p>
        <div className="mt-1 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-cherry-deep">
          see the ladder →
        </div>
      </div>

      {/* Foil strip — animated */}
      <div
        className="absolute left-0 right-0 bottom-0 h-1.5 animate-holo-pan"
        style={{
          background: `linear-gradient(90deg, ${meta.foil.primary}, ${meta.foil.secondary}, ${meta.foil.tertiary}, ${meta.foil.primary})`,
          backgroundSize: "200% 100%",
        }}
      />
    </Link>
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
