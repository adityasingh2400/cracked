// FamilyParticles — three particle categories mapped to the 9 career families.
// Replaces the generic ember layer. Tier-gates the density & motion so lower
// tiers stay calm and the top tiers feel alive.
//
// CATEGORIES:
//   rising:    embers floating upward (engineering, founder, finance, athletics)
//   drift:     slow horizontal motes (science, medicine, consulting, law)
//   code-rain: binary glyphs falling (creative_audience — the "creator" family)

import { useMemo } from "react";
import type { Family, Tier } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

export type ParticleCategory = "rising" | "drift" | "code-rain";

export const FAMILY_TO_CATEGORY: Record<Family, ParticleCategory> = {
  engineering: "rising",
  founder: "rising",
  finance: "rising",
  athletics_performance: "rising",
  science_academia: "drift",
  medicine: "drift",
  consulting_corporate: "drift",
  law_public_service: "drift",
  creative_audience: "code-rain",
};

interface ParticleProps {
  family: Family;
  tier: Tier;
  /** Deterministic seed — same card = same particle layout */
  seed: number;
}

// tier → particle count + brightness
const TIER_DENSITY: Record<Tier, { count: number; brightness: number }> = {
  ASCENDED: { count: 28, brightness: 1.0 },
  MYTHIC:   { count: 22, brightness: 0.85 },
  S:        { count: 16, brightness: 0.7 },
  A:        { count: 10, brightness: 0.5 },
  B:        { count: 6,  brightness: 0.35 },
  C:        { count: 0,  brightness: 0 },
  D:        { count: 0,  brightness: 0 },
};

// deterministic PRNG (mulberry32) — keeps particle layouts stable across renders
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function FamilyParticles({ family, tier, seed }: ParticleProps) {
  const density = TIER_DENSITY[tier];
  const category = FAMILY_TO_CATEGORY[family];
  const meta = FAMILIES_META[family];

  const particles = useMemo(() => {
    if (density.count === 0) return [];
    const rng = mulberry32(seed);
    return Array.from({ length: density.count }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      size: 0.6 + rng() * 2.0,
      delay: rng() * 5,
      duration: 3 + rng() * 4,
      hue: rng(),
    }));
  }, [seed, density.count]);

  if (density.count === 0) return null;

  if (category === "rising") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        aria-hidden
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              bottom: -8,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: meta.accent,
              boxShadow: `0 0 ${4 + p.size * 2}px ${meta.accent}`,
              opacity: density.brightness * (0.6 + p.hue * 0.4),
              animation: `particleRise ${p.duration}s linear ${p.delay}s infinite`,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    );
  }

  if (category === "drift") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        aria-hidden
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size * 1.2}px`,
              height: `${p.size * 1.2}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${meta.accent} 0%, transparent 70%)`,
              opacity: density.brightness * 0.55,
              animation: `particleDrift ${p.duration * 2}s ease-in-out ${p.delay}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    );
  }

  // code-rain
  const glyphs = ["0", "1", "{", "}", "/", ";", "<", ">", "$", "@"];
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3] overflow-hidden font-mono"
      aria-hidden
    >
      {particles.map((p) => {
        const glyph = glyphs[Math.floor(p.hue * glyphs.length)];
        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: -8,
              fontSize: `${8 + p.size * 3}px`,
              color: meta.accent,
              textShadow: `0 0 6px ${meta.accent}`,
              opacity: density.brightness * (0.45 + p.hue * 0.45),
              animation: `particleFall ${p.duration}s linear ${p.delay}s infinite`,
              willChange: "transform",
            }}
          >
            {glyph}
          </div>
        );
      })}
    </div>
  );
}
