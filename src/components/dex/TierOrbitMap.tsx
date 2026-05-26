"use client";

import { useMemo, useState } from "react";
import type { Tier } from "@/lib/types";
import { hash32 } from "@/lib/types";
import type { DexAchievementView, DexChainView } from "@/lib/dex-views";

interface TierOrbitMapProps {
  tier: Tier;
  achievements: DexAchievementView[];
  chains: DexChainView[];
  accent: string;
  foil: { primary: string; secondary: string; tertiary: string };
}

interface OrbitNode {
  id: string;
  kind: "achievement" | "chain";
  x: number;
  y: number;
  r: number;
  label: string;
  detail: string;
  requires?: string[];
}

function placeOnRing(
  id: string,
  index: number,
  total: number,
  radius: number,
  seed: string
): { x: number; y: number } {
  const h = hash32(`${seed}::${id}`);
  const jitter = ((h % 1000) / 1000 - 0.5) * (Math.PI / Math.max(total, 1)) * 0.6;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2 + jitter;
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  };
}

export function TierOrbitMap({ tier, achievements, chains, accent, foil }: TierOrbitMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const activeId = pinned ?? hovered;

  const nodes = useMemo(() => {
    const seed = `${tier}-orbit`;
    const out: OrbitNode[] = [];

    chains.forEach((c, i) => {
      const { x, y } = placeOnRing(c.id, i, chains.length, 22, seed);
      out.push({
        id: c.id,
        kind: "chain",
        x,
        y,
        r: 2.8,
        label: c.name,
        detail: c.description,
        requires: c.requires.map((r) => r.id),
      });
    });

    const ringCount = achievements.length > 24 ? 3 : achievements.length > 12 ? 2 : 1;
    achievements.forEach((a, i) => {
      const ring = i % ringCount;
      const radius = 34 + ring * 7;
      const ringIndex = Math.floor(i / ringCount);
      const ringTotal = Math.ceil(achievements.length / ringCount);
      const { x, y } = placeOnRing(a.id, ringIndex, ringTotal, radius, `${seed}-a${ring}`);
      out.push({
        id: a.id,
        kind: "achievement",
        x,
        y,
        r: achievements.length > 30 ? 1.6 : 2.2,
        label: a.label,
        detail: a.signals[0] ?? a.description,
      });
    });

    return out;
  }, [achievements, chains, tier]);

  const activeNode = nodes.find((n) => n.id === activeId);
  const highlightIds = useMemo(() => {
    if (!activeNode || activeNode.kind !== "chain" || !activeNode.requires) return new Set<string>();
    return new Set([activeNode.id, ...activeNode.requires]);
  }, [activeNode]);

  const chainLinks = useMemo(() => {
    if (!activeNode || activeNode.kind !== "chain" || !activeNode.requires) return [];
    const chain = nodes.find((n) => n.id === activeNode.id);
    if (!chain) return [];
    return activeNode.requires
      .map((reqId) => nodes.find((n) => n.id === reqId))
      .filter(Boolean)
      .map((target) => ({
        x1: chain.x,
        y1: chain.y,
        x2: target!.x,
        y2: target!.y,
      }));
  }, [activeNode, nodes]);

  return (
    <div
      className="relative rounded-2xl border-[3px] border-ink overflow-hidden min-h-[340px] sm:min-h-[400px]"
      style={{ background: "var(--ink)", boxShadow: "5px 5px 0 var(--ink)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${foil.primary}33 0%, transparent 55%),
            conic-gradient(from 0deg at 50% 50%, ${foil.primary}22, ${foil.secondary}22, ${foil.tertiary}22, ${foil.primary}22)`,
        }}
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
        {[22, 34, 41, 48].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="0.15"
            strokeOpacity="0.2"
            strokeDasharray="1 2"
          />
        ))}

        {chainLinks.map((l, i) => (
          <line
            key={`link-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={accent}
            strokeWidth="0.35"
            strokeOpacity="0.85"
            strokeDasharray="0.8 1.2"
          />
        ))}

        {nodes.map((n) => {
          const lit = !activeId || highlightIds.has(n.id) || n.id === activeId;
          const isChain = n.kind === "chain";
          return (
            <g key={n.id} style={{ opacity: lit ? 1 : 0.25, transition: "opacity 200ms" }}>
              {isChain && (
                <circle cx={n.x} cy={n.y} r={n.r * 2.2} fill={accent} fillOpacity="0.25" />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r * 2.5}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setPinned((p) => (p === n.id ? null : n.id))}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isChain ? accent : "#FFFAF2"}
                stroke={isChain ? "#FFFAF2" : accent}
                strokeWidth={activeId === n.id ? 0.5 : 0.25}
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border-2 border-paper/30 grid place-items-center text-center px-3"
          style={{
            width: "28%",
            height: "28%",
            background: `radial-gradient(circle, ${accent}44 0%, rgba(0,0,0,0.85) 70%)`,
            boxShadow: `0 0 40px ${accent}55`,
          }}
        >
          <div className="font-display text-paper text-[11px] sm:text-[13px] leading-tight tracking-wider">
            {tier}
          </div>
          <div className="font-mono text-[7px] sm:text-[8px] tracking-[0.14em] uppercase text-paper/70 mt-1">
            {achievements.length} · {chains.length}⛓
          </div>
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-0 p-3 sm:p-4 pointer-events-none">
        {activeNode ? (
          <div
            className="rounded-xl border-2 border-paper/20 px-3 py-2.5 pointer-events-auto"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div
                  className="font-mono text-[8px] font-bold tracking-[0.18em] uppercase mb-1"
                  style={{ color: accent }}
                >
                  {activeNode.kind === "chain" ? "⛓ Chain combo" : "◆ Milestone"}
                </div>
                <div className="font-display text-[13px] text-paper leading-tight">{activeNode.label}</div>
                <div className="font-serif text-[11px] text-blush/90 mt-1 leading-snug line-clamp-2">
                  {activeNode.detail}
                </div>
              </div>
              {pinned && (
                <button
                  type="button"
                  onClick={() => setPinned(null)}
                  className="shrink-0 font-mono text-[9px] text-paper/50 hover:text-paper uppercase tracking-wider"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-paper/45 text-center">
            Hover orbit · click to pin · inner ring = chains
          </div>
        )}
      </div>
    </div>
  );
}
