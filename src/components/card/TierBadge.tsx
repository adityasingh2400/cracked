// TierBadge — the rarity stamp shown on the card and dex.
// Pure presentational component. No animation here (that lives in HoloCard's
// reveal layer for ASCENDED). StaticCard reuses this without animation.

import clsx from "clsx";
import type { Tier, TierStars } from "@/lib/types";
import { formatTier } from "@/lib/types";

interface TierBadgeProps {
  tier: Tier;
  tierStars?: TierStars;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TIER_LABEL: Record<Tier, string> = {
  ASCENDED: "ASCENDED",
  MYTHIC: "MYTHIC",
  S: "S",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
};

const TIER_STARS: Record<Tier, string> = {
  ASCENDED: "",
  MYTHIC: "",
  S: "★★★",
  A: "★★★",
  B: "★★★",
  C: "★★★",
  D: "★★★",
};

const TIER_GRADIENT: Record<Tier, string> = {
  ASCENDED:
    "linear-gradient(135deg, #FFD27A 0%, #FF5A2E 50%, #EC4899 100%)",
  MYTHIC: "linear-gradient(135deg, #FFE5A8 0%, #E8B547 100%)",
  S: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
  A: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
  B: "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)",
  C: "linear-gradient(135deg, #475569 0%, #1E293B 100%)",
  D: "linear-gradient(135deg, #404040 0%, #171717 100%)",
};

const TIER_TEXT_COLOR: Record<Tier, string> = {
  ASCENDED: "#1C0A05",
  MYTHIC: "#1C0A05",
  S: "#1C0A05",
  A: "#FFFFFF",
  B: "#FFFFFF",
  C: "#FFFFFF",
  D: "#A3A3A3",
};

const SIZE_CLASSES = {
  sm: "w-14 h-14 text-xs",
  md: "w-24 h-24 text-base",
  lg: "w-48 h-48 text-lg",
};

export function TierBadge({ tier, tierStars, size = "md", className }: TierBadgeProps) {
  const stars = tierStars ? Array.from({ length: tierStars }, () => "★").join("") : "";
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-2xl font-display font-bold tracking-widest select-none",
        SIZE_CLASSES[size],
        className
      )}
      style={{
        background: TIER_GRADIENT[tier],
        color: TIER_TEXT_COLOR[tier],
        boxShadow:
          tier === "ASCENDED"
            ? "0 10px 30px rgba(255, 90, 46, 0.45)"
            : tier === "MYTHIC"
            ? "0 6px 20px rgba(232, 181, 71, 0.35)"
            : "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
      data-tier={tier}
      data-testid={`tier-badge-${tier.toLowerCase()}`}
    >
      <div className="leading-none">{formatTier(tier, tierStars)}</div>
      {size !== "sm" && stars && (
        <div className="mt-1 leading-none" aria-hidden>
          {stars}
        </div>
      )}
    </div>
  );
}

export const TIER_BADGE_META = {
  TIER_LABEL,
  TIER_STARS,
  TIER_GRADIENT,
  TIER_TEXT_COLOR,
};
