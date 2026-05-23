"use client";

import { useState } from "react";
import type { CrackedResultV1 } from "@/lib/types";
import { formatTier } from "@/lib/types";

export function ShareBar({ result }: { result: CrackedResultV1 }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetText = encodeURIComponent(
    `${result.name} is ${formatTier(result.tier, result.tierStars)} on Cracked · ${result.verdict.slice(0, 80)}${result.verdict.length > 80 ? "..." : ""}`
  );
  const tweetUrl =
    typeof window === "undefined"
      ? ""
      : `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-center">
      <button
        onClick={copyLink}
        className="px-5 py-2.5 rounded-md border border-white/15 text-white/85 font-mono text-[11px] tracking-[0.18em] uppercase hover:border-gold/40 hover:text-gold transition"
      >
        {copied ? "✓ link copied" : "Copy share link"}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 rounded-md bg-gradient-to-br from-foil-violet to-foil-pink text-white font-mono text-[11px] tracking-[0.18em] uppercase hover:brightness-110 transition text-center"
      >
        Post on X
      </a>
    </div>
  );
}
