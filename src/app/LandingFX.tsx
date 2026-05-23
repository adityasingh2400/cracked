"use client";

import { useEffect, useRef } from "react";

// Background effects layer for the landing page:
//   - Floating sparkle particles on canvas
//   - Click-anywhere confetti (except on cards / nav / footer)
const COLORS = ["#FF6B5C", "#FFC53D", "#FFA532", "#FFD0BA", "#3C1F15", "#FFE5A8"];

export function LandingFX() {
  const cvRef = useRef<HTMLCanvasElement>(null);

  // Sparkle canvas — slow drifting four-point stars
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let w = (cv.width = window.innerWidth);
    let h = (cv.height = window.innerHeight);
    const onResize = () => {
      w = cv.width = window.innerWidth;
      h = cv.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const PARTICLES = Array.from({ length: 26 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: 0.6 + Math.random() * 1.4,
      v: 0.08 + Math.random() * 0.18,
      drift: Math.random() * Math.PI * 2,
      a: Math.random(),
      color: ["#FFC53D", "#FF6B5C", "#FFE5A8"][Math.floor(Math.random() * 3)],
    }));

    function drawStar(cx: number, cy: number, r: number, color: string, alpha: number) {
      ctx!.save();
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = color;
      ctx!.beginPath();
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(ang) * r;
        const y1 = cy + Math.sin(ang) * r;
        const ang2 = ang + Math.PI / 4;
        const x2 = cx + Math.cos(ang2) * r * 0.4;
        const y2 = cy + Math.sin(ang2) * r * 0.4;
        if (i === 0) ctx!.moveTo(x1, y1);
        else ctx!.lineTo(x1, y1);
        ctx!.lineTo(x2, y2);
      }
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of PARTICLES) {
        p.y -= p.v;
        p.x += Math.sin(p.drift + p.y * 0.005) * 0.18;
        p.a += 0.008;
        const flicker = (Math.sin(p.a * 4) + 1) / 2;
        drawStar(p.x, p.y, p.s * 2.5, p.color, 0.18 + flicker * 0.35);
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Click-anywhere confetti
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      // skip interactive sections so cards/nav handle their own micro-fx
      if (tgt.closest("nav, .marquee-strip, footer, .upload-card, a, button, input, textarea, label")) return;
      confettiAt(e.clientX, e.clientY, 10);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <canvas
      ref={cvRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
}

export function confettiAt(x: number, y: number, count = 24) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = x + "px";
    c.style.top = y + "px";
    c.style.width = "10px";
    c.style.height = "14px";
    c.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    c.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    c.style.pointerEvents = "none";
    c.style.zIndex = "999";
    document.body.appendChild(c);
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 280;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 120;
    const dur = 1400 + Math.random() * 1100;
    c.animate(
      [
        { transform: c.style.transform, opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 400}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0.6,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" }
    );
    setTimeout(() => c.remove(), dur);
  }
}
