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
      {/* Tab bar — chunky arcade pills with hard shadow */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 -mx-2 px-2 scrollbar-thin">
        {TABS.map((t) => {
          const league = LEAGUES.find((l) => l.key === t.key);
          const isActive = active === t.key;
          const accent = league?.accent ?? "#FFC53D";
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="font-display text-[13px] px-4 py-2.5 rounded-full border-[3px] border-ink whitespace-nowrap transition cursor-pointer"
              style={{
                background: isActive ? accent : "var(--cream)",
                color: "var(--ink)",
                boxShadow: isActive ? "4px 4px 0 var(--ink)" : "3px 3px 0 var(--ink-soft)",
                transform: isActive ? "translate(-1px,-1px)" : "",
              }}
            >
              <span className="mr-1.5">{t.glyph}</span>
              {t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {active === "all-time" && <AllTimeBoard />}
      {activeLeague && <LeagueBoard league={activeLeague} />}
    </>
  );
}
