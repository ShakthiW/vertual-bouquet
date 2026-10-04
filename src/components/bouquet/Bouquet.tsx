import type { CSSProperties } from "react";
import { FRAME } from "@/lib/bouquet/limits";
import type { BouquetVisual } from "@/lib/bouquet/schema";
import { PAPERS, RIBBONS } from "@/lib/bouquet/wrap";
import { CATALOG } from "@/lib/flowers/catalog";
import { BouquetFlower } from "./Flower";
import { wrapScaleOf } from "./geometry";
import { Bow, WrapBack, WrapFront } from "./Wrap";

type Props = {
  data: BouquetVisual;
  /** Idle sway and breathing. Off for thumbnails and exports. */
  animated?: boolean;
  className?: string;
  /** Accessible description; defaults to a list of the flowers. */
  label?: string;
  /**
   * Scroll-driven bloom: flowers grow in, back to front, as the nearest
   * --sc-p runs from `from` to `to`. Used by the landing page reveal.
   */
  bloom?: { from: number; to: number };
  /** With `bloom`: the wrap slides up and the bow ties itself after the flowers. */
  wrapIn?: boolean;
};

/**
 * Stable identities ("rose/red/2") rather than array positions, so when the
 * arrangement changes React keeps each flower's element and it can glide.
 */
function identityKeys(flowers: BouquetVisual["flowers"]) {
  const seen = new Map<string, number>();
  return flowers.map((f) => {
    const kind = `${f.type}/${f.color}`;
    const n = seen.get(kind) ?? 0;
    seen.set(kind, n + 1);
    return `${kind}/${n}`;
  });
}

function describe(data: BouquetVisual) {
  const names = [...new Set(data.flowers.map((f) => CATALOG[f.type].name.toLowerCase()))];
  if (names.length === 0) return "An empty bouquet";
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
  return `A wrapped bouquet of ${list}`;
}

export function Bouquet({ data, animated = true, className, label, bloom, wrapIn }: Props) {
  const paper = PAPERS[data.wrap.paper];
  const ribbon = RIBBONS[data.wrap.ribbon];
  // Higher heads sit further back; z breaks ties so the arrangement engine
  // keeps final say.
  const k = wrapScaleOf(data.flowers);
  const around = (scale: number): CSSProperties => ({
    transform: `translate(${FRAME.bindX}px, ${FRAME.bindY}px) scale(${scale.toFixed(3)}) translate(${-FRAME.bindX}px, ${-FRAME.bindY}px)`,
  });
  const keys = identityKeys(data.flowers);
  const ordered = data.flowers
    .map((f, i) => ({ f, i }))
    .sort((a, b) => a.f.z - b.f.z || a.f.y - b.f.y);

  return (
    <svg
      viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
      className={`bq ${bloom ? "bq-bloomable" : ""} ${bloom && wrapIn ? "bq-wrap-in" : ""} ${className ?? ""}`}
      data-style={data.style}
      data-still={animated ? undefined : "true"}
      role="img"
      aria-label={label ?? describe(data)}
    >
      <g
        className="bq-gust"
        style={
          {
            "--paper": paper.paper,
            "--paper-shade": paper.shade,
            "--ribbon": ribbon.ribbon,
            "--ribbon-shade": ribbon.shade,
            "--bind-x": `${FRAME.bindX}px`,
            "--bind-y": `${FRAME.bindY}px`,
          } as CSSProperties
        }
      >
        <g className="bq-pos" style={around(k)}>
          <WrapBack />
        </g>
        {ordered.map(({ f, i }, order) => (
          <BouquetFlower
            key={keys[i]}
            f={f}
            index={i}
            bloomAt={bloom ? bloom.from + ((bloom.to - bloom.from) * order) / Math.max(1, ordered.length) : undefined}
          />
        ))}
        <g className="bq-pos" style={around(k)}>
          <WrapFront />
        </g>
        <g className="bq-pos" style={around(Math.sqrt(k))}>
          <Bow />
        </g>
      </g>
    </svg>
  );
}
