// v1.0 landing — drop a LinkedIn PDF (or screenshots, or use the bookmarklet),
// land on one of nine family ladders. The visual chrome is Sunset Arcade:
// chunky Bowlby headlines with letter-by-letter spring-in, cherry/marigold
// hard shadows, holographic foil sweep, ambient sparkle particles.

import Link from "next/link";
import { UploadDropzone } from "@/components/UploadDropzone";
import { FAMILIES_META, FAMILIES_ORDERED } from "@/data/families";
import { LandingFX } from "./LandingFX";
import { Hero } from "./Hero";
import { FamilyCardGrid } from "./FamilyCardGrid";

const BOOKMARKLET_HREF =
  "javascript:" +
  encodeURIComponent(
    "(function(){var s=document.createElement('script');s.src='https://cracked-woad.vercel.app/crackme.js?t='+Date.now();document.body.appendChild(s);})();"
  );

const STEPS = [
  { label: "snap", body: "Screenshot LinkedIn, or download it as a PDF." },
  { label: "drop", body: "Drag files into the box above — up to 10." },
  { label: "crack", body: "Claude reads it, scores you, makes your card." },
];

export default function Landing() {
  const families = FAMILIES_ORDERED.map((f) => FAMILIES_META[f]);

  return (
    <div className="px-5 sm:px-8 relative">
      <LandingFX />

      <Hero />

      <section className="pb-10 max-w-3xl mx-auto relative z-[2]">
        <UploadDropzone />
      </section>

      {/* BOOKMARKLET — chunky cherry-shadowed card */}
      <section id="bookmarklet" className="pb-16 max-w-3xl mx-auto relative z-[2] arcade-no-confetti">
        <div
          className="relative rounded-3xl border-[3px] border-ink bg-cream p-7 sm:p-9 text-center"
          style={{ boxShadow: "10px 10px 0 var(--cherry)" }}
        >
          <span
            className="absolute -top-4 right-8 bg-cherry text-paper font-mono font-bold text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border-2 border-ink"
            style={{ transform: "rotate(6deg)" }}
          >
            ONE-CLICK
          </span>
          <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
            // FROM ANY LINKEDIN PROFILE //
          </div>
          <h2 className="font-display text-[36px] sm:text-[44px] text-ink leading-[0.9] mb-5">
            DRAG THIS TO YOUR<br />
            <span
              className="inline-block px-3 -rotate-1 border-[3px] border-ink mt-2"
              style={{ background: "var(--marigold)", boxShadow: "4px 4px 0 var(--cherry)" }}
            >
              BOOKMARK BAR
            </span>
          </h2>
          <a
            href={BOOKMARKLET_HREF}
            draggable
            className="inline-block px-7 py-4 rounded-full border-[3px] border-ink bg-ink text-marigold font-display text-[18px] tracking-tight cursor-grab active:cursor-grabbing"
            style={{ boxShadow: "6px 6px 0 var(--cherry)" }}
          >
            ⚡ CRACK ME
          </a>
          <div className="mt-5 font-mono text-[11px] font-bold tracking-[0.14em] text-ink-soft uppercase">
            then open any linkedin profile and click it
          </div>
        </div>
      </section>

      {/* HOW-TO — 3 rotated arcade cards */}
      <section className="pb-24 max-w-3xl mx-auto relative z-[2]">
        <div className="text-center font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-6">
          // OR UPLOAD A PDF · 8 SECONDS //
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-5 list-none p-0 m-0">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="relative rounded-2xl p-5 pt-7"
              style={{
                background: "var(--cream)",
                border: "3px solid var(--ink)",
                boxShadow: "5px 5px 0 var(--ink)",
                transform: i % 2 === 0 ? "rotate(-0.6deg)" : "rotate(0.5deg)",
              }}
            >
              <span
                className="absolute -top-4 left-5 w-10 h-10 rounded-full border-[3px] border-ink bg-marigold grid place-items-center font-display text-[18px] text-ink leading-none"
                style={{ boxShadow: "3px 3px 0 var(--cherry)" }}
              >
                {i + 1}
              </span>
              <div className="font-mono text-[10px] font-bold tracking-[0.18em] text-cherry uppercase mb-2">
                {s.label}
              </div>
              <div className="text-[15px] text-ink leading-snug">{s.body}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* NINE FAMILIES — flippable arcade card grid */}
      <section className="pb-32 max-w-6xl mx-auto relative z-[2]">
        <div className="flex items-end justify-between mb-7 flex-wrap gap-4">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              ★ THE 9 FAMILIES
            </div>
            <h2 className="font-display text-[40px] sm:text-[60px] leading-[0.9] text-ink">
              PICK YOUR{" "}
              <span
                className="inline-block px-3 -rotate-1 border-[3px] border-ink"
                style={{ background: "var(--marigold)", boxShadow: "4px 4px 0 var(--cherry)" }}
              >
                PATH
              </span>
            </h2>
          </div>
          <Link
            href="/dex"
            className="font-display text-[13px] px-4 py-2.5 rounded-full border-[3px] border-ink bg-cream text-ink transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "4px 4px 0 var(--cherry)" }}
          >
            FULL DEX →
          </Link>
        </div>

        <FamilyCardGrid families={families} />
      </section>
    </div>
  );
}
