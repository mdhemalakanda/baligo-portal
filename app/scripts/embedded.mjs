/**
 * Embedded-mode QA: simulates the wp-admin environment (admin bar, fixed WP
 * menu, #wpcontent padding, bridge markup identical to baligo.php) and loads
 * the bundle with BALIGO_APP.scope = "admin". Verifies:
 *  1. Click navigation never blanks.
 *  2. Submenu deep-links (page=baligo-settings etc.) open the right route.
 *  3. Layout: sidebar beside WP menu, content full width with 30px padding.
 *  4. Dropdown menus render ABOVE the WP admin menu (z-index).
 *  5. Sticky page rails sit below the topbar, not underneath it.
 * Dev/QA tooling only — never shipped to WordPress.
 */
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../../assets");
const shotsDir = path.resolve(__dirname, "../../qa-screenshots");
mkdirSync(shotsDir, { recursive: true });

const MIME = { ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };

// Mirrors baligo_page_route() in baligo.php.
const ROUTES = {
  baligo: "/admin",
  "baligo-hotels": "/admin/hotels",
  "baligo-rooms": "/admin/rooms",
  "baligo-rates": "/admin/rates",
  "baligo-history": "/admin/history",
  "baligo-contracts": "/admin/contracts",
  "baligo-agents": "/admin/agents",
  "baligo-settings": "/admin/settings",
};

