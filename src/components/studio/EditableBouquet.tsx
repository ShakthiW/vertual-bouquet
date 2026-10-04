"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { FRAME, HEAD_SCALE } from "@/lib/bouquet/limits";
import { CATALOG } from "@/lib/flowers/catalog";
import { useStudio } from "./StudioProvider";
import { visualOf } from "./state";

const NUDGE = 0.012;

/**
 * The bouquet, plus an invisible layer of hit circles on top: drag to move,
 * tap to select, arrow keys to nudge when a flower has focus.
 */
export function EditableBouquet({ className }: { className?: string }) {
  const { state, dispatch } = useStudio();
  const { draft, selected } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ index: number; dx: number; dy: number; moved: boolean; startX: number; startY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const toFrame = (e: PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const onDown = (index: number) => (e: PointerEvent<SVGCircleElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const f = draft.flowers[index];
    const p = toFrame(e);
    drag.current = { index, dx: p.x - f.x * FRAME.width, dy: p.y - f.y * FRAME.height, moved: false, startX: e.clientX, startY: e.clientY };
    dispatch({ type: "select", index });
  };

  const onMove = (e: PointerEvent<SVGCircleElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved) {
      // A tap that wobbles a pixel is still a tap, not an undo step.
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
      d.moved = true;
      setDragging(true);
      dispatch({ type: "beginEdit" });
    }
    const p = toFrame(e);
    dispatch({ type: "moveFlower", index: d.index, x: (p.x - d.dx) / FRAME.width, y: (p.y - d.dy) / FRAME.height });
  };

  const onUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const onKey = (index: number) => (e: KeyboardEvent<SVGCircleElement>) => {
    const step = { ArrowLeft: [-NUDGE, 0], ArrowRight: [NUDGE, 0], ArrowUp: [0, -NUDGE], ArrowDown: [0, NUDGE] }[e.key];
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      dispatch({ type: "removeFlower", index });
      return;
    }
    if (!step) return;
    e.preventDefault();
    const f = draft.flowers[index];
    dispatch({ type: "select", index });
    dispatch({ type: "beginEdit" });
    dispatch({ type: "moveFlower", index, x: f.x + step[0], y: f.y + step[1] });
  };

  // Hit circles in drawing order, so the flower on top is the one you grab.
  const hits = draft.flowers.map((f, i) => ({ f, i })).sort((a, b) => a.f.z - b.f.z);
  const sel = selected !== null ? draft.flowers[selected] : null;
  const radius = (f: (typeof draft.flowers)[number]) => 88 * HEAD_SCALE * CATALOG[f.type].baseSize * f.scale * 0.72;

  return (
    <div className={`relative ${className ?? ""}`}>
      <Bouquet data={visualOf(draft)} animated={false} className={`h-full w-full ${dragging ? "" : "bq-glide"}`} />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) dispatch({ type: "select", index: null });
        }}
      >
        <title>Your bouquet. Drag a flower to move it, or select one to change it.</title>
        {sel && (
          <circle
            className="studio-ring pointer-events-none"
            cx={sel.x * FRAME.width}
            cy={sel.y * FRAME.height}
            r={radius(sel) / 0.72 * 0.95}
          />
        )}
        {hits.map(({ f, i }) => {
          const def = CATALOG[f.type];
          return (
            <circle
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`${def.colors[f.color]?.label ?? ""} ${def.name}. Arrow keys move it, Delete removes it.`}
              aria-pressed={selected === i}
              cx={f.x * FRAME.width}
              cy={f.y * FRAME.height}
              r={radius(f)}
              className="studio-hit"
              onPointerDown={onDown(i)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey(i)}
              onFocus={() => dispatch({ type: "select", index: i })}
            />
          );
        })}
      </svg>
    </div>
  );
}
