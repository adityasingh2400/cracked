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

const TIER_INTENSITY: Record<Tier, { foil: number; glow: number; sheen: number; speed: number }> = {
  S: { foil: 0.95, glow: 1.0, sheen: 1.0, speed: 7 },
  A: { foil: 0.78, glow: 0.78, sheen: 0.82, speed: 9 },
  B: { foil: 0.55, glow: 0.55, sheen: 0.6, speed: 11 },
  C: { foil: 0.35, glow: 0.32, sheen: 0.4, speed: 14 },
  D: { foil: 0.18, glow: 0.14, sheen: 0.22, speed: 18 },
};

const TIER_COLOR: Record<Tier, { from: string; to: string; ring: string }> = {
  S: { from: "#FFE5A8", to: "#E8B547", ring: "rgba(232, 181, 71, 0.65)" },
  A: { from: "#C4A0FF", to: "#8B5CF6", ring: "rgba(167, 139, 250, 0.55)" },
  B: { from: "#7DD8E8", to: "#06B6D4", ring: "rgba(34, 211, 238, 0.5)" },
  C: { from: "#C8B89C", to: "#8B7A5E", ring: "rgba(200, 184, 156, 0.4)" },
  D: { from: "#8B7A6B", to: "#5E5046", ring: "rgba(139, 122, 107, 0.3)" },
};

