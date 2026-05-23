"use client";

import { useCallback, useRef, useState } from "react";
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
    "→ inferring age cohort from grad years...",
    "→ placing into age cohort (≤16 · 17-19 · 20-22 · 23-26 · 27-32 · 33+)",
    "→ computing sub-stats: hack / grind / taste / rizz",
    "→ matching against the cracked dex",
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
        await animation;
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
        <div className="mt-5 max-w-xl mx-auto p-4 rounded-2xl border-2 border-cherry bg-blush text-ink font-mono text-[12px]"
             style={{ boxShadow: "5px 5px 0 var(--cherry)" }}>
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
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-soft hover:text-cherry transition cursor-pointer"
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
        "relative max-w-xl mx-auto rounded-3xl transition-all cursor-pointer",
        "py-12 px-8 flex flex-col items-center gap-3 text-center group",
        dragOver ? "scale-[1.02]" : ""
      )}
      style={{
        background: "var(--cream)",
        border: "3px solid var(--ink)",
        boxShadow: dragOver ? "14px 14px 0 var(--cherry)" : "10px 10px 0 var(--cherry)",
        transform: dragOver ? "translate(-4px,-4px)" : undefined,
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget as HTMLDivElement;
        t.style.boxShadow = "14px 14px 0 var(--cherry)";
        t.style.transform = "translate(-4px,-4px)";
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget as HTMLDivElement;
        t.style.boxShadow = "10px 10px 0 var(--cherry)";
        t.style.transform = "";
      }}
    >
      {/* DROP HERE sticker */}
      <span
        className="absolute -top-3 right-6 bg-cherry text-paper font-mono font-bold text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border-2 border-ink animate-wiggle"
        style={{ transform: "rotate(6deg)" }}
      >
        DROP HERE
      </span>

      {/* + circle */}
      <div
        className="w-16 h-16 rounded-full border-[3px] border-ink grid place-items-center font-display text-[40px] text-ink mb-2 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110"
        style={{ background: "linear-gradient(180deg, var(--marigold), var(--mango))" }}
      >
        +
      </div>

      <div className="font-display text-3xl text-ink leading-none">Drop your LinkedIn PDF</div>
      <div className="text-ink-soft text-[15px]">Or click to browse. We don&apos;t keep it.</div>

      <div className="mt-3 flex gap-2 flex-wrap justify-center">
        <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full bg-blush border-2 border-ink text-ink">.PDF</span>
        <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full bg-blush border-2 border-ink text-ink">10MB MAX</span>
        <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full bg-cherry text-paper border-2 border-ink">8s TO SCORE</span>
      </div>
    </div>
  );
}

function TerminalLog({ lines, phase }: { lines: string[]; phase: Phase }) {
  return (
    <div
      className="max-w-xl mx-auto mt-2 rounded-2xl bg-ink p-5 font-mono text-[12px] text-paper border-[3px] border-ink"
      style={{ boxShadow: "8px 8px 0 var(--cherry)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-3 h-3 rounded-full bg-cherry" />
        <span className="w-3 h-3 rounded-full bg-marigold" />
        <span className="w-3 h-3 rounded-full" style={{ background: "#5ED677" }} />
        <span className="ml-2 text-[10px] tracking-[0.22em] uppercase text-paper/60">
          cracked@analyzer · {phase}
        </span>
      </div>
      <pre className="leading-[1.7] whitespace-pre-wrap text-paper/95">
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.startsWith("→") ? "var(--marigold)" : "var(--paper)" }}>
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
