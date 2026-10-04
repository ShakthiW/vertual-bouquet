// Placeholder flower art, drawn to the contract in docs/implementation-plan.md §3:
// head centred on (0,0) inside a -100..100 box, parts grouped by data-part, and
// colour only through the f-* / s-* / e-* classes. Final art replaces these
// components one by one without touching the renderer.

import type { ReactNode } from "react";
import type { FlowerId } from "../catalog";
import { GOLDEN_ANGLE, petal, rand, Ring } from "./shapes";

type ArtProps = { variant: number };

function Rose({ variant: v }: ArtProps) {
  const o = v * 13;
  const outer = [92, 85, 90, 83, 88];
  const mid = [64, 58, 62, 56, 60];
  return (
    <>
      <g data-part="petals-outer">
        {outer.map((len, i) => (
          <path key={i} className="f-shade e-shade" d={petal(len, len * 0.72)} transform={`rotate(${o + i * 72 + (i % 2) * 6})`} />
        ))}
        {outer.map((len, i) => (
          <path key={i} className="f-petal e-shade" d={petal(len - 9, len * 0.64)} transform={`rotate(${o + 36 + i * 72 - (i % 2) * 5})`} />
        ))}
      </g>
      <g data-part="petals-inner">
        {mid.map((len, i) => (
          <path key={i} className="f-shade e-shade" d={petal(len, len * 0.78)} transform={`rotate(${o + 18 + i * 72})`} />
        ))}
        <path className="f-petal e-shade" d="M-44 6 C-48 -30 -10 -50 22 -40 C46 -30 50 0 34 20 C14 42 -34 40 -44 6Z" transform={`rotate(${o * 2})`} />
      </g>
      <g data-part="center" transform={`rotate(${o * 2})`}>
        <path className="f-shade" d="M-30 10 C-34 -20 -6 -36 18 -26 C34 -18 34 6 20 18 C4 30 -22 28 -30 10Z" />
        <path className="f-petal" d="M-20 8 C-22 -12 0 -22 14 -14 C24 -6 20 10 8 14 C-4 18 -18 16 -20 8Z" />
        <path
          className="s-shade"
          strokeWidth={2.6}
          strokeLinecap="round"
          d="M-12 8 C-14 -6 2 -14 10 -6 C16 2 8 10 0 8 M-34 18 C-20 32 10 32 26 16 M-38 -4 C-34 -28 -8 -40 16 -34"
        />
      </g>
    </>
  );
}

function Peony({ variant: v }: ArtProps) {
  const o = v * 9;
  return (
    <>
      <g data-part="petals-outer">
        <Ring n={8} d={petal(96, 52, "ruffle")} className="f-shade e-shade" offset={o} />
        <Ring n={8} d={petal(88, 48, "ruffle")} className="f-petal e-shade" offset={22.5 + o} />
      </g>
      <g data-part="petals-inner">
        <Ring n={9} d={petal(70, 42, "ruffle")} className="f-light e-shade" offset={8 + o} />
        <Ring n={10} d={petal(54, 34, "ruffle")} className="f-petal e-shade" offset={26 + o} />
        <Ring n={8} d={petal(38, 26, "ruffle")} className="f-shade e-shade" offset={4 + o} />
        <Ring n={7} d={petal(26, 20, "ruffle")} className="f-light e-shade" offset={30 + o} />
      </g>
      <g data-part="center">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} r={3.2} cx={0} cy={-9} className="f-center" transform={`rotate(${a + o})`} />
        ))}
      </g>
    </>
  );
}

function Ranunculus({ variant: v }: ArtProps) {
  const fills = ["f-shade", "f-petal", "f-light", "f-petal", "f-light", "f-petal", "f-shade"];
  return (
    <>
      <g data-part="petals-outer">
        {fills.slice(0, 3).map((cls, k) => {
          const len = 94 - k * 13;
          return <Ring key={k} n={11} d={petal(len, len * 0.5)} className={`${cls} e-shade`} offset={k * 17 + v * 7} />;
        })}
      </g>
      <g data-part="petals-inner">
        {fills.slice(3).map((cls, k) => {
          const len = 55 - k * 12;
          return <Ring key={k} n={k > 1 ? 7 : 9} d={petal(len, len * 0.55)} className={`${cls} e-shade`} offset={(k + 3) * 17 + v * 7} />;
        })}
      </g>
      <g data-part="center">
        <circle r={9} className="f-center" />
        <circle r={4.5} className="f-leaf-dark" />
      </g>
    </>
  );
}

