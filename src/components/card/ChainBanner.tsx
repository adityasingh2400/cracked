// ChainBanner — shows the name of an unlocked chain (e.g. "The Classic Pipeline").
// Per /plan-eng-review Cross-Model Perspective: internal name only, no URL link.
// Renders nothing if no chain is active.

import clsx from "clsx";

interface ChainBannerProps {
  chainName?: string;
  className?: string;
}

export function ChainBanner({ chainName, className }: ChainBannerProps) {
  if (!chainName) return null;
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md",
        "bg-black/30 border border-amber-foil/40",
        "font-mono text-xs tracking-widest uppercase text-amber-foil",
        className
      )}
      data-testid="chain-banner"
    >
      <span aria-hidden>⛓</span>
      <span>{chainName}</span>
    </div>
  );
}
