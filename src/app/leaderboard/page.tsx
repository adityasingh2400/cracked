import { LeaderboardClient } from "./LeaderboardClient";

export const metadata = {
  title: "Leaderboard · Cracked",
  description:
    "Mount Olympus, per-cohort, and per-family leaderboards. Compare across 9 career families and 6 age cohorts.",
};

export default function Leaderboard() {
  return (
    <div className="px-5 sm:px-8 pt-20 pb-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-5">
          THE CRACKED LEADERBOARD
        </div>
        <h1 className="font-display font-semibold text-[56px] sm:text-[80px] leading-[0.95] tracking-tight text-white">
          The wall of <span className="text-amber-foil">fame</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[16px] text-white/65 text-balance leading-relaxed">
          Two boards. <span className="text-white/90">Mount Olympus</span> is the all-time, cross-family
          top-100 (MYTHIC+ entry threshold). The <span className="text-white/90">per-cohort</span> boards
          rank by age × family — a 17-year-old IMO medalist isn&apos;t competing with a 40-year-old MacArthur Fellow.
        </p>
      </div>

      <LeaderboardClient />
    </div>
  );
}
