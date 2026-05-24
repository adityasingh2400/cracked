// Local Claude CLI extractor - uses the user's logged-in `claude` CLI as the
// LLM backend instead of api.anthropic.com. Useful in localhost dev when no
// API key is available. Spawns `claude -p` as a subprocess.
//
// Cost: ~$0.05 cold, ~$0.01 cache-warm per call (Haiku 4.5).
// Latency: ~5-9 seconds. Not for production hot paths - dev convenience only.

import { spawn } from "node:child_process";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  ExtractionV1Schema,
  type ExtractionV1Result,
  type UploadFile,
  type ExtractUploadsResult,
} from "./claude";

const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";

// Embed the same extraction spec as claude.ts uses, slightly tightened for CLI.
const EXTRACTION_PROMPT = (filePaths: string[], name?: string, age?: number) => {
  const nameLine = name ? `Their name is "${name}".` : "";
  const ageLine = age ? `They are approximately ${age} years old.` : "";
  return [
    "You're helping build someone's profile card for a fun career-summary site",
    "(cracked.com - like a trading card for résumés). The user has provided their",
    "own résumé/LinkedIn screenshots and consented to this extraction.",
    nameLine,
    ageLine,
    "",
    "Please use the Read tool to read these files the user uploaded:",
    ...filePaths.map((p, i) => `  ${i + 1}. ${p}`),
    "",
    "Pull out the highlights they'd want on a résumé card:",
    "  - schools: list of {name, degree, gradYear}",
    "  - companies: list of {name, title}",
    "  - awards: list of {name, year}",
    "  - publications: list of {venue, role: \"first\"|\"coauthor\"}",
    "  - funding: list of {company, round, amount}",
    "  - open_source: list of {project, metric (e.g. star count)}",
    "  - online: list of {platform, followers}",
    "  - raw_text: 1-3 paragraph summary of what you saw",
    "",
    "Then derive:",
    "  - name: the person's name (use what they gave above, or read from the page)",
    "  - speciality: a 2-5 word niche descriptor (e.g. \"Frontier AI Researcher\")",
    "  - bestAccolades: 3-6 ranked 'most cracked signals', strongest first, not generic labels",
    "    Examples: \"Stanford CS\", \"Anthropic MTS\", \"YC W25 Founder\", \"NeurIPS Co-Author\", \"$1.5M Seed Round\".",
    "    If they won multiple hackathons, combine it into a strong signal like \"3x Hackathon Winner\".",
    "    Each item is {title, detail?, family?}; title <42 chars; detail <90 chars.",
    "  - verdict: 2-sentence celebratory blurb about their trajectory",
    "  - flavor: short one-line tagline",
    "  - ageInference: { age: number|null, confidence: 0-1, reasoning: string }",
    "",
    "Output ONLY a single JSON object matching this shape. No fences, no",
    "preamble, no explanation. If a category has no entries, return [].",
  ].join("\n");
};

