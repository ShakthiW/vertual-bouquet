// Verify the living bouquet on a finished reveal. Usage: node living-check.mjs <bouquet-url>
import { chromium } from "playwright-core";
import fs from "node:fs";

const [link] = process.argv.slice(2);
fs.mkdirSync("lab/living", { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const log = [];
const check = (label, ok) => log.push(`${ok ? "PASS" : "FAIL"}  ${label}`);
const errors = [];

async function openDone(reduced) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(link, { waitUntil: "networkidle" });
  await page.waitForSelector('.rv[data-state="sealed"]');
  await page.click(".rv-envelope", { force: true });
  await page.waitForSelector('.rv[data-state="done"]', { timeout: 12000 });
  return page;
}

const page = await openDone(false);

// Gusts: sample the shared value for 9 seconds.
const samples = await page.evaluate(async () => {
  const svg = document.querySelector(".rv-bouquet svg");
  const out = [];
  for (let i = 0; i < 45; i++) {
    out.push(parseFloat(getComputedStyle(svg).getPropertyValue("--gust")) || 0);
    await new Promise((r) => setTimeout(r, 200));
  }
  return out;
});
const peak = Math.max(...samples.map(Math.abs));
check(`a gust arrives and swings the flowers (peak ${peak.toFixed(2)}°)`, peak > 1.5);
check(`and settles back (last ${samples.at(-1).toFixed(2)}°)`, Math.abs(samples.at(-1)) < 0.6 || samples.slice(-5).some((v) => Math.abs(v) < 0.6));

// Lean: hover near the top-most flower head.
const head = await page.evaluate(() => {
  const g = [...document.querySelectorAll(".rv-bouquet .bq-sway[data-index]")].at(-1);
  const r = g.querySelector(".bq-breathe").getBoundingClientRect();
  return { i: g.dataset.index, x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width };
});
const lean = () => page.evaluate((i) => parseFloat(document.querySelector(`.rv-bouquet .bq-sway[data-index="${i}"]`).style.getPropertyValue("--lean")) || 0, head.i);
await page.mouse.move(head.x - head.w * 0.6, head.y, { steps: 6 });
await page.waitForTimeout(500);
const leaned = await lean();
check(`a flower leans away from the cursor (${leaned.toFixed(2)}°)`, leaned > 1);
await page.mouse.move(5, 5, { steps: 6 });
await page.waitForTimeout(1800);
const back = await lean();
check(`and springs back when the cursor leaves (${back.toFixed(2)}°)`, Math.abs(back) < 0.3);

// Tap: bounce + meaning.
await page.mouse.click(head.x, head.y);
await page.waitForTimeout(120);
const bouncing = await page.evaluate((i) => document.querySelector(`.rv-bouquet .bq-sway[data-index="${i}"] .bq-breathe`).getAnimations().length, head.i);
check(`tapping a flower bounces it (${bouncing} animation)`, bouncing > 0);
const label = await page.locator(".rv-bouquet .rounded-xl").textContent().catch(() => null);
check(`and shows what it means ("${label}")`, !!label && label.includes("·") === label.includes("·"));
await page.waitForTimeout(250);
await page.screenshot({ path: "lab/living/01-tapped.png" });

// Petals: the canvas draws something.
const inked = await page.evaluate(() => {
  const c = document.querySelector(".rv-petals");
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
});
check(`petals are falling (${inked} painted pixels)`, inked > 500);

// Reduced motion.
const calm = await openDone(true);
await calm.waitForTimeout(6000);
const calmGust = await calm.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".rv-bouquet svg")).getPropertyValue("--gust")) || 0);
const calmInk = await calm.evaluate(() => {
  const c = document.querySelector(".rv-petals");
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
});
check(`reduced motion: no gusts (${calmGust}) and no drifting petals (${calmInk} px)`, calmGust === 0 && calmInk === 0);
const calmHead = await calm.evaluate(() => {
  const r = [...document.querySelectorAll(".rv-bouquet .bq-breathe")].at(-1).getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await calm.mouse.click(calmHead.x, calmHead.y);
await calm.waitForTimeout(200);
check("reduced motion: tapping still shows the meaning", (await calm.locator(".rv-bouquet .rounded-xl").count()) === 1);

const meaningList = await page.locator('ul[aria-label="What these flowers mean"] li').allTextContents();
check(`screen readers get the meanings too (${meaningList.length} kinds, e.g. "${meaningList[0]}")`, meaningList.length > 0);

console.log(log.join("\n"));
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
await browser.close();
