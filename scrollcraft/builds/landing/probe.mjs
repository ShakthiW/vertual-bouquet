import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const r = await page.evaluate(() => {
  const html = document.documentElement;
  const cs = getComputedStyle(html);
  const h1 = getComputedStyle(document.querySelector(".vb-h1"));
  return {
    htmlClass: html.className,
    fraunces: cs.getPropertyValue("--font-fraunces"),
    caveat: cs.getPropertyValue("--font-caveat"),
    geist: cs.getPropertyValue("--font-geist-sans"),
    h1Font: h1.fontFamily,
    fontsLoaded: [...document.fonts].filter(f => f.status === "loaded").map(f => f.family).slice(0, 12),
  };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();