const server = http.createServer(async (req, res) => {
  try {
    let p = req.url.split("?")[0];
    if (p === "/favicon.ico") { res.writeHead(204); res.end(); return; }
    if (p === "/" || p.startsWith("/wp-admin")) {
      const q = new URL(req.url, "http://x").searchParams;
      const pageSlug = q.get("page") ?? "baligo";
      const initialRoute = ROUTES[pageSlug] ?? "/admin";
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>wp-admin mock — Baligo</title>
<link rel="stylesheet" href="/css/baligo.css">
<script>document.addEventListener('DOMContentLoaded', function(){ document.body.classList.add('baligo-embedded'); });<\/script>
<style>
  body { margin: 0; background: #f0f0f1; font-family: system-ui; }
  /* wp-admin body carries baligo-embedded via the admin_body_class filter */
  #adminbar { position: fixed; top: 0; left: 0; right: 0; height: 32px; background: #1d2327; color: #c3c4c7; z-index: 99999; display:flex; align-items:center; padding: 0 12px; font-size: 13px; }
  #adminmenu { position: fixed; top: 32px; bottom: 0; left: 0; width: 160px; background: #1d2327; color: #c3c4c7; z-index: 9990; padding-top: 12px; font-size: 14px; }
  #adminmenu div { padding: 6px 12px; }
  #wpcontent { margin-left: 160px; padding-left: 0; }
  #wpfooter { display: none; }
  .baligo-bridge { margin: 0; padding: 0; }
  .baligo-bridge #baligo-app-root { min-height: 100vh; }
</style></head>
<body>
<div id="adminbar">🅦 Howdy, admin</div>
<div id="adminmenu"><div>Dashboard</div><div>Posts</div><div>Pages</div><div><b>Baligo</b></div><div>Plugins</div><div>Settings</div></div>
<div id="wpcontent"><div class="baligo-bridge baligo-embedded"><div id="baligo-app-root" data-scope="admin"></div></div></div>
<script>window.BALIGO_APP = { scope: "admin", initialRoute: ${JSON.stringify(initialRoute)}, demo: true };</script>
<script type="module" src="/js/baligo.js"></script>
</body></html>`;
      res.writeHead(200, { "content-type": "text/html" });
      res.end(html);
      return;
    }
    const file = await readFile(path.join(assetsDir, p));
    res.writeHead(200, { "content-type": MIME[path.extname(p)] ?? "application/octet-stream" });
    res.end(file);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1040 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

let failed = 0;
function assert(cond, label) {
  if (cond) console.log("pass  ", label);
  else { failed++; console.log("FAIL  ", label); }
}

// 1. Submenu deep links land on the right screen
const deepLinks = [
  ["baligo", "Portfolio health", "dashboard"],
  ["baligo-hotels", "Nusa Dua Beachfront Resort & Spa", "hotels"],
  ["baligo-rooms", "Room", "rooms"],
  ["baligo-rates", "Net rate", "rates"],
  ["baligo-history", "changes", "history"],
  ["baligo-contracts", "Nusa-Dua-Beachfront-Rates-2027", "contracts"],
  ["baligo-agents", "Sakura Travels", "agents"],
  ["baligo-settings", "Company name", "settings"],
];
for (const [slug, expect, label] of deepLinks) {
  await page.goto(`${base}/wp-admin/admin.php?page=${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(450);
  const body = ((await page.textContent("body")) ?? "").replace(/\s+/g, " ");
  assert(body.includes(expect) && page.url().includes(ROUTES[slug].replace("/", "#/")), `submenu "page=${slug}" opens ${label}`);
}

// 2. Click navigation never blanks (from a deep-linked start)
await page.goto(`${base}/wp-admin/admin.php?page=baligo`, { waitUntil: "networkidle" });
await page.waitForTimeout(450);
for (const [label, expect] of [
  ["Hotels", "Nusa Dua Beachfront Resort & Spa"],
  ["Supplier Rates", "Net rate"],
  ["Agents", "Sakura Travels"],
  ["Dashboard", "Portfolio health"],
]) {
  await page.getByRole("link", { name: new RegExp(`^${label}\\b`, "i") }).first().click();
  await page.waitForTimeout(320);
  const body = ((await page.textContent("body")) ?? "").replace(/\s+/g, " ");
  assert(body.includes(expect), `click "${label}" renders`);
}

// 3. Layout: sidebar beside WP menu; content full width with ~30px padding
const layout = await page.evaluate(() => {
  const aside = document.querySelector(".baligo-sidebar");
  const main = document.querySelector("main");
  if (!aside || !main) return null;
  const a = aside.getBoundingClientRect();
  const m = main.getBoundingClientRect();
  return { asideLeft: a.left, asideWidth: a.width, mainLeft: m.left, mainRight: m.right, viewport: window.innerWidth };
});
if (!layout) assert(false, "layout probe");
else {
  assert(layout.asideLeft === 160 && layout.asideWidth === 240, `sidebar at x=160 w=240 (got ${layout.asideLeft}, ${layout.asideWidth})`);
  const padL = layout.mainLeft - (layout.asideLeft + layout.asideWidth);
  const padR = layout.viewport - layout.mainRight;
  // "30px space" check: the main box spans the full remaining width and
  // its own padding is exactly 30px on each side.
  const pad = await page.evaluate(() => {
    const m = document.querySelector("main");
    const cs = getComputedStyle(m);
    return { left: parseFloat(cs.paddingLeft), right: parseFloat(cs.paddingRight) };
  });
  assert(pad.left === 30 && pad.right === 30, `content padding exactly 30px both sides (got L${pad.left}/R${pad.right})`);
  assert(padL === 0 && padR < 2, `main spans full width edge-to-edge (gap L${padL}/R${padR})`);
}

// 4. Notification dropdown renders ABOVE the WP admin menu
await page.getByRole("button", { name: /notifications/i }).click();
await page.waitForTimeout(350);
const dd = await page.evaluate(() => {
  const w = document.querySelector("[data-radix-popper-content-wrapper]");
  if (!w) return null;
  const r = w.getBoundingClientRect();
  return { z: getComputedStyle(w).zIndex, left: r.left };
});
if (!dd) assert(false, "notifications dropdown opened");
else {
  assert(Number(dd.z) > 99999, `dropdown z-index above wp-admin (${dd.z})`);
  await page.keyboard.press("Escape");
}

// 5. Rate editor sticky rail fully visible below the topbar
await page.goto(`${base}/wp-admin/admin.php?page=baligo-rates`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.goto(`${base}/#/admin/rates/rate-003`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.mouse.wheel(0, 600);
await page.waitForTimeout(400);
const rail = await page.evaluate(() => {
  const el = document.querySelector("aside.xl\\:sticky");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top };
});
if (rail === null) assert(false, "rate editor sticky rail found");
else {
  assert(rail.top >= 96 && rail.top < 160, `sticky rail visible below header chrome (top=${Math.round(rail.top)}px, chrome=96px)`);
}
await page.screenshot({ path: path.join(shotsDir, "wp-admin-embedded.png") });
console.log("shot  wp-admin-embedded.png");

console.log("\nJS errors:", errors.length ? errors.slice(0, 8) : "none");
await browser.close();
server.close();
process.exit(failed || errors.length ? 1 : 0);
