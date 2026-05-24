"use client";

// UploadDropzone — multi-file vision intake.
// Accepts up to 10 images (png/jpeg/webp/gif) and/or PDFs. Files are sent
// to /api/analyze-uploads, which runs Claude Vision over them and returns
// a CrackedResultV1 share URL.
//
// Sunset Arcade chrome: chunky cherry-shadowed dropzone, animated DROP
// HERE sticker, arcade chip filetypes, arcade name/age inputs, terminal
// log on an ink panel with cherry hard-shadow.

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
    "→ matching against the 9 family achievement libraries",
    "→ detecting chain combos",
    "→ placing into age cohort",
    "→ computing percentiles · within-family · cross-family · global",
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

  useEffect(() => {
    if (files.length === 0) clearFiles().catch(() => {});
    else saveFiles(files).catch(() => {});
  }, [files]);
  useEffect(() => {
    try { sessionStorage.setItem("cracked.upload.name", name); } catch {}
  }, [name]);
  useEffect(() => {
    try { sessionStorage.setItem("cracked.upload.age", age); } catch {}
  }, [age]);

  const appendLog = (line: string) => setLogs((prev) => [...prev, line]);

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
        return { ok: files, err: `${f.name} is over ${MAX_FILE_MB}MB.` };
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
    <div className="w-full arcade-no-confetti">
      {!isWorking && (
        <>
          <DropZone
            dragOver={dragOver}
            setDragOver={setDragOver}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            hasFiles={files.length > 0}
          />
          {files.length > 0 && <FilePreview files={files} onRemove={removeFile} />}
          {files.length > 0 && (
            <div className="max-w-xl mx-auto mt-5 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-4 py-3 rounded-full border-[3px] border-ink bg-cream text-ink placeholder:text-ink-fade font-mono text-[13px] focus:outline-none"
                style={{ boxShadow: "3px 3px 0 var(--ink)" }}
              />
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min={10}
                max={100}
                className="w-full sm:w-28 px-4 py-3 rounded-full border-[3px] border-ink bg-cream text-ink placeholder:text-ink-fade font-mono text-[13px] focus:outline-none"
                style={{ boxShadow: "3px 3px 0 var(--ink)" }}
              />
              <button
                onClick={submit}
                className="px-6 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[14px] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ boxShadow: "5px 5px 0 var(--ink)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "7px 7px 0 var(--ink)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "5px 5px 0 var(--ink)";
                }}
              >
                CRACK ME →
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
        <div
          className="mt-5 max-w-xl mx-auto p-4 rounded-2xl border-[3px] border-cherry bg-blush text-ink font-mono text-[12px]"
          style={{ boxShadow: "5px 5px 0 var(--cherry)" }}
        >
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
          className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-ink-soft hover:text-cherry transition cursor-pointer"
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
        "relative max-w-xl mx-auto rounded-3xl py-10 px-8 flex flex-col items-center gap-3 text-center cursor-pointer transition-all group",
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
      <span
        className="absolute -top-3 right-6 bg-cherry text-paper font-mono font-bold text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border-2 border-ink animate-wiggle"
        style={{ transform: "rotate(6deg)" }}
      >
        DROP HERE
      </span>

      <div
        className="w-16 h-16 rounded-full border-[3px] border-ink grid place-items-center font-display text-[40px] text-ink mb-2 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110 leading-none"
        style={{ background: "linear-gradient(180deg, var(--marigold), var(--mango))" }}
      >
        +
      </div>

      <div className="font-display text-2xl text-ink leading-none">
        {hasFiles ? "ADD MORE FILES" : "DROP SCREENSHOTS OR PDFS"}
      </div>
      <div className="text-ink-soft text-[14px]">
        Or click to browse · up to {MAX_FILES} files · {MAX_FILE_MB}mb each
      </div>

      <div className="mt-2 flex gap-2 flex-wrap justify-center">
        {[".PNG", ".JPG", ".WEBP", ".PDF"].map((ext) => (
          <span
            key={ext}
            className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full bg-blush border-2 border-ink text-ink"
          >
            {ext}
          </span>
        ))}
        <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full bg-cherry text-paper border-2 border-ink">
          NEVER STORED
        </span>
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
    <div className="max-w-xl mx-auto mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {files.map((f, i) => {
        const isPdf =
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
        const url = isPdf ? null : URL.createObjectURL(f);
        return (
          <div
            key={`${f.name}-${i}`}
            className="relative aspect-square rounded-xl overflow-hidden border-[3px] border-ink bg-cream group"
            style={{ boxShadow: "3px 3px 0 var(--ink)" }}
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
              <div className="w-full h-full flex flex-col items-center justify-center bg-marigold text-ink p-2">
                <div className="text-3xl">📄</div>
                <div className="font-mono text-[9px] font-bold mt-1 truncate w-full text-center text-ink">
                  {f.name}
                </div>
              </div>
            )}
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-cherry text-paper border-2 border-ink hover:bg-cherry-deep text-sm font-bold leading-none flex items-center justify-center"
              aria-label={`Remove ${f.name}`}
              style={{ boxShadow: "2px 2px 0 var(--ink)" }}
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
