export interface LiveNewsItem {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface NewsArticle {
  title?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  topic?: string;
}

export const LIVE_NEWS_REVALIDATE_SECONDS = 60 * 60 * 24;

const MAX_ITEMS = 8;

export const FALLBACK_LIVE_NEWS_ITEMS: LiveNewsItem[] = [
  {
    headline: "SPACEX VALUATION WATCH",
    source: "CURATED",
    url: "https://www.spacex.com/",
    publishedAt: "fallback",
  },
  {
    headline: "CANCER BREAKTHROUGH WATCH",
    source: "CURATED",
    url: "https://www.cancer.gov/news-events",
    publishedAt: "fallback",
  },
  {
    headline: "FUSION ENERGY BREAKTHROUGH WATCH",
    source: "CURATED",
    url: "https://www.energy.gov/science/fes/fusion-energy-sciences",
    publishedAt: "fallback",
  },
  {
    headline: "AI LAB VALUATION WATCH",
    source: "CURATED",
    url: "https://news.google.com/search?q=AI%20valuation",
    publishedAt: "fallback",
  },
];

const SEARCHES = [
  { topic: "SPACE", query: "SpaceX valuation when:7d" },
  { topic: "AI", query: "OpenAI valuation OR Anthropic valuation when:7d" },
  { topic: "HEALTH", query: "cancer breakthrough OR cancer cure when:7d" },
  { topic: "BIOTECH", query: "CRISPR breakthrough OR FDA approves gene therapy when:7d" },
  { topic: "FUSION", query: "fusion energy breakthrough when:14d" },
  { topic: "NASA", query: "NASA discovery OR Mars discovery OR moon landing when:7d" },
  { topic: "CHIPS", query: "Nvidia market cap OR AI chip breakthrough when:7d" },
];

const EXCITING_KEYWORDS: Array<[RegExp, number]> = [
  [/\b(spacex|openai|anthropic|nvidia|tesla|apple|microsoft|google|meta|nasa)\b/i, 6],
  [/\b(cancer|crispr|alzheimers|fusion|quantum|mars|moon|space|asteroid)\b/i, 5],
  [/\b(valuation|market cap|trillion|billion|ipo|acquisition)\b/i, 4],
  [/\b(breakthrough|cure|discovers?|discovery|first-ever|historic|milestone)\b/i, 4],
  [/\b(approved|trial|vaccine|therapy|treatment|launch|lands?|orbit)\b/i, 2],
];

const BORING_OR_BAD_NEWS = /\b(lawsuit|crime|murder|war|election|poll|scandal|stock falls|stock drops|injury|divorce|problem|concerns?|not a cure)\b/i;
const LOW_SIGNAL_SOURCES = /\b(linkedin|pressreader|medium|substack|reddit|facebook|instagram|tiktok|digitaljournal|msn|nai500)\b/i;
const TOPIC_MATCHERS: Record<string, RegExp> = {
  AI: /\b(openai|anthropic|nvidia|ai|artificial intelligence)\b/i,
  BIOTECH: /\b(crispr|gene therapy|fda|biotech|genetic)\b/i,
  CHIPS: /\b(nvidia|chip|semiconductor|gpu|ai)\b/i,
  FUSION: /\b(fusion|energy)\b/i,
  HEALTH: /\b(cancer|cure|therapy|treatment|trial|breakthrough)\b/i,
  NASA: /\b(nasa|moon landing|lunar|mars discovery|space discovery)\b/i,
  SPACE: /\b(spacex|starlink|space)\b/i,
};

function googleNewsRssUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

export async function getLiveNewsItems(): Promise<LiveNewsItem[]> {
  try {
    const responses = await Promise.allSettled(
      SEARCHES.map(async (query) => {
        const response = await fetch(googleNewsRssUrl(query.query), {
          next: { revalidate: LIVE_NEWS_REVALIDATE_SECONDS },
          signal: AbortSignal.timeout(10_000),
        });
        return response.ok
          ? parseGoogleNewsRss(await response.text(), query.topic)
          : [];
      })
    );

    const items = normalizeNewsArticles(
      responses.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      )
    );
    return items.length > 0 ? items : FALLBACK_LIVE_NEWS_ITEMS;
  } catch (err) {
    console.error("live-news fetch failed:", err instanceof Error ? err.message : err);
    return FALLBACK_LIVE_NEWS_ITEMS;
  }
}

export function normalizeNewsArticles(articles: NewsArticle[]): LiveNewsItem[] {
  const seen = new Set<string>();
  const topicCounts = new Map<string, number>();

  return articles
    .map((article) => ({ article, score: scoreLiveNewsArticle(article.title ?? "") }))
    .filter(({ score }) => score >= 6)
    .filter(({ article }) => isUsefulForTopic(article))
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => {
      const headline = cleanHeadline(article.title ?? "");
      const dedupeKey = headline.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!headline || seen.has(dedupeKey)) return null;
      const topic = article.topic ?? "LIVE";
      const topicCount = topicCounts.get(topic) ?? 0;
      if (topicCount >= 2) return null;
      seen.add(dedupeKey);
      topicCounts.set(topic, topicCount + 1);

      return {
        headline: article.topic ? `${article.topic}: ${headline}` : headline,
        source: cleanSource(article.source),
        url: article.url ?? "#",
        publishedAt: article.publishedAt ?? new Date().toISOString(),
      };
    })
    .filter((item): item is LiveNewsItem => item !== null)
    .slice(0, MAX_ITEMS);
}

export function scoreLiveNewsArticle(title: string): number {
  if (!title || BORING_OR_BAD_NEWS.test(title)) return 0;

  return EXCITING_KEYWORDS.reduce((score, [pattern, weight]) => {
    return pattern.test(title) ? score + weight : score;
  }, 0);
}

function isUsefulForTopic(article: NewsArticle): boolean {
  if (LOW_SIGNAL_SOURCES.test(article.source ?? "")) return false;
  const matcher = article.topic ? TOPIC_MATCHERS[article.topic] : null;
  return matcher ? matcher.test(article.title ?? "") : true;
}

export function parseGoogleNewsRss(xml: string, topic?: string): NewsArticle[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const rawTitle = decodeXml(readTag(item, "title"));
    const titleParts = rawTitle.split(" - ");
    const source = decodeXml(readTag(item, "source")) || titleParts.at(-1) || "LIVE";

    return {
      title: titleParts.length > 1 ? titleParts.slice(0, -1).join(" - ") : rawTitle,
      source,
      url: decodeXml(readTag(item, "link")),
      publishedAt: decodeXml(readTag(item, "pubDate")),
      topic,
    };
  });
}

export function formatMarqueeHeadline(item: LiveNewsItem): string {
  return `${item.source}: ${item.headline}`;
}

function cleanHeadline(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s[-–—|]\s[^-–—|]{2,32}$/g, "")
    .trim()
    .slice(0, 110)
    .toUpperCase();
}

function cleanSource(domain?: string): string {
  if (!domain) return "LIVE";
  return domain
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 14) || "LIVE";
}

function readTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  return match?.[1]?.trim() ?? "";
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
