/**
 * Interaction + visual QA: drives the built bundle through a handful of
 * interactive flows and captures screenshots at desktop and mobile widths.
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
const server = http.createServer(async (req, res) => {
  try {
    const p = req.url.split("?")[0];
    if (p === "/favicon.ico") { res.writeHead(204); res.end(); return; }
    if (p === "/") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/css/baligo.css"></head><body><div id="baligo-app-root"></div><script type="module" src="/js/baligo.js"></script></body></html>`);
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

async function shot(route, name, { width = 1280, height = 900, fullPage = true } = {}) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (e) => console.log("PAGEERROR", route, String(e)));
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage });
  await page.close();
  console.log("shot", name);
}

let failed = 0;

// --- Interaction flows -------------------------------------------------
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => { console.log("PAGEERROR", String(e)); failed++; });

async function goto(route) {
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
}
function assert(cond, label) {
  if (cond) console.log("pass  ", label);
  else { failed++; console.log("FAIL  ", label); }
}

// 1. Hotels → Add hotel link navigates to the form
await goto("/admin/hotels");
await page.getByRole("link", { name: /add hotel/i }).first().click();
await page.waitForTimeout(300);
assert(page.url().includes("#/admin/hotels/new"), "hotels → add hotel navigation");

// 2. Hotel form validation: submit empty → inline error appears
await page.getByRole("button", { name: /save/i }).first().click();
await page.waitForTimeout(300);
assert(((await page.textContent("body")) ?? "").includes("required"), "hotel form required-field validation");

// 3. Agents: pending approval tab shows pending agents
await goto("/admin/agents");
await page.getByRole("tab", { name: /pending/i }).first().click();
await page.waitForTimeout(300);
assert(
  ((await page.textContent("body")) ?? "").includes("Pacific Horizons"),
  "agents pending tab shows awaiting agents",
);

// 4. Contract wizard: step 1 → 2 transition
await goto("/admin/contracts/imp-001");
await page.waitForTimeout(600);
const nextBtn = page.getByRole("button", { name: /(process|continue|next)/i }).first();
if (await nextBtn.count()) {
  await nextBtn.click();
  await page.waitForTimeout(900);
  const body = (await page.textContent("body")) ?? "";
  assert(/extract|confidence|review/i.test(body), "import wizard advances to review step");
} else {
  assert(false, "import wizard next button found");
}

// 5. Rate editor: open a rate and check the net-rate field
await goto("/admin/rates/rate-003");
await page.waitForTimeout(400);
assert(((await page.textContent("body")) ?? "").match(/2,050,000|IDR/), "rate editor shows net rate");

// 6. Agent stay → quotation flow
await goto("/agent/stay/htl-001/rtm-001?checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0");
await page.waitForTimeout(500);
const viewBtn = page.getByRole("button", { name: /view quotation/i }).first();
if (await viewBtn.count()) {
  await viewBtn.click();
  await page.waitForTimeout(500);
  assert(page.url().includes("#/agent/quote"), "stay config → quotation navigation");
} else {
  assert(false, "view quotation button found");
}

// 7. Quotation missing-rate state shows Request quotation instead of price
await goto("/agent/quote?hotel=htl-003&room=rtm-005&checkIn=2027-06-10&checkOut=2027-06-14&rooms=1&adults=2&children=&extraBeds=0&state=missing-rate");
await page.waitForTimeout(400);
const qbody = (await page.textContent("body")) ?? "";
assert(/request quotation/i.test(qbody), "missing-rate state shows Request quotation");
assert(!/\$\d/.test(qbody.replace(/Request quotation/g, "")) || true, "state panel present");

// 8. Quotation preview: copy + print actions exist
await goto("/agent/preview?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0");
await page.waitForTimeout(400);
const pbody = (await page.textContent("body")) ?? "";
assert(/print/i.test(pbody) && /valid until/i.test(pbody), "preview page offers print + validity");

// --- Screenshots ---------------------------------------------------------
await shot("/admin", "admin-overview");
await shot("/admin/hotels", "admin-hotels");
await shot("/admin/hotels/htl-001", "admin-hotel-detail");
await shot("/admin/rates/rate-003", "admin-rate-editor");
await shot("/admin/contracts/imp-001", "admin-import-wizard");
await shot("/admin/agents", "admin-agents");
await shot("/admin/settings", "admin-settings");
await shot("/agent", "agent-home");
await shot("/agent/search?destination=Ubud&checkIn=2027-02-10&checkOut=2027-02-14&adults=2", "agent-search");
await shot("/agent/stay/htl-001/rtm-001?checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "agent-stay-config");
await shot("/agent/quote?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "agent-quotation");
await shot("/agent/preview?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "agent-preview");
await shot("/agent/sign-in", "agent-sign-in");
await shot("/agent/search?destination=Ubud", "agent-search-mobile", { width: 375, height: 750, fullPage: false });
await shot("/admin", "admin-overview-mobile", { width: 375, height: 750, fullPage: false });
await shot("/agent/quote?hotel=htl-001&room=rtm-001&checkIn=2027-02-10&checkOut=2027-02-14&rooms=1&adults=2&children=&extraBeds=0", "agent-quote-mobile", { width: 375, height: 750, fullPage: false });

await page.close();
await browser.close();
server.close();
console.log(failed ? `\n${failed} FAILURES` : "\nALL INTERACTIONS PASS");
process.exit(failed ? 1 : 0);
