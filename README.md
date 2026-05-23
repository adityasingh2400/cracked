# Cracked

Drop your LinkedIn. Get a tier. Get a family. Get a holographic trading card.

Cracked is an opinionated achievement scanner for ambitious people. It parses a LinkedIn PDF or structured profile data, matches the signals against a hand-built achievement library, and renders the result as a shareable card.

## How Scoring Works

Cracked no longer uses the old 0-100 category-cap scoring system. The current scorer is achievement-native:

1. Extract structured signals: schools, companies, awards, publications, funding, open source, online presence, and raw text.
2. Match those signals against achievements inside 9 career families.
3. Score each family independently.
4. Unlock chains when specific combinations of achievements are present.
5. Pick the strongest family as the card's primary family.
6. Render the tier, star rank, percentile claim, unlocked chains, and matched achievements.

## Tiers

The tier ladder is:

`D < C < B < A < S < MYTHIC < ASCENDED`

Standard tiers have 1-3 stars:

- `D1`, `D2`, `D3`
- `C1`, `C2`, `C3`
- `B1`, `B2`, `B3`
- `A1`, `A2`, `A3`
- `S1`, `S2`, `S3`

`MYTHIC` and `ASCENDED` are special tiers and intentionally do not have stars.

## Families

Cracked currently scores across 9 families:

- Engineering
- Science & Academia
- Founder
- Finance
- Consulting & Corporate
- Law & Public Service
- Medicine
- Athletics & Performance
- Creative & Audience

Each family has its own achievement library and chain set in `src/data/achievements/`.

## Running Locally

```bash
bun install
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Optional: set `ANTHROPIC_API_KEY` in `.env.local` for richer extraction. Without it, the regex fallback still returns the same structured signal shape.

## Useful Routes

- `/` — upload flow
- `/sample` — sample card
- `/dex` — family/tier dex
- `/leaderboard` — leaderboard shell

## Tech

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Anthropic Claude, optional
- Vercel KV / Upstash, optional

## License

MIT
