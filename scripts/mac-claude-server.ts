// Mac-Claude proxy server — runs on Aditya's MacBook 24/7.
// Vercel routes scoring requests here via Tailscale Funnel; this process spawns
// the `claude` CLI as a subprocess for each request and returns extracted JSON.
//
// Run with:  bun run mac-claude-server
// Or:        bun run scripts/mac-claude-server.ts
//
// Required env:
//   MAC_CLAUDE_AUTH   shared secret matching the website's MAC_CLAUDE_AUTH env
//   PORT              port to listen on (default 3030)
//
// Tailscale Funnel exposes this publicly:
//   tailscale funnel 3030
//   → public URL: https://<machine-name>.<tailnet>.ts.net
//   set MAC_CLAUDE_URL=that URL on Vercel.
//
// Privacy: this script logs request counts but never the actual PDF text.

import { spawn } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

const PORT = Number(process.env.PORT ?? 3030);
const AUTH_TOKEN = process.env.MAC_CLAUDE_AUTH;
const CLAUDE_BIN = process.env.CLAUDE_BIN ?? "claude";
const MAX_BODY_BYTES = 200_000; // ~200KB ceiling for an extracted resume text
const REQUEST_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are extracting STRUCTURED resume signals.
Return ONLY valid JSON matching this schema (no prose, no markdown fences):

{
  "name": "...",
  "signals": {
    "schools":      [{ "name": "...", "degree": "...?", "gradYear": ...? }],
    "companies":    [{ "name": "...", "title": "...?", "tenure": [start,end]? }],
    "awards":       [{ "name": "...", "year": ...? }],
    "publications": [{ "venue": "...", "role": "first"|"co"|"senior"? }],
    "funding":      [{ "company": "...", "round": "...", "amount": ...? }],
    "open_source":  [{ "project": "...", "metric": ...? }],
    "online":       [{ "platform": "...", "followers": ...? }],
    "raw_text":     "..."
  },
  "verdict":  "30 words biting-but-fair",
  "flavor":   "1 short italic line <8 words",
  "ageInference": { "age": ..., "confidence": 0-1, "reasoning": "..." }
}

raw_text MUST be the full input verbatim. Be GENEROUS but EXACT.
Today is __TODAY__.`;

interface ClaudeOutput {
  // We don't care about exact shape here — Vercel zod-validates downstream.
  [k: string]: unknown;
}

async function runClaude(pdfText: string): Promise<ClaudeOutput | null> {
  const today = new Date().toISOString().slice(0, 10);
  const prompt = SYSTEM_PROMPT.replace("__TODAY__", today);

  return new Promise((resolve) => {
    // Use `claude -p` for headless one-shot mode.
    const proc = spawn(CLAUDE_BIN, ["-p", "--output-format", "text"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      try { proc.kill("SIGKILL"); } catch {}
      console.warn("claude CLI timed out");
      resolve(null);
    }, REQUEST_TIMEOUT_MS);

    proc.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        console.warn(`claude CLI exit ${code}:`, stderr.slice(0, 500));
        resolve(null);
        return;
      }
      // Strip code fences if any, then parse.
      const cleaned = stdout
        .replace(/^```(?:json)?\s*/, "")
        .replace(/\s*```\s*$/, "")
        .trim();
      try {
        const json = JSON.parse(cleaned);
        resolve(json);
      } catch {
        console.warn("claude CLI returned non-JSON:", cleaned.slice(0, 300));
        resolve(null);
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      console.warn("claude CLI spawn failed:", err.message);
      resolve(null);
    });

    // Send prompt + input via stdin.
    proc.stdin.write(prompt + "\n\nResume text:\n---\n" + pdfText + "\n---\n");
    proc.stdin.end();
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST") {
    send(res, 405, { error: "POST only" });
    return;
  }
  if (req.url !== "/extract") {
    send(res, 404, { error: "not found" });
    return;
  }
  // Auth check.
  if (AUTH_TOKEN) {
    const header = req.headers.authorization;
    if (header !== `Bearer ${AUTH_TOKEN}`) {
      send(res, 401, { error: "unauthorized" });
      return;
    }
  }

  let body: string;
  try {
    body = await readBody(req);
  } catch {
    send(res, 413, { error: "body too large" });
    return;
  }

  let parsed: { pdfText?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    send(res, 400, { error: "invalid JSON" });
    return;
  }

  const pdfText = parsed.pdfText;
  if (!pdfText || typeof pdfText !== "string") {
    send(res, 400, { error: "missing pdfText" });
    return;
  }

  const startedAt = Date.now();
  const result = await runClaude(pdfText);
  const ms = Date.now() - startedAt;

  if (!result) {
    console.log(`[${new Date().toISOString()}] extract failed in ${ms}ms`);
    send(res, 502, { error: "claude unavailable" });
    return;
  }

  console.log(
    `[${new Date().toISOString()}] extract ok in ${ms}ms (${pdfText.length} chars)`
  );
  send(res, 200, result);
});

server.listen(PORT, () => {
  console.log(`Mac-Claude server listening on http://0.0.0.0:${PORT}`);
  console.log(
    AUTH_TOKEN
      ? "Auth: Bearer token required (MAC_CLAUDE_AUTH set)"
      : "Auth: DISABLED (no MAC_CLAUDE_AUTH set — set this before exposing via Tailscale Funnel)"
  );
  console.log("Expose publicly:  tailscale funnel " + PORT);
});

process.on("SIGINT", () => { console.log("\nshutting down"); server.close(() => process.exit(0)); });
process.on("SIGTERM", () => { console.log("\nshutting down"); server.close(() => process.exit(0)); });
