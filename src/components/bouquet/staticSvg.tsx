// A standalone SVG string of a bouquet, for places that can't read our CSS:
// link-preview images (Satori/resvg) and anything else that needs a plain file.
//
// It walks the same art components the app renders and resolves every colour
// class (f-petal, e-shade, s-stem...) into fill/stroke attributes, so the
// preview is the same drawing, not a lookalike.

import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { FRAME } from "@/lib/bouquet/limits";
import type { BouquetVisual } from "@/lib/bouquet/schema";
import { PAPERS, RIBBONS, STYLE_GREENS } from "@/lib/bouquet/wrap";
import { CATALOG, getColor } from "@/lib/flowers/catalog";
import { FlowerArt } from "@/lib/flowers/art/flowers";
import { headOf, LEAF, stemOf, wrapScaleOf } from "./geometry";
import { Bow, WrapBack, WrapFront } from "./Wrap";

type Palette = Record<string, string>;

const INK = { paper: "#fffdfb", line: "#231a1d" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const kebab = (k: string) => (k === "viewBox" || k === "pathLength" ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));

/** Colour classes -> presentation attributes. */
function resolveClasses(cls: string, pal: Palette, ink: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of cls.split(/\s+/)) {
    const fill = {
      "f-petal": pal.petal,
      "f-shade": pal.shade,
      "f-light": pal.light,
      "f-center": pal.center,
      "f-center-dark": pal.centerDark,
      "f-leaf": pal.leaf,
      "f-leaf-dark": pal.leafDark,
      "f-paper": pal.paper,
      "f-paper-shade": pal.paperShade,
      "f-ribbon": pal.ribbon,
      "f-ribbon-shade": pal.ribbonShade,
    }[c];
    if (fill) out.fill = ink ? (c === "f-center-dark" ? INK.line : INK.paper) : fill;
    if (c === "e-shade") Object.assign(out, { stroke: ink ? INK.line : pal.shade, "stroke-width": "1.2", "stroke-linejoin": "round" });
    if (c === "s-shade") Object.assign(out, { fill: "none", stroke: ink ? INK.line : pal.shade });
    if (c === "s-center") Object.assign(out, { fill: "none", stroke: ink ? INK.line : pal.centerDark });
    if (c === "s-stem") Object.assign(out, { fill: "none", stroke: ink ? INK.line : pal.stem, "stroke-linecap": "round" });
  }
  if (ink && !out.stroke) Object.assign(out, { stroke: INK.line, "stroke-width": "1.4" });
  return out;
}

/** Serialise a tree of plain function components and SVG elements. */
export function toSvgMarkup(node: ReactNode, pal: Palette, ink = false): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return esc(String(node));
  if (Array.isArray(node)) return node.map((n) => toSvgMarkup(n, pal, ink)).join("");
  if (!isValidElement(node)) return "";
  const el = node as ReactElement<Record<string, unknown> & { children?: ReactNode }>;
  const { children, ...props } = el.props;
  if (el.type === Fragment) return toSvgMarkup(children, pal, ink);
  if (typeof el.type === "function") return toSvgMarkup((el.type as (p: unknown) => ReactNode)(el.props), pal, ink);
  if (typeof el.type !== "string") return "";

  const attrs: Record<string, string> = {};
  if (typeof props.className === "string") Object.assign(attrs, resolveClasses(props.className, pal, ink));
  for (const [k, v] of Object.entries(props)) {
    if (k === "className" || k === "style" || k === "key" || v === undefined || v === null || v === false) continue;
    if (typeof v === "function" || typeof v === "object") continue;
    attrs[kebab(k)] = String(v); // explicit attributes win over class defaults
  }
  const a = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join("");
  const inner = toSvgMarkup(children, pal, ink);
  return inner ? `<${el.type}${a}>${inner}</${el.type}>` : `<${el.type}${a}/>`;
}

/** The whole bouquet as a standalone SVG document. */
export function bouquetSvg(data: BouquetVisual, size?: { width: number; height: number }): string {
  const ink = data.style === "ink";
  const greens = STYLE_GREENS[data.style];
  const paper = PAPERS[data.wrap.paper];
  const ribbon = RIBBONS[data.wrap.ribbon];
  const base: Palette = {
    ...greens,
    paper: paper.paper,
    paperShade: paper.shade,
    ribbon: ribbon.ribbon,
    ribbonShade: ribbon.shade,
  };
  const k = wrapScaleOf(data.flowers);
  const around = (s: number) =>
    `translate(${FRAME.bindX} ${FRAME.bindY}) scale(${s.toFixed(3)}) translate(${-FRAME.bindX} ${-FRAME.bindY})`;

  const flowers = data.flowers
    .map((f, i) => ({ f, i }))
    .sort((a, b) => a.f.z - b.f.z || a.f.y - b.f.y)
    .map(({ f, i }) => {
      const c = getColor(f.type, f.color);
      const pal: Palette = { ...base, petal: c.petal, shade: c.shade, light: c.light, center: c.center, centerDark: c.centerDark ?? c.center };
      const head = headOf(f);
      const stem = stemOf(f);
      const filler = CATALOG[f.type].category === "filler";
      const side = i % 2 === 0 ? 1 : -1;
      const stemAttrs = toSvgMarkup(<path className="s-stem" strokeWidth={filler ? 4 : 6} d={stem.below} />, pal, ink);
      const stemAbove = toSvgMarkup(<path className="s-stem" strokeWidth={filler ? 4 : 6} d={stem.above} />, pal, ink);
      const leaf = filler
        ? ""
        : `<g transform="translate(${stem.leaf.x} ${stem.leaf.y}) rotate(${stem.leaf.angle + side * 38}) scale(${side} 1)">${toSvgMarkup(
            <>
              <path className="f-leaf" d={LEAF} />
              <path className="s-stem" strokeWidth={1.5} d="M2 0 C20 -1 38 -1 54 0" opacity={0.6} />
            </>,
            pal,
            ink,
          )}</g>`;
      const art = toSvgMarkup(<FlowerArt type={f.type} variant={f.variant} />, pal, ink);
      return `<g>${stemAttrs}${stemAbove}${leaf}<g data-head="${f.type}" transform="translate(${head.x.toFixed(1)} ${head.y.toFixed(1)}) rotate(${f.rotation}) scale(${head.s.toFixed(3)})">${art}</g></g>`;
    })
    .join("");

  const dims = size ? ` width="${size.width}" height="${size.height}"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FRAME.width} ${FRAME.height}"${dims}>` +
    `<g transform="${around(k)}">${toSvgMarkup(<WrapBack />, base, ink)}</g>` +
    flowers +
    `<g transform="${around(k)}">${toSvgMarkup(<WrapFront />, base, ink)}</g>` +
    `<g transform="${around(Math.sqrt(k))}">${toSvgMarkup(<Bow />, base, ink)}</g>` +
    `</svg>`
  );
}
