import { LeagueTabs } from "./LeagueTabs";

export const metadata = {
  title: "Leaderboard · Cracked",
  description:
    "The Cracked Leaderboard. All-Time absolute rankings plus six age cohorts so a 16-year-old's wins aren't measured against a 40-year-old's.",
};

export default function Leaderboard() {
  return (
    <div className="px-5 sm:px-8 pt-20 pb-24 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-gold/80 mb-5">
          The Cracked Leaderboard
        </div>
        <h1 className="font-display font-semibold text-[64px] sm:text-[88px] leading-[0.95] tracking-tight text-white">
          The wall of <span className="text-foil">fame</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-[16px] text-white/65 text-balance leading-relaxed">
          Two ways to rank. <span className="text-white/90">All-Time</span> measures
          you against everyone, ever — the absolute 0-100. The{" "}
          <span className="text-white/90">age cohort</span> boards rank you against people
          your age, so a 17-year-old IMO medalist isn&apos;t competing with a 40-year-old
          MacArthur Fellow. Older cohorts aren&apos;t more cracked — the bar just moves with
          you.
        </p>
      </div>

      <LeagueTabs />
    </div>
  );
}
