// Komt uit shop-core (tools/teksten-registratie.mjs). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
/**
 * Meldt de teksten van deze site aan bij shop-dash, zodat ze daar per pagina
 * bewerkbaar zijn (shop-dash migratie 109 en 110).
 *
 *   node tools/teksten-registratie.mjs            # droogloop: wat zou er heen
 *   node tools/teksten-registratie.mjs --schrijf  # echt aanmelden
 *   node tools/teksten-registratie.mjs --json     # de hele lijst tonen
 *
 * Dit bestand is de motor en is in elke shop gelijk. Wat per site verschilt
 * staat in twee bestanden van de repo zelf:
 *
 *   teksten.config.mjs            welke shop, waar de woordenlijst staat
 *   src/lib/teksten/indeling.mjs  welke tak bij welke pagina hoort, in welk
 *                                 blok een veld valt, en wat schermmeubilair
 *                                 is (PAGINAS, BLOKKEN, SYSTEEM)
 *
 * De woordenlijst is de bron: elk blad daarin wordt een tekstsleutel met zijn
 * puntpad ('cart.titel'), de pagina waar hij op staat en de tekst zoals die
 * in de code staat. Het dashboard mag alleen sleutels tonen die hier langs
 * zijn gekomen.
 *
 * Draai dit na elke wijziging in de woordenlijst. Sleutels die verdwijnen
 * worden in het dashboard apart gezet ("niet meer in de code") en niet stil
 * weggegooid, zodat een aangepaste tekst niet zonder spoor verdwijnt.
 *
 * Nodig in .env.local: SHOP_DASH_URL en SHOP_DASH_API_KEY (dezelfde sleutel
 * waarmee deze site zijn orderbevestigingen laat mailen).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WORTEL = path.resolve(HIER, "..");

const schrijf = process.argv.includes("--schrijf");
const toonJson = process.argv.includes("--json");

const laad = async (relatiefPad) => import(pathToFileURL(path.join(WORTEL, relatiefPad)).href);

const configPad = path.join(WORTEL, "teksten.config.mjs");
if (!fs.existsSync(configPad)) {
  console.error(
    "teksten.config.mjs ontbreekt in deze repo.\n" +
      "Zie shop-core/sjablonen/teksten.config.mjs voor een voorbeeld; het zegt welke\n" +
      "shop dit is en waar de woordenlijst en de indeling staan.",
  );
  process.exit(1);
}

const config = (await laad("teksten.config.mjs")).default;
const woordenlijstModule = await laad(config.woordenlijst);
const woordenlijst = woordenlijstModule[config.export || "nl"];
if (!woordenlijst || typeof woordenlijst !== "object") {
  console.error(`In ${config.woordenlijst} staat geen export "${config.export || "nl"}".`);
  process.exit(1);
}
const { PAGINAS, BLOKKEN = {}, SYSTEEM = {}, SYSTEEM_NAAM, OVERSLAAN = [], WOORDEN = {}, VELD_LABELS = {} } =
  await laad(config.indeling);

// ── Labels ────────────────────────────────────────────────────────────

/** Woorden die in sleutelnamen voorkomen, in gewoon Nederlands. */
const STANDAARD_WOORDEN = {
  cta: "Knop",
  usp: "Belofte",
  sub: "onderregel",
  kop: "kop",
  titel: "Titel",
  intro: "Intro",
  uitleg: "uitleg",
  faq: "Veelgestelde vraag",
  pct: "percentage",
  seo: "SEO",
  url: "URL",
};

/** Veldnamen binnen een lijst-item. */
const STANDAARD_VELD_LABELS = {
  v: "Vraag",
  a: "Antwoord",
  q: "Vraag",
  vraag: "Vraag",
  antwoord: "Antwoord",
  titel: "Titel",
  kop: "Kop",
  sub: "Onderregel",
  tekst: "Tekst",
  naam: "Naam",
  vragen: "Vragen",
  items: "Items",
};

