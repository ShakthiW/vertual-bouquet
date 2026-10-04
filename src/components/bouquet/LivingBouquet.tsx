"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { FRAME, HEAD_SCALE } from "@/lib/bouquet/limits";
import type { FlowerPlacement } from "@/lib/bouquet/schema";
import { CATALOG, getColor } from "@/lib/flowers/catalog";
import { idle } from "@/lib/motion/presets";
import { Bouquet } from "./Bouquet";

type Props = ComponentProps<typeof Bouquet> & {
  /** Gusts, lean and tap only run while this is true (e.g. after the reveal). */
  alive?: boolean;
  /** A flower was tapped: where, and its petal colour (for falling petals). */
  onFlowerTap?: (f: FlowerPlacement, clientX: number, clientY: number, petal: string) => void;
  wrapperClassName?: string;
};

const LEAN_RADIUS = 260; // frame units around the pointer
const LEAN_MAX = 8; // degrees

/**
 * The bouquet, alive: breeze gusts every so often, flowers that lean away from
 * a cursor or finger and spring back, and a tap on a flower bounces it and
 * shows what it means. Everything writes CSS variables (--gust on the svg,
 * --lean per flower), read by the `rotate` rule on .bq-sway in globals.css.
 */
export function LivingBouquet({ alive = true, onFlowerTap, wrapperClassName, ...bouquet }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [meaning, setMeaning] = useState<{ i: number; x: number; y: number } | null>(null);
  const flowers = bouquet.data.flowers;

  // --- gusts ---------------------------------------------------------------------
  useEffect(() => {
    const svg = wrap.current?.querySelector("svg");
    if (!svg || !alive || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let raf = 0;
    const [minGap, maxGap] = idle.gustEvery;

    const gust = () => {
      // Lean one way, overshoot back a little, settle: a damped spring.
      const amp = (2.2 + Math.random() * 2.2) * (Math.random() < 0.65 ? 1 : -1);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = (now - t0) / 1000;
        const rise = Math.min(1, t / 0.9);
        const swell = 1 - (1 - rise) * (1 - rise);
        const settle = t < 0.9 ? 1 : Math.exp(-(t - 0.9) / 0.7) * Math.cos((t - 0.9) * 4.2);
        const v = amp * swell * settle;
        svg.style.setProperty("--gust", v.toFixed(3));
        if (t < 4.5) raf = requestAnimationFrame(step);
        else svg.style.setProperty("--gust", "0");
      };
      if (!document.hidden) raf = requestAnimationFrame(step);
      timer = window.setTimeout(gust, (minGap + Math.random() * (maxGap - minGap)) * 1000);
    };
    timer = window.setTimeout(gust, 2500 + Math.random() * 3000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      svg.style.setProperty("--gust", "0");
    };
  }, [alive]);

  // --- pointer lean ------------------------------------------------------------------
  useEffect(() => {
    const host = wrap.current;
    const svg = host?.querySelector("svg");
    if (!host || !svg || !alive || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const groups = new Map<number, SVGGElement>();
    svg.querySelectorAll<SVGGElement>(".bq-sway[data-index]").forEach((g) => groups.set(Number(g.dataset.index), g));
    const current = flowers.map(() => 0);
    const target = flowers.map(() => 0);
    let raf = 0;

    const toFrame = (clientX: number, clientY: number) => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    };

    const settle = () => {
      let moving = false;
      flowers.forEach((_, i) => {
        // Critically-damped-ish follow: quick to lean, gentle to return.
        const k = target[i] === 0 ? 0.08 : 0.18;
        current[i] += (target[i] - current[i]) * k;
        if (Math.abs(current[i] - target[i]) > 0.02) moving = true;
        groups.get(i)?.style.setProperty("--lean", current[i].toFixed(3));
      });
      raf = moving ? requestAnimationFrame(settle) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(settle);
    };

    const onMove = (e: PointerEvent) => {
      const p = toFrame(e.clientX, e.clientY);
      if (!p) return;
      flowers.forEach((f, i) => {
        const hx = f.x * FRAME.width;
        const hy = f.y * FRAME.height;
        const d = Math.hypot(hx - p.x, hy - p.y);
        target[i] = d < LEAN_RADIUS ? Math.sign(hx - p.x || 1) * LEAN_MAX * (1 - d / LEAN_RADIUS) ** 1.2 : 0;
      });
      kick();
    };
    const onLeave = () => {
      target.fill(0);
      kick();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerup", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerup", onLeave);
      cancelAnimationFrame(raf);
      groups.forEach((g) => g.style.removeProperty("--lean"));
    };
  }, [alive, flowers]);

  // --- tap: bounce + meaning --------------------------------------------------------
  useEffect(() => {
    if (!meaning) return;
    const id = setTimeout(() => setMeaning(null), 3200);
    return () => clearTimeout(id);
  }, [meaning]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const host = wrap.current;
    const svg = host?.querySelector("svg");
    const ctm = svg?.getScreenCTM();
    if (!alive || !host || !svg || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    // The top-most flower under the tap: highest z first.
    const hit = flowers
      .map((f, i) => ({ f, i, d: Math.hypot(f.x * FRAME.width - p.x, f.y * FRAME.height - p.y) }))
      .filter(({ f, d }) => d < 88 * HEAD_SCALE * CATALOG[f.type].baseSize * f.scale * 0.85)
      .sort((a, b) => b.f.z - a.f.z || a.d - b.d)[0];
    if (!hit) {
      setMeaning(null);
      return;
    }
    const head = svg.querySelector<SVGGElement>(`.bq-sway[data-index="${hit.i}"] .bq-breathe`);
    if (head && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      head.animate([{ scale: "1" }, { scale: "1.14" }, { scale: "0.96" }, { scale: "1.03" }, { scale: "1" }], {
        duration: 650,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    // Position the label above the flower, in wrapper pixels.
    const screen = new DOMPoint(hit.f.x * FRAME.width, hit.f.y * FRAME.height).matrixTransform(ctm);
    const box = host.getBoundingClientRect();
    setMeaning({ i: hit.i, x: screen.x - box.left, y: screen.y - box.top });
    onFlowerTap?.(hit.f, e.clientX, e.clientY, getColor(hit.f.type, hit.f.color).petal);
  };

  const tapped = meaning ? flowers[meaning.i] : null;
  const def = tapped ? CATALOG[tapped.type] : null;

  return (
    <div ref={wrap} className={`relative ${wrapperClassName ?? ""}`} onClick={onClick}>
      <Bouquet {...bouquet} />
      {meaning && tapped && def && (
        <div
          key={`${meaning.i}-${meaning.x}`}
          className="pointer-events-none absolute z-10 w-max max-w-[15rem] -translate-x-1/2 -translate-y-[calc(100%+1.6rem)] rounded-xl bg-surface/95 px-3.5 py-2 text-center shadow-[0_2px_4px_rgb(60_20_30/0.1),0_12px_28px_-10px_rgb(60_20_30/0.35)] backdrop-blur motion-safe:animate-[vb-open_260ms_cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: meaning.x, top: meaning.y }}
        >
          <p className="font-display text-[1.05rem] leading-tight italic">
            {def.colors[tapped.color]?.label} {def.name.toLowerCase()}
          </p>
          <p className="text-[0.82rem] text-ink-soft">{def.meanings.join(" · ")}</p>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {def ? `${def.name}: ${def.meanings.join(", ")}` : ""}
      </p>
      {/* What tapping shows, for keyboard and screen-reader visitors too. */}
      <ul className="sr-only" aria-label="What these flowers mean">
        {[...new Set(flowers.map((f) => f.type))].map((t) => (
          <li key={t}>
            {CATALOG[t].name}: {CATALOG[t].meanings.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
