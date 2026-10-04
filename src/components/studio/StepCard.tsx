"use client";

import { LIMITS } from "@/lib/bouquet/limits";
import { CARD_FONTS, CARD_FONT_IDS } from "@/lib/bouquet/wrap";
import { useStudio } from "./StudioProvider";
import { Pill, StepHeading } from "./ui";

const field =
  "w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink-soft/60 transition-[border-color,box-shadow] focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15";

export function StepCard() {
  const { state, dispatch } = useStudio();
  const { card } = state.draft;
  const set = (patch: Partial<typeof card>) => dispatch({ type: "setCard", patch });
  const left = LIMITS.messageLength - card.message.length;

  return (
    <section aria-labelledby="step-card" className="flex flex-col gap-5">
      <div id="step-card">
        <StepHeading title="Write the card" hint="Their name goes on the envelope, too." />
      </div>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink-soft">Who is it for?</span>
        <input
          className={field}
          value={card.to}
          onChange={(e) => set({ to: e.target.value })}
          placeholder="Their name"
          maxLength={LIMITS.nameLength}
          autoComplete="off"
          enterKeyHint="next"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="flex justify-between text-sm font-medium text-ink-soft">
          Message
          <span className={`tabular-nums ${left < 40 ? "text-accent" : ""}`} aria-live="polite">
            {left < 100 ? `${left} left` : ""}
          </span>
        </span>
        <textarea
          className={`${field} min-h-32 resize-y leading-relaxed`}
          value={card.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="Write something they'd love to hear…"
          maxLength={LIMITS.messageLength}
          rows={4}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink-soft">From</span>
        <input
          className={field}
          value={card.from}
          onChange={(e) => set({ from: e.target.value })}
          placeholder="Your name"
          maxLength={LIMITS.nameLength}
          autoComplete="given-name"
          enterKeyHint="done"
        />
      </label>

      <fieldset>
        <legend className="mb-2.5 text-sm font-medium text-ink-soft">Handwriting</legend>
        <div className="flex flex-wrap gap-2">
          {CARD_FONT_IDS.map((id) => (
            <Pill
              key={id}
              active={card.font === id}
              onClick={() => set({ font: id })}
              className="text-lg"
              style={{ fontFamily: CARD_FONTS[id].cssVar }}
            >
              {card.to ? `For ${card.to}` : "For you"}
            </Pill>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
