// Bookmarklet handoff route — receives base64-encoded ExtractedSignals from the
// user's LinkedIn tab, posts to /api/analyze, redirects to the share-URL card.
//
// useSearchParams must be wrapped in Suspense per Next.js 15 (static-render
// bailout safety) — see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

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
          setError("Got a card but no share URL — please try the PDF upload.");
        }
      } catch (err) {
        setError("Network error talking to /api/analyze.");
      }
    }
    run();
  }, [router, sp]);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="font-display text-3xl text-white mb-3">Hiccup</h1>
            <p className="text-white/65 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/5"
            >
              go home
            </a>
          </>
        ) : (
          <>
            <div className="font-display text-3xl text-amber-foil mb-2">cracking…</div>
            <div className="text-white/60 text-sm">analyzing your profile</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookmarkletHandoff() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="max-w-md text-center">
            <div className="font-display text-3xl text-amber-foil mb-2">cracking…</div>
            <div className="text-white/60 text-sm">loading</div>
          </div>
        </div>
      }
    >
      <HandoffInner />
    </Suspense>
  );
}
