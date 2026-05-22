import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Fraunces({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang="en" className={`${inter.variable} ${mono.variable} ${display.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg/70 border-b border-amber/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-[26px] font-semibold tracking-tight text-cream">
            cracked<span className="text-amber">.</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.24em] text-amber/70 uppercase">
            vol. i
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-[13px] font-medium">
          <NavLink href="/dex">Dex</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            href="/"
            className="ml-2 px-4 py-2 rounded-full bg-gradient-to-b from-amber-light to-amber text-bg-1 text-[13px] font-display font-semibold hover:brightness-105 transition shadow-amber-glow"
          >
            Score me
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-cream/70 hover:text-cream transition"
    >
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-amber/10 py-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="font-display italic text-[14px] text-cream/55">
          cracked · vol. i · a toy by people who should be working
        </div>
        <div className="flex gap-6 text-[13px] text-cream/55">
          <Link href="/dex" className="hover:text-cream transition">Dex</Link>
          <Link href="/leaderboard" className="hover:text-cream transition">Leaderboard</Link>
          <Link href="/about" className="hover:text-cream transition">How it works</Link>
        </div>
      </div>
    </footer>
  );
}
