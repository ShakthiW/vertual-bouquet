// Studio -> Send -> recipient link -> manage page -> delete. Usage: node send-flow.mjs [width] [height]
import { chromium } from "playwright-core";
import fs from "node:fs";

const [w = "1440", h = "900"] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const out = `lab/send-${w}`;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
const page = await ctx.newPage();
const errors = [];
const watch = (p) => {
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
};
watch(page);
const log = [];
const check = (label, ok) => log.push(`${ok ? "PASS" : "FAIL"}  ${label}`);
const shot = async (p, name) => {
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/${name}.png` });
};

await page.goto(`${BASE}/create?to=Maya`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
for (const f of ["peony", "rose", "rose", "ranunculus", "ranunculus", "tulip"]) await page.click(`button[aria-label^="Add a"][aria-label*=" ${f}:"]`);
for (const next of ["Arrange them →", "Wrap it →", "Write the card →"]) await page.click(`text=${next}`);
await page.fill("textarea", "Hope this makes your day a little brighter.");
await page.fill('input[placeholder="Your name"]', "Shakthi");
await page.click("text=Preview →");
await page.click("text=Send 🌷");
await page.waitForSelector("#sent-title", { timeout: 15000 });
await shot(page, "01-sent");
const link = await page.inputValue('input[aria-label="Bouquet link"]');
check(`send returns a link (${link})`, /\/b\/[A-Za-z0-9_-]{10}$/.test(link));
await page.click("text=Copy");
check("copy puts the link on the clipboard", (await page.evaluate(() => navigator.clipboard.readText())) === link);
const manage = await page.textContent("details code");

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
check("after a reload the share sheet is still there (no accidental resend)", (await page.locator("#sent-title").count()) === 1);

// What a chat app sees when it fetches the link (bots get metadata in <head>).
const html = await (await fetch(link, { headers: { "user-agent": "WhatsApp/2.24.1 A" } })).text();
const meta = (p) => html.match(new RegExp(`<meta (?:property|name)="${p}" content="([^"]*)"`))?.[1];
check(`og:title = "${meta("og:title")}"`, meta("og:title") === "Shakthi sent you a posy 🌷");
check(`og:description = "${meta("og:description")}"`, meta("og:description")?.includes("For Maya"));
check(`robots = "${meta("robots")}"`, meta("robots")?.includes("noindex"));
const ogImage = meta("og:image");
check(`og:image is absolute (${ogImage})`, ogImage?.startsWith("http"));
if (ogImage) {
  const img = await fetch(ogImage.replace(/&amp;/g, "&"));
  fs.writeFileSync(`${out}/og.png`, Buffer.from(await img.arrayBuffer()));
  check(`og:image responds ${img.status} ${img.headers.get("content-type")}`, img.ok && img.headers.get("content-type") === "image/jpeg" && Number(img.headers.get("content-length") ?? 0) < 300_000);
}

// The recipient.
const r = await ctx.newPage();
watch(r);
await r.goto(link, { waitUntil: "networkidle" });
await shot(r, "02-envelope");
check("recipient sees the envelope addressed to Maya", (await r.textContent("main")).includes("For Maya"));
await r.click('button[aria-label^="Open your bouquet"]', { force: true });
await r.waitForSelector('.rv[data-state="done"]', { timeout: 12000 });
await shot(r, "03-opened");
check("tapping plays the reveal to the bouquet and card", (await r.textContent("main")).includes("Hope this makes your day"));
check("'send one back' goes to the Studio for Shakthi", (await r.getAttribute("text=Send Shakthi one back 🌷", "href")) === "/create?to=Shakthi");

// The sender's private page, then delete.
await r.goto(manage, { waitUntil: "networkidle" });
await shot(r, "04-manage");
check("sender opening their own link is not counted (same browser)", (await r.textContent("main")).includes("Not opened yet"));
await r.click("text=Delete bouquet");
await r.click("text=Yes, delete");
await r.waitForSelector("text=Deleted.");
const gone = await fetch(link);
check(`deleted link now 404s (${gone.status})`, gone.status === 404);
await r.goto(link, { waitUntil: "networkidle" });
await shot(r, "05-gone");

const bad = await fetch(link.replace(/\/b\/.*/, "/b/not-a-real"));
check(`unknown id 404s (${bad.status})`, bad.status === 404);
const traversal = await fetch(link.replace(/\/b\/.*/, "/b/..%2F..%2Fetc"));
check(`malformed id 404s (${traversal.status})`, traversal.status === 404);

console.log(log.join("\n"));
if (errors.length) console.log("CONSOLE ERRORS:\n" + errors.join("\n"));
await browser.close();
