# cracked

> **How cracked are you?** Upload your LinkedIn → get a tier, a score, and a Cracked Dex archetype.

A Next.js app that grades a person's "crackedness" (internet slang for hypercompetent, hacker-coded, terminal-online overachiever) from their LinkedIn PDF export, scores them across six categories, matches them to one of 54 hand-written archetypes, and renders the result as a holographic shareable trading card.

Built for screenshotting and arguing about.

## Live demo

**https://cracked-woad.vercel.app**

Click "see a sample card first" on the landing to skip the upload and see the holo card right away.

## What it does

1. **You upload your LinkedIn PDF** (from LinkedIn → your profile → More → Save to PDF).
2. **We extract structured signals** — schools, jobs, hackathons, fellowships, open source, founder history, online presence. Done by Claude when an API key is set, by a regex fallback otherwise.
3. **Each signal is scored** against a hand-curated tier list (S/A/B/C/D, worth 10/7/4/2/1 points). Six categories cap at 15/25/25/15/10/10 = 100 total.
4. **Sub-stats are computed** — HACK / GRIND / TASTE / RIZZ — and the result is matched to its closest archetype in **[The Cracked Dex](/dex)**.
5. **The whole result is gzip+base64-encoded into the share URL.** No database, no storage, no tracking. The link IS the storage.

## The Cracked Dex

A field guide to 54 archetypes of cracked, ordered from least to most.
Every entry has a profile, real examples, and a defensible justification.

- D-tier (#001–#010): the long tail — bootcamp grads, SaaS bros, LinkedIn influencers
- C-tier (#011–#020): the believers — early signals, on the up
- B-tier (#021–#032): the top 10% — stacked but not yet S
- A-tier (#033–#044): real heat — Berkeley → Anthropic, YC vets, Mercury Fellows
- S-tier (#045–#054): the mythic tier — IMO golds, Thiel unicorns, MacArthur fellows

Browse at `/dex`.

## Local setup

Requires Node 18+ and one of `bun`, `pnpm`, or `npm`.

```bash
bun install
bun run dev
# open http://localhost:3000
```

To enable Claude-powered extraction (recommended — way better than the regex fallback):

```bash
cp .env.example .env.local
# add your ANTHROPIC_API_KEY=sk-ant-...
```

Without an API key, the app still works — it uses a regex-based signal extractor. Less nuanced, but functional. The scoring math and the holo card are identical either way.

## Tech

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind v3** for styling
- **unpdf** for in-memory PDF text extraction (no native deps, Vercel-friendly)
- **@anthropic-ai/sdk** for LLM-based signal extraction (optional)
- **zod** for response schema validation
- **gzip + base64url** for URL-encoded result storage (no DB)
- **Cormorant Garamond + JetBrains Mono** (via next/font)

## Deploying to Vercel

```bash
npx vercel
# follow prompts; add ANTHROPIC_API_KEY in the Vercel dashboard if you want Claude scoring
```

That's it. Nothing else to set up — the app is stateless. Every share link contains the full result, gzip-compressed and base64-encoded into the URL.

## Architecture notes

- `src/lib/tier-list.ts` — the rubric. Hand-curated S/A/B/C/D entries with name patterns + regex matchers.
- `src/lib/score.ts` — the scoring engine. Pure function from signals → CrackedResult.
- `src/lib/match.ts` — archetype matcher. L2 distance on sub-stats + score range + tier compatibility.
- `src/lib/claude.ts` — Anthropic SDK integration + regex fallback.
- `src/lib/pdf.ts` — `unpdf`-based text extraction (Vercel-edge-friendly).
- `src/lib/encode.ts` — gzip + base64url for share URLs.
- `src/data/archetypes.ts` — the Cracked Dex content (~30KB, the soul of the project).
- `src/components/HoloCard.tsx` — the shareable trading-card component with 3D mouse tilt + animated holo foil.

## Editing the rubric

Want to argue about a tier placement? Edit `src/lib/tier-list.ts`. Each entry is a `{ label, tier, patterns, regex? }`. The scoring engine consumes the rubric at runtime — no codegen.

Want to add or rewrite an archetype? Edit `src/data/archetypes.ts`. The Dex pages regenerate automatically (`generateStaticParams` from the archetype array).

## Honest limits

- LinkedIn PDFs are thin on hackathons, open source, and online presence. The OSINT enrichment layer (Twitter / GitHub / Devpost scraping) isn't built yet.
- Regex fallback misses nuance — set `ANTHROPIC_API_KEY` for real Claude-grade extraction.
- The tier list is opinionated by design. PR your case if you disagree.

## License

MIT. Have fun. Don't use this to actually rank people in performance reviews.
