"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_LIVE_NEWS_ITEMS,
  formatMarqueeHeadline,
  type LiveNewsItem,
} from "@/lib/live-news";

const ITEMS = [
  { text: "★ NOW SCORING", hot: true },
  { text: "DROP A LINKEDIN", hot: false },
];

export function Marquee() {
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>(FALLBACK_LIVE_NEWS_ITEMS);

  useEffect(() => {
    let cancelled = false;

    async function refreshNews() {
      try {
        const response = await fetch("/api/live-news");
        if (!response.ok) return;
        const payload = (await response.json()) as { items?: LiveNewsItem[] };
        if (!cancelled && payload.items?.length) {
          setLiveNews(payload.items);
        }
      } catch {
        // Keep curated fallback headlines when the live feed is unavailable.
      }
    }

    refreshNews();
    const interval = window.setInterval(refreshNews, 60 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const liveItems = liveNews.map((item) => ({
    text: formatMarqueeHeadline(item),
    hot: true,
  }));
  const items = [...ITEMS, ...liveItems];

  return (
    <div className="marquee-strip sticky top-[63px] z-[49]" aria-label="Live exciting news ticker">
      <div className="marquee-track">
        {[...items, ...items].map((it, i) => (
          <span key={i}>
            <span style={{ color: it.hot ? "var(--cherry)" : "var(--marigold)" }}>★</span>
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}
