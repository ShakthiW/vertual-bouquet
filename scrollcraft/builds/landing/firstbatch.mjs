import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/dev/arrange", { waitUntil: "networkidle" });

await page.waitForTimeout(600);
await (await page.$("main ul")).screenshot({ path: "lab/batch-1.png" });
const scores = await page.$$eval("main ul > li p span:last-child", (s) => s.map((x) => parseFloat(x.textContent.split("·")[1])));
scores.sort((a, b) => a - b);
console.log(`seeds 1-48: median score ${scores[24]}, worst ${scores.at(-1)}, over 15: ${scores.filter((s) => s > 15).length}`);
await browser.close();
