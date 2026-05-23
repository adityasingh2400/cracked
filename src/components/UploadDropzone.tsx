"use client";

// UploadDropzone — multi-file vision intake.
// Accepts up to 10 images (png/jpeg/webp/gif) and/or PDFs. Files are sent
// to /api/analyze-uploads, which runs Claude Vision over them and returns
// a CrackedResultV1 share URL.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { saveFiles, loadFiles, clearFiles } from "@/lib/file-cache";

type Phase =
  | "idle"
  | "uploading"
  | "investigating"
  | "scoring"
  | "done"
  | "error";

const PHASE_LOGS: Record<Phase, string[]> = {
  idle: [],
  uploading: [
    "$ cracked --analyze uploads",
    "→ files accepted",
    "→ encoding for vision...",
  ],
  investigating: [
    "→ Claude reading your files",
    "→ extracting schools, jobs, awards, oss, signal",
    "→ cross-referencing across documents",
  ],
  scoring: [
    "→ matching against 196 dex archetypes",
    "→ placing you on the 9 family ladders",
    "→ computing cohort percentile (top X%)",
    "→ rendering verdict prose...",
  ],
  done: ["✓ done. redirecting to your card..."],
  error: ["✗ something broke."],
};

const ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf,.pdf";
const MAX_FILES = 10;
const MAX_FILE_MB = 8;

