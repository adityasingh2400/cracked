import Link from "next/link";

export const metadata = {
  title: "How it works · Cracked",
  description: "What Cracked measures, how your score is built, and what it does and doesn't mean.",
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
        <p className="mt-6 max-w-lg mx-auto text-[16px] sm:text-[17px] font-serif italic text-ink-soft leading-snug">
          A quick guide to what this site does — no insider knowledge required.
        </p>
      </div>

      <Section title="In plain English">
        <p>
          Cracked reads your LinkedIn profile (or screenshots) and asks a simple question:{" "}
          <em className="font-serif italic">how stacked is your track record?</em> It looks at schools,
          jobs, awards, fellowships, publications, audience size, athletic results — whatever shows up
          on your page — and compares them to a shared ladder of achievements.
        </p>
        <p className="mt-3">
          You get placed on one of <strong>nine career paths</strong> (Engineering, Founder, Finance,
          Medicine, Academia, Consulting, Law, Athletics, Creative) and a tier from{" "}
          <strong>D</strong> up to <strong>ASCENDED</strong>. Your strongest path sets the score.
        </p>
      </Section>

      <Section title="Step by step">
        <ol className="space-y-4 text-[16px] text-ink leading-relaxed list-none p-0 m-0">
          <ListItem n={1}>
            Upload your LinkedIn export, screenshots, or use the bookmarklet on your profile page.
          </ListItem>
          <ListItem n={2}>
            We pull out the highlights: where you studied, where you worked, titles, honors, and anything
            else that reads like a real credential.
          </ListItem>
          <ListItem n={3}>
            Each highlight is matched against the{" "}
            <Link href="/dex" className="font-bold underline decoration-cherry decoration-[3px] underline-offset-4 hover:text-cherry transition">
              Cracked Dex
            </Link>
            — a field guide that spells out what counts at each tier, for each career path.
          </ListItem>
          <ListItem n={4}>
            Your tier is based on your best achievements in that path. At the top tiers,{" "}
            <strong>crowns (♔)</strong> reward depth — not just one big win, but several strong ones stacked
            together.
          </ListItem>
          <ListItem n={5}>
            <strong>Chains</strong> are bonus combinations — like a top fellowship leading into a flagship
            role — that can push your tier higher than any single line on your résumé would.
          </ListItem>
          <ListItem n={6}>
            Your result is saved in the link itself. There is no account and no database on our end. Share
            the URL if you want others to see it.
          </ListItem>
        </ol>
      </Section>

      <Section title="What we're trying to measure">
        <p>
          &ldquo;Cracked&rdquo; is slang for unusually capable — the person who keeps stacking rare wins
          across different parts of their life. A national-team athlete who built a real business. A surgeon
          with a major research prize. A creator with millions of followers <em className="font-serif italic">and</em> a
          serious day job. A founder who actually scaled something.
        </p>
        <p className="mt-3">
          The ladder is opinionated on purpose. It favors paths that compound — elite training, hard
          selection, visible output — over résumé filler that looks good but doesn&apos;t add up. If you
          disagree with a placement, the{" "}
          <Link href="/dex" className="font-bold underline decoration-cherry decoration-[3px] underline-offset-4 hover:text-cherry transition">
            Dex
          </Link>{" "}
          shows the reasoning. Argue with your friends, not with us.
        </p>
      </Section>

      <Section title="What we're not measuring">
        <ul className="space-y-2 text-[15px] text-ink list-none p-0 m-0">
          <li>· Whether you&apos;re a <em className="font-serif italic">good person</em>. A high tier says nothing about character.</li>
          <li>· Whether you&apos;re <em className="font-serif italic">happy</em>. Credentials and fulfillment are different games.</li>
          <li>· Your <em className="font-serif italic">future</em>. We score what&apos;s on the page today, not where you&apos;re headed.</li>
          <li>· Everything you&apos;ve done. Side projects, private wins, and off-LinkedIn work often don&apos;t show up.</li>
        </ul>
      </Section>

      <Section title="Good to know">
        <ul className="space-y-2 text-[15px] text-ink list-none p-0 m-0">
          <li>· LinkedIn doesn&apos;t list everything — awards, audience metrics, and niche credentials are easy to miss.</li>
          <li>· Screenshots and exports work better than a bare profile link when you have unusual achievements.</li>
          <li>· New or unfamiliar organizations may land lower until they&apos;re added to the Dex.</li>
          <li>· Your data lives in the share link, not on our servers. Only share it if you&apos;re fine with it being public.</li>
        </ul>
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