function Tulip({ variant: v }: ArtProps) {
  const lean = v === 1 ? 6 : -4;
  return (
    <g transform={`rotate(${lean}) translate(0 12)`}>
      <g data-part="petals-outer">
        <path className="f-shade e-shade" d="M-36 26 C-50 -12 -32 -64 0 -82 C32 -64 50 -12 36 26 Z" />
        <path className="f-petal e-shade" d="M-4 40 C-54 32 -64 -22 -42 -66 C-24 -52 -8 -22 4 30 Z" />
        <path className="f-petal e-shade" d="M4 40 C54 32 64 -22 42 -66 C24 -52 8 -22 -4 30 Z" />
      </g>
      <g data-part="petals-inner">
        <path className="f-petal e-shade" d="M-32 40 C-48 4 -32 -50 0 -72 C32 -50 48 4 32 40 C14 50 -14 50 -32 40 Z" />
        <path className="f-light" opacity={0.75} d="M-8 -52 C-16 -22 -14 10 -5 32 C1 10 1 -22 -8 -52Z" />
      </g>
    </g>
  );
}

function Lily({ variant: v }: ArtProps) {
  const o = v * 10;
  const front = [60, 180, 300];
  return (
    <>
      <g data-part="petals-outer">
        <Ring n={3} d={petal(98, 40, "point")} className="f-shade e-shade" offset={o} />
      </g>
      <g data-part="petals-inner">
        <Ring n={3} d={petal(94, 38, "point")} className="f-petal e-shade" offset={60 + o} />
        {front.map((a) => (
          <g key={a} transform={`rotate(${a + o})`}>
            <path className="s-shade" strokeWidth={2.2} strokeLinecap="round" d="M0 -12 C2 -40 1 -60 0 -78" />
            <circle className="f-center-dark" r={2.4} cx={-7} cy={-30} />
            <circle className="f-center-dark" r={2} cx={6} cy={-38} />
            <circle className="f-center-dark" r={1.8} cx={-4} cy={-46} />
          </g>
        ))}
      </g>
      <g data-part="center">
        {[20, 80, 140, 200, 260, 320].map((a) => (
          <g key={a} transform={`rotate(${a + o})`}>
            <path className="s-stem" strokeWidth={2} d="M0 0 C3 -20 0 -38 0 -52" />
            <ellipse className="f-center" rx={4} ry={7} cx={0} cy={-55} />
          </g>
        ))}
        <circle r={6} className="f-leaf" />
      </g>
    </>
  );
}

function Camellia({ variant: v }: ArtProps) {
  const o = v * 15;
  return (
    <>
      <g data-part="petals-outer">
        <Ring n={6} d={petal(90, 68)} className="f-shade e-shade" offset={o} />
        <Ring n={6} d={petal(82, 62)} className="f-petal e-shade" offset={30 + o} />
      </g>
      <g data-part="petals-inner">
        <Ring n={5} d={petal(56, 46)} className="f-light e-shade" offset={12 + o} />
      </g>
      <g data-part="center">
        <circle r={21} className="f-center" />
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} r={3.4} cx={0} cy={-15} className="f-center-dark" transform={`rotate(${i * 22.5})`} />
        ))}
        <circle r={8} className="f-center-dark" />
      </g>
    </>
  );
}

function Sunflower({ variant: v }: ArtProps) {
  const n = v === 1 ? 20 : 22;
  return (
    <>
      <g data-part="petals-outer">
        <Ring n={n} d={petal(99, 20, "point")} className="f-shade" offset={180 / n} />
      </g>
      <g data-part="petals-inner">
        <Ring n={n} d={petal(92, 18, "point")} className="f-petal e-shade" />
      </g>
      <g data-part="center">
        <circle r={47} className="f-center" />
        {Array.from({ length: 80 }, (_, i) => {
          const rr = Math.sqrt((i + 0.5) / 80) * 42;
          const a = (i * GOLDEN_ANGLE * Math.PI) / 180;
          return (
            <circle
              key={i}
              r={2.6}
              cx={Math.round(Math.cos(a) * rr * 10) / 10}
              cy={Math.round(Math.sin(a) * rr * 10) / 10}
              className="f-center-dark"
            />
          );
        })}
      </g>
    </>
  );
}

