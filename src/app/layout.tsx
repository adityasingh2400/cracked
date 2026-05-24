import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Fraunces,
  Bowlby_One,
  Cinzel,
  Cormorant_Garamond,
  Bodoni_Moda,
  Anton,
  IM_Fell_English_SC,
  Pinyon_Script,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { Nav } from "./Nav";
import { Marquee } from "./Marquee";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Fraunces({
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const display = Bowlby_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Champion-tier display fonts — used by the /preview/champions cards.
// Loaded once globally so per-family overrides are cheap.
const cinzel = Cinzel({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
const bodoni = Bodoni_Moda({
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});
const anton = Anton({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});
const imfellSc = IM_Fell_English_SC({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-imfell-sc",
  display: "swap",
});
const pinyon = Pinyon_Script({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-pinyon",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cracked · how cracked are you?",
  description:
    "Drop your LinkedIn or résumé. Get scored across 9 families, 7 tiers. Built for screenshotting and arguing about.",
  openGraph: {
    title: "Cracked · how cracked are you?",
    description:
      "Drop your LinkedIn or résumé. Get scored across 9 families, 7 tiers.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${serif.variable} ${display.variable} ${cinzel.variable} ${cormorant.variable} ${bodoni.variable} ${anton.variable} ${imfellSc.variable} ${pinyon.variable} ${plexMono.variable}`}
    >
      <body>
        <Nav />
        <Marquee />
        <main className="relative z-[2]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="relative z-[2] mt-24 px-5 sm:px-8 pt-12 pb-10 border-t-2 border-ink/15">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center mb-7">
          <span className="arcade-stamp">★ vol. i</span>
          <span className="arcade-stamp">★ 9 families</span>
          <span className="arcade-stamp">★ 7 tiers</span>
          <span className="arcade-stamp" style={{ background: "var(--marigold)" }}>★ free forever</span>
        </div>
        <div className="text-center">
          <div className="font-serif italic text-[15px] text-ink-soft">
            cracked · vol. i · a toy by people who should be working
          </div>
          <div className="mt-5 flex gap-5 justify-center font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-ink-soft">
            <a href="/dex" className="hover:text-cherry transition">Dex</a>
            <span className="text-ink/20">·</span>
            <a href="/leaderboard" className="hover:text-cherry transition">Leaderboard</a>
            <span className="text-ink/20">·</span>
            <a href="/about" className="hover:text-cherry transition">How it works</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
