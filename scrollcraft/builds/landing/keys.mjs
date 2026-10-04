import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const order = [];
for (let i = 0; i < 5; i++) {
  await page.keyboard.press("Tab");
  order.push(await page.evaluate(() => {
    const el = document.activeElement;
    return `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)}"`;
  }));
  if (i === 1) await page.keyboard.type("Ana");
}
const links = await page.$$eval("a.vb-cta", (as) => as.map((a) => `${a.textContent} -> ${a.getAttribute("href")}`));
console.log("tab order:\n  " + order.join("\n  "));
console.log("CTAs after typing:\n  " + links.join("\n  "));
await browser.close();
