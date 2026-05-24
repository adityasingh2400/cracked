// SpecialityLine - single labeled phrase identifying the user's niche.
// Examples: "Frontier AI Researcher", "Pediatric Cardiologist", "Olympic Sprinter"
// LLM-derived (Claude extraction); template-fallback for regex extraction.

import clsx from "clsx";
import type { Family } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface SpecialityLineProps {
  speciality?: string;
  family: Family;
  /** When true, the speciality came from the regex-fallback path and may
   *  refine when LLM tier reconnects. Shown as a subtle indicator. */
  calibrating?: boolean;
  className?: string;
}

export function SpecialityLine({ speciality, family, calibrating, className }: SpecialityLineProps) {
  const meta = FAMILIES_META[family];
  // Skip rendering if speciality is empty (Claude returns "" when signals
  // are too thin to identify a niche).
  if (!speciality || speciality.trim().length === 0) return null;

  return (
    <div className={clsx("flex flex-col gap-0.5", className)} data-testid="speciality-line">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
        {calibrating && <span className="text-amber-foil/70" title="May refine when Claude reconnects">·</span>}
        {" "}speciality
      </div>
      <div
        className="font-display text-base sm:text-lg leading-tight"
        style={{ color: "#FFE5A8" }}
      >
        {speciality}
      </div>
    </div>
  );
}