export function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore previously-selected files on first mount so a failed attempt
  // doesn't force the user to re-drop everything.
  useEffect(() => {
    let alive = true;
    loadFiles().then((restored) => {
      if (alive && restored.length > 0) setFiles(restored);
    });
    try {
      const savedName = sessionStorage.getItem("cracked.upload.name") || "";
      const savedAge = sessionStorage.getItem("cracked.upload.age") || "";
      if (savedName) setName(savedName);
      if (savedAge) setAge(savedAge);
    } catch {}
    return () => {
      alive = false;
    };
  }, []);
  // Persist file state on every change. IndexedDB stores blobs natively.
  useEffect(() => {
    if (files.length === 0) {
      clearFiles().catch(() => {});
    } else {
      saveFiles(files).catch(() => {});
    }
  }, [files]);
  useEffect(() => {
    try { sessionStorage.setItem("cracked.upload.name", name); } catch {}
  }, [name]);
  useEffect(() => {
    try { sessionStorage.setItem("cracked.upload.age", age); } catch {}
  }, [age]);

  const appendLog = (line: string) =>
    setLogs((prev) => [...prev, line]);

  const advancePhase = useCallback(async (to: Phase, delay = 400) => {
    setPhase(to);
    const lines = PHASE_LOGS[to];
    for (const l of lines) {
      await new Promise((r) => setTimeout(r, delay));
      appendLog(l);
    }
  }, []);

  const validate = (incoming: File[]): { ok: File[]; err?: string } => {
    if (incoming.length === 0) return { ok: [] };
    const merged = [...files, ...incoming];
    if (merged.length > MAX_FILES) {
      return { ok: files, err: `Max ${MAX_FILES} files.` };
    }
    for (const f of incoming) {
      if (
        !/^image\/(png|jpe?g|webp|gif)$/.test(f.type) &&
        f.type !== "application/pdf" &&
        !f.name.toLowerCase().endsWith(".pdf")
      ) {
        return { ok: files, err: `Unsupported file: ${f.name}` };
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        return {
          ok: files,
          err: `${f.name} is over ${MAX_FILE_MB}MB.`,
        };
      }
    }
    return { ok: merged };
  };

  const onAddFiles = (incoming: File[]) => {
    setError(null);
    const { ok, err } = validate(incoming);
    if (err) {
      setError(err);
      return;
    }
    setFiles(ok);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (phase !== "idle" && phase !== "error") return;
    onAddFiles(Array.from(e.dataTransfer.files));
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onAddFiles(Array.from(e.target.files));
    // Reset the input so re-picking the same file fires onChange again.
    e.target.value = "";
  };

  const submit = async () => {
    if (files.length === 0) {
      setError("Add at least one screenshot or PDF.");
      return;
    }
    setError(null);
    setLogs([]);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const animation = (async () => {
      await advancePhase("uploading", 250);
      await advancePhase("investigating", 450);
      await advancePhase("scoring", 400);
    })();

    const form = new FormData();
    for (const f of files) form.append("files", f);
    if (name.trim()) form.append("name", name.trim());
    if (age.trim()) form.append("age", age.trim());

    try {
      const res = await fetch("/api/analyze-uploads", {
        method: "POST",
        body: form,
        signal: abortRef.current.signal,
      });
      await animation;
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { encoded } = (await res.json()) as { encoded: string };
      setPhase("done");
      appendLog("✓ done. redirecting...");
      await clearFiles().catch(() => {});
      router.push(`/c/${encoded}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPhase("error");
    }
  };

  const isWorking = phase !== "idle" && phase !== "error";

  return (
    <div className="w-full">
      {!isWorking && (
        <>
          <DropZone
            dragOver={dragOver}
            setDragOver={setDragOver}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            hasFiles={files.length > 0}
          />
          {files.length > 0 && (
            <FilePreview files={files} onRemove={removeFile} />
          )}
          {files.length > 0 && (
            <div className="max-w-xl mx-auto mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-3 py-2 rounded-md bg-black/30 border border-white/15 text-white placeholder:text-white/30 font-mono text-[13px] focus:border-gold/60 focus:outline-none"
              />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age (optional)"
                min={10}
                max={100}
                className="w-full sm:w-32 px-3 py-2 rounded-md bg-black/30 border border-white/15 text-white placeholder:text-white/30 font-mono text-[13px] focus:border-gold/60 focus:outline-none"
              />
              <button
                onClick={submit}
                className="px-5 py-2 rounded-md bg-amber-foil text-black font-mono text-[12px] tracking-[0.18em] uppercase font-bold hover:opacity-90"
              >
                Crack me
              </button>
            </div>
          )}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
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
  hasFiles,
}: {
  dragOver: boolean;
  setDragOver: (b: boolean) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  hasFiles: boolean;
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
        "py-10 px-8 flex flex-col items-center gap-3 text-center",
        dragOver
          ? "border-gold/60 bg-gold/5 scale-[1.01]"
          : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
      )}
    >
      <div className="font-display text-2xl text-white/90">
        {hasFiles ? "Add more files" : "Drop screenshots or PDFs"}
      </div>
      <div className="font-mono text-[11px] tracking-[0.16em] text-white/45 uppercase">
        or click to choose · up to {MAX_FILES} files · {MAX_FILE_MB}mb each
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-white/35">
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          .PNG
        </span>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          .JPG
        </span>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          .WEBP
        </span>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          .PDF
        </span>
        <span>·</span>
        <span>never stored</span>
      </div>
    </div>
  );
}

function FilePreview({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (i: number) => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {files.map((f, i) => {
        const isPdf =
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        const url = isPdf ? null : URL.createObjectURL(f);
        return (
          <div
            key={`${f.name}-${i}`}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40 group"
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={f.name}
                className="w-full h-full object-cover"
                onLoad={() => URL.revokeObjectURL(url)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-amber-foil">
                <div className="text-2xl">📄</div>
                <div className="font-mono text-[9px] mt-1 px-1 truncate w-full text-center text-white/60">
                  {f.name}
                </div>
              </div>
            )}
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white/80 hover:bg-red-500/80 hover:text-white text-xs flex items-center justify-center"
              aria-label={`Remove ${f.name}`}
            >
              ×
            </button>
          </div>
        );
      })}
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
          <div
            key={i}
            style={{
              color: l.startsWith("→")
                ? "rgba(252,211,77,0.85)"
                : "rgba(232,232,236,0.95)",
            }}
          >
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
