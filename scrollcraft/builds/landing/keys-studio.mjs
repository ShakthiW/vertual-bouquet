import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/create", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
// Tab until a flower card has focus, printing the order on the way.
const order = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press("Tab");
  const at = await page.evaluate(() => {
    const el = document.activeElement;
    return (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 50);
  });
  order.push(at);
  if (at.startsWith("Add a")) break;
}
console.log("tab order: " + order.join("  →  "));
await page.keyboard.press("Enter");
await page.click("text=Arrange them →");
await page.waitForTimeout(400);
const hit = page.locator("circle.studio-hit").first();
await hit.focus();
const label = await hit.getAttribute("aria-label");
const cx0 = await hit.getAttribute("cx");
for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
const cx1 = await hit.getAttribute("cx");
const ring = await page.locator("circle.studio-ring").count();
const n0 = await page.locator("circle.studio-hit").count();
await page.keyboard.press("Delete");
await page.waitForTimeout(200);
const n1 = await page.locator("circle.studio-hit").count();
console.log(`focused: "${label}"`);
console.log(`${+cx1 > +cx0 ? "PASS" : "FAIL"}  arrow keys move it (${cx0} -> ${cx1})`);
console.log(`${ring === 1 ? "PASS" : "FAIL"}  focus selects it (ring shown)`);
console.log(`${n1 === n0 - 1 ? "PASS" : "FAIL"}  Delete removes it (${n0} -> ${n1})`);
await browser.close();
