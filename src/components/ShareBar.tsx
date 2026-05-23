"use client";

import { useState } from "react";
import type { CrackedResult } from "@/lib/types";
import { getLeague } from "@/data/leagues";

export function ShareBar({ result }: { result: CrackedResult }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const grade = result.league
    ? `TIER ${result.league.leagueTier} at ${getLeague(result.league.league).shortLabel}`
    : `TIER ${result.tier}`;
  const tweetText = encodeURIComponent(
    `${result.name} scored ${result.total}/100 · ${grade} on Cracked · ${result.verdict.slice(0, 80)}${result.verdict.length > 80 ? "..." : ""}`
  );
  const tweetUrl =
    typeof window === "undefined"
      ? ""
      : `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
      <button
        onClick={copyLink}
        className="arcade-btn px-5 py-3 rounded-full border-[3px] border-ink bg-cream text-ink font-display text-[13px] tracking-tight transition"
        style={{ boxShadow: "5px 5px 0 var(--ink)" }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "7px 7px 0 var(--ink)";
          t.style.transform = "translate(-2px,-2px)";
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "5px 5px 0 var(--ink)";
          t.style.transform = "";
        }}
      >
        {copied ? "✓ LINK COPIED" : "COPY SHARE LINK"}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="arcade-btn px-5 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[13px] tracking-tight text-center transition"
        style={{ boxShadow: "5px 5px 0 var(--ink)" }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "7px 7px 0 var(--ink)";
          t.style.transform = "translate(-2px,-2px)";
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.boxShadow = "5px 5px 0 var(--ink)";
          t.style.transform = "";
        }}
      >
        POST ON X →
      </a>
    </div>
  );
}
