"use client";

const ITEMS = [
  { text: "33+ ARCHETYPES", hot: false },
  { text: "9 ELEMENTAL TYPES", hot: false },
  { text: "★ NOW SCORING", hot: true },
  { text: "8 SECONDS", hot: false },
  { text: "BUILT FOR SCREENSHOTS", hot: false },
  { text: "★ FREE FOREVER", hot: true },
  { text: "ONE LIFE ONE SCORE", hot: false },
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
