// Bookmarklet handoff route - receives base64-encoded ExtractedSignals from
// the user's LinkedIn tab, posts to /api/analyze, redirects to the share-URL
// card. Arcade chrome: chunky cherry-shadowed status panel.
//
// useSearchParams must be wrapped in Suspense per Next.js 15.

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BookmarkletPayload {
  name: string;
  signals: unknown;
  source: string;
  bookmarkletVersion?: string;
  extensionVersion?: string;
  photoUrl?: string;
}

function HandoffInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const encoded = sp.get("d");
      if (!encoded) {
        setError("No bookmarklet payload found in URL.");
        return;
      }

      let payload: BookmarkletPayload;
      try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        payload = JSON.parse(decoded);
      } catch (err) {
        setError("Couldn't decode the bookmarklet payload.");
        return;
      }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "structured",
            name: payload.name,
            signals: payload.signals,
            source: "bookmarklet",
            photoUrl: payload.photoUrl,
          }),
        });
        if (!res.ok) {
          setError("Couldn't score the profile. Try again in a sec.");
          return;
        }
        const json = await res.json();
        if (json.shareUrl) {
          router.replace(json.shareUrl);
        } else {
          setError("Got a card but no share URL - please try the PDF upload.");
        }
      } catch (err) {
        setError("Network error talking to /api/analyze.");
      }
    }
    run();
  }, [router, sp]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div
        className="max-w-md w-full rounded-3xl border-[3px] border-ink bg-cream p-8 text-center"
        style={{ boxShadow: "8px 8px 0 var(--cherry)" }}
      >
        {error ? (
          <>
            <div className="arcade-stamp mb-4" style={{ background: "var(--cherry)", color: "var(--paper)" }}>
              ★ HICCUP
            </div>
            <h1 className="font-display text-[36px] text-ink leading-none mb-4">
              SOMETHING BROKE
            </h1>
            <p className="font-serif italic text-ink-soft mb-6">{error}</p>
            <a
              href="/"
              className="inline-block px-5 py-2.5 rounded-full border-[3px] border-ink bg-ink text-paper font-display text-[13px] leading-none transition hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ boxShadow: "5px 5px 0 var(--cherry)" }}
            >
              GO HOME →
            </a>
          </>
        ) : (
          <>
            <div className="arcade-stamp mb-4">★ BOOKMARKLET</div>
            <h1 className="font-display text-[44px] text-ink leading-none mb-3">
              <span className="text-arcade-holo">CRACKING…</span>
            </h1>
            <p className="font-serif italic text-ink-soft">analyzing your profile</p>
            <div className="mt-6 flex justify-center gap-2">
              <Dot delay={0} />
              <Dot delay={0.15} />
              <Dot delay={0.3} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-3 h-3 rounded-full bg-cherry"
      style={{
        animation: `pulseGlow 1.2s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function BookmarkletHandoff() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center px-5">
          <div
            className="max-w-md w-full rounded-3xl border-[3px] border-ink bg-cream p-8 text-center"
            style={{ boxShadow: "8px 8px 0 var(--cherry)" }}
          >
            <div className="arcade-stamp mb-4">★ BOOKMARKLET</div>
            <div className="font-display text-[44px] text-ink leading-none mb-3">
              <span className="text-arcade-holo">CRACKING…</span>
            </div>
            <div className="font-serif italic text-ink-soft text-sm">loading</div>
          </div>
        </div>
      }
    >
      <HandoffInner />
    </Suspense>
  );
}
