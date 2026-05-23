import { LeagueTabs } from "./LeagueTabs";

export const metadata = {
  title: "Leaderboard · Cracked",
  description:
    "The Cracked Leaderboard. All-Time absolute rankings plus six age cohorts so a 16-year-old's wins aren't measured against a 40-year-old's.",
};

export default function Leaderboard() {
  return (
    <div className="px-5 sm:px-8 pt-12 pb-24 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="arcade-stamp mb-6">★ The Cracked Leaderboard</div>
        <h1 className="font-display text-[56px] sm:text-[88px] leading-[0.9] tracking-tight text-ink">
          THE WALL OF{" "}
          <span className="text-arcade-holo inline-block">FAME</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[16px] font-serif italic text-ink-soft text-balance leading-snug">
          Two ways to rank. <span className="font-bold not-italic text-ink">All-Time</span> measures you against everyone, ever — the absolute 0-100. The <span className="font-bold not-italic text-ink">age cohort</span> boards rank you against people your age, so a 17-year-old IMO medalist isn&apos;t competing with a 40-year-old MacArthur Fellow. Older cohorts aren&apos;t more cracked — the bar just moves with you.
        </p>
      </div>

      <LeagueTabs />
    </div>
  );
}
