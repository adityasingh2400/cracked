// v1.0 landing page — drop a LinkedIn PDF, get a card.
// The bookmarklet draggable button is the new hero CTA per /plan-eng-review.

import Link from "next/link";
import { UploadDropzone } from "@/components/UploadDropzone";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";

const BOOKMARKLET_HREF =
  "javascript:" +
  encodeURIComponent(
    "(function(){var s=document.createElement('script');s.src='https://cracked-woad.vercel.app/crackme.js?t='+Date.now();document.body.appendChild(s);})();"
  );

export default function Landing() {
  return (
    <div className="px-5 sm:px-8">
      {/* HERO */}
      <section className="pt-16 sm:pt-28 pb-12 max-w-5xl mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-6">
          THE CRACKED INDEX · 9 FAMILIES · 7 TIERS
        </div>
        <h1 className="font-display font-semibold leading-[0.95] tracking-tight text-[68px] sm:text-[120px]">
          <span className="text-white">how cracked</span>
          <br />
          <span className="text-amber-foil">are you?</span>
        </h1>
        <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[17px] text-white/65 text-balance leading-relaxed">
          Drop screenshots of your LinkedIn, your résumé PDF, or use the{" "}
          <Link href="#bookmarklet" className="text-gold underline decoration-gold/40 underline-offset-4">
            bookmarklet
          </Link>
          . We weigh every signal — schools, jobs, hackathons, fellowships, open source — and
          place you on one of 9 family ladders, from D to{" "}
          <span className="text-amber-foil">ASCENDED</span>.
        </p>
      </section>

      {/* UPLOAD */}
      <section className="pb-10 max-w-5xl mx-auto">
        <UploadDropzone />
      </section>

      {/* BOOKMARKLET */}
      <section id="bookmarklet" className="pb-16 max-w-3xl mx-auto">
        <div className="rounded-xl border border-amber-foil/30 bg-amber-foil/[0.04] p-6">
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-amber-foil/80 mb-2">
              ONE-CLICK from any LinkedIn profile
            </div>
            <h2 className="font-display text-3xl text-white mb-3">
              Drag this to your bookmark bar
            </h2>
            <a
              href={BOOKMARKLET_HREF}
              draggable
              className="inline-block px-6 py-3 rounded-md border border-amber-foil text-amber-foil font-mono text-[13px] tracking-[0.15em] uppercase bg-black/30 hover:bg-amber-foil/10 cursor-grab active:cursor-grabbing"
            >
              ⚡ Crack Me
            </a>
            <div className="mt-4 font-mono text-[10px] text-white/45">
              then open any LinkedIn profile (your own, a friend's, your boss's) and click it
            </div>
          </div>
        </div>
      </section>

      {/* HOW-TO */}
      <section className="pb-24 max-w-3xl mx-auto">
        <div className="text-center font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-6">
          Or upload your PDF · 8 seconds
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="font-display text-3xl font-semibold text-amber-foil">
                  {i + 1}
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
                  {s.label}
                </span>
              </div>
              <div className="text-[14px] text-white/80 leading-snug">{s.body}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* NINE FAMILIES */}
      <section className="pb-24 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
              The 9 families
            </div>
            <h2 className="mt-2 font-display text-4xl text-white">
              Pick your <span className="text-amber-foil">path</span>
            </h2>
          </div>
          <Link
            href="/dex"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition"
          >
            full dex →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FAMILIES_ORDERED.map((f) => {
            const meta = FAMILIES_META[f];
            return (
              <Link
                key={f}
                href={`/dex/family/${meta.slug}`}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/30 transition"
                style={{ borderColor: `${meta.accent}33` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="text-xl"
                    style={{ color: meta.accent }}
                    aria-hidden
                  >
                    {meta.glyph}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/45">
                    {meta.shortName}
                  </div>
                </div>
                <div className="font-display text-base text-white leading-tight">
                  {meta.name}
                </div>
                <p className="text-[11px] italic text-white/55 mt-1">
                  {meta.motto}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const STEPS = [
  { label: "Snap", body: "Screenshot your LinkedIn, or download it as a PDF." },
  { label: "Drop", body: "Drag files into the box above (up to 10)." },
  { label: "Crack", body: "Claude reads it all, scores you, makes your card." },
];
