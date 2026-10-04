// Usage: node zoom.mjs <url> <out.png> <seed,seed,...>
import { chromium } from "playwright-core";
const [url, out, seeds] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
if (process.argv[5] === "next") { await page.click("text=Next 48 seeds"); await page.waitForTimeout(600); }
const want = seeds.split(",").map((s) => `#${s}`);
await page.evaluate((want) => {
  const items = [...document.querySelectorAll("main ul > li")];
  for (const li of items) {
    const label = li.querySelector("p span")?.textContent;
    li.style.display = want.includes(label) ? "" : "none";
  }
  document.querySelector("main ul").style.gridTemplateColumns = `repeat(${want.length}, minmax(0, 1fr))`;
}, want);
await page.waitForTimeout(300);
await (await page.$("main ul")).screenshot({ path: out });
await browser.close();
