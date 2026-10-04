"use client";

import { newSeed } from "@/lib/arrange/prng";
import { CATALOG } from "@/lib/flowers/catalog";
import { useStudio } from "./StudioProvider";
import { Pill, StepHeading, Swatch } from "./ui";

export function StepArrange() {
  const { state, dispatch } = useStudio();
  const { draft, selected, past } = state;
  const f = selected !== null ? draft.flowers[selected] : null;
  const def = f ? CATALOG[f.type] : null;

  const nudge = (dx: number, dy: number) => {
    if (selected === null || !f) return;
    dispatch({ type: "beginEdit" });
    dispatch({ type: "moveFlower", index: selected, x: f.x + dx, y: f.y + dy });
  };

  return (
    <section aria-labelledby="step-arrange" className="flex flex-col gap-6">
      <div id="step-arrange">
        <StepHeading title="Arrange it" hint="It's arranged for you. Shuffle for another look, or drag any flower to move it." />
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill onClick={() => dispatch({ type: "shuffle", seed: newSeed() })}>
          <span aria-hidden>🔀</span> Shuffle
        </Pill>
        <Pill onClick={() => dispatch({ type: "arrange" })}>
          <span aria-hidden>✨</span> Arrange for me
        </Pill>
        <Pill onClick={() => dispatch({ type: "undo" })} disabled={past.length === 0}>
          <span aria-hidden>↶</span> Undo
        </Pill>
      </div>

      {f && def && selected !== null ? (
        <div className="flex flex-col gap-5 rounded-2xl border border-hairline bg-surface p-4" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xl">
              {def.colors[f.color]?.label} {def.name.toLowerCase()}
            </p>
            <p className="text-sm text-ink-soft">{def.meanings.join(" · ")}</p>
          </div>

          {Object.keys(def.colors).length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Colour">
              {Object.entries(def.colors).map(([id, c]) => (
                <Swatch
                  key={id}
                  color={c.petal}
                  label={c.label}
                  selected={f.color === id}
                  onClick={() => dispatch({ type: "updateFlower", index: selected, patch: { color: id } })}
                />
              ))}
            </div>
          )}

          <label className="grid gap-1.5 text-sm">
            <span className="flex justify-between text-ink-soft">
              Tilt <span className="tabular-nums">{Math.round(f.rotation)}°</span>
            </span>
            <input
              type="range"
              min={-45}
              max={45}
              step={1}
              value={f.rotation}
              onPointerDown={() => dispatch({ type: "beginEdit" })}
              onKeyDown={() => dispatch({ type: "beginEdit" })}
              onChange={(e) =>
                dispatch({ type: "updateFlower", index: selected, live: true, patch: { rotation: Number(e.target.value) } })
              }
              className="accent-accent"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="flex justify-between text-ink-soft">
              Size <span className="tabular-nums">{Math.round(f.scale * 100)}%</span>
            </span>
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.01}
              value={f.scale}
              onPointerDown={() => dispatch({ type: "beginEdit" })}
              onKeyDown={() => dispatch({ type: "beginEdit" })}
              onChange={(e) =>
                dispatch({ type: "updateFlower", index: selected, live: true, patch: { scale: Number(e.target.value) } })
              }
              className="accent-accent"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Pill onClick={() => dispatch({ type: "reorder", index: selected, to: "front" })}>Bring forward</Pill>
              <Pill onClick={() => dispatch({ type: "reorder", index: selected, to: "back" })}>Send back</Pill>
            </div>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Nudge">
              <span />
              <NudgeButton label="Up" onClick={() => nudge(0, -0.012)}>↑</NudgeButton>
              <span />
              <NudgeButton label="Left" onClick={() => nudge(-0.012, 0)}>←</NudgeButton>
              <NudgeButton label="Down" onClick={() => nudge(0, 0.012)}>↓</NudgeButton>
              <NudgeButton label="Right" onClick={() => nudge(0.012, 0)}>→</NudgeButton>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              onClick={() => dispatch({ type: "removeFlower", index: selected })}
            >
              Remove this flower
            </button>
            <button
              type="button"
              className="text-sm text-ink-soft underline-offset-4 hover:underline"
              onClick={() => dispatch({ type: "select", index: null })}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-hairline p-4 text-sm text-ink-soft">
          Tap a flower in the bouquet to change its colour, tilt or size.
        </p>
      )}
    </section>
  );
}

function NudgeButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={`Move ${label.toLowerCase()}`}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-lg border border-hairline bg-canvas text-sm text-ink-soft transition-transform hover:text-ink active:scale-90"
    >
      {children}
    </button>
  );
}
