// AvatarBubble — the small profile circle in the card's top-left zone.
//
// Shows the user's LinkedIn profile photo if photoUrl is provided, otherwise
// renders a clean initials fallback (per `getInitials` in src/lib/types.ts).
// Per-tier visual treatment: ASCENDED gets a foil ring + warm glow, MYTHIC
// gets a gold ring, lower tiers get a thin family-accent ring.

import clsx from "clsx";
import Image from "next/image";
import { getInitials } from "@/lib/types";
import type { Tier, Family } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface AvatarBubbleProps {
  name: string;
  photoUrl?: string;
  tier: Tier;
  family: Family;
  size?: number; // px
  className?: string;
}

const RING_BY_TIER: Record<Tier, string> = {
  ASCENDED: "0 0 0 2px #FFD27A, 0 0 16px 2px rgba(255,90,46,0.55), inset 0 0 0 1px rgba(255,229,168,0.5)",
  MYTHIC: "0 0 0 2px #E8B547, 0 0 12px 1px rgba(232,181,71,0.45), inset 0 0 0 1px rgba(255,229,168,0.4)",
  S: "0 0 0 2px #FCD34D, inset 0 0 0 1px rgba(255,229,168,0.3)",
  A: "0 0 0 1.5px #A78BFA, inset 0 0 0 1px rgba(167,139,250,0.3)",
  B: "0 0 0 1.5px #06B6D4, inset 0 0 0 1px rgba(34,211,238,0.3)",
  C: "0 0 0 1px rgba(255,255,255,0.25)",
  D: "0 0 0 1px rgba(255,255,255,0.15)",
};

export function AvatarBubble({ name, photoUrl, tier, family, size = 44, className }: AvatarBubbleProps) {
  const initials = getInitials(name);
  const meta = FAMILIES_META[family];

  return (
    <div
      className={clsx("relative rounded-full overflow-hidden shrink-0 flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        boxShadow: RING_BY_TIER[tier],
        background: photoUrl ? "transparent" : `linear-gradient(135deg, ${meta.accent}AA 0%, ${meta.accent}44 100%)`,
      }}
      data-testid={`avatar-bubble-${tier}`}
    >
      {photoUrl ? (
        // Use a plain <img> here (not next/image): we accept arbitrary URLs
        // including data: URLs from the mirror-photo fallback path, and
        // arbitrary licdn.com mirrors at Vercel Blob. next/image would require
        // domains config + would reject data URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${name} profile photo`}
          className="w-full h-full object-cover"
          style={{ width: size, height: size }}
          loading="eager"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          className="font-display font-bold leading-none select-none"
          style={{
            fontSize: size * 0.4,
            color: "#1C0A05",
            textShadow: "0 1px 1px rgba(255,255,255,0.4)",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
