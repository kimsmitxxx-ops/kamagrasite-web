// Snelle visuele controle: schermafdrukken van de pagina's waar de UI net is
// veranderd, desktop en mobiel.
//
//   node scripts/schermafdruk.mjs [basis-url]
//
// Playwright staat in shop-dash, niet in deze repo; vandaar het directe pad.
// Draai dit tegen een productiebuild (`npm run build && npm start`), want
// achter `next dev` zien links en prijzen er anders uit dan live.

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("C:/Users/Administrator/shop-dash/package.json");
const { chromium } = require("playwright");

const BASIS = (process.argv[2] || "http://localhost:3041").replace(/\/+$/, "");
const UIT = "C:/Users/Administrator/kamagrasite-web/data/shots";
fs.mkdirSync(UIT, { recursive: true });

/** Pagina's die zonder klikken te maken zijn. */
const PAGINAS = [
  ["product-uitverkocht", "/product/kamagra-polo/"],
  ["product-preorder", "/product/cenforce-50mg/"],
  ["product-voorraad", "/product/cenforce-100mg/"],
  ["winkel", "/winkel/"],
];

const browser = await chromium.launch();

for (const [naam, pad] of PAGINAS) {
  for (const [vorm, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobiel", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const res = await page.goto(BASIS + pad, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
    const bestand = path.join(UIT, `${naam}-${vorm}.png`);
    await page.screenshot({ path: bestand, fullPage: vorm === "desktop" });
    console.log(`${naam} ${vorm}: ${res ? res.status() : "geen antwoord"} -> ${bestand}`);
    await ctx.close();
  }
}

// De mand met drie stuks van hetzelfde product: daar hoort de balk naar de
// volgende staffel te staan (3+ = 10%, dus bij twee stuks "nog 1 stuk").
for (const [vorm, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobiel", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASIS}/product/cenforce-100mg/`, { waitUntil: "networkidle", timeout: 45000 });
  const knop = page.getByRole("button", { name: /in de mand|toevoegen|bestellen/i }).first();
  await knop.click({ timeout: 10000 }).catch(() => console.log("  (kon de mand-knop niet vinden)"));
  // Wachten tot de mand het item echt heeft; anders fotografeer je een lege mand.
  await page.waitForFunction(() => {
    try { return (localStorage.getItem("kamagrasite.cart.v2") || "").includes("price_cents"); } catch { return false; }
  }, { timeout: 8000 }).catch(() => console.log("  (mand bleef leeg)"));
  await page.screenshot({ path: path.join(UIT, `lade-${vorm}.png`) });
  // Naar de mand en daar het aantal op twee zetten: dan staat er "nog 1 stuk".
  await page.goto(`${BASIS}/winkelmand/`, { waitUntil: "networkidle", timeout: 45000 });
  const plus = page.getByRole("button").filter({ has: page.locator("svg.lucide-plus") }).first();
  await plus.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(UIT, `winkelmand-${vorm}.png`), fullPage: vorm === "desktop" });
  console.log(`mand ${vorm}: -> ${path.join(UIT, `winkelmand-${vorm}.png`)}`);
  await ctx.close();
}

await browser.close();
console.log(`\nklaar, afdrukken staan in ${UIT}`);
