import Link from "next/link";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ARCHETYPES, type ArchetypeType } from "@/data/archetypes";
import { TYPES_META, TYPES_ORDERED } from "@/data/types-meta";
import { HoloTile } from "@/components/HoloTile";
import { ArchetypeMini } from "@/components/ArchetypeMini";

export default function Landing() {
  // Top S-tier archetypes as the bottom-of-fold "canon" preview
  const canon = ARCHETYPES.filter((a) => a.tier === "S").slice().reverse().slice(0, 6);

  return (
    <div className="px-5 sm:px-8">
      {/* HERO */}
      <section className="pt-16 sm:pt-28 pb-12 max-w-5xl mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-6">
          THE CRACKED INDEX · A FIELD GUIDE
        </div>
        <h1 className="font-display font-semibold leading-[0.95] tracking-tight text-[68px] sm:text-[120px]">
          <span className="text-white">how cracked</span>
          <br />
          <span className="text-foil">are you?</span>
        </h1>
        <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[17px] text-white/65 text-balance leading-relaxed">
          Drop your LinkedIn PDF. We weigh every signal — schools, jobs, hackathons, fellowships,
          open source, all of it — and match you to one of <Link href="/dex" className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">54 archetypes</Link> across <Link href="/dex" className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">7 elemental types</Link>.
        </p>
      </section>

      {/* UPLOAD */}
      <section className="pb-10 max-w-5xl mx-auto">
        <UploadDropzone />
      </section>

      {/* HOW-TO */}
      <section className="pb-24 max-w-3xl mx-auto">
        <div className="text-center font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-6">
          Getting your PDF · 8 seconds
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <li key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-baseline gap-3 mb-2.5">
                <span className="font-display text-3xl font-semibold text-foil">{i + 1}</span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
                  {s.label}
                </span>
              </div>
              <div className="text-[14px] text-white/80 leading-snug">{s.body}</div>
            </li>
          ))}
        </ol>
        <div className="mt-3 text-center font-mono text-[10px] text-white/35">
          desktop only — linkedin app doesn't expose the PDF export
        </div>
      </section>

      {/* THE SEVEN TYPES — holo tile strip */}
      <section className="pb-24 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
              The seven types
            </div>
            <h2 className="mt-2 font-display text-4xl text-white">
              Pick your <span className="text-foil">element</span>
            </h2>
          </div>
          <Link
            href="/dex"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition"
          >
            full dex →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TYPES_ORDERED.slice(0, 4).map((t) => (
            <TypePeek key={t} t={t} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TYPES_ORDERED.slice(4).map((t) => (
            <TypePeek key={t} t={t} />
          ))}
        </div>
      </section>

      {/* CANON PREVIEW */}
      <section className="pb-32 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
              S-tier canon · the mythic ten
            </div>
            <h2 className="mt-2 font-display text-4xl text-white">
              The names you hear at <span className="text-foil">dinners</span>
            </h2>
          </div>
          <Link
            href="/dex"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition"
          >
            view all 54 →
          </Link>
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
  { label: "Open", body: "Go to your LinkedIn profile on desktop." },
  { label: "Click", body: "Hit the 'More' button → 'Save to PDF'." },
  { label: "Drop", body: "Drag the file into the box above. Done." },
];

function TypePeek({ t }: { t: ArchetypeType }) {
  const meta = TYPES_META[t];
  const count = ARCHETYPES.filter((a) => a.types[0] === t).length;
  return (
    <HoloTile
      href={`/dex/types/${meta.slug}`}
      foil={meta.foil}
      accent={meta.accent}
      glyph={meta.glyph}
      title={meta.name}
      subtitle={meta.motto}
      count={count}
      aspect="square"
      intensity={0.5}
    />
  );
}