// Spring-smoothed tilt for buttery motion instead of jittery snap.
function useSpringTilt(target: { rx: number; ry: number; mx: number; my: number }) {
  const [val, setVal] = useState(target);
  const valRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const cur = valRef.current;
      const k = 0.14; // stiffness — higher = snappier
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

  // Lead with league tier when available; fall back to absolute for legacy
  // share links that predate the league system.
  const displayTier: Tier = result.league?.leagueTier ?? result.tier;
  const intensity = TIER_INTENSITY[displayTier];
  const tierColor = TIER_COLOR[displayTier];
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

  // Stable sparkle positions — generated once per render, deterministic by tier.
  const sparkles = useMemo(() => {
    const count = displayTier === "S" ? 18 : displayTier === "A" ? 12 : displayTier === "B" ? 8 : 4;
    const rng = mulberry32(result.total * 1000 + archetype.number);
    return Array.from({ length: count }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      size: 1 + rng() * 2.5,
      delay: rng() * 4,
      duration: 1.6 + rng() * 2.4,
    }));
  }, [displayTier, result.total, archetype.number]);

  // Cursor-angle sheen sweep — a thin diagonal highlight that tilts with the card.
  const sheenAngle = 95 + (tilt.ry * 1.4);

  return (
    <div className={clsx("holo-card-wrap select-none", className)} style={{ perspective: "1600px" }}>
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
        className="holo-card relative cursor-grab active:cursor-grabbing"
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
            0 0 100px -10px ${tierColor.ring},
            0 0 0 1px rgba(232,181,71,0.10) inset
          `,
        }}
      >
        {/* Base — warm ink */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden"
          style={{ background: "linear-gradient(155deg, #1C130A 0%, #0E0805 100%)" }}
        />

        {/* Foil layer 1 — conic rainbow, cursor-anchored, parallax-shifted */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `conic-gradient(from ${130 + tilt.ry * 3}deg at ${tilt.mx}% ${tilt.my}%,
              #8B5CF6 0deg,
              #EC4899 60deg,
              #FCD34D 120deg,
              #06B6D4 180deg,
              #8B5CF6 240deg,
              #FCD34D 300deg,
              #8B5CF6 360deg
            )`,
            opacity: intensity.foil * (0.4 + (hovering ? 0.25 : 0)),
            mixBlendMode: "screen",
            filter: displayTier === "D" ? "saturate(0.4)" : undefined,
            transition: "opacity 400ms",
          }}
        />

        {/* Foil layer 2 — diagonal sheen band that sweeps with tilt (the "card swipe" feel) */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `linear-gradient(${sheenAngle}deg,
              transparent 0%,
              transparent 40%,
              rgba(255, 245, 220, ${0.18 * intensity.sheen}) 49%,
              rgba(255, 255, 255, ${0.45 * intensity.sheen}) 50%,
              rgba(255, 245, 220, ${0.18 * intensity.sheen}) 51%,
              transparent 60%,
              transparent 100%
            )`,
            mixBlendMode: "overlay",
            opacity: hovering ? 1 : 0.55,
            transition: "opacity 300ms",
          }}
        />

        {/* Foil layer 3 — radial spotlight that follows cursor */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%,
              rgba(255, 240, 200, 0.45) 0%,
              rgba(255, 240, 200, 0.10) 28%,
              transparent 60%)`,
            mixBlendMode: "overlay",
            opacity: hovering ? 1 : 0.7,
            transition: "opacity 300ms",
          }}
        />

        {/* Sparkle layer — tier-scaled twinkles. Position-anchored to the cursor area when active. */}
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
                background: "#FFF5C4",
                boxShadow: `0 0 ${s.size * 4}px ${s.size}px rgba(255,229,168,0.7)`,
                opacity: 0,
                animation: `holoTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

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

        {/* Gold double-line inner frame */}
        <div
          className="absolute rounded-[16px] pointer-events-none"
          style={{
            inset: 14,
            border: "1px solid rgba(232, 181, 71, 0.55)",
            boxShadow:
              "inset 0 0 0 4px rgba(0,0,0,0.4), inset 0 0 0 5px rgba(232,181,71,0.30), inset 0 0 50px rgba(232,181,71,0.10)",
          }}
        />

        {/* Edge light — illuminates the side the card is "leaning toward" */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background: `linear-gradient(${90 + tilt.ry * 3}deg,
              rgba(255, 229, 168, ${Math.max(0, tilt.ry / 60)}) 0%,
              transparent 25%,
              transparent 75%,
              rgba(255, 229, 168, ${Math.max(0, -tilt.ry / 60)}) 100%
            )`,
            mixBlendMode: "screen",
            opacity: hovering ? 1 : 0.4,
            transition: "opacity 300ms",
          }}
        />

        {/* Content — parallaxed forward */}
        <div
          className="relative h-full w-full flex flex-col p-7 pt-5 z-10"
          style={{ transform: "translateZ(50px)" }}
        >
          {/* Top row: tier badge + dex number + rarity */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-start gap-1" style={{ transform: "translateZ(20px)" }}>
              <TierBadge tier={displayTier} colors={tierColor} />
              {league && (
                <div
                  className="mt-1 font-mono text-[9px] tracking-[0.22em] uppercase whitespace-nowrap"
                  style={{ color: league.accent }}
                >
                  {league.glyph} {league.shortLabel} League
                </div>
              )}
            </div>
            <div
              className="flex flex-col items-end gap-1"
              style={{ transform: "translateZ(20px)" }}
            >
              <div className="font-mono text-[10px] tracking-[0.18em] text-amber/85">
                CRACKED · #{String(archetype.number).padStart(3, "0")}
              </div>
              <RarityBadge tier={displayTier} />
              {result.league && (
                <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-cream/45 mt-0.5">
                  OVERALL {result.tier} · {result.total}/100
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div
            className="mt-3 text-center"
            style={{ transform: "translateZ(35px)" }}
          >
            <h1
              className="font-display text-[34px] leading-[1.05] tracking-tight text-cream"
              style={{ fontWeight: 600 }}
            >
              {result.name}
            </h1>
            <div className="mt-1.5 font-mono text-[10px] tracking-[0.32em] uppercase text-cream/60">
              {archetype.name.toUpperCase()}
            </div>
          </div>

          {/* Score hero */}
          <div
            className="mt-4 flex items-end justify-center gap-2 relative"
            style={{ transform: "translateZ(60px)" }}
          >
            <ScoreNumeral total={result.total} tier={displayTier} colors={tierColor} />
          </div>

          {/* League placement pill — "Top X% in Y League" with inline edit */}
          {result.league && league && (
            <div className="mt-1 flex justify-center" style={{ transform: "translateZ(40px)" }}>
              <LeagueBadge
                encoded={encoded ?? null}
                age={result.league.age}
                ageSource={result.league.ageSource}
                percentile={result.league.percentile}
                leagueLabel={result.league.leagueLabel}
                accent={league.accent}
                editable={interactive}
              />
            </div>
          )}

          {/* Stat block */}
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
                    border: `1px solid ${s.tier === "S" ? tierColor.ring : "rgba(242,232,220,0.20)"}`,
                    color: s.tier === "S" ? "#FFE5A8" : "rgba(242,232,220,0.88)",
                    background:
                      s.tier === "S" ? "rgba(232,181,71,0.10)" : "rgba(242,232,220,0.05)",
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
            <div className="font-display italic text-[11px] text-amber/95 max-w-[60%] leading-tight">
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

      {/* Cast shadow below — shifts with tilt to anchor the card to the surface */}
      <div
        aria-hidden
        className="mx-auto rounded-[50%] pointer-events-none"
        style={{
          width: `${70 - Math.abs(tilt.ry) * 0.5}%`,
          height: 22,
          marginTop: -10,
          marginLeft: `${tilt.ry * 0.6}%`,
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 50%, transparent 80%)",
          filter: "blur(14px)",
          transition: "width 200ms",
        }}
      />

      {mounted && interactive && (
        <div className="mt-5 text-center font-mono text-[10px] tracking-[0.22em] text-amber/70 uppercase">
          tilt the card &middot; holo {displayTier}-rank
        </div>
      )}

      <style jsx>{`
        @keyframes holoTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50%      { opacity: 0.95; transform: scale(1); }
        }
      `}</style>
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
          boxShadow: `0 0 28px ${colors.ring}, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.35)`,
          color: "#1F1612",
        }}
      >
        {tier}
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.22em] text-cream/55 whitespace-nowrap">
        TIER
      </div>
    </div>
  );
}

function RarityBadge({ tier }: { tier: Tier }) {
  const label = ({ S: "MYTHIC", A: "RARE", B: "UNCOMMON", C: "COMMON", D: "BASIC" } as const)[tier];
  const stars = ({ S: "★★★★★", A: "★★★★", B: "★★★", C: "★★", D: "★" } as const)[tier];
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/8 border border-amber/25">
      <span className="font-mono text-[8px] tracking-[0.18em] text-amber-light">{stars}</span>
      <span className="font-mono text-[8px] tracking-[0.2em] text-cream/85">{label}</span>
    </div>
  );
}

function ScoreNumeral({
  total,
  colors,
}: {
  total: number;
  tier: Tier;
  colors: { from: string; to: string; ring: string };
}) {
  return (
    <div className="relative">
      <div
        className="font-display leading-none"
        style={{
          fontSize: "120px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          background: `linear-gradient(180deg, #ffffff 0%, ${colors.from} 55%, ${colors.to} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 4px 24px ${colors.ring})`,
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
  // We use a hard navigation here so the URL (which is the storage layer)
  // reflects the corrected age. No router import needed in this client comp.
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

// Deterministic small PRNG so sparkle layout is stable across renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default HoloCard;
