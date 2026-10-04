import type { CSSProperties } from "react";
import type { FlowerPlacement } from "@/lib/bouquet/schema";
import { CATALOG, getColor } from "@/lib/flowers/catalog";
import { FlowerArt } from "@/lib/flowers/art/flowers";
import { swayFor } from "@/lib/motion/presets";
import { headOf, LEAF, stemOf } from "./geometry";


export function colorVars(f: Pick<FlowerPlacement, "type" | "color">): CSSProperties {
  const c = getColor(f.type, f.color);
  return {
    "--petal": c.petal,
    "--petal-shade": c.shade,
    "--petal-light": c.light,
    "--center": c.center,
    "--center-dark": c.centerDark ?? c.center,
  } as CSSProperties;
}

/** One stem + head, swaying around the shared binding point. */
export function BouquetFlower({
  f,
  index,
  bloomAt,
}: {
  f: FlowerPlacement;
  index: number;
  /** When set, the flower blooms in as the surrounding --sc-p passes this value. */
  bloomAt?: number;
}) {
  const head = headOf(f);
  const stem = stemOf(f);
  const sway = swayFor(index);
  const filler = CATALOG[f.type].category === "filler";
  const leafSide = index % 2 === 0 ? 1 : -1;

  return (
    <g
      className="bq-sway"
      data-flower={f.type}
      data-index={index}
      style={
        {
          ...colorVars(f),
          // How far a gust bends this stem: greenery and outer stems more.
          "--gust-k": (filler ? 1.35 : 0.75 + Math.abs(f.x - 0.5) * 1.2).toFixed(2),
          "--sway-amp": `${sway.amp.toFixed(2)}deg`,
          "--sway-dur": `${sway.dur.toFixed(2)}s`,
          "--sway-delay": `${sway.delay.toFixed(2)}s`,
          ...(bloomAt !== undefined ? { "--bs": bloomAt.toFixed(3) } : {}),
        } as CSSProperties
      }
    >
      <g data-part="stem">
        <path className="s-stem" strokeWidth={filler ? 4 : 6} d={stem.below} />
        <path
          className={`s-stem bq-stem${bloomAt !== undefined ? " bq-draw" : ""}`}
          strokeWidth={filler ? 4 : 6}
          d={stem.above}
          style={{ d: `path("${stem.above}")` } as CSSProperties}
          pathLength={bloomAt !== undefined ? 1 : undefined}
        />
        {!filler && (
          <g
            className="bq-pos"
            style={{
              transform: `translate(${stem.leaf.x}px, ${stem.leaf.y}px) rotate(${stem.leaf.angle + leafSide * 38}deg) scale(${leafSide}, 1)`,
            }}
          >
            <g className={bloomAt !== undefined ? "bq-bloom" : undefined}>
              <path className="f-leaf" d={LEAF} />
              <path className="s-stem" strokeWidth={1.5} d="M2 0 C20 -1 38 -1 54 0" opacity={0.6} />
            </g>
          </g>
        )}
      </g>
      {/* Positioned with a CSS transform (same result as the attribute) so the
          Studio can let flowers glide to new spots. */}
      <g
        className="bq-pos"
        style={{
          transform: `translate(${head.x.toFixed(1)}px, ${head.y.toFixed(1)}px) rotate(${f.rotation}deg) scale(${head.s.toFixed(3)})`,
        }}
      >
        <g className={bloomAt !== undefined ? "bq-bloom" : undefined}>
          <g className="bq-breathe" data-part="head">
            <FlowerArt type={f.type} variant={f.variant} />
          </g>
        </g>
      </g>
    </g>
  );
}

/** A single flower on its own, for pickers and meaning cards. */
export function FlowerIcon({
  type,
  color,
  variant = 0,
  className,
  title,
}: {
  type: FlowerPlacement["type"];
  color: string;
  variant?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="-105 -105 210 210"
      className={`bq ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g style={colorVars({ type, color })}>
        <FlowerArt type={type} variant={variant} />
      </g>
    </svg>
  );
}
