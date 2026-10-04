// Shared petal geometry. Every petal grows upward from (0,0) toward (0,-len),
// so a ring of petals is just the same path rotated around the origin.

export type Tip = "round" | "point" | "ruffle";

const r = (n: number) => Math.round(n * 10) / 10;

export function petal(len: number, w: number, tip: Tip = "round"): string {
  const L = -len;
  if (tip === "point") {
    return `M0 0 C${r(w)} ${r(L * 0.3)} ${r(w * 0.55)} ${r(L * 0.8)} 0 ${r(L)} C${r(-w * 0.55)} ${r(L * 0.8)} ${r(-w)} ${r(L * 0.3)} 0 0Z`;
  }
  if (tip === "ruffle") {
    return `M0 0 C${r(w)} ${r(L * 0.25)} ${r(w * 1.05)} ${r(L * 0.85)} ${r(w * 0.45)} ${r(L * 0.97)} Q${r(w * 0.2)} ${r(L * 0.88)} 0 ${r(L)} Q${r(-w * 0.2)} ${r(L * 0.88)} ${r(-w * 0.45)} ${r(L * 0.97)} C${r(-w * 1.05)} ${r(L * 0.85)} ${r(-w)} ${r(L * 0.25)} 0 0Z`;
  }
  return `M0 0 C${r(w)} ${r(L * 0.25)} ${r(w)} ${r(L * 0.95)} 0 ${r(L)} C${r(-w)} ${r(L * 0.95)} ${r(-w)} ${r(L * 0.25)} 0 0Z`;
}

export function Ring({
  n,
  d,
  offset = 0,
  radius = 0,
  className,
}: {
  n: number;
  d: string;
  offset?: number;
  radius?: number;
  className: string;
}) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          className={className}
          d={d}
          transform={`rotate(${r(offset + (i * 360) / n)})${radius ? ` translate(0 ${-radius})` : ""}`}
        />
      ))}
    </g>
  );
}

/** Deterministic PRNG so "random" art is identical on server and client. */
export { prng as rand } from "@/lib/arrange/prng";

export const GOLDEN_ANGLE = 137.50776;
