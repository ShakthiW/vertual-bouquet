"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LivingBouquet } from "@/components/bouquet/LivingBouquet";
import { Petals, type PetalsHandle } from "@/components/bouquet/Petals";
import { Card } from "@/components/card/Card";
import type { BouquetInput } from "@/lib/bouquet/schema";
import { CATALOG, getColor } from "@/lib/flowers/catalog";
import { timeline, timelineVars } from "@/lib/motion/presets";
import "./reveal.css";

type State = "loading" | "sealed" | "playing" | "done";

type Props = {
  bouquet: BouquetInput;
  /** Return visit: skip the envelope and play the bloom quickly, without a tap. */
  quick?: boolean;
  /** Called once, on the first tap that opens the envelope. */
  onOpen?: () => void;
  /** Called when the reveal finishes (or is skipped). */
  onDone?: () => void;
  /** Buttons shown at the end. */
  actions?: ReactNode;
};

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The reveal: sealed envelope, seal cracks, flap opens, the bouquet blooms,
 * their name writes itself, the card slides in. One clock drives it all: a
 * rAF loop writes --t (seconds since the tap) to the root, and reveal.css
 * derives every element's state from it. React only renders state changes.
 */
export function RevealSequence({ bouquet, quick = false, onOpen, onDone, actions }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const opened = useRef(false);
  const [state, setState] = useState<State>("loading");
  const petals = useRef<PetalsHandle>(null);
  const { card } = bouquet;
  const initial = card.from.trim()[0]?.toUpperCase() ?? "";
  // Falling petals in the bouquet's own colours (blooms, not greenery).
  const petalColors = useMemo(() => {
    const blooms = bouquet.flowers.filter((f) => CATALOG[f.type].category !== "filler");
    const colors = blooms.flatMap((f) => [getColor(f.type, f.color).petal, getColor(f.type, f.color).light]);
    return [...new Set(colors)].slice(0, 8);
  }, [bouquet.flowers]);

  const setT = (t: number) => root.current?.style.setProperty("--t", t.toFixed(3));

  const finish = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setT(timeline.end);
    setState("done");
    onDone?.();
  }, [onDone]);

  const play = useCallback(
    (from: number, speed: number) => {
      cancelAnimationFrame(frame.current);
      if (reducedMotion()) {
        finish();
        return;
      }
      setState("playing");
      let t = from;
      let last = performance.now();
      setT(t);
      const tick = (now: number) => {
        // Cap each step so a backgrounded tab doesn't jump straight to the end.
        t += Math.min(0.05, (now - last) / 1000) * speed;
        last = now;
        if (t >= timeline.end) {
          finish();
          return;
        }
        setT(t);
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [finish],
  );

  // Ready once the handwriting fonts have loaded, so nothing reflows mid-reveal.
  useEffect(() => {
    let alive = true;
    const minWait = new Promise((r) => setTimeout(r, 250));
    Promise.all([document.fonts?.ready, minWait]).then(() => {
      if (!alive) return;
      if (quick) play(timeline.quick.from, timeline.quick.speed);
      else setState("sealed");
    });
    return () => {
      alive = false;
      cancelAnimationFrame(frame.current);
    };
  }, [quick, play]);

  const open = () => {
    if (state !== "sealed") return;
    navigator.vibrate?.(12);
    if (!opened.current) {
      opened.current = true;
      onOpen?.();
    }
    play(0, 1);
  };

  return (
    <div
      ref={root}
      className="rv"
      data-state={state}
      data-look={bouquet.style}
      style={timelineVars() as CSSProperties}
    >
      <div className="rv-scene" aria-hidden={state === "sealed" || state === "loading"}>
        <p className="rv-name">For {card.to}</p>
        <div className="rv-bouquet">
          <LivingBouquet
            data={bouquet}
            bloom={{ from: 0, to: 0.55 }}
            wrapIn
            alive={state === "done"}
            wrapperClassName="h-full w-full"
            className="h-full w-full"
            onFlowerTap={(_, x, y, color) => petals.current?.burst(x, y, color, 2)}
          />
        </div>
        <div className="rv-card">
          <Card {...card} />
        </div>
      </div>

      <Petals ref={petals} colors={petalColors} active={state === "done"} className="rv-petals" />

      <div className="rv-intro">
        <p className="rv-from">{card.from} sent you something</p>
        <div className="rv-float">
          <button
            type="button"
            className="rv-envelope"
            onClick={open}
            disabled={state === "loading"}
            aria-label={`Open your bouquet from ${card.from}`}
          >
            <span className="rv-env-back" />
            <span className="rv-env-front">
              <span className="rv-env-to">For {card.to}</span>
            </span>
            <span className="rv-env-flap" />
            <span className="rv-seal" aria-hidden>
              <span className="rv-seal-half rv-seal-half--l" />
              <span className="rv-seal-half rv-seal-half--r" />
              <span className="rv-seal-mark">{initial}</span>
            </span>
          </button>
        </div>
        <p className="rv-hint" aria-live="polite">
          {state === "loading" ? "One moment…" : "Tap the envelope to open"}
        </p>
      </div>

      <button
        type="button"
        className="rv-skip rounded-full px-3 py-1.5 text-sm text-ink-soft hover:text-ink"
        onClick={finish}
      >
        Skip
      </button>

      <div className="rv-actions">
        {state === "done" && (
          <>
            <button
              type="button"
              onClick={() => play(0, 1)}
              aria-label="Replay"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-hairline bg-surface/90 px-3.5 font-medium text-ink backdrop-blur transition-transform active:scale-[0.97] sm:px-5"
            >
              <span aria-hidden>↻</span>
              <span className="hidden sm:inline" aria-hidden>
                Replay
              </span>
            </button>
            {actions}
          </>
        )}
      </div>
    </div>
  );
}
