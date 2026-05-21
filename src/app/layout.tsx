import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Cormorant_Garamond({
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-ink/50 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl font-semibold tracking-tight text-foil">cracked</span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-[0.24em] text-white/40 uppercase">
            v0.1
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4 font-mono text-[11px] tracking-[0.18em] uppercase">
          <NavLink href="/dex">Dex</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          <Link
            href="/"
            className="ml-2 px-3 py-1.5 rounded-md bg-gradient-to-br from-foil-violet to-foil-pink text-white text-[10px] tracking-[0.18em] hover:brightness-110 transition"
          >
            Score Me
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
      className="px-2.5 py-1.5 text-white/60 hover:text-white transition rounded-md hover:bg-white/5"
    >
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase">
          Cracked · A toy by people who should be working
        </div>
        <div className="flex gap-5 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
          <Link href="/dex" className="hover:text-white transition">Dex</Link>
          <Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
          <Link href="/about" className="hover:text-white transition">How it works</Link>
        </div>
      </div>
    </footer>
  );
}
