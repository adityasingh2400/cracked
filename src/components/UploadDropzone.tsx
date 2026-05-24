"use client";

// UploadDropzone - multi-file vision intake.
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

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Ready",
  uploading: "Ingesting",
  investigating: "Reading",
  scoring: "Forging",
  done: "Done",
  error: "Paused",
};

const PROGRESS_STEPS = [
  { phase: "uploading" as const, label: "Files secured", detail: "Compressing screenshots for vision" },
  { phase: "investigating" as const, label: "Signal scan", detail: "Schools, roles, awards, research, funding" },
  { phase: "investigating" as const, label: "Accolade pull", detail: "Finding actual flexes, not generic labels" },
  { phase: "scoring" as const, label: "Family match", detail: "Checking 9 achievement libraries" },
  { phase: "scoring" as const, label: "Combo detector", detail: "Looking for chain unlocks and rare stacks" },
  { phase: "scoring" as const, label: "Percentile forge", detail: "Placing you against the right age cohort" },
  { phase: "scoring" as const, label: "Card polish", detail: "Writing verdict and card-back highlights" },
];

const WAITING_LINES = [
  "Scanning for the highest-signal receipts...",
  "Separating real accolades from LinkedIn filler...",
  "Checking whether this is normal cracked or legally concerning...",
  "Looking for rare combos across school, company, awards, research, and funding...",
  "Pulling the best card-back bullets into human-readable form...",
  "Calibrating against the age cohort so 23 and 43 are not judged the same...",
  "Making sure the card says the actual flex, not just 'research person'...",
  "Running the aura check. This part takes a second.",
];

const ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf,.pdf";
const PHOTO_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const MAX_FILES = 10;
const MAX_FILE_MB = 8;
const MAX_PROFILE_PHOTO_MB = 4;

