"use client";

import { useState } from "react";
import { LEAGUES } from "@/data/leagues";
import { AllTimeBoard, LeagueBoard } from "./boards";

type TabKey = "all-time" | (typeof LEAGUES)[number]["key"];

const TABS: { key: TabKey; label: string; glyph: string }[] = [
  { key: "all-time", label: "All-Time", glyph: "★" },
  ...LEAGUES.map((l) => ({ key: l.key, label: l.shortLabel, glyph: l.glyph })),
];

export function LeagueTabs() {
  const [active, setActive] = useState<TabKey>("all-time");
  const activeLeague = LEAGUES.find((l) => l.key === active);

  return (
    <>
      {/* Tab bar — horizontal scroll on small screens. */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-8 -mx-2 px-2 scrollbar-thin">
        {TABS.map((t) => {
          const league = LEAGUES.find((l) => l.key === t.key);
          const isActive = active === t.key;
          const accent = league?.accent ?? "#FCD34D";
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="font-mono text-[11px] tracking-[0.18em] uppercase px-3.5 py-2 rounded-lg border whitespace-nowrap transition cursor-pointer"
              style={{
                borderColor: isActive ? `${accent}80` : "rgba(255,255,255,0.10)",
                background: isActive ? `${accent}14` : "rgba(255,255,255,0.02)",
                color: isActive ? accent : "rgba(255,255,255,0.65)",
                boxShadow: isActive ? `0 0 16px ${accent}25` : undefined,
              }}
            >
              <span className="mr-1.5">{t.glyph}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab body */}
      {active === "all-time" && <AllTimeBoard />}
      {activeLeague && <LeagueBoard league={activeLeague} />}
    </>
  );
}
