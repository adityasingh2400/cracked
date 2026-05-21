"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

type Phase = "idle" | "uploading" | "investigating" | "scoring" | "done" | "error";

const PHASE_LOGS: Record<Phase, string[]> = {
  idle: [],
  uploading: [
    "$ cracked --analyze profile.pdf",
    "→ pdf accepted (size ok)",
    "→ extracting text via unpdf...",
  ],
  investigating: [
    "→ identified subject name",
    "→ scanning for education signals...",
    "→ scanning for work signals...",
    "→ scanning for accolades, founder, oss, online...",
    "→ cross-referencing 6 rubric categories",
  ],
  scoring: [
    "→ tier rubric loaded (S=10, A=7, B=4, C=2, D=1)",
    "→ computing sub-stats: hack / grind / taste / rizz",
    "→ matching against the cracked dex (54 archetypes)",
    "→ rendering verdict prose...",
  ],
  done: ["✓ done. redirecting to your card..."],
  error: ["✗ something broke."],
};

export function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const appendLog = (line: string) => setLogs((prev) => [...prev, line]);

  const advancePhase = useCallback(async (to: Phase, delay = 400) => {
    setPhase(to);
    const lines = PHASE_LOGS[to];
    for (const l of lines) {
      await new Promise((r) => setTimeout(r, delay));
      appendLog(l);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLogs([]);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError("That doesn't look like a PDF. Use LinkedIn's 'Save to PDF' export.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("PDF over 10MB. Try a smaller export.");
        return;
      }

      // kick off phase animation in parallel with the actual request
      const animation = (async () => {
        await advancePhase("uploading", 250);
        await advancePhase("investigating", 350);
        await advancePhase("scoring", 400);
      })();

      const form = new FormData();
      form.append("pdf", file);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: form,
          signal: abortRef.current.signal,
        });
        await animation; // make sure logs finish before we transition
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        const { encoded } = (await res.json()) as { id: string; encoded: string };
        setPhase("done");
        appendLog("✓ done. redirecting...");
        router.push(`/c/${encoded}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setPhase("error");
      }
    },
    [advancePhase, router]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isWorking = phase !== "idle" && phase !== "error";

  return (
    <div className="w-full">
      {!isWorking && (
        <DropZone
          dragOver={dragOver}
          setDragOver={setDragOver}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onPick}
      />

      {error && (
        <div className="mt-5 max-w-xl mx-auto p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-200 font-mono text-[12px]">
          {error}
        </div>
      )}

      {isWorking && <TerminalLog lines={logs} phase={phase} />}

      <div className="mt-6 text-center">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/sample");
              const { encoded } = (await res.json()) as { encoded: string };
              router.push(`/c/${encoded}`);
            } catch {}
          }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/40 hover:text-white transition"
        >
          → or see a sample card first
        </button>
      </div>
    </div>
  );
}

function DropZone({
  dragOver,
  setDragOver,
  onDrop,
  onClick,
}: {
  dragOver: boolean;
  setDragOver: (b: boolean) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={clsx(
        "max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all cursor-pointer",
        "py-12 px-8 flex flex-col items-center gap-3 text-center",
        dragOver
          ? "border-gold/60 bg-gold/5 scale-[1.01]"
          : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
      )}
    >
      <div className="font-display text-2xl text-white/90">Drop your LinkedIn PDF</div>
      <div className="font-mono text-[11px] tracking-[0.16em] text-white/45 uppercase">
        or click to choose · max 10mb
      </div>
      <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-white/35">
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">.PDF</span>
        <span>·</span>
        <span>processed in your browser ↔ server, never stored</span>
      </div>
    </div>
  );
}

function TerminalLog({ lines, phase }: { lines: string[]; phase: Phase }) {
  return (
    <div className="max-w-xl mx-auto mt-2 rounded-2xl bg-ink-900/80 border border-white/10 p-5 font-mono text-[12px] text-white/85 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[10px] tracking-[0.22em] uppercase text-white/40">
          cracked@analyzer · {phase}
        </span>
      </div>
      <pre className="leading-[1.7] whitespace-pre-wrap text-foil-cyan/90">
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.startsWith("→") ? "rgba(252,211,77,0.85)" : "rgba(232,232,236,0.95)" }}>
            {l}
            {i === lines.length - 1 && phase !== "done" && phase !== "error" && (
              <span className="cursor-blink ml-1" />
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}
