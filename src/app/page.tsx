import Link from "next/link";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ARCHETYPES } from "@/data/archetypes";

export default function Landing() {
  // pick a few representative archetypes for the bottom-of-fold dex peek
  const peek = [
    ARCHETYPES[ARCHETYPES.length - 1], // top S
    ARCHETYPES.find((a) => a.slug === "imo-mit-anthropic")!,
    ARCHETYPES.find((a) => a.slug === "berkeley-anthropic")!,
    ARCHETYPES.find((a) => a.slug === "stanford-dropout-yc")!,
    ARCHETYPES.find((a) => a.slug === "hackmit-stripe")!,
    ARCHETYPES.find((a) => a.slug === "saas-bro")!,
  ];

  return (
    <div className="px-5 sm:px-8">
      {/* HERO */}
      <section className="pt-16 sm:pt-28 pb-12 max-w-5xl mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-6">
          THE CRACKED INDEX · A FIELD GUIDE
        </div>
        <h1 className="font-display font-semibold leading-[0.95] tracking-tight text-[68px] sm:text-[112px]">
          <span className="text-white">how cracked</span>
          <br />
          <span className="text-foil">are you?</span>
        </h1>
        <p className="mt-7 max-w-xl mx-auto text-[16px] sm:text-[17px] text-white/65 text-balance leading-relaxed">
          Drop your LinkedIn export. We weigh every signal — schools, jobs, hackathons, fellowships,
          open source, all of it — and match you to one of <Link href="/dex" className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">54 archetypes</Link> in the Cracked Dex.
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

      {/* DEX PEEK */}
      <section className="pb-32 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-gold/80">
              From the dex
            </div>
            <h2 className="mt-2 font-display text-4xl text-white">A field guide to crackedness</h2>
          </div>
          <Link
            href="/dex"
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/55 hover:text-white transition"
          >
            view all 54 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {peek.map((arch) => (
            <Link
              key={arch.slug}
              href={`/dex/${arch.slug}`}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-gold/30 hover:bg-gold/[0.03] transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-[0.18em] text-white/40">
                  #{String(arch.number).padStart(3, "0")}
                </span>
                <TierPill tier={arch.tier} />
              </div>
              <div className="font-display text-xl text-white mb-1.5 group-hover:text-gold transition">
                {arch.name}
              </div>
              <div className="font-display italic text-[13px] text-white/55 leading-snug">
                "{arch.tagline}"
              </div>
            </Link>
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

function TierPill({ tier }: { tier: "S" | "A" | "B" | "C" | "D" }) {
  const color: Record<string, string> = {
    S: "bg-gradient-to-br from-foil-gold to-amber-500 text-ink",
    A: "bg-gradient-to-br from-foil-violet to-purple-700 text-white",
    B: "bg-gradient-to-br from-foil-cyan to-cyan-700 text-white",
    C: "bg-slate-600/40 text-slate-200",
    D: "bg-zinc-700/40 text-zinc-300",
  };
  return (
    <span className={`inline-block w-6 h-6 rounded-md text-[11px] font-display font-bold leading-6 text-center ${color[tier]}`}>
      {tier}
    </span>
  );
}
