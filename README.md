# cracked

> **How cracked are you?**
> Drop your LinkedIn. Get a tier. Get an archetype. Get a holographic trading card.

This is a website that grades how impressive your resume is — in a fun, opinionated, internet-brain way — and turns the result into a Pokemon-style trading card you can screenshot and argue about.

The word "cracked" is internet slang for someone who is freakishly good at what they do. This is a field guide and a grading scale for it.

## Try it

**Live site:** https://cracked-woad.vercel.app

**Running locally:** http://localhost:3000 (once you start it — see below)

You can either:
1. **Upload your LinkedIn PDF** and get your real score, or
2. Click **"see a sample card first"** on the homepage to skip the upload and look at an example.

## What you get

After dropping your LinkedIn PDF in, in about 8 seconds you get:

- **A score out of 100** — total "crackedness"
- **A tier**: S, A, B, C, or D (like a Smash Bros tier list)
- **A cohort placement** — your age cohort. Pure age ranges: ≤16, 17–19, 20–22, 23–26, 27–32, 33+. Same score, regraded against your peers — a 17-year-old IMO medalist doesn't compete with a 40-year-old MacArthur Fellow. Older cohorts aren't more cracked, the bar just moves with you
- **Four sub-stats**: HACK, GRIND, TASTE, RIZZ
- **An archetype** — one of 196 hand-written character types like *"The Bain Capital Partner"* or *"The Fiverr Logo Mill"* — that best matches you
- **A holographic shareable card** with all of the above on it

The card *leads* with the league tier (the relative grade against your cohort) and treats the absolute 0-100 as the secondary metadata. Age is inferred from your resume's grad years and can be corrected inline on the card.

Plus a sharable link that contains your entire result inside the URL itself. **Nothing is saved on any server.** Your data never leaves the browser unless you click share.

## The Cracked Dex

The heart of the project. A browseable encyclopedia of **196 archetypes** of cracked people, grouped into **22 elemental types** (Hacker, Quant, Founder, Scholar, Healer, Athlete, Performer, etc.), ranked from least to most impressive.

Each entry has:
- A name, a one-line tagline, and a picture-perfect profile
- Real-world examples of who fits the archetype
- A justification for why it's ranked where it is
- What it evolves into next

Browse the dex at **[/dex](https://cracked-woad.vercel.app/dex)**.

## The five tiers

| Tier | Count | Vibe |
|------|-------|------|
| **S** | 34 | The legends. Once-a-decade trajectories. (Sequoia partner, Nobel laureate, IMO gold) |
| **A** | 49 | Obviously cracked within five minutes of meeting them. |
| **B** | 48 | The climbers. Stacked dossiers, top 10-20%. |
| **C** | 32 | The believers. Real signal, on the way up. |
| **D** | 33 | The long tail. Signals haven't shown up yet. |

## Running it on your own machine

You'll need [Node.js](https://nodejs.org) 18 or newer, and [bun](https://bun.sh) (or npm, or pnpm).

```bash
git clone https://github.com/adityasingh2400/cracked.git
cd cracked
bun install
bun run dev
```

Then open **http://localhost:3000**.

That's it. No database to set up. No accounts. No environment variables required.

> Optional: if you want LLM-powered signal extraction instead of the regex fallback, set `ANTHROPIC_API_KEY=...` in a `.env.local` file. Without it, the app still works — it just uses simpler pattern matching.

## How it works (in plain English)

1. **You upload your LinkedIn PDF.**
2. The app reads the text out of it and pulls out the things that matter — schools, jobs, awards, hackathons, projects.
3. Each thing gets graded S / A / B / C / D against a giant **hand-curated tier list** (e.g., MIT is S-tier education, Fiverr is D-tier work, IMO Gold Medal is S-tier accolade).
4. Those grades get added up into six buckets (Education, Work, Accolades, Founder, Open Source, Online Presence), capped, and combined into a total score from 0 to 100.
5. The total gets bucketed into a tier (S/A/B/C/D).
6. Your sub-stats are computed from the same signals: **HACK** (hard skills), **GRIND** (volume), **TASTE** (selectivity), **RIZZ** (audience).
7. The result is matched against the closest of 196 archetypes by score, sub-stats, and tier.
8. Everything is rendered onto a holographic Pokemon-style trading card.
9. The card is encoded into a share link. No server-side storage exists.

The whole grading rubric is in `src/lib/tier-list.ts` and is meant to be argued with. The full dex is in `src/data/archetypes.ts`. Both are plain TypeScript — fork it, change the rubric, ship your own version.

## Built with

- **[Next.js 15](https://nextjs.org)** — the website framework
- **[Tailwind CSS](https://tailwindcss.com)** — the styling
- **[Framer Motion](https://www.framer.com/motion/)** — the holo card animations
- **[Claude](https://www.anthropic.com/claude)** (optional) — for smarter signal extraction
- **[Vercel](https://vercel.com)** — where it's hosted

## Project layout

```
src/
├── app/              # the pages (home, dex, leaderboard, about)
│   ├── dex/          # the field guide — index, types, individual archetypes
│   └── c/[data]/     # the share card route (decodes URL → renders card)
├── components/       # the holo card, upload box, tier rings, etc.
├── data/
│   ├── archetypes.ts # all 196 archetypes
│   └── types-meta.ts # the 22 elemental types
└── lib/
    ├── tier-list.ts  # the hand-curated scoring rubric
    ├── score.ts      # totals the categories, picks a tier
    ├── leagues.ts    # age-relative placement math
    ├── match.ts      # picks the closest archetype
    ├── claude.ts     # signal extraction (with regex fallback)
    └── encode.ts     # gzip+base64 → share URL

src/data/leagues.ts   # the 6 leagues + per-league cutoffs and exemplars
```

## Why this exists

For fun. Mostly to argue with friends about who's more cracked.

It's also a working example of:
- A website that does real work but stores **literally nothing** (the URL is the database)
- A hand-curated taste artifact (the tier list + dex) wrapped in a real product
- LLM-assisted PDF parsing that gracefully falls back to deterministic regex

## License

MIT. Steal it. Fork it. Make your own.
