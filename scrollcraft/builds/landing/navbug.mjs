import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const color = () => page.evaluate(() => {
  const b = document.querySelector('nav[aria-label=Steps] button[aria-current=step]');
  return b ? `${getComputedStyle(b).color} on ${getComputedStyle(b).backgroundColor}` : "no current step";
});
await page.goto("http://localhost:3000/create", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
console.log("direct load:        ", await color());
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.click("a.vb-cta >> nth=0");            // client-side navigation, like a real visitor
await page.waitForURL("**/create**");
await page.waitForTimeout(800);
console.log("via landing page:   ", await color());
await page.screenshot({ path: "lab/navbug.png", clip: { x: 0, y: 0, width: 1440, height: 60 } });
await browser.close();
