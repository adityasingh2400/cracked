import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FALLBACK_LIVE_NEWS_ITEMS,
  formatMarqueeHeadline,
  getLiveNewsItems,
  normalizeNewsArticles,
  parseGoogleNewsRss,
  scoreLiveNewsArticle,
} from "@/lib/live-news";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("live news scoring", () => {
  it("prioritizes recognizable breakthrough and valuation headlines", () => {
    expect(
      scoreLiveNewsArticle("SpaceX valuation jumps to $350 billion after tender offer")
    ).toBeGreaterThanOrEqual(10);

    expect(
      scoreLiveNewsArticle("Scientists report first-ever cancer cure breakthrough in trial")
    ).toBeGreaterThanOrEqual(10);
  });

  it("filters low-signal or negative headlines", () => {
    expect(scoreLiveNewsArticle("Local election poll shows close race")).toBe(0);
    expect(scoreLiveNewsArticle("Celebrity lawsuit update")).toBe(0);
  });
});

describe("live news normalization", () => {
  it("cleans, sorts, dedupes, and formats items for the marquee", () => {
    const items = normalizeNewsArticles([
      {
        title: "Small company launches new app",
        source: "Example",
        url: "https://example.com/app",
        publishedAt: "20260524T010000Z",
      },
      {
        title: "NASA announces historic Mars discovery - Space Wire",
        source: "Space Wire",
        url: "https://spacewire.com/mars",
        publishedAt: "20260524T020000Z",
      },
      {
        title: "NASA announces historic Mars discovery - Space Wire",
        source: "Space Wire",
        url: "https://spacewire.com/mars-dupe",
        publishedAt: "20260524T030000Z",
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      headline: "NASA ANNOUNCES HISTORIC MARS DISCOVERY",
      source: "SPACEWIRE",
      url: "https://spacewire.com/mars",
    });
    expect(formatMarqueeHeadline(items[0])).toBe(
      "SPACEWIRE: NASA ANNOUNCES HISTORIC MARS DISCOVERY"
    );
  });

  it("caps repeated stories from the same topic", () => {
    const items = normalizeNewsArticles([
      {
        title: "SpaceX valuation jumps to $350 billion",
        source: "CNBC",
        topic: "SPACE",
      },
      {
        title: "SpaceX sets benchmark for space valuation",
        source: "CNBC",
        topic: "SPACE",
      },
      {
        title: "SpaceX IPO sparks valuation hopes",
        source: "Reuters",
        topic: "SPACE",
      },
      {
        title: "Cancer breakthrough trial reports historic milestone",
        source: "Nature",
        topic: "HEALTH",
      },
    ]);

    expect(items.map((item) => item.headline)).toContain(
      "SPACE: SPACEX VALUATION JUMPS TO $350 BILLION"
    );
    expect(items.filter((item) => item.headline.startsWith("SPACE:"))).toHaveLength(2);
    expect(items.map((item) => item.headline)).toContain(
      "HEALTH: CANCER BREAKTHROUGH TRIAL REPORTS HISTORIC MILESTONE"
    );
  });

  it("filters source spam and topic bleed", () => {
    const items = normalizeNewsArticles([
      {
        title: "SpaceX just filed a record-breaking valuation",
        source: "LinkedIn",
        topic: "AI",
      },
      {
        title: "OpenAI valuation reaches new milestone",
        source: "The Information",
        topic: "AI",
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].headline).toBe("AI: OPENAI VALUATION REACHES NEW MILESTONE");
  });

  it("extracts real headline, source, link, and date from Google News RSS", () => {
    const articles = parseGoogleNewsRss(`
      <rss><channel><item>
        <title>SpaceX valuation climbs to $350 billion - Reuters</title>
        <link>https://news.google.com/rss/articles/example?oc=5</link>
        <pubDate>Sun, 24 May 2026 08:00:00 GMT</pubDate>
        <source url="https://www.reuters.com">Reuters</source>
      </item></channel></rss>
    `);

    expect(articles).toEqual([
      {
        title: "SpaceX valuation climbs to $350 billion",
        source: "Reuters",
        url: "https://news.google.com/rss/articles/example?oc=5",
        publishedAt: "Sun, 24 May 2026 08:00:00 GMT",
        topic: undefined,
      },
    ]);
  });
});

describe("live news fetch fallback", () => {
  it("does not throw when providers return unusable text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Your query is invalid", { status: 200 }))
    );

    await expect(getLiveNewsItems()).resolves.toEqual(FALLBACK_LIVE_NEWS_ITEMS);
  });

  it("uses real headlines when at least one provider request succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue(
        new Response(
          `<rss><channel><item>
            <title>OpenAI valuation reaches new milestone - The Information</title>
            <link>https://news.google.com/rss/articles/openai</link>
            <pubDate>Sun, 24 May 2026 08:00:00 GMT</pubDate>
            <source>The Information</source>
          </item></channel></rss>`,
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLiveNewsItems()).resolves.toMatchObject([
      {
        headline: "AI: OPENAI VALUATION REACHES NEW MILESTONE",
        source: "THEINFORMATION",
      },
    ]);
  });
});
