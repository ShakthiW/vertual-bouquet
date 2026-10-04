"use client";

import { PAPERS, PAPER_IDS, RIBBONS, RIBBON_IDS, STYLE_IDS, type StyleId } from "@/lib/bouquet/wrap";
import { useStudio } from "./StudioProvider";
import { Pill, StepHeading, Swatch } from "./ui";

const STYLE_LABELS: Record<StyleId, { label: string; hint: string }> = {
  romantic: { label: "Romantic", hint: "Soft, full colour" },
  garden: { label: "Garden", hint: "Fresh, a little wild" },
  ink: { label: "Ink", hint: "Black-and-white line art" },
};

export function StepWrap() {
  const { state, dispatch } = useStudio();
  const { style, wrap } = state.draft;

  return (
    <section aria-labelledby="step-wrap" className="flex flex-col gap-7">
      <div id="step-wrap">
        <StepHeading title="Wrap it up" hint="Pick a style, the paper and the ribbon." />
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium text-ink-soft">Style</legend>
        <div className="flex flex-wrap gap-2">
          {STYLE_IDS.map((id) => (
            <Pill key={id} active={style === id} onClick={() => dispatch({ type: "setStyle", style: id })} title={STYLE_LABELS[id].hint}>
              {STYLE_LABELS[id].label}
            </Pill>
          ))}
        </div>
        <p className="text-sm text-ink-soft">{STYLE_LABELS[style].hint}.</p>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium text-ink-soft">
          Paper <span className="text-ink">· {PAPERS[wrap.paper].label}</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {PAPER_IDS.map((id) => (
            <Swatch
              key={id}
              color={PAPERS[id].paper}
              label={`${PAPERS[id].label} paper`}
              selected={wrap.paper === id}
              onClick={() => dispatch({ type: "setPaper", paper: id })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium text-ink-soft">
          Ribbon <span className="text-ink">· {RIBBONS[wrap.ribbon].label}</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {RIBBON_IDS.map((id) => (
            <Swatch
              key={id}
              color={RIBBONS[id].ribbon}
              label={`${RIBBONS[id].label} ribbon`}
              selected={wrap.ribbon === id}
              onClick={() => dispatch({ type: "setRibbon", ribbon: id })}
            />
          ))}
        </div>
      </fieldset>
    </section>
  );
}
