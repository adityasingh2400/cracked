import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";

export const metadata = {
  title: "Leaderboard · Cracked",
  description: "The publicly-opted-in cracked rankings. Coming with v0.2.",
};

export default function Leaderboard() {
  return (
    <div className="px-5 sm:px-8 pt-20 pb-24 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-5">
          The Cracked Leaderboard
        </div>
        <h1 className="font-display font-semibold text-[64px] sm:text-[88px] leading-[0.95] tracking-tight text-white">
          The wall of <span className="text-foil">fame</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-[16px] text-white/65 text-balance leading-relaxed">
          Opt-in only. Pick whether to publish after you see your score.
          The current build keeps everything in the URL so nothing's stored
          server-side without permission.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-white mb-3">Coming with v0.2</div>
          <p className="text-white/55 text-pretty">
            The leaderboard ships next, once we wire an opt-in publish endpoint
            with a real persistent store. In the meantime, every score is yours alone —
            the entire result is encoded into your share link, no database touches it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <FeatureNote
            icon="◇"
            title="Opt-in only"
            body="Your card is private until you click publish."
          />
          <FeatureNote
            icon="✦"
            title="Filterable"
            body="By city, school, age cohort, archetype, tier."
          />
          <FeatureNote
            icon="✺"
            title="Honest"
            body="No anonymous submissions. Real names or handles."
          />
        </div>
      </div>

      {/* While we wait: a teaser featuring archetype examples */}
      <div className="mt-20">
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-white/40 mb-4">
          In lieu of a leaderboard · the canonical top of the dex
        </div>
        <div className="space-y-2">
          {ARCHETYPES.filter((a) => a.tier === "S")
            .slice()
            .reverse()
            .map((a, i) => (
              <Link
                key={a.slug}
                href={`/dex/${a.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-gold/30 hover:bg-gold/[0.02] transition"
              >
                <div className="font-display text-3xl text-foil w-12 text-center">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg text-white group-hover:text-gold transition">
                    {a.name}
                  </div>
                  <div className="font-display italic text-[13px] text-white/50">"{a.tagline}"</div>
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-gold/80">
                  #{String(a.number).padStart(3, "0")}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function FeatureNote({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
      <div className="text-gold text-2xl mb-2">{icon}</div>
      <div className="font-display text-white text-lg mb-1">{title}</div>
      <div className="text-[12px] text-white/55 leading-snug">{body}</div>
    </div>
  );
}
