/**
 * Render smoke test for the built Baligo bundle.
 * Serves ../assets plus a tiny harness page, then drives system Chrome via
 * playwright-core to confirm each route renders expected content.
 * Dev/QA tooling only — never shipped to WordPress.
 */
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../../assets");

const MIME = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".html": "text/html",
};

const server = http.createServer(async (req, res) => {
  try {
    let p = req.url.split("?")[0];
    if (p === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (p === "/") {
      const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Baligo smoke</title>
<link rel="stylesheet" href="/css/baligo.css"></head>
<body><div id="baligo-app-root"></div>
<script>window.BALIGO_APP={demo:true};</script>
<script type="module" src="/js/baligo.js"></script></body></html>`;
      res.writeHead(200, { "content-type": "text/html" });
      res.end(html);
      return;
    }
    const file = await readFile(path.join(assetsDir, p));
    res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end();
  }
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// Each case: [hash route, selector-or-text that must appear, ms timeout]
const cases = [
  ["/admin", "Dashboard"],
  ["/admin/hotels", "Nusa Dua Beachfront Resort & Spa"],
  ["/admin/hotels/htl-001", "Deluxe Garden Room"],
  ["/admin/hotels/new", "Add"],
  ["/admin/rooms", "Room"],
  ["/admin/rates", "Net rate"],
  ["/admin/rates/rate-003", "Net rate"],
  ["/admin/rates/new", "New"],
  ["/admin/agents", "Sakura Travels"],
  ["/admin/agents/agt-001", "Sakura"],
  ["/admin/contracts", "Nusa-Dua-Beachfront-Rates-2027"],
  ["/admin/contracts/imp-001", "Upload"],
  ["/admin/history", "changes"],
  ["/admin/settings", "Settings"],
  ["/agent", "Hana"],
  ["/agent/search", "hotel"],
  ["/agent/stay/htl-001/rtm-001?checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "night"],
  ["/agent/quote?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "$"],
  ["/agent/quotations", "BLG-Q-2418"],
  ["/agent/quotations/q-2418", "Ubud"],
  ["/agent/profile", "Profile"],
  ["/agent/sign-in", "Sign in"],
  ["/agent/pending", "pending"],
  ["/agent/deactivated", "deactivated"],
];

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("requestfailed", (r) => errors.push(`REQFAIL ${r.url()} ${r.failure()?.errorText}`));
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
});
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

let failed = 0;
for (const [route, expect] of cases) {
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  let body = (await page.textContent("body")) ?? "";
  // Hotel detail: room names live on the "Room types" tab — click it first.
  if (route.startsWith("/admin/hotels/htl")) {
    try {
      const tab = page.getByRole("tab", { name: /room/i }).first();
      await tab.waitFor({ state: "visible", timeout: 4000 });
      await tab.click();
      await page.waitForTimeout(400);
      body = (await page.textContent("body")) ?? "";
    } catch {
      /* tab never appeared — body check below will fail */
    }
  }
  const ok = body.toLowerCase().includes(expect.toLowerCase());
  if (!ok) {
    failed++;
    console.log(`FAIL ${route} — expected "${expect}"`);
    console.log("   got:", body.slice(0, 220).replace(/\s+/g, " "));
  } else {
    console.log(`pass ${route}`);
  }
}

// Horizontal-overflow sweep at mobile width on a sample of routes
const mobile = await browser.newPage({ viewport: { width: 375, height: 720 } });
mobile.on("pageerror", (e) => errors.push(String(e)));
mobile.on("response", (r) => {
  if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
});
for (const route of [
  "/admin", "/admin/hotels", "/admin/hotels/htl-001", "/admin/rates", "/admin/contracts/imp-001",
  "/admin/settings", "/agent", "/agent/search", "/agent/quote?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0",
  "/agent/quotations/q-2418", "/agent/sign-in",
]) {
  await mobile.goto(`${base}/#${route}`, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(250);
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  console.log(`${overflow > 8 ? "OVERFLOW" : "pass  "} ${route} (+${overflow}px)`);
  if (overflow > 8) failed++;
}

console.log("\nJS errors:", errors.length ? errors.slice(0, 10) : "none");
await browser.close();
server.close();
process.exit(failed || errors.length ? 1 : 0);
