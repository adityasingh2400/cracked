// 3-tier scoring backend router.
// Per /plan-eng-review Section 1.3 + Premise #4:
//   Top:    Claude on Aditya's Mac (via Tailscale Funnel; for testing/v1.0)
//   Middle: Anthropic API (when ANTHROPIC_API_KEY env var is set; daily cap)
//   Bottom: existing regex fallback in claude.ts
//
// Cascade contract:
//   1. Try Mac-Claude with 8s timeout.
//   2. On timeout / network failure / malformed response → try API tier.
//   3. On API budget cap hit / API error / no key → regex fallback.
//   4. Each tier returns same ExtractionV1Result shape, plus a `tier` label
//      indicating which tier served the result. The result includes a
//      `calibrating` flag when scored at the bottom tier so the UI can show
//      a "calibrating" badge + one-click re-score affordance.

import {
  extractWithClaude,
  extractWithRegex,
  ExtractionV1Schema,
  type ExtractionV1Result,
} from "./claude";

// Env vars read at CALL TIME, not module load. This lets tests set env vars
// after the module is imported. Production callers see no behavior change.
function macClaudeUrl(): string | undefined {
  return process.env.MAC_CLAUDE_URL;
}
function macClaudeAuth(): string | undefined {
  return process.env.MAC_CLAUDE_AUTH;
}
function apiDailyBudgetUsd(): number {
  return Number(process.env.API_DAILY_BUDGET_USD ?? "20");
}

const MAC_CLAUDE_TIMEOUT_MS = 8_000;
const API_COST_PER_REQUEST_USD = 0.03; // rough estimate; tune as observed

// Lightweight in-memory budget tracker (resets at midnight UTC).
interface BudgetState {
  date: string; // YYYY-MM-DD UTC
  spent: number; // USD
}
let budget: BudgetState = { date: utcDate(), spent: 0 };

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkBudget(): boolean {
  const today = utcDate();
  if (budget.date !== today) {
    budget = { date: today, spent: 0 };
  }
  return budget.spent < apiDailyBudgetUsd();
}

function recordSpend(): void {
  if (budget.date !== utcDate()) {
    budget = { date: utcDate(), spent: 0 };
  }
  budget.spent += API_COST_PER_REQUEST_USD;
}

// =============================================================================
// MAC-CLAUDE TIER - POST to Tailscale Funnel URL.
// =============================================================================

async function routeToMacClaude(
  pdfText: string
): Promise<ExtractionV1Result | null> {
  const url = macClaudeUrl();
  const auth = macClaudeAuth();
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAC_CLAUDE_TIMEOUT_MS);

  try {
    const res = await fetch(url + "/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify({ pdfText }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`Mac-Claude returned ${res.status}; cascading to API tier.`);
      return null;
    }

    const json = await res.json();
    const parsed = ExtractionV1Schema.safeParse(json);
    if (!parsed.success) {
      console.warn("Mac-Claude returned malformed JSON; cascading.");
      return null;
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("Mac-Claude timed out; cascading to API tier.");
    } else {
      console.warn(
        "Mac-Claude error; cascading:",
        err instanceof Error ? err.message : err
      );
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// =============================================================================
// CASCADE - try top → middle → bottom, return first success.
// =============================================================================

export type ScoringTier = "mac-claude" | "anthropic-api" | "regex-fallback";

export interface RoutedExtractionResult {
  extraction: ExtractionV1Result;
  tier: ScoringTier;
  calibrating: boolean;
}

export async function routeExtraction(
  pdfText: string,
  fallbackName = "User"
): Promise<RoutedExtractionResult> {
  // 1. Try Mac-Claude.
  const mac = await routeToMacClaude(pdfText);
  if (mac) {
    return { extraction: mac, tier: "mac-claude", calibrating: false };
  }

  // 2. Try Anthropic API (only if budget allows).
  if (checkBudget() && process.env.ANTHROPIC_API_KEY) {
    const api = await extractWithClaude(pdfText);
    if (api) {
      recordSpend();
      return { extraction: api, tier: "anthropic-api", calibrating: false };
    }
  } else if (!checkBudget()) {
    console.warn(
      `API budget cap reached for ${budget.date}; cascading to regex.`
    );
  }

  // 3. Regex fallback - always returns. Mark as calibrating.
  const regex = extractWithRegex(pdfText, fallbackName);
  return { extraction: regex, tier: "regex-fallback", calibrating: true };
}

// Exported for testability - reset budget state between tests.
export function _resetBudgetForTests(): void {
  budget = { date: utcDate(), spent: 0 };
}

export function _currentBudget(): BudgetState {
  return { ...budget };
}
