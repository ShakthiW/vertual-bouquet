// Walk the landing page and capture frames at chosen scroll fractions.
// Usage: node frames.mjs <url> <outDir> <width> <height> [name] [reduced]
import { chromium } from "playwright-core";
import fs from "node:fs";

const [url, out, w = "1440", h = "900", name = "", reduced = ""] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const ctx = await browser.newContext({
  viewport: { width: +w, height: +h },
  deviceScaleFactor: 1,
  reducedMotion: reduced ? "reduce" : "no-preference",
});
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
if (name) {
  await page.fill(".vb-tag__input", name);
  await page.waitForTimeout(200);
}

// Sample inside each act, not just evenly across the page.
const acts = await page.$$eval(".vb-act", (els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect();
    return { cls: el.className.split(" ")[1], top: r.top + scrollY, height: r.height };
  }),
);
const vh = +h;
const shots = [];
for (const a of acts) {
  const pinned = a.height > vh * 1.05;
  const fracs = pinned ? [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] : [0, 0.5];
  for (const f of fracs) {
    const y = pinned ? a.top + f * (a.height - vh) : a.top + f * Math.max(0, a.height - vh * 0.5);
    shots.push({ label: `${a.cls}-${String(Math.round(f * 100)).padStart(3, "0")}`, y });
  }
}
let i = 0;
for (const s of shots) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), s.y);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${out}/${String(i++).padStart(2, "0")}-${s.label}.png` });
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log(`frames: ${shots.length}, horizontal overflow: ${overflow}px, page height: ${await page.evaluate(() => document.documentElement.scrollHeight / innerHeight)} vh`);
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
await browser.close();
