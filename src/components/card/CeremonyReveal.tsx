"use client";

// Tier-aware reveal animation wrapper.
// Per /plan-eng-review T-CEREMONY: ASCENDED gets the cinematic treatment;
// B/A/S animations stay v0.7-current to avoid scope creep.
//
// Strategy: pure CSS animations triggered on mount via the `data-tier` attribute.
// No JS animation libraries needed (Framer Motion stays for HoloCard).

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Tier } from "@/lib/types";

interface CeremonyRevealProps {
  tier: Tier;
  children: React.ReactNode;
  className?: string;
}

export function CeremonyReveal({ tier, children, className }: CeremonyRevealProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // Trigger the animation a frame after mount so CSS transitions fire.
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isAscended = tier === "ASCENDED";
  const isMythic = tier === "MYTHIC";

  return (
    <div
      className={clsx(
        "ceremony-reveal",
        armed && "ceremony-reveal--armed",
        isAscended && "ceremony-reveal--ascended",
        isMythic && "ceremony-reveal--mythic",
        className
      )}
      data-tier={tier}
    >
      {children}
      {isAscended && armed && <AscendedHaloBurst />}
    </div>
  );
}

function AscendedHaloBurst() {
  return (
    <div className="ceremony-halo pointer-events-none" aria-hidden>
      <div className="ceremony-halo-ring" />
      <div className="ceremony-halo-ring ceremony-halo-ring--delay" />
    </div>
  );
}
