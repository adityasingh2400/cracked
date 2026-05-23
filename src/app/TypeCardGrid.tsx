"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { TypeMeta } from "@/data/types-meta";
import type { Tier } from "@/lib/types";
import { confettiAt } from "./LandingFX";

interface Breakdown {
  key: string;
  meta: TypeMeta;
  count: number;
  topTier: Tier;
  members: { slug: string; name: string; tier: Tier }[];
}

export function TypeCardGrid({ breakdowns }: { breakdowns: Breakdown[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5" style={{ perspective: 1200 }}>
      {breakdowns.map((b) => (
        <FlipCard key={b.key} b={b} />
      ))}
    </div>
  );
}

function FlipCard({ b }: { b: Breakdown }) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);

  const accent = b.meta.accent;
  const tint = withAlpha(accent, 0.22);

  const onMove = (e: React.MouseEvent) => {
    if (!wrap.current || !card.current || flipped) return;
    const r = wrap.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setMx(x); setMy(y);
    const xRot = (y / 100 - 0.5) * -14;
    const yRot = (x / 100 - 0.5) * 14;
    card.current.style.transform = `perspective(900px) rotateY(${yRot}deg) rotateX(${xRot}deg) translateY(-5px)`;
  };
  const onLeave = () => {
    if (!card.current) return;
    if (!flipped) card.current.style.transform = "";
    setMx(50); setMy(50);
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setFlipped((f) => !f);
    if (card.current) {
      card.current.style.transform = !flipped ? "rotateY(180deg)" : "";
    }
    confettiAt(e.clientX, e.clientY, 12);
  };

  return (
    <div ref={wrap} className="relative aspect-[3/4]" style={{ perspective: 1000 }}>
      <div
        ref={card}
        role="button"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="absolute inset-0 cursor-pointer rounded-[20px]"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(.3,1.2,.4,1), box-shadow 0.18s",
          willChange: "transform",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-[20px] overflow-hidden p-5 sm:p-6 flex flex-col"
          style={{
            background: `linear-gradient(160deg, var(--cream) 0%, ${tint} 100%)`,
            border: "3px solid var(--ink)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: "6px 6px 0 var(--ink)",
          }}
        >
          {/* Cursor radial highlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.6) 0%, transparent 30%)`,
              mixBlendMode: "overlay",
              opacity: mx !== 50 || my !== 50 ? 1 : 0,
              transition: "opacity 250ms",
            }}
          />
          {/* Cursor conic foil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `conic-gradient(from ${(mx + my) * 1.8}deg at ${mx}% ${my}%,
                transparent 0deg,
                ${b.meta.foil.primary}88 60deg,
                ${b.meta.foil.secondary}88 120deg,
                ${b.meta.foil.tertiary}88 200deg,
                transparent 360deg)`,
              mixBlendMode: "color-dodge",
              opacity: mx !== 50 || my !== 50 ? 0.42 : 0,
              transition: "opacity 300ms",
            }}
          />

          {/* Top row */}
          <div className="relative flex items-start justify-between z-[2]">
            <span
              className="font-display text-[18px] px-2.5 py-0.5 rounded-md bg-ink text-paper leading-none"
            >
              {b.topTier}
            </span>
            <span className="font-mono text-[10px] font-bold tracking-[0.16em] px-2 py-1 rounded-md bg-cream text-ink border-2 border-ink">
              {b.count} / dex
            </span>
          </div>

          {/* Glyph */}
          <div
            className="relative flex-1 grid place-items-center text-center font-display leading-none my-3 z-[2]"
            style={{
              fontSize: "84px",
              color: accent,
              textShadow: "3px 3px 0 var(--ink)",
            }}
          >
            {b.meta.glyph}
          </div>

          {/* Name + motto */}
          <div className="relative text-center z-[2]">
            <div className="font-display text-[24px] text-ink leading-none">
              {b.meta.name.toUpperCase()}
            </div>
            <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-ink-soft">
              {b.meta.motto}
            </div>
          </div>

          {/* Flip hint */}
          <div className="absolute bottom-3 right-3 font-mono text-[9px] font-bold tracking-[0.12em] uppercase text-ink bg-cream border-2 border-ink px-2 py-0.5 rounded z-[3] opacity-80">
            CLICK
          </div>

          {/* Foil strip */}
          <div
            className="absolute left-0 right-0 bottom-0 h-1.5 animate-holo-pan"
            style={{
              background: `linear-gradient(90deg, ${b.meta.foil.primary}, ${b.meta.foil.secondary}, ${b.meta.foil.tertiary}, ${b.meta.foil.primary})`,
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-[20px] overflow-hidden p-5 sm:p-6 flex flex-col bg-ink text-paper"
          style={{
            border: "3px solid var(--ink)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "6px 6px 0 var(--ink)",
          }}
        >
          <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase mb-1" style={{ color: accent }}>
            {b.meta.name} type · {b.count} archetypes
          </div>
          <div className="font-display text-[22px] text-paper leading-none mb-3">
            {b.meta.name.toUpperCase()}
          </div>
          <ul className="flex flex-col gap-1.5 flex-1 mb-3 list-none m-0 p-0">
            {b.members.map((m) => (
              <li key={m.slug} className="flex items-center gap-2 py-1 border-b border-paper/15">
                <span className="font-mono text-[9px] font-bold tracking-[0.1em]" style={{ color: accent }}>
                  {m.tier}
                </span>
                <span className="font-serif text-[14px] text-blush leading-tight">{m.name}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/dex/types/${b.meta.slug}`}
            className="font-display text-[13px] text-ink bg-marigold rounded-full px-4 py-2 text-center border-2 border-paper"
            onClick={(e) => e.stopPropagation()}
          >
            SEE FULL TYPE →
          </Link>
        </div>
      </div>
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
