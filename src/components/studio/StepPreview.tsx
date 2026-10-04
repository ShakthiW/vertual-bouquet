"use client";

import { useState } from "react";
import { RevealPreview } from "./RevealPreview";
import { useStudio } from "./StudioProvider";
import { readiness, visualOf } from "./state";
import { PrimaryButton, StepHeading } from "./ui";

export function StepPreview() {
  const { state, dispatch } = useStudio();
  const r = readiness(state.draft);
  const [watching, setWatching] = useState(false);
  const { card } = state.draft;
  // Before the card is finished, preview with stand-in names.
  const preview = r.ok
    ? r.input
    : {
        ...visualOf(state.draft),
        card: { ...card, to: card.to.trim() || "them", from: card.from.trim() || "Someone" },
      };

  return (
    <section aria-labelledby="step-preview" className="flex flex-col gap-5">
      <div id="step-preview">
        <StepHeading title="How it looks" hint="This is the bouquet and card they'll open." />
      </div>

      {r.ok ? (
        <p className="rounded-2xl bg-sage/12 p-4 text-[0.95rem] text-ink">
          All set for {r.input.card.to}. When you send it, they get a link that opens with a sealed envelope, then the
          bouquet blooms and your card slides in.
        </p>
      ) : (
        <p className="rounded-2xl bg-accent/8 p-4 text-[0.95rem] text-ink" role="status">
          {r.reason}{" "}
          <button
            type="button"
            className="font-medium text-accent underline underline-offset-4"
            onClick={() => dispatch({ type: "goto", step: r.step })}
          >
            Fix it
          </button>
        </p>
      )}

      <PrimaryButton onClick={() => setWatching(true)} className="self-start">
        <span aria-hidden>▶</span> Watch it open
      </PrimaryButton>
      {watching && <RevealPreview bouquet={preview} onClose={() => setWatching(false)} />}

      <ul className="grid gap-1 text-sm text-ink-soft">
        {(
          [
            ["flowers", "Change the flowers"],
            ["arrange", "Rearrange"],
            ["wrap", "Change the wrap"],
            ["card", "Edit the card"],
          ] as const
        ).map(([step, label]) => (
          <li key={step}>
            <button
              type="button"
              className="underline-offset-4 hover:text-ink hover:underline"
              onClick={() => dispatch({ type: "goto", step })}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