export async function extractViaLocalClaude(
  files: UploadFile[],
  userName?: string,
  userAge?: number
): Promise<ExtractUploadsResult> {
  if (!files || files.length === 0) return { ok: false, reason: "no-files" };

  // Materialize uploads to a session dir so the CLI's Read tool can see them.
  const sessionDir = join(tmpdir(), `cracked-${randomUUID()}`);
  await mkdir(sessionDir, { recursive: true });

  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ext = f.mimeType === "application/pdf" ? "pdf"
      : f.mimeType === "image/png" ? "png"
      : f.mimeType === "image/webp" ? "webp"
      : f.mimeType === "image/gif" ? "gif"
      : "jpg";
    const path = join(sessionDir, `upload-${i}.${ext}`);
    await writeFile(path, Buffer.from(f.base64, "base64"));
    paths.push(path);
  }

  const prompt = EXTRACTION_PROMPT(paths, userName, userAge);

  // Spawn `claude -p` with stdin prompt. Strip the auto-context to keep cost low.
  const args = [
    "-p",
    "--model", "haiku",
    "--output-format", "json",
    "--max-budget-usd", "0.20",
    "--exclude-dynamic-system-prompt-sections",
    "--disable-slash-commands",
    "--no-session-persistence",
    "--dangerously-skip-permissions",
    "--allowedTools", "Read",
    "--add-dir", sessionDir,
  ];

  // Strip ANTHROPIC_API_KEY from the subprocess env. If our .env.local has a
  // dead key, the CLI would prefer it over keychain auth and 401-fail.
  // Letting it fall through to keychain auth makes "no key required" work.
  const cleanEnv = { ...process.env };
  delete cleanEnv.ANTHROPIC_API_KEY;
  delete cleanEnv.ANTHROPIC_AUTH_TOKEN;

  const cleanup = () => rm(sessionDir, { recursive: true, force: true }).catch(() => {});

  return new Promise<ExtractUploadsResult>((resolve) => {
    const wrap = async (r: ExtractUploadsResult) => {
      await cleanup();
      resolve(r);
    };
    const child = spawn(CLAUDE_BIN, args, {
      env: cleanEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let killed = false;
    const timeout = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
    }, 90_000);

    child.stdout.on("data", (b) => { stdout += b.toString(); });
    child.stderr.on("data", (b) => { stderr += b.toString(); });

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (killed) {
        return wrap({ ok: false, reason: "api", detail: "local-claude timed out" });
      }
      if (code !== 0 && stdout.trim().length === 0) {
        return wrap({
          ok: false,
          reason: "api",
          detail: `local-claude exited ${code}: ${stderr.slice(0, 400)}`,
        });
      }

      // The CLI returns one JSON object per line in json output-format.
      // Take the last "type":"result" line.
      const lines = stdout.split("\n").filter((l) => l.trim());
      const resultLine = [...lines].reverse().find((l) => l.includes('"type":"result"'));
      if (!resultLine) {
        return wrap({
          ok: false,
          reason: "parse",
          detail: "no result line in CLI output",
        });
      }
      let envelope: { result?: string; is_error?: boolean };
      try {
        envelope = JSON.parse(resultLine);
      } catch (e) {
        return wrap({
          ok: false,
          reason: "parse",
          detail: e instanceof Error ? e.message : "envelope parse failed",
        });
      }
      if (envelope.is_error || typeof envelope.result !== "string") {
        return wrap({
          ok: false,
          reason: "api",
          detail: envelope.result || "CLI reported is_error",
        });
      }

      const cleaned = envelope.result
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      let json: unknown;
      try {
        json = JSON.parse(cleaned);
      } catch (e) {
        return wrap({
          ok: false,
          reason: "parse",
          detail: `inner JSON parse failed: ${e instanceof Error ? e.message : "?"}`,
        });
      }

      // Normalize: if the model flattened signals at the top level, re-nest them.
      const SIG_KEYS = [
        "schools", "companies", "awards", "publications",
        "funding", "open_source", "online", "raw_text",
      ];
      if (
        json && typeof json === "object" && !("signals" in json) &&
        SIG_KEYS.some((k) => k in (json as Record<string, unknown>))
      ) {
        const j = json as Record<string, unknown>;
        const signals: Record<string, unknown> = {};
        for (const k of SIG_KEYS) {
          if (k in j) {
            signals[k] = j[k];
            delete j[k];
          }
        }
        j.signals = signals;
      }
      coerceNumericFields(json);
      stripNulls(json);
      const parsed = ExtractionV1Schema.safeParse(json);
      if (!parsed.success) {
        // Print full schema diff to dev log so we can see exactly what's missing
        console.error("Local CLI schema mismatch. Issues:");
        for (const issue of parsed.error.issues.slice(0, 10)) {
          console.error("  -", issue.path.join("."), ":", issue.message);
        }
        console.error("Raw JSON keys:", Object.keys(json as object).join(", "));
        return wrap({
          ok: false,
          reason: "schema",
          detail: parsed.error.issues
            .slice(0, 3)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
      }
      wrap({ ok: true, data: parsed.data });
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/** Coerce string→number on the few numeric fields the schema demands.
 *  Claude often writes "4,200 stars" or "12.5k" - strip non-digits, parse. */
function toNum(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  let s = v.toLowerCase().replace(/,/g, "").trim();
  let mult = 1;
  if (/k\b/.test(s)) mult = 1_000;
  else if (/m\b/.test(s)) mult = 1_000_000;
  else if (/b\b/.test(s)) mult = 1_000_000_000;
  s = s.replace(/[^0-9.]/g, "");
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n * mult);
}

function coerceNumericFields(json: unknown): void {
  if (!json || typeof json !== "object") return;
  const j = json as Record<string, unknown>;
  const signals = j.signals as Record<string, unknown> | undefined;
  if (!signals) return;

  // schools[].gradYear, awards[].year, publications irrelevant, funding[].amount,
  // open_source[].metric, online[].followers
  const coerceArr = (arr: unknown, fields: string[]) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const it = item as Record<string, unknown>;
      for (const f of fields) {
        if (f in it) {
          const n = toNum(it[f]);
          if (n !== null) it[f] = n;
          else delete it[f]; // remove unparseable so optional fields pass
        }
      }
    }
  };
  coerceArr(signals.schools, ["gradYear"]);
  coerceArr(signals.awards, ["year"]);
  coerceArr(signals.funding, ["amount"]);
  coerceArr(signals.open_source, ["metric"]);
  coerceArr(signals.online, ["followers"]);
}

/** Recursively delete keys whose value is null. Zod optional() accepts undefined,
 *  not null, and the CLI often writes `"degree": null` instead of omitting it. */
function stripNulls(json: unknown): void {
  if (Array.isArray(json)) {
    for (const item of json) stripNulls(item);
    return;
  }
  if (!json || typeof json !== "object") return;
  const j = json as Record<string, unknown>;
  for (const k of Object.keys(j)) {
    if (j[k] === null) delete j[k];
    else if (typeof j[k] === "object") stripNulls(j[k]);
  }
}

/** Returns true if the local claude CLI is available. Cached after first call. */
let cliAvailable: boolean | null = null;
export async function isLocalClaudeAvailable(): Promise<boolean> {
  if (cliAvailable !== null) return cliAvailable;
  return new Promise<boolean>((resolve) => {
    const c = spawn(CLAUDE_BIN, ["--version"], { stdio: "ignore" });
    c.on("error", () => { cliAvailable = false; resolve(false); });
    c.on("close", (code) => {
      cliAvailable = code === 0;
      resolve(cliAvailable);
    });
  });
}

// Re-export ExtractionV1Result type for callers.
export type { ExtractionV1Result };
