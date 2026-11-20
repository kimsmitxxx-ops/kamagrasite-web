// Komt uit shop-core (src/lib/afbeelding-terugval.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
import { IS_MAATVARIANT } from "./afbeelding-maten";

/**
 * Terugval voor een maatvariant die er (nog) niet is.
 *
 * WAAROM APART EN NIET IN DE PROXY ZELF
 * `media-proxy.ts` is per repo uit elkaar gelopen: twaalf shops, zeven
 * verschillende versies, van 44 tot 64 regels. Eén gedeelde proxy
 * synchroniseren zou die verschillen overschrijven, en wat daar per shop in
 * zit weet ik niet. Daarom staat alleen dit stukje hier, als functie die je in
 * je eigen proxy aanroept.
 *
 * WAT HET OPLOST
 * `<Afbeelding>` zendt zijn srcset altijd uit, ook voor de duizenden beelden
 * die van voor de maatgeneratie zijn. Vraagt de browser dan `naam-640w.webp`
 * en bestaat die nog niet, dan krijgt hij een 404 en zie je een kapot beeld.
 * Met deze terugval krijgt hij het origineel: groter dan nodig, maar heel.
 *
 * Draai je de backfill (shop-dash/scripts/afbeeldingen-backfill.mjs) over een
 * shop, dan is deze terugval daar niet meer nodig. Hij blijft het vangnet voor
 * alles wat er daarna nog los binnenkomt.
 *
 * INBOUWEN
 * In je eigen proxyStorage, na de eerste mislukte fetch:
 *
 *   if ((!upstream || upstream.status === 404) && isMaatVariant(pad)) {
 *     upstream = await zoekOrigineel(pad, (p) => haalUpstream(bucketPad, p));
 *   }
 *
 * en zet de Cache-Control dan op iets korts, zodat de echte variant het
 * overneemt zodra hij er wel is.
 */

export function isMaatVariant(pad: string): boolean {
  return IS_MAATVARIANT.test(pad);
}

/** Extensies op volgorde van hoe vaak ze voorkomen; de eerste treffer wint. */
const EXTENSIES = ["webp", "jpg", "png", "jpeg", "avif", "gif"] as const;

/**
 * Zoekt het origineel bij een maatvariant. `haal` is jouw eigen fetch naar de
 * opslag; die blijft dus in je eigen proxy staan, met jouw bucket en jouw
 * foutafhandeling.
 */
export async function zoekOrigineel(
  variantPad: string,
  haal: (pad: string) => Promise<Response | null>,
): Promise<Response | null> {
  const zonderExtensie = variantPad.replace(IS_MAATVARIANT, "");
  if (zonderExtensie === variantPad) return null;
  for (const ext of EXTENSIES) {
    const poging = await haal(`${zonderExtensie}.${ext}`);
    if (poging?.ok && poging.body) return poging;
  }
  return null;
}

/** Korter dan de gewone beeldcache: de echte variant moet dit kunnen opvolgen. */
export const CACHE_TERUGVAL = "public, max-age=3600, s-maxage=86400";
