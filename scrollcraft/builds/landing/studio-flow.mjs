// Drive the Studio end to end. Usage: node studio-flow.mjs <width> <height> <outDir>
import { chromium } from "playwright-core";
import fs from "node:fs";

const [w = "1440", h = "900", out = "lab/studio"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, hasTouch: +w < 800 });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
const shot = async (name) => {
  await page.waitForTimeout(750);
  await page.screenshot({ path: `${out}/${name}.png` });
};
const log = [];
const check = (label, ok) => log.push(`${ok ? "PASS" : "FAIL"}  ${label}`);

await page.goto("http://localhost:3000/create?to=Maya", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
await shot("01-empty");

const add = (name) => page.click(`button[aria-label^="Add a"][aria-label*=" ${name}:"]`);
await add("peony");
for (let i = 0; i < 3; i++) await add("rose");
await add("ranunculus");
await add("ranunculus");
await add("tulip");
const counter = await page.textContent("[aria-live=polite]");
check(`counter shows 7 picks (${counter?.trim()})`, counter?.includes("7"));
await shot("02-picked");

await page.click("text=Arrange them →");
await shot("03-arrange");
const before = await page.$$eval(".bq [data-flower]", (gs) => gs.length);
await page.click("text=Shuffle");
await shot("04-shuffled");

// Drag the first hit circle 90px right.
const hit = page.locator("circle.studio-hit").last();
const box = await hit.boundingBox();
const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
const pos = async () => hit.evaluate((c) => [c.getAttribute("cx"), c.getAttribute("cy")].join(","));
const p0 = await pos();
await page.mouse.move(start.x, start.y);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(start.x + i * 9, start.y + i * 2);
await page.mouse.up();
const p1 = await pos();
check(`drag moves the flower (${p0} -> ${p1})`, p0 !== p1);
await shot("05-dragged-selected");

// Recolour the selected flower, then undo twice (colour, drag).
const swatches = page.locator('[role=group][aria-label=Colour] button');
if (await swatches.count()) await swatches.nth(1).click();
await shot("06-recoloured");
await page.click("text=Undo");
await page.click("text=Undo");
await page.waitForTimeout(800);
check(`undo returns the dragged flower (${p0} vs ${await pos()})`, (await pos()) === p0);

await page.click("text=Wrap it →");
await page.click('button[aria-label="Kraft paper"]');
await page.click('button[aria-label="Sage ribbon"]');
await shot("07-wrap");

await page.click("text=Write the card →");
const to = await page.inputValue('input[placeholder="Their name"]');
check(`name carried from the landing page (${to})`, to === "Maya");
await page.fill("textarea", "Hope this makes your day a little brighter.");
await page.fill('input[placeholder="Your name"]', "Shakthi");
await shot("08-card");

await page.click("text=Preview →");
await shot("09-preview");
check("preview says ready", (await page.textContent("main")).includes("All set for Maya"));

await page.waitForTimeout(500);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
check("draft survives a reload (still on preview, still for Maya)", (await page.textContent("main")).includes("All set for Maya"));
const after = await page.$$eval(".bq [data-flower]", (gs) => gs.length);
check(`same number of stems after reload (${before} / ${after})`, before === after);
await shot("10-reloaded");

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
check(`no horizontal overflow (${overflow}px)`, overflow <= 0);
console.log(log.join("\n"));
if (errors.length) console.log("CONSOLE ERRORS:\n" + errors.join("\n"));
await browser.close();
