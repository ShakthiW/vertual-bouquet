import { describe, expect, it } from "vitest";
import { SAMPLES } from "@/lib/bouquet/samples";
import { bouquetSvg, toSvgMarkup } from "./staticSvg";

describe("bouquetSvg", () => {
  it.each(Object.entries(SAMPLES))("renders the %s sample with every colour resolved", (_, sample) => {
    const svg = bouquetSvg(sample);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    // Nothing a renderer without our CSS couldn't draw.
    expect(svg).not.toMatch(/class=|var\(|style=/);
    expect(svg).not.toContain("undefined");
    // Every flower is there: one head group per placement.
    expect(svg.match(/data-head="/g)?.length).toBe(sample.flowers.length);
  });

  it("uses the bouquet's own colours", () => {
    const svg = bouquetSvg(SAMPLES.romantic);
    expect(svg).toContain('fill="#c42b45"'); // red rose petals
    expect(svg).toContain('fill="#f3cdd3"'); // blush wrap paper
  });

  it("draws Ink as line art on paper", () => {
    const svg = bouquetSvg(SAMPLES.ink);
    expect(svg).toContain('stroke="#231a1d"');
    expect(svg).not.toContain('fill="#f7f1ec"'); // no white-rose fill, paper instead
  });

  it("converts camelCase attributes and escapes text", () => {
    expect(toSvgMarkup(<path className="s-stem" strokeWidth={3} d="M0 0" />, { stem: "#123456" })).toBe(
      '<path fill="none" stroke="#123456" stroke-linecap="round" stroke-width="3" d="M0 0"/>',
    );
    expect(toSvgMarkup(<text>{"<b>&"}</text>, {})).toBe("<text>&lt;b&gt;&amp;</text>");
  });

  it("is a valid size when asked", () => {
    expect(bouquetSvg(SAMPLES.garden, { width: 500, height: 600 })).toContain('width="500" height="600"');
  });
});