const woorden = { ...STANDAARD_WOORDEN, ...WOORDEN };
const veldLabels = { ...STANDAARD_VELD_LABELS, ...VELD_LABELS };
const overslaan = new Set(OVERSLAAN);

function leesbaar(naam) {
  const delen = String(naam)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => woorden[w.toLowerCase()] || w);
  const tekst = delen.join(" ").toLowerCase();
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

function blokVoor(tak, naam) {
  const regels = BLOKKEN[tak];
  if (!regels) return null;
  for (const [patroon, blok] of regels) {
    if (patroon === null || patroon.test(naam)) return blok;
  }
  return null;
}

/** Schermmeubilair: knoppen, menu-items, filters. Standaard verborgen in het dashboard. */
const STANDAARD_SYSTEEM_NAAM =
  /^(sluiten|menu|menuSluiten|vorige|volgende|toonMeer|paginas|snelnavigatie|bezig|laden|sluit)$/;

function isSysteem(tak, naam) {
  const regel = SYSTEEM[tak];
  if (regel && regel(naam)) return true;
  return (SYSTEEM_NAAM || STANDAARD_SYSTEEM_NAAM).test(naam);
}

// ── Soort en vorm ─────────────────────────────────────────────────────

const PLAATSHOUDERS = {
  ref: "het bestelnummer",
  email: "het e-mailadres van de klant",
  bedrag: "het bedrag",
  locatie: "de verzendlocatie",
  naam: "de naam van de klant",
  n: "het aantal",
  pct: "het kortingspercentage",
  dagen: "het aantal dagen",
};

/**
 * Uitleg onder een veld met een plaatshouder. Een tekst als "Bestelling {ref}
 * staat voor je klaar" krijgt het bestelnummer pas op de pagina; haalt iemand
 * {ref} weg, dan staat die zin er voorgoed zonder nummer.
 */
function hulpBijTekst(waarde) {
  const gevonden = [...new Set(waarde.match(/\{[a-zA-Z]+\}/g) || [])];
  if (gevonden.length === 0) return null;
  const uitleg = gevonden
    .map((p) => `${p} = ${PLAATSHOUDERS[p.slice(1, -1)] || "wordt door de site ingevuld"}`)
    .join(", ");
  return `Laat ${gevonden.join(" en ")} staan: ${uitleg}.`;
}

function soortVanTekst(waarde) {
  if (/<[a-z][^>]*>/i.test(waarde)) return "rijk";
  if (waarde.includes("\n") || waarde.length > 180) return "lang";
  return "kort";
}

/** De velden van een lijst, afgeleid uit de items die in de code staan. */
function veldenVan(items, pad) {
  const namen = [];
  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(
        `${pad}: een lijst met losse teksten kan dit script nog niet aanmelden. ` +
          `Maak er een lijst van objecten van, bijvoorbeeld [{ tekst: "…" }].`,
      );
    }
    for (const naam of Object.keys(item)) if (!namen.includes(naam)) namen.push(naam);
  }
  return namen.map((naam) => {
    const voorbeeld = items.map((i) => i[naam]).find((v) => v !== undefined);
    if (Array.isArray(voorbeeld)) {
      return {
        naam,
        label: veldLabels[naam] || leesbaar(naam),
        soort: "lijst",
        velden: veldenVan(voorbeeld, `${pad}.${naam}`),
      };
    }
    return {
      naam,
      label: veldLabels[naam] || leesbaar(naam),
      soort: typeof voorbeeld === "string" ? soortVanTekst(voorbeeld) : "kort",
    };
  });
}

// ── De woordenlijst doorlopen ─────────────────────────────────────────

