// Usage: node snap.mjs <url> <out.png> [width] [height] [fullPage]
import { chromium } from "playwright-core";

const [url, out, w = "1440", h = "900", full = "1"] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: full === "1" });
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
await browser.close();
