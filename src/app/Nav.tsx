"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export function Nav() {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Magnetic CTA - pulls toward cursor when within 200px.
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const onMove = (e: MouseEvent) => {
      const r = cta.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 200) {
        const pull = (200 - dist) / 200;
        cta.style.transform = `translate(${dx * pull * 0.18}px, ${dy * pull * 0.18}px)`;
      } else {
        cta.style.transform = "";
      }
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(255, 228, 214, 0.62)",
        borderBottom: "2px solid rgba(60,31,21,0.12)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-[26px] text-ink leading-none">
          cracked<span className="text-cherry text-[22px] -rotate-[8deg] inline-block animate-bolt-flash">⚡</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/dex">Dex</NavLink>
          <NavLink href="/leaderboard">Leaderboard</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            ref={ctaRef}
            href="/"
            className="ml-2 px-5 py-2.5 rounded-full bg-ink text-paper font-display text-[13px] leading-none relative"
            style={{
              boxShadow: "4px 4px 0 var(--cherry)",
              transition: "transform 0.12s, box-shadow 0.12s",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 6px 0 var(--cherry)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "4px 4px 0 var(--cherry)";
            }}
          >
            AM I CRACKED
            <span className="absolute inset-[-4px] rounded-full pointer-events-none animate-cta-pulse" />
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
      className="px-3 sm:px-4 py-2 rounded-full text-ink font-bold text-[13px] transition hover:bg-cherry/15"
    >
      {children}
    </Link>
  );
}
