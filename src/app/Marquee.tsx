"use client";

const ITEMS = [
  { text: "9 FAMILIES", hot: false },
  { text: "7 TIERS", hot: false },
  { text: "★ NOW SCORING", hot: true },
  { text: "ASCENDED → D", hot: false },
  { text: "BUILT FOR SCREENSHOTS", hot: false },
  { text: "★ FREE FOREVER", hot: true },
  { text: "DROP A LINKEDIN", hot: false },
];

export function Marquee() {
  return (
    <div className="marquee-strip sticky top-[63px] z-[49]" aria-hidden="true">
      <div className="marquee-track">
        {[...ITEMS, ...ITEMS].map((it, i) => (
          <span key={i}>
            <span style={{ color: it.hot ? "var(--cherry)" : "var(--marigold)" }}>★</span>
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}
