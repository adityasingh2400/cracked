# cracked.com v1.0 — Setup Dashboard

Every step in this file requires **your account or your hands**. Everything in
the codebase has been written and tested in dry-run; this dashboard is the
sequence to actually light it up.

Phases match `/plan-eng-review` Approach B (5 weeks). You can do these in any
order, but the listed order minimizes blocking.

---

## 1. Install new deps (5 min)

```bash
cd /Users/aditya/Documents/cracked
bun install
```

New deps added in v1.0:
- `@vercel/og` — server-side OG image rendering (Satori)
- `@upstash/redis` — Vercel KV client
- devDeps: `vitest`, `@testing-library/{react,jest-dom,user-event}`, `@playwright/test`, `@vitest/coverage-v8`, `jsdom`, `@vitejs/plugin-react`

## 2. Run tests locally (1 min)

```bash
bun run test                # vitest unit tests
bun run test:coverage       # with coverage gate on src/lib/
bun run test:e2e            # Playwright (requires `bunx playwright install`)
```

If any test fails before you change anything: that's a real bug from this
session — file an issue, do not deploy.

## 3. Vercel KV (Upstash Redis) — provision (~10 min, you-only)

cracked.com v0.7 was stateless. v1.0 introduces persistent storage for
browse-mode tier badges, Mount Olympus rankings, telemetry, and per-cell
empirical distributions. Free tier covers v1.0 launch.

1. Open Vercel dashboard → Storage → Create Database → "KV (Upstash)" → name
   it `cracked-kv` → Region: same as the app's primary deploy region.
2. Vercel auto-injects `KV_REST_API_URL` + `KV_REST_API_TOKEN` env vars into
   your project. Confirm they appear under Project Settings → Environment
   Variables.
3. Redeploy: `bun run build && vercel deploy --prod` (or push to master).

If you skip this, `/api/lookup`, `/api/telemetry`, `/api/olympus`, and the
Chrome extension browse-mode badges all silently degrade — the site still
works, just with no persistent state.

## 4. Tailscale Funnel for Mac-Claude routing (~15 min, you-only)

You picked Mac-Claude as the v1.0 scoring backend (option 1.C in eng review).
The site routes `/api/analyze` requests to a Node server running on your
MacBook via Tailscale Funnel.

1. Install Tailscale if you don't have it:
   ```bash
   brew install --cask tailscale
   tailscale up
   ```
2. Start the Mac-Claude proxy server (in a long-running terminal or via
   `pm2`/`launchd`):
   ```bash
   export MAC_CLAUDE_AUTH="$(openssl rand -hex 32)"
   echo "save this token: $MAC_CLAUDE_AUTH"
   PORT=3030 bun run mac-claude-server
   ```
3. Expose via Tailscale Funnel:
   ```bash
   tailscale funnel 3030
   ```
   Tailscale prints a public HTTPS URL like
   `https://<machine-name>.<tailnet>.ts.net`.
4. Add to Vercel env vars:
   - `MAC_CLAUDE_URL` = `https://<machine-name>.<tailnet>.ts.net`
   - `MAC_CLAUDE_AUTH` = the token from step 2
5. Redeploy.

If your Mac is offline, the score router falls through to the Anthropic API
tier (if `ANTHROPIC_API_KEY` is set) or the regex extractor. Cards built via
regex show a "calibrating" badge.

## 5. Anthropic API key (optional but recommended, ~2 min, you-only)

If you provision an API key as the middle tier, the site keeps working when
your Mac is offline.

1. Get a key at https://console.anthropic.com/.
2. Add to Vercel env vars:
   - `ANTHROPIC_API_KEY` = your key
   - `API_DAILY_BUDGET_USD` = `20` (or whatever cap you want)
3. Redeploy.

The router already respects the daily budget cap and falls through to regex
when hit. Cap resets at midnight UTC.

## 6. Pre-seed the lookup index (Week 1a, ~2-4 hours)

