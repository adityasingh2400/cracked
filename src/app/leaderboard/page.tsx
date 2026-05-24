import { LeaderboardClient } from "./LeaderboardClient";

export const metadata = {
  title: "Leaderboard · Cracked",
  description:
    "Mount Olympus, per-cohort, and per-family leaderboards. Compare across 9 career families and 6 age cohorts.",
};

export default function Leaderboard() {
  return (
    <div className="px-5 sm:px-8 pt-12 pb-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="arcade-stamp mb-6">★ The Cracked Leaderboard</div>
        <h1 className="font-display text-[56px] sm:text-[88px] leading-[0.9] tracking-tight text-ink">
          THE WALL OF{" "}
          <span className="text-arcade-holo inline-block">FAME</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[16px] sm:text-[17px] font-serif italic text-ink-soft text-balance leading-snug">
          Two boards. <span className="font-bold not-italic text-ink">Mount Olympus</span> is the all-time, cross-family top-100 (MYTHIC+ entry threshold). The <span className="font-bold not-italic text-ink">per-cohort</span> boards rank by age × family - a 17-year-old IMO medalist isn&apos;t competing with a 40-year-old MacArthur Fellow.
        </p>
      </div>

      <LeaderboardClient />
    </div>
  );
}
