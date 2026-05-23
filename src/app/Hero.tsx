"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";
import { TYPES_ORDERED } from "@/data/types-meta";

// Landing hero — stamp, three-line letter-by-letter headline, tagline.
// Static SSR output renders without animation; client effect splits the
// data-text spans into per-letter spans and triggers the staggered reveal.
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current) return;
    root.current.querySelectorAll<HTMLElement>("[data-text]").forEach((el) => {
      const txt = el.dataset.text ?? "";
      el.innerHTML = "";
      // figure out cumulative offset across all lines so the cascade is global
      const all = Array.from(root.current!.querySelectorAll<HTMLElement>("[data-text]"));
      let cum = 0;
      for (const line of all) {
        if (line === el) break;
        cum += (line.dataset.text ?? "").length;
      }
      [...txt].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "letter";
        s.textContent = ch === " " ? " " : ch;
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
    // inject the keyframe once
    if (!document.getElementById("letter-in-kf")) {
      const style = document.createElement("style");
      style.id = "letter-in-kf";
      style.textContent = `@keyframes letterIn { to { opacity: 1; transform: translateY(0) rotate(0); } }`;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <section ref={root} className="relative z-[2] max-w-5xl mx-auto text-center pt-14 pb-12 sm:pt-20 sm:pb-16">
      {/* Floating stickers */}
      <Sticker top="120px" left="6%" rotate={-8} bg="var(--marigold)">MYTHIC ★</Sticker>
      <Sticker top="240px" right="6%" rotate={6} bg="var(--cherry)" color="var(--paper)">RARE</Sticker>
      <Sticker top="420px" left="3%" rotate={4} bg="var(--cream)" small>8s · NO SIGNUP</Sticker>

      <div className="arcade-stamp animate-stamp-in mb-7">
        ★ The Cracked Index <span style={{ color: "var(--cherry)" }}>·</span> Vol. I{" "}
        <span style={{ color: "var(--cherry)" }}>·</span> {ARCHETYPES.length} archetypes
      </div>

      <h1 className="font-display leading-[0.86] text-[64px] sm:text-[120px] lg:text-[168px] tracking-tight text-ink m-0">
        <span className="block" style={{ transform: "translateX(-12px)" }} data-text="HOW" />
        <span className="block">
          <span className="text-arcade-holo inline-block" data-text="CRACKED" />
        </span>
        <span className="block" style={{ transform: "translateX(18px)" }} data-text="ARE YOU?" />
      </h1>

      <p className="mt-8 max-w-xl mx-auto text-[17px] sm:text-[19px] font-serif italic text-ink-soft leading-snug text-balance opacity-0 animate-[fadein_0.8s_ease_1.4s_forwards]"
         style={{ animationName: "fadein", animationDuration: "0.8s", animationDelay: "1.4s", animationFillMode: "forwards" }}>
        Drop your LinkedIn. We weigh every signal — schools, hackathons, fellowships, ships shipped — and crown you one of{" "}
        <Link href="/dex" className="underline decoration-cherry decoration-[3px] underline-offset-4">{ARCHETYPES.length} archetypes</Link> across{" "}
        <Link href="/dex" className="underline decoration-cherry decoration-[3px] underline-offset-4">{TYPES_ORDERED.length} elemental types</Link>.
        Built for screenshots. Designed for the group chat.
      </p>

      <style>{`
        @keyframes fadein { to { opacity: 1; } }
      `}</style>
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
