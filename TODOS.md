# TODOS

Long-running items captured during reviews. Not blocking v1.0.

## Maintenance

### Achievement library quarterly refresh

**What:** Re-run `scripts/generate-achievements.ts` once per quarter (Q1/Q2/Q3/Q4) to catch new awards, programs, and culturally-important credentials that emerged since the last pass. Diff against existing `src/data/achievements/*.ts`; review the diff; commit.

**Why:** The Achievement library captures a snapshot of "what's cracked in 2026." New things become cracked over time (new YC batches, new Olympiad medalists, new Forbes lists, new programs like the Thiel Fellowship class of 2027). Without a refresh cadence, tier assignments drift from reality over 6-12 months and the dex starts feeling stale.

**Pros:** Library stays calibrated. Diff-PR pattern means each refresh is reviewable in ~30 minutes.

**Cons:** Quarterly attention overhead. Easy to forget. The "calendar reminder" approach relies on you remembering.

**Context:** The library generator is a 4-wide parallel research subagent pass (18 agents total) producing per-family Achievement + Chain JSON. The output is hand-curatable via `achievements-{family}.draft.json` files before committing as TypeScript. The script itself is re-runnable any time.

**Depends on:** Initial library shipped in Week 1a of v1.0. Refresh script tested end-to-end. (Both happen in v1.0.)

**Action items:**
- [ ] After v1.0 ships: set a calendar reminder for the start of each quarter
- [ ] (Optional v1.1) Wire this into a GitHub Action that runs the pass on a quarterly cron and opens a PR with the diff
