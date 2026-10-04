"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { Card } from "@/components/card/Card";
import { createBouquetAction } from "@/lib/actions";
import { newSeed } from "@/lib/arrange/prng";
import { rememberSent } from "@/lib/local";
import { EditableBouquet } from "./EditableBouquet";
import { SendSheet } from "./SendSheet";
import { StepArrange } from "./StepArrange";
import { StepCard } from "./StepCard";
import { StepFlowers } from "./StepFlowers";
import { StepPreview } from "./StepPreview";
import { StepWrap } from "./StepWrap";
import { useStudio } from "./StudioProvider";
import { readiness, STEPS, visualOf, type Step } from "./state";
import { StepBar, StepProgress } from "./StepBar";
import { GhostButton, PrimaryButton } from "./ui";
import { SITE } from "@/lib/site";

const NEXT: Record<Step, string> = {
  flowers: "Arrange them",
  arrange: "Wrap it",
  wrap: "Write the card",
  card: "Preview",
  preview: "Send",
};

export function Studio() {
  const { state, dispatch, ready, initialTo } = useStudio();
  const { draft } = state;
  const at = STEPS.indexOf(draft.step);
  const hasFlowers = draft.flowers.length > 0;
  const go = (step: Step) => dispatch({ type: "goto", step });

  // On a phone the bouquet sits above the panel: bring it back into view on each new step.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [draft.step]);

  return (
    <div className={`flex min-h-svh flex-col transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`} aria-busy={!ready}>
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4 border-b border-hairline bg-canvas/90 px-4 py-2.5 backdrop-blur sm:px-6">
        <Link
          href="/"
          className="justify-self-start font-display text-[0.95rem] whitespace-nowrap italic text-ink-soft transition-colors hover:text-ink sm:text-lg"
        >
          {SITE.name}
        </Link>
        <div className="min-w-0">
          {draft.sent ? (
            <p className="text-center text-sm font-medium text-accent">Sent 🌷</p>
          ) : (
            <>
              <StepBar current={draft.step} unlocked={hasFlowers} onGo={go} />
              <StepProgress current={draft.step} />
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 justify-self-end rounded-full px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink disabled:invisible"
          disabled={!hasFlowers && !draft.card.message}
          onClick={() => dispatch({ type: "reset", seed: newSeed(), to: initialTo })}
          title="Start a new bouquet (you can undo this)"
        >
          <span aria-hidden className="text-base leading-none">↺</span>
          <span className="hidden sm:inline">Start over</span>
          <span className="sr-only sm:hidden">Start over</span>
        </button>
      </header>

      <main className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
        <Stage />
        <div className="flex flex-col border-hairline lg:border-l">
          <div className="flex-1 px-5 py-5 sm:px-8 sm:py-8">
            {draft.sent ? (
              <SendSheet />
            ) : (
              <>
                {draft.step === "flowers" && <StepFlowers />}
                {draft.step === "arrange" && <StepArrange />}
                {draft.step === "wrap" && <StepWrap />}
                {draft.step === "card" && <StepCard />}
                {draft.step === "preview" && <StepPreview />}
              </>
            )}
          </div>
          {!draft.sent && <StepNav at={at} hasFlowers={hasFlowers} go={go} />}
        </div>
      </main>
    </div>
  );
}

function StepNav({ at, hasFlowers, go }: { at: number; hasFlowers: boolean; go: (s: Step) => void }) {
  const { state, dispatch } = useStudio();
  const step = STEPS[at];
  const last = at === STEPS.length - 1;
  const ready = readiness(state.draft);
  const [sending, startSending] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    if (!ready.ok) return;
    setError(null);
    startSending(async () => {
      const res = await createBouquetAction(ready.input);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      const at = new Date().toISOString();
      rememberSent(res.id, { manageToken: res.manageToken, to: ready.input.card.to, at });
      dispatch({ type: "sent", id: res.id, manageToken: res.manageToken, at });
    });
  };

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-hairline bg-canvas/95 px-5 py-3 backdrop-blur sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <GhostButton disabled={at === 0} onClick={() => go(STEPS[at - 1])}>
          ← Back
        </GhostButton>
        {last ? (
          <PrimaryButton disabled={!ready.ok || sending} onClick={send} aria-busy={sending}>
            {sending ? "Sealing…" : `${NEXT[step]} 🌷`}
          </PrimaryButton>
        ) : (
          <PrimaryButton disabled={!hasFlowers} onClick={() => go(STEPS[at + 1])}>
            {NEXT[step]} →
          </PrimaryButton>
        )}
      </div>
      {error && (
        <p role="alert" className="text-right text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

/** The bouquet itself: editable while arranging, with the card once there is one. */
function Stage() {
  const { state } = useStudio();
  const { draft } = state;
  const showCard = draft.step === "card" || draft.step === "preview";

  return (
    <div className="relative flex h-[50svh] min-h-[22rem] items-center justify-center overflow-hidden bg-[radial-gradient(60%_55%_at_50%_42%,#fff3ec,transparent_75%),#f8e8e8] lg:sticky lg:top-0 lg:h-[calc(100svh-3.3rem)]">
      {draft.flowers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <Bouquet data={visualOf(draft)} animated={false} className="h-[34svh] w-auto opacity-40" label="An empty wrap" />
          <p className="font-display text-xl text-ink-soft">Your bouquet will appear here.</p>
        </div>
      ) : draft.step === "arrange" ? (
        <EditableBouquet className="aspect-[1000/1200] h-[92%]" />
      ) : (
        <div className={`relative aspect-[1000/1200] h-[92%] transition-transform duration-500 ${showCard ? "lg:-translate-x-[12%]" : ""}`}>
          <Bouquet data={visualOf(draft)} className="bq-glide h-full w-full" />
          {showCard && (
            <Card
              {...draft.card}
              placeholders={draft.step === "card"}
              className="absolute right-[-8%] bottom-[9%] w-[min(17rem,58%)] -rotate-3 text-[0.78rem] sm:text-[0.9rem] lg:right-[-22%]"
            />
          )}
        </div>
      )}
    </div>
  );
}
