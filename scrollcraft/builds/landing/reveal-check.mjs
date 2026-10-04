// Verify the reveal. Usage: node reveal-check.mjs [width] [height]
import { chromium } from "playwright-core";
import fs from "node:fs";

const [w = "1440", h = "900"] = process.argv.slice(2);
const out = `lab/reveal-${w}`;
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const viewport = { width: +w, height: +h };
const log = [];
const check = (label, ok) => log.push(`${ok ? "PASS" : "FAIL"}  ${label}`);
const errors = [];
const watch = (p) => {
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
};

async function makeBouquet(ctx, to) {
  const p = await ctx.newPage();
  watch(p);
  await p.goto(`http://localhost:3000/create?to=${to}`, { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.removeItem("vb:draft:v1"));
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  for (const f of ["peony", "rose", "rose", "ranunculus", "ranunculus", "tulip", "daisy"]) await p.click(`button[aria-label^="Add a"][aria-label*=" ${f}:"]`);
  for (const next of ["Arrange them →", "Wrap it →", "Write the card →"]) await p.click(`text=${next}`);
  await p.fill("textarea", "Hope this makes your day a little brighter.");
  await p.fill('input[placeholder="Your name"]', "Shakthi");
  await p.click("text=Preview →");
  await p.click("text=Send 🌷");
  await p.waitForSelector("#sent-title");
  const link = await p.inputValue('input[aria-label="Bouquet link"]');
  const manage = await p.textContent("details code");
  await p.close();
  return { link, manage };
}

const sender = await browser.newContext({ viewport });
const { link, manage } = await makeBouquet(sender, "Maya");

// 1. Frame by frame: set the clock directly.
const recipient = await browser.newContext({ viewport });
const r = await recipient.newPage();
watch(r);
await r.goto(link, { waitUntil: "networkidle" });
await r.waitForSelector('.rv[data-state="sealed"]');
await r.waitForTimeout(400);
await r.screenshot({ path: `${out}/00-sealed.png` });
const times = [0.15, 0.3, 0.55, 0.85, 1.2, 1.6, 2.0, 2.5, 3.0, 3.6, 4.2, 4.6, 5.1, 5.7, 6.7];
let i = 1;
for (const t of times) {
  await r.evaluate((t) => {
    const el = document.querySelector(".rv");
    el.dataset.state = t >= 6.7 ? "done" : "playing";
    el.style.setProperty("--t", String(t));
  }, t);
  await r.waitForTimeout(120);
  await r.screenshot({ path: `${out}/${String(i++).padStart(2, "0")}-t${t.toFixed(2)}.png` });
}

// 2. For real.
const r2 = await recipient.newPage();
watch(r2);
await r2.goto(link, { waitUntil: "networkidle" });
await r2.waitForSelector('.rv[data-state="sealed"]');
const t0 = Date.now();
await r2.click(".rv-envelope", { force: true });
await r2.waitForSelector('.rv[data-state="done"]', { timeout: 12000 });
const took = (Date.now() - t0) / 1000;
check(`real tap plays to the end in ${took.toFixed(1)}s (timeline 6.7s)`, took > 6 && took < 8.5);
check("Replay and Send-one-back appear at the end", (await r2.locator(".rv-actions button, .rv-actions a").count()) === 2);
await r2.waitForTimeout(500);
await r2.screenshot({ path: `${out}/20-real-end.png` });

const m = await sender.newPage();
await m.goto(manage, { waitUntil: "networkidle" });
check(`sender's page now shows it opened ("${(await m.textContent("dd:last-of-type"))?.trim()}")`, (await m.textContent("main")).includes("🌷"));

// Return visit: short version, no tap needed.
const r3 = await recipient.newPage();
await r3.goto(link, { waitUntil: "networkidle" });
const q0 = Date.now();
await r3.waitForSelector('.rv[data-state="done"]', { timeout: 8000 });
const quick = (Date.now() - q0) / 1000;
check(`return visit plays the short version by itself (${quick.toFixed(1)}s)`, quick < 3.5);

// Skip.
await r2.click('button[aria-label="Replay"]');
await r2.waitForTimeout(1500);
await r2.click(".rv-skip");
check("Skip jumps to the end", (await r2.getAttribute(".rv", "data-state")) === "done");

// The sender opening their own (second) bouquet doesn't count.
const second = await makeBouquet(sender, "Ana");
const own = await sender.newPage();
await own.goto(second.link, { waitUntil: "networkidle" });
await own.waitForSelector('.rv[data-state="sealed"]');
await own.click(".rv-envelope", { force: true });
await own.waitForTimeout(800);
await own.goto(second.manage, { waitUntil: "networkidle" });
check("the sender opening their own link isn't counted as opened", (await own.textContent("main")).includes("Not opened yet"));

// Reduced motion: straight to the end on tap.
const calm = await browser.newContext({ viewport, reducedMotion: "reduce" });
const rc = await calm.newPage();
await rc.goto(second.link, { waitUntil: "networkidle" });
await rc.waitForSelector('.rv[data-state="sealed"]');
await rc.click(".rv-envelope", { force: true });
await rc.waitForTimeout(150);
check("reduced motion: tap goes straight to the finished bouquet", (await rc.getAttribute(".rv", "data-state")) === "done");
await rc.waitForTimeout(800);
await rc.screenshot({ path: `${out}/30-reduced.png` });

const overflow = await r2.evaluate(() => document.documentElement.scrollWidth - innerWidth);
check(`no horizontal overflow (${overflow}px)`, overflow <= 0);
console.log(log.join("\n"));
if (errors.length) console.log("CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n"));
await browser.close();
