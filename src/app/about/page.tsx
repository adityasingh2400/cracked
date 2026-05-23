import Link from "next/link";

export const metadata = {
  title: "How it works · Cracked",
  description: "How the cracked score is calculated. The rubric, the math, the limits.",
};

export default function About() {
  return (
    <div className="px-5 sm:px-8 pt-12 pb-24 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <div className="arcade-stamp mb-6">★ The Cracked Method</div>
        <h1 className="font-display text-[52px] sm:text-[80px] leading-[0.9] tracking-tight text-ink">
          HOW IT{" "}
          <span
            className="inline-block px-3 -rotate-1 border-[3px] border-ink"
            style={{ background: "var(--marigold)", boxShadow: "4px 4px 0 var(--cherry)" }}
          >
            WORKS
          </span>
        </h1>
      </div>

      <Section title="The pipeline">
        <ol className="space-y-4 text-[16px] text-ink leading-relaxed">
          <ListItem n={1}>
            You upload your LinkedIn export. We parse the text in-memory with{" "}
            <code className="font-mono text-cherry">unpdf</code> — the PDF is never written to disk.
          </ListItem>
          <ListItem n={2}>
            Claude (or a regex fallback if no API key is set) extracts <em className="font-serif italic">signals</em>: schools, jobs, accolades, hackathons, fellowships, open source, online presence. Everything that could matter.
          </ListItem>
          <ListItem n={3}>
            Each signal is matched against the rubric and assigned a tier (S/A/B/C/D, worth 10/7/4/2/1 points).
          </ListItem>
          <ListItem n={4}>
            Six categories aggregate to 100 total points. Education caps at 15, work at 25, accolades at 25, founder at 15, open source at 10, signal at 10.
          </ListItem>
          <ListItem n={5}>
            Sub-stats (HACK / GRIND / TASTE / RIZZ) are computed from the categories. The matched archetype is the closest of 33+ by total + sub-stat + tier compatibility.
          </ListItem>
          <ListItem n={6}>
            The whole result is gzip+base64-encoded into your share URL. There is no database. The link IS the storage.
          </ListItem>
        </ol>
      </Section>

      <Section title="What we're trying to measure">
        <p>
          &ldquo;Cracked&rdquo; is internet slang for hypercompetent. It rewards stacked, multi-domain excellence — the IMO medalist who joined Anthropic, the YC founder who exited at 28, the Putnam fellow at Jane Street. It penalizes paths that <em className="font-serif italic">look</em> impressive but don&apos;t compound (career consulting, FAANG-only, lifestyle businesses).
        </p>
        <p className="mt-3">
          The rubric is opinionated by design. If you disagree with where something sits, the{" "}
          <Link
            href="/dex"
            className="font-bold underline decoration-cherry decoration-[3px] underline-offset-4 hover:text-cherry transition"
          >
            Cracked Dex
          </Link>{" "}
          has the justifications spelled out. Fight in the group chat, not at me.
        </p>
      </Section>

      <Section title="What we're not measuring">
        <ul className="space-y-2 text-[15px] text-ink">
          <li>· Whether you&apos;re a <em className="font-serif italic">good person</em>. Crackedness ≠ goodness.</li>
          <li>· Whether you&apos;re <em className="font-serif italic">happy</em>. The dex is upstream of fulfillment.</li>
          <li>· Your <em className="font-serif italic">future</em>. We grade present credentials, not trajectory.</li>
          <li>· Things LinkedIn doesn&apos;t list — open source, Twitter, side projects often missed.</li>
        </ul>
      </Section>

      <Section title="The honest limits">
        <ul className="space-y-2 text-[15px] text-ink">
          <li>· LinkedIn data is shallow on hackathons, open source, and online presence.</li>
          <li>· Without an Anthropic API key, the regex fallback misses nuance.</li>
          <li>· Tier-list mappings are best-effort; novel orgs may default low.</li>
          <li>· Privacy: data lives in your URL, not our DB. Don&apos;t share links you wouldn&apos;t want public.</li>
        </ul>
      </Section>

      <Section title="Made with">
        <div className="flex flex-wrap gap-2">
          {[
            "Next.js 15", "React 19", "TypeScript", "Tailwind", "unpdf",
            "Claude", "Bowlby One", "Fraunces", "JetBrains Mono",
          ].map((t) => (
            <span
              key={t}
              className="font-mono text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border-2 border-ink bg-cream text-ink"
              style={{ boxShadow: "2px 2px 0 var(--ink)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-cherry-deep mb-4">
        // {title} //
      </div>
      <div className="text-ink leading-relaxed">{children}</div>
    </section>
  );
}

function ListItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 items-start">
      <span
        className="font-display text-[22px] w-10 h-10 shrink-0 grid place-items-center rounded-full border-[3px] border-ink bg-marigold text-ink leading-none"
        style={{ boxShadow: "2px 2px 0 var(--cherry)" }}
      >
        {n}
      </span>
      <span className="pt-1">{children}</span>
    </li>
  );
}
