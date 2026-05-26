// Human-readable labels for Achievement SignalMatchers — used on dex cards.

import type { SignalMatcher } from "@/lib/types";

export function formatSignal(m: SignalMatcher): string {
  switch (m.kind) {
    case "school": {
      const names = m.match.filter(Boolean);
      if (names.length === 0) return "School credential";
      return `School: ${joinLimited(names, 4)}`;
    }
    case "company": {
      const companies = m.match.filter(Boolean);
      const titles = m.title?.filter(Boolean) ?? [];
      if (companies.length === 0 && titles.length > 0) {
        return `Role: ${joinLimited(titles, 3)}`;
      }
      const co = companies.length ? joinLimited(companies, 3) : "Any company";
      if (titles.length) return `${co} · ${joinLimited(titles, 2)}`;
      return co;
    }
    case "award": {
      const names = m.match.filter(Boolean);
      return names.length ? `Award: ${joinLimited(names, 3)}` : "Award";
    }
    case "publication": {
      const venues = m.venue.filter(Boolean);
      const role = m.role ? `${m.role}-author` : "author";
      return venues.length
        ? `Publication (${role}): ${joinLimited(venues, 3)}`
        : `Publication (${role})`;
    }
    case "funding": {
      const parts: string[] = ["Funding"];
      if (m.round) parts.push(m.round);
      if (m.minAmount) parts.push(`≥ $${formatAmount(m.minAmount)}`);
      return parts.join(" · ");
    }
    case "online": {
      const parts: string[] = [];
      if (m.platform) parts.push(m.platform);
      if (m.minFollowers) parts.push(`≥ ${formatCount(m.minFollowers)} followers`);
      return parts.length ? parts.join(" · ") : "Online presence";
    }
    case "open_source": {
      const projects = m.project?.filter(Boolean) ?? [];
      const metric = m.minMetric ? `≥ ${formatCount(m.minMetric)} stars` : "";
      if (projects.length && metric) return `${joinLimited(projects, 2)} · ${metric}`;
      if (projects.length) return `OSS: ${joinLimited(projects, 3)}`;
      if (metric) return `Open source · ${metric}`;
      return "Open source signal";
    }
    case "free_text": {
      const hint = m.patterns[0]?.source.slice(0, 48);
      return hint ? `Text match: /${hint}${hint.length >= 48 ? "…" : ""}/` : "Resume text match";
    }
    default:
      return "Signal";
  }
}

export function formatSignals(signals: SignalMatcher[]): string[] {
  return signals.map(formatSignal);
}

function joinLimited(items: string[], max: number): string {
  if (items.length <= max) return items.join(", ");
  return `${items.slice(0, max).join(", ")} +${items.length - max}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function formatAmount(n: number): string {
  if (n >= 1_000_000_000) return `${n / 1_000_000_000}B`;
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}K`;
  return String(n);
}
