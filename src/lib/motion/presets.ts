// Every spring, duration and stagger in the app lives here. Tune in
// /dev/playground, then copy the winning values back.

export const spring = {
  bloom: { type: "spring", stiffness: 120, damping: 14 },
  gentle: { type: "spring", stiffness: 80, damping: 18 },
  snappy: { type: "spring", stiffness: 300, damping: 24 },
  settle: { type: "spring", stiffness: 60, damping: 10 },
} as const;

/** Seconds. */
export const reveal = {
  sealCrack: 0.3,
  flapOpen: 0.5,
  envelopeExit: 0.4,
  stemDraw: 0.4,
  flowerStagger: 0.15,
  fillerStagger: 0.04,
  wrapIn: 0.5,
  ribbonDraw: 0.6,
  nameWrite: 1.0,
  cardIn: 0.6,
  signWrite: 0.8,
  skipAppearsAfter: 1.0,
  quickReplayTotal: 2.0,
} as const;

export const idle = {
  /** Degrees of sway either side of rest. */
  swayDeg: [1.4, 2.8],
  /** Seconds per half swing. */
  swayPeriod: [3, 5],
  /** Seconds between breeze gusts. */
  gustEvery: [8, 15],
  breathe: 0.02,
  particleCount: { mobile: 20, desktop: 40 },
} as const;

/** Deterministic per-flower motion so the same bouquet always moves the same way. */
export function swayFor(index: number) {
  // Golden-ratio spacing keeps neighbouring flowers out of phase.
  const t = (index * 0.618034) % 1;
  const u = (index * 0.414214 + 0.3) % 1;
  const [aMin, aMax] = idle.swayDeg;
  const [pMin, pMax] = idle.swayPeriod;
  return {
    amp: aMin + (aMax - aMin) * u,
    dur: pMin + (pMax - pMin) * t,
    delay: -(t * pMax),
  };
}

/**
 * The recipient's reveal, in seconds after the tap. One clock (--t) drives it.
 * These windows are handed to the CSS as variables (timelineVars), so this is
 * the only place the timing lives.
 */
export const timeline = {
  sealCrack: [0, 0.3],
  flapOpen: [0.3, 0.85],
  envelopeExit: [0.95, 1.4],
  bloom: [1.1, 4.1],
  nameWrite: [4.0, 5.0],
  cardIn: [4.8, 5.4],
  signWrite: [5.4, 6.2],
  buttonsIn: [6.2, 6.7],
  end: 6.7,
  skipAfter: 1.0,
  /** Return visits: start after the envelope and play the rest this much faster. */
  quick: { from: 1.1, speed: 2.7 },
} as const;

/** The timeline as CSS custom properties: --tl-<name>-a / --tl-<name>-b. */
export function timelineVars(): Record<string, string> {
  const vars: Record<string, string> = { "--tl-end": String(timeline.end) };
  const windows = {
    seal: timeline.sealCrack,
    flap: timeline.flapOpen,
    exit: timeline.envelopeExit,
    bloom: timeline.bloom,
    name: timeline.nameWrite,
    card: timeline.cardIn,
    sign: timeline.signWrite,
    btn: timeline.buttonsIn,
  };
  for (const [name, [a, b]] of Object.entries(windows)) {
    vars[`--tl-${name}-a`] = String(a);
    vars[`--tl-${name}-b`] = String(b);
  }
  return vars;
}
