"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { FamilyMeta } from "@/data/families";
import { confettiAt } from "./LandingFX";

// Flip-card grid for the landing - front shows the family glyph + name + motto;
// back shows a slug-link to the full family ladder. Click anywhere on the card
// to flip; click again to flip back.

export function FamilyCardGrid({ families }: { families: FamilyMeta[] }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 arcade-no-confetti"
      style={{ perspective: 1200 }}
    >
      {families.map((meta) => (
        <FlipCard key={meta.key} meta={meta} />
      ))}
    </div>
  );
}

function FlipCard({ meta }: { meta: FamilyMeta }) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [mx, setMx] = useState(50);
  const [my, setMy] = useState(50);

  const accent = meta.accent;
  const tint = withAlpha(accent, 0.22);

  const onMove = (e: React.MouseEvent) => {
    if (!wrap.current || !card.current || flipped) return;
    const r = wrap.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setMx(x);
    setMy(y);
    const xRot = (y / 100 - 0.5) * -14;
    const yRot = (x / 100 - 0.5) * 14;
    card.current.style.transform = `perspective(900px) rotateY(${yRot}deg) rotateX(${xRot}deg) translateY(-5px)`;
  };
  const onLeave = () => {
    if (!card.current) return;
    if (!flipped) card.current.style.transform = "";
    setMx(50);
    setMy(50);
  };

  const onCardClick = (e: React.MouseEvent) => {
    // Don't capture clicks on the back-side link - those should navigate.
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
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
        onClick={onCardClick}
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
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,0.6) 0%, transparent 30%)`,
              mixBlendMode: "overlay",
              opacity: mx !== 50 || my !== 50 ? 1 : 0,
              transition: "opacity 250ms",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `conic-gradient(from ${(mx + my) * 1.8}deg at ${mx}% ${my}%,
                transparent 0deg,
                ${meta.foil.primary}88 60deg,
                ${meta.foil.secondary}88 120deg,
                ${meta.foil.tertiary}88 200deg,
                transparent 360deg)`,
              mixBlendMode: "color-dodge",
              opacity: mx !== 50 || my !== 50 ? 0.42 : 0,
              transition: "opacity 300ms",
            }}
          />

          <div className="relative flex items-start justify-between z-[2]">
            <span
              className="font-mono text-[10px] font-bold tracking-[0.18em] px-2 py-1 rounded-md text-paper border-2 border-ink"
              style={{ background: accent }}
            >
              {meta.shortName}
            </span>
            <span className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase px-2 py-1 rounded-md bg-cream text-ink border-2 border-ink">
              CLICK
            </span>
          </div>

          <div
            className="relative flex-1 grid place-items-center text-center font-display leading-none my-3 z-[2]"
            style={{ fontSize: "84px", color: accent, textShadow: "3px 3px 0 var(--ink)" }}
          >
            {meta.glyph}
          </div>

          <div className="relative text-center z-[2]">
            <div className="font-display text-[22px] text-ink leading-none">
              {meta.name.toUpperCase()}
            </div>
            <div className="mt-2 font-serif italic text-[12px] text-ink-soft leading-tight px-2">
              {meta.motto}
            </div>
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 h-1.5 animate-holo-pan"
            style={{
              background: `linear-gradient(90deg, ${meta.foil.primary}, ${meta.foil.secondary}, ${meta.foil.tertiary}, ${meta.foil.primary})`,
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
            {meta.shortName}
          </div>
          <div className="font-display text-[22px] text-paper leading-none mb-2">
            {meta.name.toUpperCase()}
          </div>
          <p className="font-serif text-[13px] text-blush leading-snug flex-1 overflow-hidden">
            {meta.description}
          </p>
          <Link
            href={`/dex/family/${meta.slug}`}
            className="mt-3 font-display text-[13px] text-ink bg-marigold rounded-full px-4 py-2 text-center border-2 border-paper hover:bg-marigold-light transition"
            onClick={(e) => e.stopPropagation()}
          >
            SEE THE LADDER →
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
