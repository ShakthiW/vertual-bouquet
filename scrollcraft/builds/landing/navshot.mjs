import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const [w, h, name] of [[1440, 900, "desk"], [390, 844, "mob"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(600);
  await page.click("a.vb-cta >> nth=0");
  await page.waitForURL("**/create**");
  await page.waitForTimeout(700);
  const header = async (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: name === "mob" ? 70 : 56 } });
  await header(`lab/nav-${name}-1.png`);
  for (let i = 0; i < 4; i++) await page.click('button[aria-label^="Add a"] >> nth=0');
  for (const next of ["Arrange them →", "Wrap it →", "Write the card →"]) await page.click(`text=${next}`);
  await page.waitForTimeout(500);
  await header(`lab/nav-${name}-4.png`);
  await page.close();
}
await browser.close();
