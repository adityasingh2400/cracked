// StaticCard — Satori-compatible card for OG image rendering.
//
// Per /plan-eng-review Section 1.1: Twitter/X/LinkedIn/iMessage scrapers can't
// render React + Framer Motion. The live HoloCard stays Framer Motion in-app;
// this StaticCard is a separate composition rendered server-side by next/og
// at 1200x630 for OG meta tags.
//
// Satori constraints respected:
//   - No Framer Motion / no transforms / no animations
//   - No SVG filters
//   - Tailwind not available — inline styles only
//   - Limited gradient support — solid colors + simple linear gradients OK
//   - System fonts only (Satori loads its own font set)
//
// Layout zones (per Share Card Spec):
//   1. Family glyph + name banner (top, 80px)
//   2. Tier badge (large, centered)
//   3. Three percentile lines (monospaced)
//   4. Headline chain banner (if any)
//   5. Achievement-native signal score
//   6. cracked.com watermark

import type { Family, Tier, TierStars, PercentileTrio } from "@/lib/types";
import { formatTier } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

export interface StaticCardProps {
  name: string;
  tier: Tier;
  tierStars?: TierStars;
  family: Family;
  percentiles: PercentileTrio;
  signalScore: number;
  headlineChain?: string;
  calibrating?: boolean;
}

const TIER_STYLES: Record<Tier, { bg: string; text: string; rarity: string; stars: string }> = {
  ASCENDED: {
    bg: "linear-gradient(135deg, #FFD27A 0%, #FF5A2E 50%, #EC4899 100%)",
    text: "#1C0A05",
    rarity: "ASCENDED",
    stars: "",
  },
  MYTHIC: {
    bg: "linear-gradient(135deg, #FFE5A8 0%, #E8B547 100%)",
    text: "#1C0A05",
    rarity: "MYTHIC",
    stars: "",
  },
  S: {
    bg: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
    text: "#1C0A05",
    rarity: "S TIER",
    stars: "★★★",
  },
  A: {
    bg: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
    text: "#FFFFFF",
    rarity: "A TIER",
    stars: "★★★",
  },
  B: {
    bg: "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)",
    text: "#FFFFFF",
    rarity: "B TIER",
    stars: "★★★",
  },
  C: {
    bg: "linear-gradient(135deg, #475569 0%, #1E293B 100%)",
    text: "#FFFFFF",
    rarity: "C TIER",
    stars: "★★★",
  },
  D: {
    bg: "linear-gradient(135deg, #404040 0%, #171717 100%)",
    text: "#A3A3A3",
    rarity: "D TIER",
    stars: "★★★",
  },
};

export function StaticCard({
  name,
  tier,
  tierStars,
  family,
  percentiles,
  signalScore,
  headlineChain,
  calibrating,
}: StaticCardProps) {
  const meta = FAMILIES_META[family];
  const tierStyle = TIER_STYLES[tier];

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse at 50% 110%, #6A0E0E 0%, transparent 55%), linear-gradient(155deg, #1C0A05 0%, #0A0402 100%)",
        color: "#FFE5A8",
        fontFamily: "monospace",
        position: "relative",
      }}
    >
      {/* Zone 1: Family banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: meta.accent + "22",
          borderBottom: `2px solid ${meta.accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 48, color: meta.accent }}>{meta.glyph}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "rgba(255,229,168,0.55)" }}>
              CRACKED · {meta.shortName}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#FFE5A8" }}>{name}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,229,168,0.55)", letterSpacing: "0.15em" }}>
          cracked.com
        </div>
      </div>

      {/* Zone 2: Tier badge */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            background: tierStyle.bg,
            color: tierStyle.text,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.3em",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            {formatTier(tier, tierStars)}
          </div>
          {tierStars && (
            <div style={{ fontSize: 36, letterSpacing: "0.2em" }}>
              {Array.from({ length: tierStars }, () => "★").join("")}
            </div>
          )}
          {headlineChain && (
            <div
              style={{
                marginTop: 24,
                padding: "6px 14px",
                fontSize: 14,
                background: "rgba(0,0,0,0.25)",
                color: tierStyle.text,
                borderRadius: 6,
                letterSpacing: "0.1em",
              }}
            >
              {headlineChain}
            </div>
          )}
        </div>

        {/* Zone 3 + 5: Percentiles + sub-stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 600 }}>
          {/* Percentile trio */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <PercentileLine
              label={`top ${(100 - percentiles.withinFamilyCohort).toFixed(1)}% in ${meta.shortName}, your cohort`}
              percentile={percentiles.withinFamilyCohort}
              accent={meta.accent}
              primary
            />
            <PercentileLine
              label={`top ${(100 - percentiles.crossFamilyCohort).toFixed(1)}% of your cohort, all fields`}
              percentile={percentiles.crossFamilyCohort}
              accent="#FCD34D"
            />
            <PercentileLine
              label={`top ${(100 - percentiles.global).toFixed(1)}% of the world, all-time`}
              percentile={percentiles.global}
              accent="rgba(255,229,168,0.45)"
            />
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 20px",
                border: "1px solid rgba(255,229,168,0.16)",
                borderRadius: 8,
                background: "rgba(255,229,168,0.04)",
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "rgba(255,229,168,0.5)" }}>
                SIGNAL SCORE
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#FFE5A8" }}>{signalScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 6: Watermark + calibrating badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "rgba(255,229,168,0.4)",
          borderTop: "1px solid rgba(255,229,168,0.1)",
        }}
      >
        <div>HOW CRACKED ARE YOU? · CRACKED.COM</div>
        {calibrating && (
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 4,
              background: "rgba(252,211,77,0.18)",
              color: "#FCD34D",
              fontSize: 10,
              letterSpacing: "0.15em",
            }}
          >
            CALIBRATING
          </div>
        )}
      </div>
    </div>
  );
}

function PercentileLine({
  label,
  percentile,
  accent,
  primary,
}: {
  label: string;
  percentile: number;
  accent: string;
  primary?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: primary ? 20 : 14,
          color: primary ? "#FFE5A8" : "rgba(255,229,168,0.7)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      {/* Percentile bar */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: primary ? 8 : 4,
          background: "rgba(255,229,168,0.1)",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            width: `${Math.max(2, Math.min(100, percentile))}%`,
            height: "100%",
            background: accent,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

function SubStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "10px 0",
        background: "rgba(255,229,168,0.05)",
        border: "1px solid rgba(255,229,168,0.12)",
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,229,168,0.55)" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#FFE5A8" }}>{value}</div>
    </div>
  );
}