function Daisy({ variant: v }: ArtProps) {
  const n = [20, 18, 22][v] ?? 20;
  return (
    <>
      <g data-part="petals-outer">
        <Ring n={n} d={petal(90, 15)} className="f-shade" offset={180 / n} />
      </g>
      <g data-part="petals-inner">
        <Ring n={n} d={petal(86, 14)} className="f-petal e-shade" />
      </g>
      <g data-part="center">
        <circle r={20} className="f-center" />
        {Array.from({ length: 26 }, (_, i) => {
          const rr = Math.sqrt((i + 0.5) / 26) * 16;
          const a = (i * GOLDEN_ANGLE * Math.PI) / 180;
          return (
            <circle
              key={i}
              r={1.7}
              cx={Math.round(Math.cos(a) * rr * 10) / 10}
              cy={Math.round(Math.sin(a) * rr * 10) / 10}
              className="f-center-dark"
            />
          );
        })}
      </g>
    </>
  );
}

const FMN_CLUSTERS = [
  [[0, 0], [-36, -14], [32, -20], [-12, -44], [22, 26], [-32, 28], [44, 10], [10, -72], [-44, -50]],
  [[0, 0], [-30, -30], [34, -8], [6, -52], [-40, 14], [24, 34], [44, -42], [-18, 40], [-52, -36]],
];