function rijenUit(dict) {
  const rijen = [];
  const overgeslagen = [];
  let teller = 0;

  const loop = (waarde, pad) => {
    const tak = pad[0];
    const naam = pad[pad.length - 1];
    const sleutel = pad.join(".");
    if (overslaan.has(sleutel) || overslaan.has(naam)) return;

    const pagina = PAGINAS[tak];
    if (!pagina) {
      overgeslagen.push(`${sleutel} (geen pagina voor tak "${tak}")`);
      return;
    }

    const basis = () => ({
      sleutel,
      pagina: pagina.pagina,
      pagina_label: pagina.label,
      pagina_pad: pagina.pad ?? null,
      pagina_volgorde: pagina.volgorde ?? 100,
      // Een tekst die twee niveaus diep zit krijgt een eigen blok met de naam
      // van dat niveau (product.voorraadMelding.kop → blok "Voorraadmelding").
      groep: pad.length > 2 ? leesbaar(pad[pad.length - 2]) : blokVoor(tak, naam) || pagina.label,
      label: leesbaar(naam),
      volgorde: (teller += 10),
      systeem: isSysteem(tak, naam),
    });

    if (typeof waarde === "string") {
      rijen.push({ ...basis(), standaard: waarde, soort: soortVanTekst(waarde), hulp: hulpBijTekst(waarde) });
      return;
    }
    if (Array.isArray(waarde)) {
      if (waarde.length === 0) {
        overgeslagen.push(`${sleutel} (lege lijst, geen vorm te bepalen)`);
        return;
      }
      rijen.push({ ...basis(), standaard: waarde, soort: "lijst", velden: veldenVan(waarde, sleutel) });
      return;
    }
    if (waarde && typeof waarde === "object") {
      for (const [k, v] of Object.entries(waarde)) loop(v, [...pad, k]);
      return;
    }
    // Booleans en getallen zijn schakelaars, geen tekst.
    overgeslagen.push(`${sleutel} (${typeof waarde})`);
  };

  for (const [k, v] of Object.entries(dict)) loop(v, [k]);
  return { rijen, overgeslagen };
}

// ── Draaien ───────────────────────────────────────────────────────────

function env(naam) {
  if (process.env[naam]) return process.env[naam];
  const bestand = path.join(WORTEL, ".env.local");
  if (!fs.existsSync(bestand)) return "";
  const m = fs.readFileSync(bestand, "utf8").match(new RegExp(`^${naam}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const { rijen, overgeslagen } = rijenUit(woordenlijst);

const perPagina = {};
for (const r of rijen) {
  const rij = (perPagina[r.pagina_label] = perPagina[r.pagina_label] || { tekst: 0, systeem: 0 });
  if (r.systeem) rij.systeem++;
  else rij.tekst++;
}

const zichtbaar = rijen.filter((r) => !r.systeem).length;
console.log(`${rijen.length} tekstsleutels, waarvan ${zichtbaar} zichtbaar in het dashboard:`);
for (const [label, n] of Object.entries(perPagina)) {
  const staart = n.systeem ? `  (+${n.systeem} knop- en menutekst)` : "";
  console.log(`  ${String(n.tekst).padStart(4)}  ${label}${staart}`);
}
if (overgeslagen.length > 0) {
  console.log(`\nNiet aangemeld (${overgeslagen.length}):`);
  for (const o of overgeslagen) console.log(`  - ${o}`);
}
if (toonJson) console.log(JSON.stringify(rijen, null, 2));

if (!schrijf) {
  console.log("\nDroogloop. Met --schrijf gaat het naar shop-dash.");
  process.exit(0);
}

const dash = (env("SHOP_DASH_URL") || "https://shop-dash-ruby.vercel.app").replace(/\/+$/, "");
const sleutel = env("SHOP_DASH_API_KEY");
if (!sleutel) {
  console.error("SHOP_DASH_API_KEY ontbreekt in .env.local");
  process.exit(1);
}

const res = await fetch(`${dash}/api/teksten/registratie`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-shop-dash-key": sleutel },
  body: JSON.stringify({ shop: config.shopSlug, rijen }),
});
const uit = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`\nAanmelden mislukt (${res.status}):`, uit.error || uit);
  process.exit(1);
}
console.log(
  `\nAangemeld bij ${dash}: ${uit.aangemeld} sleutels, ${uit.totaal} in totaal` +
    (uit.verouderd ? `, ${uit.verouderd} staan niet meer in de code` : ""),
);