The Chrome extension's browse-mode tier badges need profiles in the lookup
DB at launch — otherwise badges are invisible and the feature looks dead.

1. Hand-collect ~10-20 public LinkedIn signal-sets per `family × cohort` cell
   (~540-1080 total). Suggested sources: public LinkedIn profiles of YC
   founders, Forbes 30U30, Olympic medalists, MacArthur fellows, etc.
2. Store each as a JSON file in `tests/fixtures/seed-profiles/{family}/{cohort}/{name}.json`
   matching the `ExtractedSignals` shape.
3. Run the seed script (one-shot — write this as `scripts/seed-kv.ts`):
   ```bash
   bun run scripts/seed-kv.ts
   ```
   This script scores each fixture, writes `LookupEntry` to KV, and appends
   each internal_score to the family×cohort cell.

This is a one-time bootstrap. Once real users come in, `w` saturates and the
seed's influence drops naturally.

## 7. Achievement library generation (~1 day of focused agent time)

The 18 parallel research subagents per /plan-eng-review Section 1.4. Each
generates ~80-150 Achievements + 15-25 Chains per family. The orchestrator
script will be added in a follow-up commit; for v1.0 launch, you can do this
by hand-spawning Claude Code Agent tool calls or running this prompt for
each family pair (`achievements` + `chains`).

Per-family prompt template:
```
You are researching Achievements that qualify someone as cracked in the
ENGINEERING family of cracked.com. For each tier (ASCENDED, MYTHIC, S, A, B, C, D),
return JSON achievements matching the schema in src/lib/types.ts (Achievement).
Per-tier targets: D=5, C=10, B=15, A=20, S=25, MYTHIC=10, ASCENDED=5-15.
```

Output goes to `src/data/achievements/{family}.ts` as a typed `Achievement[]`
+ `Chain[]` export. The chain-detector already wires this in via the
`FamilyLibrary` type — once the files exist, scoring engages automatically.

## 8. Chrome extension icons + Chrome Web Store submission (~1 day)

1. Add three PNG icons at `extension/icons/{16,48,128}.png`. The cracked.com
   logo or a stylized "⚡" works.
2. Pack and submit:
   ```bash
   cd extension && zip -r ../cracked-extension-v1.0.0.zip .
   ```
3. Submit at https://chrome.google.com/webstore/devconsole/.
4. **Review takes 5-10 business days** for first-submission MV3 with LinkedIn
   DOM permissions. The bookmarklet is the fallback while you wait.

## 9. Bookmarklet on the landing page (~30 min)

Currently the bookmarklet is hosted at `public/crackme.js`. The landing page
needs a draggable button that points to it. Add this snippet to
`src/app/page.tsx`:

```tsx
<a
  href={`javascript:${encodeURIComponent("(function(){var s=document.createElement('script');s.src='https://cracked-woad.vercel.app/crackme.js';document.body.appendChild(s);})();")}`}
  className="..."
  draggable="true"
>
  ⚡ Crack Me — drag to bookmark bar
</a>
```

## 10. Run the type-checker and fix any drift (~10 min)

The v1.0 refactor extended the `Tier` union to 7 values. Any code that does
`Record<Tier, X>` needs all 7 entries. I extended:

- `src/data/leagues.ts` cohort cutoffs
- `src/lib/tier-list.ts` `TIER_POINTS`
- `src/lib/score.ts` uses canonical `TIER_RANK`

Run:

```bash
bunx tsc --noEmit
```

If TypeScript errors appear in `src/lib/match.ts`, that's expected — it gets
deleted in T-CLEAN (step 12) along with the 196 archetypes.

## 11. Delete v0.7 legacy (~15 min) — T-CLEAN

Once you've verified `src/data/achievements/*.ts` is populated and the new
dex routes render, delete:

```bash
rm src/data/archetypes.ts        # 3552 lines of 196 archetypes
rm src/data/types-meta.ts        # 22-types layer
rm src/lib/match.ts              # archetype matcher
rm src/components/ArchetypeMini.tsx
rm -r src/app/dex/[slug]         # individual archetype pages
rm -r src/app/dex/types          # 22-types index
```

