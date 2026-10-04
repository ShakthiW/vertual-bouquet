"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type PetalsHandle = {
  /** Drop a few petals from a point (client coordinates), e.g. a tapped flower. */
  burst: (clientX: number, clientY: number, color: string, count?: number) => void;
};

type Petal = {
  x: number;
  y: number;
  vy: number;
  size: number;
  color: string;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  spin: number;
  angle: number;
  flipFreq: number;
  life: number; // seconds left; Infinity for ambient petals
  alpha: number;
};

type Props = {
  colors: string[];
  /** Ambient petals on a phone / a larger screen. */
  density?: { mobile: number; desktop: number };
  /** Ambient petals only drift while this is true; bursts always work. */
  active: boolean;
  className?: string;
  ref?: Ref<PetalsHandle>;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * A single canvas of drifting petals. One rAF loop, at most ~40 petals,
 * paused while the tab is hidden; nothing at all under reduced motion except
 * the short bursts from a tapped flower.
 */
export function Petals({ colors, density = { mobile: 18, desktop: 32 }, active, className, ref }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const petals = useRef<Petal[]>([]);
  const wake = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({
    burst(clientX, clientY, color, count = 2) {
      const el = canvas.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        petals.current.push({
          ...newPetal(r.width, r.height, [color], false),
          x: clientX - r.left + rand(-14, 14),
          y: clientY - r.top + rand(-8, 8),
          vy: rand(40, 70),
          life: rand(2.2, 3.2),
          alpha: 1,
        });
      }
      wake.current();
    },
  }));

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const target = reduce || !active ? 0 : w < 700 ? density.mobile : density.desktop;
    // Seed the ambient petals across the whole height so the first frame isn't empty at the top.
    const ambient = petals.current.filter((p) => p.life === Infinity).length;
    for (let i = ambient; i < target; i++) petals.current.push({ ...newPetal(w, h, colors, true), y: rand(-h, h) });

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      petals.current = petals.current.filter((p) => {
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        if (p.life !== Infinity) {
          p.life -= dt;
          p.alpha = Math.min(1, p.life / 0.8);
          if (p.life <= 0) return false;
        } else if (p.y - p.size > h) {
          // Recycle from the top, at a new spot.
          Object.assign(p, newPetal(w, h, colors, true));
        }
        const x = p.x + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(x, p.y);
        ctx.rotate(p.angle);
        // Flip like a turning petal: squash one axis with a cosine.
        ctx.scale(Math.max(0.15, Math.abs(Math.cos(t * p.flipFreq + p.phase))), 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.5, p.size * 0.6, p.size * 0.7, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.7, -p.size * 0.9, -p.size * 0.5, 0, -p.size);
        ctx.fill();
        ctx.restore();
        return true;
      });
      if (petals.current.length && !document.hidden) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const start = () => {
      if (raf || document.hidden || !petals.current.length) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wake.current = start;
    const onVisibility = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      // Ambient petals go when the scene stops; bursts in flight can finish next time.
      petals.current = petals.current.filter((p) => p.life !== Infinity);
    };
  }, [active, colors, density.mobile, density.desktop]);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none ${className ?? ""}`} />;
}

function newPetal(w: number, h: number, colors: string[], ambient: boolean): Petal {
  return {
    x: rand(0, w),
    y: rand(-60, -10),
    vy: rand(18, 42),
    size: rand(4, 8.5),
    color: colors[Math.floor(Math.random() * colors.length)] ?? "#f2b6bf",
    swayAmp: rand(14, 38),
    swayFreq: rand(0.6, 1.4),
    phase: rand(0, Math.PI * 2),
    spin: rand(-1.2, 1.2),
    angle: rand(0, Math.PI * 2),
    flipFreq: rand(0.8, 2),
    life: ambient ? Infinity : 0,
    alpha: ambient ? rand(0.55, 0.9) : 1,
  };
}
