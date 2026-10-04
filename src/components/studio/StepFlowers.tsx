"use client";

import { useState } from "react";
import { FlowerIcon } from "@/components/bouquet/Flower";
import { LIMITS } from "@/lib/bouquet/limits";
import { FLOWERS, defaultColor, type FlowerDef } from "@/lib/flowers/catalog";
import { useStudio } from "./StudioProvider";
import { pickCount } from "./state";
import { StepHeading, Swatch } from "./ui";

export function StepFlowers() {
  const { state } = useStudio();
  const n = state.draft.picks.length;
  const full = n >= LIMITS.maxFlowers;

  return (
    <section aria-labelledby="step-flowers" className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div id="step-flowers">
          <StepHeading
            title="Pick your flowers"
            hint={
              full
                ? "That's a full bouquet."
                : n >= 6
                  ? "Looking lovely. Ready to arrange?"
                  : "Tap a flower to add it. Each one means something."
            }
          />
        </div>
        <p className="shrink-0 font-display text-xl tabular-nums" aria-live="polite">
          {n}
          <span className="text-ink-soft"> / {LIMITS.maxFlowers}</span>
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {FLOWERS.map((def) => (
          <FlowerCard key={def.id} def={def} disabled={full} />
        ))}
      </ul>
      <p className="text-sm text-ink-soft">Greenery is added for you, so the bouquet looks full.</p>
    </section>
  );
}

function FlowerCard({ def, disabled }: { def: FlowerDef; disabled: boolean }) {
  const { state, dispatch } = useStudio();
  const [color, setColor] = useState(defaultColor(def.id));
  const count = pickCount(state.draft, def.id);
  const colors = Object.entries(def.colors);

  return (
    <li
      className={`relative flex flex-col rounded-2xl border bg-surface p-3 transition-[border-color,box-shadow] duration-200 ${
        count ? "border-accent/50 shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_12%,transparent)]" : "border-hairline"
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => dispatch({ type: "addPick", flower: def.id, color })}
        className="group flex flex-col items-start text-left disabled:cursor-not-allowed"
        aria-label={`Add a ${def.colors[color].label.toLowerCase()} ${def.name.toLowerCase()}: ${def.meanings.join(", ")}`}
      >
        <FlowerIcon
          type={def.id}
          color={color}
          className="mx-auto size-20 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 group-disabled:opacity-50"
        />
        <span className="mt-2 font-display text-[1.15rem] leading-tight">{def.name}</span>
        <span className="mt-0.5 text-[0.8rem] leading-snug text-ink-soft">{def.meanings.join(" · ")}</span>
      </button>

      {colors.length > 1 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label={`${def.name} colour`}>
          {colors.map(([id, c]) => (
            <Swatch key={id} size="sm" color={c.petal} label={c.label} selected={color === id} onClick={() => setColor(id)} />
          ))}
        </div>
      )}

      {count > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => dispatch({ type: "removePick", flower: def.id })}
            aria-label={`Remove a ${def.name.toLowerCase()}`}
            className="grid size-7 place-items-center rounded-full bg-canvas text-lg leading-none text-ink-soft ring-1 ring-hairline transition-transform hover:text-ink active:scale-90"
          >
            −
          </button>
          <span className="grid size-7 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-ink tabular-nums">
            {count}
          </span>
        </div>
      )}
    </li>
  );
}
