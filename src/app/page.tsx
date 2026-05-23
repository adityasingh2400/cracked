import { UploadDropzone } from "@/components/UploadDropzone";
import { ARCHETYPES } from "@/data/archetypes";
import { TYPES_META, TYPES_ORDERED } from "@/data/types-meta";
import { ArchetypeMini } from "@/components/ArchetypeMini";
import { LandingFX } from "./LandingFX";
import { Hero } from "./Hero";
import { TypeCardGrid } from "./TypeCardGrid";

export default function Landing() {
  const canon = ARCHETYPES.filter((a) => a.tier === "S").slice().reverse().slice(0, 6);

  // Pre-compute archetype breakdowns per type for the flip-card backs.
  const typeBreakdowns = TYPES_ORDERED.map((t) => {
    const meta = TYPES_META[t];
    const all = ARCHETYPES.filter((a) => a.types[0] === t);
    return {
      key: t,
      meta,
      count: all.length,
      topTier: all.find((a) => a.tier === "S")?.tier ?? all[0]?.tier ?? "B",
      members: all
        .slice()
        .sort((a, b) => b.number - a.number)
        .slice(0, 5)
        .map((a) => ({ slug: a.slug, name: a.name, tier: a.tier })),
    };
  });

  return (
    <div className="px-5 sm:px-8 relative">
      <LandingFX />

      <Hero />

      <section className="pb-10 max-w-3xl mx-auto relative z-[2]">
        <UploadDropzone />
      </section>

      <section className="pb-24 max-w-3xl mx-auto relative z-[2]">
        <div className="text-center font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-ink-soft mb-5">
          // GETTING YOUR PDF · 8 SECONDS //
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                className="absolute -top-4 left-5 w-10 h-10 rounded-full border-[3px] border-ink bg-marigold grid place-items-center font-display text-[18px] text-ink"
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
        <div className="mt-4 text-center font-mono text-[10px] font-bold tracking-[0.16em] text-ink-soft uppercase">
          desktop only — linkedin app doesn&apos;t expose the PDF export
        </div>
      </section>

      {/* THE 9 ELEMENTAL TYPES — flip cards */}
      <section className="pb-24 max-w-6xl mx-auto relative z-[2]">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              ★ THE 9 ELEMENTAL TYPES
            </div>
            <h2 className="font-display text-[44px] sm:text-[60px] leading-[0.9] text-ink">
              PICK YOUR{" "}
              <span
                className="inline-block px-3 -rotate-1 border-[3px] border-ink"
                style={{ background: "var(--marigold)", boxShadow: "4px 4px 0 var(--cherry)" }}
              >
                ELEMENT
              </span>
            </h2>
          </div>
          <a
            href="/dex"
            className="font-display text-[13px] px-4 py-2.5 rounded-full border-[3px] border-ink bg-cream text-ink transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "4px 4px 0 var(--cherry)" }}
          >
            FULL DEX →
          </a>
        </div>

        <TypeCardGrid breakdowns={typeBreakdowns} />
      </section>

      {/* S-TIER CANON */}
      <section className="pb-32 max-w-6xl mx-auto relative z-[2]">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.28em] uppercase text-cherry-deep mb-2">
              ★ S-TIER CANON · THE MYTHIC PEAK
            </div>
            <h2 className="font-display text-[40px] sm:text-[56px] leading-[0.9] text-ink">
              THE NAMES YOU HEAR<br />AT{" "}
              <span
                className="inline-block px-3 -rotate-1 border-[3px] border-ink"
                style={{ background: "var(--cherry)", color: "var(--paper)", boxShadow: "4px 4px 0 var(--ink)" }}
              >
                DINNERS
              </span>
            </h2>
          </div>
          <a
            href="/dex"
            className="font-display text-[13px] px-4 py-2.5 rounded-full border-[3px] border-ink bg-cream text-ink transition hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ boxShadow: "4px 4px 0 var(--cherry)" }}
          >
            VIEW ALL {ARCHETYPES.length} →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canon.map((a) => (
            <ArchetypeMini key={a.slug} archetype={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

const STEPS = [
  { label: "open", body: "Go to your LinkedIn profile on desktop." },
  { label: "click", body: "Hit the 'More' button → 'Save to PDF'." },
  { label: "drop", body: "Drag the file into the box above. Done." },
];
