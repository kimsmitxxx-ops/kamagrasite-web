// Komt uit shop-core (src/lib/afbeelding-maten.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
/**
 * De maten waarin een afbeelding wordt klaargezet, en hoe die heten.
 *
 * WAAROM DIT BESTAAT
 * Lighthouse meldt op de homepage van kamagrashop 127 KiB verspilling onder
 * "Properly size images", plus 46 KiB onder "next-gen formats". De shops
 * serveren het origineel aan iedereen: een telefoon van 390 pixels breed
 * krijgt hetzelfde bestand als een scherm van 2560.
 *
 * Eerlijk over de opbrengst: Lighthouse schat de tijdwinst op 30ms, want in de
 * labsimulatie is het netwerk niet de rem (671 KiB totaal, score 100 op
 * paginagewicht). De winst zit in bytes voor wie op een echte mobiele
 * verbinding zit, niet in het rapportcijfer.
 *
 * WAAROM NIET next/image
 * Dat kan hier prima, want de beelden lopen sinds de media-proxy over ons
 * eigen domein. Maar Vercel rekent beeldoptimalisaties per bronafbeelding af,
 * en met twaalf shops en duizenden productfoto's is dat een terugkerende post
 * voor iets wat één keer bij het uploaden kan. Vandaar de WordPress-aanpak:
 * maten maken op het moment dat het bestand binnenkomt.
 *
 * DE NAAMGEVING
 * Naast `<naam>.<ext>` komt `<naam>-<breedte>w.webp` in dezelfde map. Dus:
 *
 *   products/1763-ab12cd.jpg          het origineel, onaangeroerd
 *   products/1763-ab12cd-320w.webp
 *   products/1763-ab12cd-640w.webp
 *   products/1763-ab12cd-960w.webp
 *   products/1763-ab12cd-1280w.webp
 *
 * Het origineel blijft staan en blijft de `src`. Dat is belangrijk: elke
 * bestaande URL in de database, in Google Afbeeldingen en in de overgenomen
 * teksten blijft werken, en een browser zonder srcset-ondersteuning krijgt
 * gewoon het origineel.
 *
 * WAT ALS DE MATEN ER NOG NIET ZIJN
 * Dan valt de beeldproxy terug op het origineel (zie `media-proxy.ts`). Daarom
 * mag de component zijn srcset altijd uitzenden, ook voor de duizenden
 * bestanden die nog van voor deze wijziging zijn. De backfill maakt ze daarna
 * echt kleiner, maar niets gaat stuk zolang dat nog niet gebeurd is.
 */

/**
 * Een merkteken achter de variant-URL's, om een vastgelopen CDN-cache te
 * omzeilen. Leeg laten betekent: geen merkteken.
 *
 * WAAROM DIT BESTAAT
 * Op anabolen.is gaf elke maatvariant een 502 zolang de terugval kapot was
 * (zie afbeelding-terugval.ts). Die 502 kreeg via de `headers()` in
 * next.config.js een Cache-Control van s-maxage=604800 mee, dus bleef hij een
 * week in de cache staan nadat de code al gefixt en uitgerold was. Meetbaar:
 *
 *   /media/products/dianabol-10-mg-ml-utinon-320w.webp        502
 *   /media/products/dianabol-10-mg-ml-utinon-320w.webp?n=1    200, 7.952 bytes
 *   een variant die nog nooit was opgevraagd, kaal             200
 *
 * Die laatste regel is het bewijs dat het de cache is en niet de route: zelfde
 * vorm, zelfde handler, enige verschil is of de URL eerder is opgevraagd toen
 * de bug nog live was. Zonder Cloudflare-credentials op de machine (en zonder
 * zekerheid of de entry bij Cloudflare of bij Vercel vastzit) is de URL
 * veranderen de enige weg die niet van iemand anders afhangt.
 *
 * WAAROM ALLEEN DE VARIANTEN
 * Het merkteken komt niet achter het origineel. Dat is de `src`, en die staat
 * in Google Afbeeldingen en in overgenomen teksten; die URL laat je met rust.
 * De varianten staan alleen in de srcset en hebben geen eigen geschiedenis.
 *
 * WEGHALEN
 * Zet dit terug op "" zodra de cache echt leeg is. Het kost niets om het te
 * laten staan, maar een merkteken dat niemand meer kan uitleggen is rommel.
 */
export const VARIANT_MERK = "2";

/** De breedtes die we klaarzetten. Bewust kort: elke maat kost opslag. */
export const BREEDTES = [320, 640, 960, 1280] as const;

export type Breedte = (typeof BREEDTES)[number];

/** Herkent een pad dat zelf al een maatvariant is, zodat we die niet opnieuw schalen. */
export const IS_MAATVARIANT = /-(\d{2,4})w\.webp$/i;

/**
 * `/media/products/1763-ab12cd.jpg` + 640 -> `/media/products/1763-ab12cd-640w.webp`
 *
 * Geeft null terug voor dingen die geen gewone afbeelding zijn (een SVG schaal
 * je niet, en een pad dat al een variant is laat je met rust).
 */
export function maatPad(src: string, breedte: number): string | null {
  if (!src || IS_MAATVARIANT.test(src)) return null;
  if (/\.svg($|\?)/i.test(src)) return null;
  // Query en anker blijven achter de nieuwe naam staan.
  const [pad, rest = ""] = src.split(/(?=[?#])/, 2);
  const punt = pad.lastIndexOf(".");
  if (punt <= pad.lastIndexOf("/")) return null; // geen extensie
  return `${pad.slice(0, punt)}-${breedte}w.webp${rest}`;
}

/**
 * De srcset-waarde voor een bron. Leeg betekent: geen srcset uitzenden.
 *
 * `maxBreedte` snijdt maten af die groter zijn dan het beeld ooit getoond
 * wordt; een kaartje van 300 pixels heeft niets aan een 1280-variant.
 */
export function srcSet(src: string, maxBreedte?: number): string {
  let bruikbaar: number[] = BREEDTES.filter((b) => !maxBreedte || b <= maxBreedte * 2);

  // Altijd minstens de kleinste maat aanbieden, ook als die groter is dan de
  // plek waar het beeld staat.
  //
  // Zonder deze regel viel precies de grootste verspilling buiten de boot: een
  // artikelthumbnail staat in een vakje van 112 pixels, dus 112 * 2 = 224, en
  // dan haalt geen enkele breedte het filter. Die kreeg dan het origineel van
  // 147 KB voor een plekje van 112 pixels. De 320w-variant is nog steeds
  // ruimer dan nodig maar scheelt daar het meest van alles.
  if (!bruikbaar.length) bruikbaar = [BREEDTES[0]];

  const delen = bruikbaar
    .map((b) => {
      const p = maatPad(src, b);
      if (!p) return null;
      // Het merkteken erachter, en netjes achter een query die er al staat.
      const merk = VARIANT_MERK ? (p.includes("?") ? `&v=${VARIANT_MERK}` : `?v=${VARIANT_MERK}`) : "";
      return `${p}${merk} ${b}w`;
    })
    .filter(Boolean);
  return delen.join(", ");
}
