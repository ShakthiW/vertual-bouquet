// Build and send a bouquet through the real Studio; prints "<link> <manage>".
// Usage: node make-bouquet.mjs <to> <from> <style> <flower,flower,...> [paperLabel]
import { chromium } from "playwright-core";

const [to, from, style = "Romantic", list = "peony,rose,rose,ranunculus,tulip,daisy", paper] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`${BASE}/create`, { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: "networkidle" });
await p.waitForTimeout(400);
for (const f of list.split(",")) await p.click(`button[aria-label^="Add a"][aria-label*=" ${f}:"]`);
await p.click("text=Arrange them →");
await p.click("text=Wrap it →");
await p.click(`button:has-text("${style}")`);
if (paper) await p.click(`button[aria-label="${paper} paper"]`);
await p.click("text=Write the card →");
await p.fill('input[placeholder="Their name"]', to);
await p.fill("textarea", "Hope this makes your day a little brighter.");
await p.fill('input[placeholder="Your name"]', from);
await p.click("text=Preview →");
await p.click("text=Send 🌷");
await p.waitForSelector("#sent-title");
console.log(await p.inputValue('input[aria-label="Bouquet link"]'), await p.textContent("details code"));
await browser.close();
