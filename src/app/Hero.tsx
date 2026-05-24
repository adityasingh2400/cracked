"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Landing hero — stamp + three-line letter-by-letter Bowlby headline.
// Server-rendered HTML stays clean; client effect splits the data-text spans
// into per-letter spans with staggered enter animation.
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    if (!document.getElementById("letter-in-kf")) {
      const style = document.createElement("style");
      style.id = "letter-in-kf";
      style.textContent = `
        @keyframes letterIn { to { opacity: 1; transform: translateY(0) rotate(0); } }
        @keyframes heroFadeIn { to { opacity: 1; } }
      `;
      document.head.appendChild(style);
    }

    root.current.querySelectorAll<HTMLElement>("[data-text]").forEach((el) => {
      const txt = el.dataset.text ?? "";
      el.innerHTML = "";
      const all = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-text]"));
      let cum = 0;
      for (const line of all) {
        if (line === el) break;
        cum += (line.dataset.text ?? "").length;
      }
      [...txt].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "letter";
        s.textContent = ch === " " ? " " : ch;
        s.style.display = "inline-block";
        s.style.opacity = "0";
        s.style.transform = "translateY(60px) rotate(8deg)";
        s.style.animation = `letterIn 0.7s cubic-bezier(.3,1.6,.5,1) forwards`;
        s.style.animationDelay = `${(cum + i) * 0.045}s`;
        s.style.transition = "transform 180ms ease-out";
        s.addEventListener("mouseenter", () => {
          s.style.transform = "translateY(-8px) rotate(-4deg) scale(1.08)";
        });
        s.addEventListener("mouseleave", () => {
          s.style.transform = "translateY(0) rotate(0) scale(1)";
        });
        el.appendChild(s);
      });
    });
  }, []);

  return (
    <section ref={root} className="relative z-[2] max-w-5xl mx-auto text-center pt-14 pb-12 sm:pt-20 sm:pb-16 px-5">
      <Sticker top="120px" left="6%" rotate={-8} bg="var(--marigold)">
        MYTHIC ★
      </Sticker>
      <Sticker top="240px" right="6%" rotate={6} bg="var(--cherry)" color="var(--paper)">
        ASCENDED
      </Sticker>
      <Sticker top="420px" left="3%" rotate={4} bg="var(--cream)" small>
        9 FAMILIES · 7 TIERS
      </Sticker>

      <div className="arcade-stamp animate-stamp-in mb-7">
        ★ The Cracked Index <span style={{ color: "var(--cherry)" }}>·</span> Vol. I{" "}
        <span style={{ color: "var(--cherry)" }}>·</span> 9 families
      </div>

      <h1 className="font-display leading-[0.86] text-[64px] sm:text-[120px] lg:text-[168px] tracking-tight text-ink m-0">
        <span className="block" style={{ transform: "translateX(-12px)" }} data-text="HOW" />
        <span className="block">
          <span className="text-arcade-holo inline-block" data-text="CRACKED" />
        </span>
        <span className="block" style={{ transform: "translateX(18px)" }} data-text="ARE YOU?" />
      </h1>

      <p
        className="mt-8 max-w-xl mx-auto text-[17px] sm:text-[19px] font-serif italic text-ink-soft leading-snug text-balance opacity-0"
        style={{ animation: "heroFadeIn 0.8s ease 1.4s forwards" }}
      >
        Drop your LinkedIn, screenshots, or the{" "}
        <Link href="#bookmarklet" className="underline decoration-cherry decoration-[3px] underline-offset-4">
          ⚡ bookmarklet
        </Link>
        . We weigh every signal — schools, jobs, hackathons, fellowships, open source — and place you on one of nine family ladders, from D to{" "}
        <span className="text-arcade-holo font-bold not-italic">ASCENDED</span>.
      </p>
    </section>
  );
}

function Sticker({
  children,
  top,
  left,
  right,
  rotate = 0,
  bg = "var(--cream)",
  color = "var(--ink)",
  small = false,
}: {
  children: React.ReactNode;
  top: string;
  left?: string;
  right?: string;
  rotate?: number;
  bg?: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <div
      className="absolute z-[3] pointer-events-none animate-bobble hidden md:block font-display"
      style={
        {
          top,
          left,
          right,
          background: bg,
          color,
          padding: "8px 16px",
          fontSize: small ? "12px" : "16px",
          border: "3px solid var(--ink)",
          borderRadius: "999px",
          boxShadow: "3px 3px 0 var(--ink)",
          ["--r" as string]: `${rotate}deg`,
          transform: `rotate(${rotate}deg)`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
