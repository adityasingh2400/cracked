import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces, Bowlby_One } from "next/font/google";
import "./globals.css";
import { Nav } from "./Nav";
import { Marquee } from "./Marquee";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Fraunces({
  weight: ["400", "500", "600", "700"],
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

export const metadata: Metadata = {
  title: "Cracked · how cracked are you?",
  description:
    "Upload your LinkedIn. Get scored, tiered, and matched to a Cracked Dex archetype. Built for screenshotting and arguing about.",
  openGraph: {
    title: "Cracked · how cracked are you?",
    description:
      "Upload your LinkedIn. Get scored, tiered, and matched to a Cracked Dex archetype.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${serif.variable} ${display.variable}`}
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
    <footer className="relative z-[2] mt-32 px-5 sm:px-8 pt-12 pb-10 border-t-2 border-ink/15">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center mb-7">
          <span className="arcade-stamp">★ vol. i</span>
          <span className="arcade-stamp">★ 33+ archetypes</span>
          <span className="arcade-stamp">★ 9 elemental types</span>
          <span className="arcade-stamp" style={{ background: "var(--marigold)" }}>★ free forever</span>
        </div>
        <div className="text-center">
          <div className="font-serif italic text-[15px] text-ink-soft">
            cracked · vol. i · a toy by people who should be working
          </div>
          <div className="mt-5 flex gap-5 justify-center font-mono text-[11px] tracking-[0.16em] uppercase text-ink-soft/85">
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
