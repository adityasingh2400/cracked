// /preview - landing index for design preview pages.

import Link from "next/link";

export const metadata = { title: "Preview · Cracked Design" };

const PAGES = [
  {
    href: "/preview/tiers",
    title: "The Tier Ladder",
    subtitle: "All 7 tiers · D through ASCENDED",
    description:
      "One sample person rendered through every tier so you can eyeball the progression - how sparkles, foil, halo, border, and corner ornaments ramp up.",
  },
  {
    href: "/preview/champions",
    title: "The Champion Cabinet",
    subtitle: "9 families · all at S-3♔",
    description:
      "Same S-3♔ rank rendered across all 9 career families so you can see how the per-family palette, glyph, motto, and metal (gold/silver/rose-gold) flow through the same card.",
  },
];

export default function PreviewIndex() {
  return (
    <div className="min-h-screen px-5 sm:px-8 py-14 pb-32" style={{ background: "#040206" }}>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ fontFamily: "var(--font-plex-mono)", color: "#C5A24D" }}
          >
            HoloCardV2 · Design Preview
          </div>
          <h1
            className="leading-[0.92]"
            style={{
              fontFamily: "var(--font-cinzel)",
              fontWeight: 900,
              fontSize: "clamp(48px, 7vw, 110px)",
              letterSpacing: "0.04em",
              background:
                "linear-gradient(165deg, #FFF1A8 0%, #E8C36A 30%, #D4AF37 55%, #FFE5A8 75%, #7A5C18 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter:
                "drop-shadow(0 0 24px rgba(232,181,71,0.45)) drop-shadow(0 2px 0 rgba(60,30,0,0.8))",
              textTransform: "uppercase",
            }}
          >
            Cabinet
          </h1>
          <p
            className="mt-7 max-w-xl mx-auto text-[15px] italic leading-snug"
            style={{ fontFamily: "var(--font-cormorant)", color: "rgba(232,181,71,0.85)" }}
          >
            Static test pages rendering HoloCardV2 with inline sample data - no encoded
            share URLs, no API calls. Use these to QA the card visuals during design
            iteration.
          </p>
        </header>

        <div className="grid gap-6 sm:gap-8">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="block rounded-2xl border-2 p-7 sm:p-8 transition hover:-translate-y-0.5"
              style={{
                borderColor: "rgba(213,173,80,0.45)",
                background: "rgba(213,173,80,0.04)",
                boxShadow:
                  "0 30px 80px -30px rgba(0,0,0,0.85), 0 0 80px -20px rgba(213,173,80,0.35), inset 0 1px 0 rgba(213,173,80,0.18)",
              }}
            >
              <div
                className="text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ fontFamily: "var(--font-plex-mono)", color: "#C5A24D" }}
              >
                {p.subtitle}
              </div>
              <div
                className="leading-tight mb-2"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  fontWeight: 700,
                  fontSize: 36,
                  letterSpacing: "0.06em",
                  background:
                    "linear-gradient(165deg, #FFF1A8 0%, #E8C36A 50%, #B8860B 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textTransform: "uppercase",
                }}
              >
                {p.title}
              </div>
              <div
                className="text-[14px] italic leading-snug"
                style={{ fontFamily: "var(--font-cormorant)", color: "rgba(255,250,240,0.78)" }}
              >
                {p.description}
              </div>
              <div
                className="mt-3 text-[10px] tracking-[0.28em] uppercase"
                style={{ fontFamily: "var(--font-plex-mono)", color: "#E8C36A" }}
              >
                {p.href} →
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center text-[11px] italic"
          style={{ fontFamily: "var(--font-cormorant)", color: "rgba(232,181,71,0.55)" }}>
          cracked · design cabinet · vol. i
        </footer>
      </div>
    </div>
  );
}