function ForgetMeNot({ variant: v }: ArtProps) {
  const pts = FMN_CLUSTERS[v] ?? FMN_CLUSTERS[0];
  return (
    <>
      <g data-part="leaves">
        {pts.slice(1).map(([x, y], i) => (
          <path key={i} className="s-stem" strokeWidth={2} d={`M0 22 Q${x * 0.4} ${(y + 22) * 0.6} ${x} ${y}`} />
        ))}
      </g>
      <g data-part="petals-outer">
        {pts.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 23}) scale(${i === 0 ? 1.1 : 0.85 + (i % 3) * 0.08})`}>
            <Ring n={5} d={petal(19, 15)} className="f-petal e-shade" />
            <circle r={6} className="f-center-dark" />
            <circle r={3.4} className="f-center" />
          </g>
        ))}
      </g>
    </>
  );
}

function Iris({ variant: v }: ArtProps) {
  const o = v === 1 ? 8 : 0;
  return (
    <g transform={`rotate(${o})`}>
      <g data-part="petals-outer">
        {[-30, 0, 30].map((a) => (
          <path key={a} className="f-shade e-shade" d={petal(74, 30, "point")} transform={`translate(0 -6) rotate(${a})`} />
        ))}
      </g>
      <g data-part="petals-inner">
        {[180, 122, 238].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path className="f-petal e-shade" d={petal(82, 40)} />
            <path className="s-shade" strokeWidth={1.6} d="M-10 -30 C-12 -50 -8 -66 -4 -74 M10 -30 C12 -50 8 -66 4 -74" />
            <ellipse className="f-center" rx={5} ry={16} cy={-30} />
          </g>
        ))}
      </g>
      <g data-part="center">
        <circle r={8} className="f-light" />
      </g>
    </g>
  );
}

function Orchid({ variant: v }: ArtProps) {
  const tilt = v === 1 ? 10 : -6;
  return (
    <g transform={`rotate(${tilt})`}>
      <g data-part="petals-outer">
        {[0, 128, 232].map((a) => (
          <path key={a} className="f-shade e-shade" d={petal(84, 30, "point")} transform={`rotate(${a})`} />
        ))}
      </g>
      <g data-part="petals-inner">
        {[70, -70].map((a) => (
          <path key={a} className="f-petal e-shade" d={petal(78, 64)} transform={`rotate(${a})`} />
        ))}
        <path className="f-light" opacity={0.6} d={petal(54, 34)} transform="rotate(70)" />
        <path className="f-light" opacity={0.6} d={petal(54, 34)} transform="rotate(-70)" />
      </g>
      <g data-part="center">
        <circle className="f-center" r={9} cx={-14} cy={18} />
        <circle className="f-center" r={9} cx={14} cy={18} />
        <path className="f-center e-shade" d="M0 8 C18 10 24 30 12 46 C6 54 -6 54 -12 46 C-24 30 -18 10 0 8Z" />
        <ellipse className="f-light" rx={8} ry={12} cy={-4} />
        <circle className="f-center-dark" r={3.5} cy={10} />
      </g>
    </g>
  );
}

function Spike({ dx, lean, len, seed }: { dx: number; lean: number; len: number; seed: number }) {
  const n = Math.round(len / 9);
  return (
    <g transform={`translate(${dx} 0) rotate(${lean} 0 96)`}>
      <path className="s-stem" strokeWidth={3} d={`M0 96 L0 ${96 - len}`} />
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const y = 96 - len * 0.32 - (len * 0.68 - 6) * t;
        const s = 1.15 - t * 0.6;
        const side = (i + seed) % 2 ? 1 : -1;
        return (
          <g key={i} transform={`translate(0 ${Math.round(y * 10) / 10}) scale(${Math.round(s * 100) / 100})`}>
            <ellipse className="f-shade e-shade" rx={9} ry={13} transform={`translate(${-8 * side} 2) rotate(${-26 * side})`} />
            <ellipse className="f-petal e-shade" rx={9} ry={13} transform={`translate(${8 * side} -3) rotate(${26 * side})`} />
            {i % 2 === 0 && <ellipse className="f-light" rx={5} ry={7} cy={-9} />}
          </g>
        );
      })}
    </g>
  );
}

function Lavender({ variant: v }: ArtProps) {
  const m = v === 1 ? -1 : 1;
  return (
    <g data-part="petals-outer">
      <Spike dx={-22 * m} lean={-12 * m} len={170} seed={0} />
      <Spike dx={22 * m} lean={10 * m} len={180} seed={1} />
      <Spike dx={0} lean={-2 * m} len={196} seed={0} />
    </g>
  );
}

function BabysBreath({ variant: v }: ArtProps) {
  const rnd = rand(17 + v * 101);
  const tips = Array.from({ length: 34 }, () => {
    const a = (-160 + rnd() * 140) * (Math.PI / 180);
    const d = 26 + rnd() * 74;
    return [Math.round(Math.cos(a) * d), Math.round(Math.sin(a) * d) + 12, 8 + rnd() * 5] as const;
  });
  return (
    <>
      <g data-part="leaves">
        {tips.map(([x, y], i) => (
          <path key={i} className="s-stem" strokeWidth={2} d={`M0 70 Q${Math.round(x * 0.3)} ${Math.round(y * 0.4 + 26)} ${x} ${y}`} />
        ))}
      </g>
      <g data-part="petals-outer">
        {tips.map(([x, y, s], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={s} className="f-shade" />
            <circle cx={x - 1} cy={y - 1} r={s * 0.82} className="f-petal" />
            <circle cx={x - 2} cy={y - 2} r={s * 0.35} className="f-light" />
          </g>
        ))}
      </g>
    </>
  );
}

function Eucalyptus({ variant: v }: ArtProps) {
  const bend = v === 1 ? -12 : 12;
  const leaves = Array.from({ length: 7 }, (_, k) => {
    const t = k / 6;
    const y = 74 - k * 26;
    const x = bend * Math.sin(t * Math.PI * 0.9);
    return { x, y, r: 23 - k * 2 };
  });
  return (
    <>
      <path className="s-stem" strokeWidth={3} d={`M0 98 Q${bend * 1.4} 0 ${bend * 0.3} -96`} />
      <g data-part="leaves">
        {leaves.map(({ x, y, r }, k) => (
          <g key={k}>
            <circle className={`${k % 2 ? "f-shade" : "f-petal"} e-shade`} cx={Math.round(x - r * 0.9)} cy={y} r={r} />
            <circle className={`${k % 2 ? "f-petal" : "f-shade"} e-shade`} cx={Math.round(x + r * 0.9)} cy={y - 10} r={r * 0.95} />
          </g>
        ))}
        <circle className="f-light e-shade" cx={Math.round(bend * 0.3)} cy={-96} r={9} />
      </g>
    </>
  );
}

const ART: Record<FlowerId, (p: ArtProps) => ReactNode> = {
  rose: Rose,
  peony: Peony,
  ranunculus: Ranunculus,
  tulip: Tulip,
  lily: Lily,
  camellia: Camellia,
  sunflower: Sunflower,
  daisy: Daisy,
  "forget-me-not": ForgetMeNot,
  iris: Iris,
  orchid: Orchid,
  lavender: Lavender,
  "babys-breath": BabysBreath,
  eucalyptus: Eucalyptus,
};

export function FlowerArt({ type, variant }: { type: FlowerId; variant: number }) {
  const Art = ART[type];
  return <Art variant={variant} />;
}