export function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progressTick, setProgressTick] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [profileText, setProfileText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    loadFiles().then((restored) => {
      if (alive && restored.length > 0) setFiles(restored);
    });
    try {
      const savedName = sessionStorage.getItem("cracked.upload.name") || "";
      const savedAge = sessionStorage.getItem("cracked.upload.age") || "";
      const savedProfileText = sessionStorage.getItem("cracked.upload.profileText") || "";
      if (savedName) setName(savedName);
      if (savedAge) setAge(savedAge);
      if (savedProfileText) setProfileText(savedProfileText);
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
  useEffect(() => {
    try { sessionStorage.setItem("cracked.upload.profileText", profileText); } catch {}
  }, [profileText]);

  const advancePhase = useCallback(async (to: Phase, delay = 400) => {
    setPhase(to);
    await new Promise((r) => setTimeout(r, delay));
  }, []);

  useEffect(() => {
    if (phase === "idle" || phase === "done" || phase === "error") return;
    const id = window.setInterval(() => setProgressTick((tick) => tick + 1), 1200);
    return () => window.clearInterval(id);
  }, [phase]);

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

  const onProfilePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    setError(null);
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("Profile picture must be PNG, JPG, or WEBP.");
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_MB * 1024 * 1024) {
      setError(`Profile picture is over ${MAX_PROFILE_PHOTO_MB}MB.`);
      return;
    }
    setProfilePhoto(file);
  };

  const submit = async () => {
    if (files.length === 0) {
      setError("Add at least one screenshot or PDF.");
      return;
    }
    setError(null);
    setProgressTick(0);
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
    if (profilePhoto) form.append("profilePhoto", profilePhoto);

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
      const { shareUrl, encoded } = (await res.json()) as { shareUrl?: string; encoded: string };
      setPhase("done");
      await clearFiles().catch(() => {});
      router.push(shareUrl ?? `/c/${encoded}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPhase("error");
    }
  };

  const submitProfileText = async () => {
    const text = profileText.trim();
    if (text.length < 100) {
      setError("Paste the LinkedIn extractor JSON or full profile text first.");
      return;
    }

    setError(null);
    setProgressTick(0);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const animation = (async () => {
      await advancePhase("uploading", 250);
      await advancePhase("investigating", 450);
      await advancePhase("scoring", 400);
    })();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "text",
          text,
          name: name.trim() || undefined,
          age: age.trim() ? Number(age) : undefined,
          photoUrl: profilePhoto ? await fileToDataUrl(profilePhoto) : undefined,
          source: "linkedin-console",
        }),
        signal: abortRef.current.signal,
      });
      await animation;
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { shareUrl, encoded } = (await res.json()) as { shareUrl?: string; encoded: string };
      setPhase("done");
      router.push(shareUrl ?? `/c/${encoded}`);
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
          <ProfilePhotoInput
            photo={profilePhoto}
            onPick={() => profilePhotoInputRef.current?.click()}
            onRemove={() => setProfilePhoto(null)}
          />
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
                AM I CRACKED →
              </button>
            </div>
          )}
          <LinkedInPasteBox
            value={profileText}
            onChange={setProfileText}
            name={name}
            setName={setName}
            age={age}
            setAge={setAge}
            onSubmit={submitProfileText}
          />
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
      <input
        ref={profilePhotoInputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        className="hidden"
        onChange={onProfilePhotoPick}
      />

      {error && (
        <div
          className="mt-5 max-w-xl mx-auto p-4 rounded-2xl border-[3px] border-cherry bg-blush text-ink font-mono text-[12px]"
          style={{ boxShadow: "5px 5px 0 var(--cherry)" }}
        >
          {error}
        </div>
      )}

      {isWorking && <ScoringShow phase={phase} tick={progressTick} />}

      <div className="mt-6 text-center">
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/sample");
              const { shareUrl, encoded } = (await res.json()) as { shareUrl?: string; encoded: string };
              router.push(shareUrl ?? `/c/${encoded}`);
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read profile picture."));
    reader.readAsDataURL(file);
  });
}

function LinkedInPasteBox({
  value,
  onChange,
  name,
  setName,
  age,
  setAge,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="max-w-xl mx-auto mt-7 rounded-3xl border-[3px] border-ink bg-cream p-5 sm:p-6"
      style={{ boxShadow: "8px 8px 0 var(--ink)" }}
    >
      <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-cherry-deep mb-2">
        // fastest path //
      </div>
      <div className="font-display text-[26px] text-ink leading-none">
        PASTE LINKEDIN JSON
      </div>
      <p className="mt-2 font-serif italic text-[14px] text-ink-soft leading-snug">
        Run the console extractor on your own profile, then paste the downloaded JSON or combined text here.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste LinkedIn extractor JSON or full profile text..."
        className="mt-4 min-h-36 w-full resize-y rounded-2xl border-[3px] border-ink bg-paper p-4 font-mono text-[12px] text-ink placeholder:text-ink-fade focus:outline-none"
        style={{ boxShadow: "3px 3px 0 var(--ink)" }}
      />
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="flex-1 px-4 py-3 rounded-full border-[3px] border-ink bg-paper text-ink placeholder:text-ink-fade font-mono text-[13px] focus:outline-none"
          style={{ boxShadow: "3px 3px 0 var(--ink)" }}
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          min={10}
          max={100}
          className="w-full sm:w-28 px-4 py-3 rounded-full border-[3px] border-ink bg-paper text-ink placeholder:text-ink-fade font-mono text-[13px] focus:outline-none"
          style={{ boxShadow: "3px 3px 0 var(--ink)" }}
        />
        <button
          onClick={onSubmit}
          className="px-6 py-3 rounded-full border-[3px] border-ink bg-cherry text-paper font-display text-[14px] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
          style={{ boxShadow: "5px 5px 0 var(--ink)" }}
        >
          SCORE JSON →
        </button>
      </div>
    </div>
  );
}

function ProfilePhotoInput({
  photo,
  onPick,
  onRemove,
}: {
  photo: File | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  const previewUrl = photo ? URL.createObjectURL(photo) : null;

  return (
    <div
      className="max-w-xl mx-auto mt-5 rounded-2xl border-[3px] border-ink bg-cream p-4 flex items-center gap-4"
      style={{ boxShadow: "5px 5px 0 var(--ink)" }}
    >
      <button
        type="button"
        onClick={onPick}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-ink bg-blush grid place-items-center font-display text-2xl text-ink"
        style={{ boxShadow: "3px 3px 0 var(--cherry)" }}
        aria-label="Choose profile picture"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Profile picture preview"
            className="h-full w-full object-cover"
            onLoad={() => URL.revokeObjectURL(previewUrl)}
          />
        ) : (
          "+"
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-cherry-deep">
          profile picture
        </div>
        <div className="mt-1 font-serif italic text-[14px] leading-snug text-ink-soft">
          Optional. Upload a headshot separately so it appears on the card.
        </div>
        {photo && (
          <div className="mt-1 font-mono text-[10px] text-ink-soft truncate">
            {photo.name}
          </div>
        )}
      </div>
      {photo ? (
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-2 rounded-full border-2 border-ink bg-paper font-mono text-[10px] font-bold uppercase text-ink"
          style={{ boxShadow: "2px 2px 0 var(--ink)" }}
        >
          remove
        </button>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="px-4 py-2 rounded-full border-2 border-ink bg-marigold font-mono text-[10px] font-bold uppercase text-ink"
          style={{ boxShadow: "2px 2px 0 var(--ink)" }}
        >
          choose
        </button>
      )}
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

function ScoringShow({ phase, tick }: { phase: Phase; tick: number }) {
  const phaseIndex = phase === "uploading" ? 1 : phase === "investigating" ? 3 : phase === "scoring" ? 6 : 7;
  const fill = Math.min(96, 12 + phaseIndex * 11 + (tick % 4) * 2);
  const headline =
    phase === "uploading"
      ? "Locking In The Evidence"
      : phase === "investigating"
        ? "Reading For Real Signal"
        : phase === "done"
          ? "Card Ready"
          : "Forging The Verdict";
  const waitingLine = WAITING_LINES[tick % WAITING_LINES.length];
  const activeStep = Math.min(PROGRESS_STEPS.length - 1, phaseIndex);

  return (
    <div
      className="relative max-w-xl mx-auto mt-2 overflow-hidden rounded-[2rem] border-[3px] border-ink bg-cream p-5 sm:p-6 text-ink"
      style={{ boxShadow: "10px 10px 0 var(--cherry)" }}
    >
      <div
        className="absolute inset-0 opacity-45 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,92,79,0.24), transparent 30%), radial-gradient(circle at 82% 22%, rgba(255,188,59,0.32), transparent 30%), linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-cherry-deep">
            {PHASE_LABEL[phase]} card
          </div>
          <div className="mt-1 font-display text-[28px] sm:text-[34px] leading-none text-ink">
            {headline}
          </div>
          <p className="mt-2 font-serif italic text-[14px] text-ink-soft leading-snug">
            {waitingLine}
          </p>
        </div>
        <div className="relative h-20 w-16 shrink-0 rotate-6 rounded-xl border-[3px] border-ink bg-ink overflow-hidden">
          <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-cherry via-marigold to-mango animate-pulse" />
          <div className="absolute inset-x-2 top-3 h-7 rounded-full bg-paper/80" />
          <div className="absolute inset-x-2 bottom-3 h-2 rounded-full bg-paper/80" />
          <div className="absolute inset-0 bg-white/30 animate-card-scan" />
        </div>
      </div>

      <div className="relative z-10 mt-5">
        <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cherry via-marigold to-mango transition-all duration-700"
            style={{ width: `${fill}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink-soft">
          <span>scan</span>
          <span>{fill}%</span>
          <span>forge</span>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid gap-2">
        {PROGRESS_STEPS.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <div
              key={step.label}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border-2 px-3 py-2 transition",
                current ? "border-cherry bg-blush" : done ? "border-ink/30 bg-paper/70" : "border-ink/15 bg-paper/40 opacity-60"
              )}
            >
              <div
                className={clsx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-[12px]",
                  done ? "bg-marigold" : current ? "bg-cherry text-paper animate-pulse" : "bg-cream text-ink-soft"
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <div className="min-w-0">
                <div className="font-display text-[13px] leading-none text-ink">
                  {step.label}
                </div>
                <div className="mt-1 font-mono text-[9px] leading-tight text-ink-soft">
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes card-scan {
          0% { transform: translateY(-100%) skewY(-12deg); }
          100% { transform: translateY(100%) skewY(-12deg); }
        }
        .animate-card-scan {
          animation: card-scan 1.4s linear infinite;
        }
      `}</style>
    </div>
  );
}
