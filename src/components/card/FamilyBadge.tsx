// FamilyBadge — the family glyph + name strip at the top of the card.
// 9 family variants with foil colors from FAMILIES_META.

import clsx from "clsx";
import type { Family } from "@/lib/types";
import { FAMILIES_META } from "@/data/families";

interface FamilyBadgeProps {
  family: Family;
  /** When true, shows the full motto on hover. Default false. */
  withMotto?: boolean;
  /** When set, renders a secondary "/ also X" tag for runners-up. */
  secondary?: Family;
  className?: string;
}

export function FamilyBadge({
  family,
  withMotto,
  secondary,
  className,
}: FamilyBadgeProps) {
  const meta = FAMILIES_META[family];
  const secondaryMeta = secondary ? FAMILIES_META[secondary] : null;

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-2 rounded-md",
        className
      )}
      style={{
        background: `${meta.accent}1A`, // ~10% opacity
        border: `1px solid ${meta.accent}66`,
      }}
      data-testid={`family-badge-${family}`}
    >
      <span
        aria-hidden
        className="text-2xl leading-none"
        style={{ color: meta.accent }}
      >
        {meta.glyph}
      </span>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/55 uppercase">
          {meta.shortName}
          {secondaryMeta && (
            <span className="text-white/30"> · also {secondaryMeta.shortName}</span>
          )}
        </span>
        <span className="font-display text-base text-white leading-tight">
          {meta.name}
        </span>
        {withMotto && (
          <span className="text-xs text-white/55 italic mt-0.5">{meta.motto}</span>
        )}
      </div>
    </div>
  );
}