Then fix the imports that break:
- `src/app/page.tsx` — landing page imports from `@/data/archetypes` and
  `@/data/types-meta`. Replace the "canon preview" section with `FAMILIES_ORDERED`
  family tiles.
- `src/components/HoloCard.tsx` — currently imports `Archetype` from
  `@/data/archetypes`. Either delete the archetype prop entirely or
  add a `family: Family` prop in its place.

The `score.ts` file imports `matchArchetype` from `./match`. After deletion,
remove that import and the line that calls it; the new `chain-detector.ts`
is the v1.0 replacement.

## 12. ASCENDED reveal animation (~half day) — T-CEREMONY

Per /plan-eng-review Section 4 polish: ASCENDED tier reveals get a cinematic
animation. Wire into `HoloCard.tsx` (or a new `HoloCard.v1.tsx`):

- Slow flip-in (1.2s) for ASCENDED only
- Holo flare across the foil
- Optional sound cue
- B/A/S animations stay v0.7-current (no scope creep)

## 13. README + privacy posture update (~15 min)

The v0.7 README says "Nothing is saved on any server. Your data never leaves
the browser unless you click share." That changes in v1.0 with Vercel KV.

Update `README.md` to say:

> **What we persist:** when you crack a profile, we store a small lookup entry
> (family, tier, cohort, percentile, initials) keyed by the LinkedIn URL slug.
> This powers the browse-mode tier badges in the Chrome extension and the
> Mount Olympus leaderboard. **We never store the raw resume text, full names,
> or anything from the LinkedIn profile beyond what's described above.** You
> can have your entry removed by emailing aditya@cracked.com (TBD).

## 14. Eval suites (manual cadence, ~30 min each)

The four EVAL items from the test plan run manually whenever you change the
Claude extraction prompt or the achievement library:

- **EVAL-1**: 20 hand-labeled LinkedIn exports → assert field-level accuracy ≥90%
- **EVAL-2**: age inference accuracy on HS/MBA/PhD/career-changer fixtures
- **EVAL-3**: achievement library generation validates against 5 rules
- **EVAL-4**: percentile claim monotonicity in tier

Skipped CI integration per /plan-eng-review TODO-3.

## 15. Ship checklist

Before going live with v1.0:

- [ ] All bun tests pass (`bun run test`)
- [ ] Playwright E2E pass (`bun run test:e2e`)
- [ ] Coverage ≥80% on `src/lib/` (`bun run test:coverage`)
- [ ] `bunx tsc --noEmit` clean
- [ ] Vercel KV provisioned + env vars wired
- [ ] Tailscale Funnel exposing Mac-Claude
- [ ] `MAC_CLAUDE_URL` + `MAC_CLAUDE_AUTH` set on Vercel
- [ ] Achievement library populated for at least Engineering + Founder + Finance
- [ ] Seed KV with ~540-1080 profiles
- [ ] Bookmarklet button rendered on landing page
- [ ] OG image renders correctly for a sample share URL (try
      `https://cracked-woad.vercel.app/api/og/<your-share-id>` in browser)
- [ ] v0.7 share URLs decode correctly (`REGR-2` test passes)
- [ ] No raw 0-100 score visible anywhere on card/leaderboard/dex (`REGR-3`)
- [ ] README updated with privacy posture
- [ ] Chrome extension submitted to Web Store

## What's intentionally NOT done in v1.0

Per /plan-eng-review "NOT in scope":

- Comparison links (`/c/<you>/vs/<them>`)
- PDF poster export of family ladders
- Edge Add-ons / Firefox extension
- "Cracked tape" MP4 export (Remotion)
- Named-chain shareable URLs
- BLS OEWS data-driven family weights (coarse hand-picked instead)
- EVAL CI integration (manual cadence instead)

Each of these can land in v1.1.
