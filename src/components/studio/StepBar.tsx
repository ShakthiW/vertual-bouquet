"use client";

import { STEPS, type Step } from "./state";

export const STEP_LABELS: Record<Step, string> = {
  flowers: "Flowers",
  arrange: "Arrange",
  wrap: "Wrap",
  card: "Card",
  preview: "Preview",
};

type Props = {
  current: Step;
  /** Steps after Flowers stay locked until there is something to arrange. */
  unlocked: boolean;
  onGo: (step: Step) => void;
};

/** Desktop: a stepper with connectors. Done steps show a tick and stay clickable. */
export function StepBar({ current, unlocked, onGo }: Props) {
  const at = STEPS.indexOf(current);
  return (
    <nav aria-label="Steps" className="hidden md:block">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const locked = i > 0 && !unlocked;
          const state = i === at ? "current" : i < at ? "done" : "upcoming";
          return (
            <li key={step} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`mx-1.5 h-px w-5 transition-colors duration-300 lg:mx-2 lg:w-9 ${i <= at ? "bg-accent/60" : "bg-ink/15"}`}
                />
              )}
              <button
                type="button"
                disabled={locked}
                aria-current={state === "current" ? "step" : undefined}
                onClick={() => onGo(step)}
                className="group flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-[background-color,opacity] duration-150 hover:bg-ink/[0.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span
                  className={`grid size-6 place-items-center rounded-full text-[0.72rem] font-semibold tabular-nums transition-colors duration-300 ${
                    state === "current"
                      ? "bg-accent text-accent-ink shadow-[0_2px_8px_-2px_rgb(184_50_94/0.6)]"
                      : state === "done"
                        ? "bg-accent/12 text-accent"
                        : "text-ink-soft ring-1 ring-ink/20"
                  }`}
                >
                  {state === "done" ? <Tick /> : i + 1}
                </span>
                <span
                  className={`text-sm transition-colors ${
                    state === "current" ? "font-semibold text-ink" : "text-ink-soft group-hover:text-ink"
                  }`}
                >
                  {STEP_LABELS[step]}
                  {state === "done" && <span className="sr-only"> (done)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Phones: where you are, in words, over a segmented progress bar. */
export function StepProgress({ current }: { current: Step }) {
  const at = STEPS.indexOf(current);
  return (
    <div className="md:hidden">
      <p className="text-center text-[0.8rem] text-ink-soft" aria-live="polite">
        Step {at + 1} of {STEPS.length} · <span className="font-semibold text-ink">{STEP_LABELS[current]}</span>
      </p>
      <div className="mt-1.5 flex gap-1" aria-hidden>
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= at ? "bg-accent" : "bg-ink/12"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
      <path d="M2.5 6.4 5 8.8l4.5-5.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
