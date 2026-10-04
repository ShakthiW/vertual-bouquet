import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/dev/arrange", { waitUntil: "networkidle" });
for (const n of ["1", "3", "10"]) {
  await page.selectOption("select", n);
  await page.waitForTimeout(500);
  await page.evaluate(() => [...document.querySelectorAll("main ul > li")].forEach((li, i) => (li.style.display = i < 12 ? "" : "none")));
  await (await page.$("main ul")).screenshot({ path: `lab/count-${n}.png` });
}
await browser.close();
