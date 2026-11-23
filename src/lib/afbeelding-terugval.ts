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
 *   if (mislukt(upstream) && isMaatVariant(pad)) {
 *     upstream = await zoekOrigineel(pad, (p) => haalUpstream(bucketPad, p));
 *   }
 *
 * en zet de Cache-Control dan op iets korts, zodat de echte variant het
 * overneemt zodra hij er wel is.
 *
 * Gebruik `mislukt()` voor de trigger en `ontbreekt()` voor de status die je
 * zelf teruggeeft. Niet je eigen `status === 404`: hier stond dat voorbeeld
 * eerst wel, en dat was fout: zie de uitleg bij `ontbreekt`.
 */

/**
 * "Bestaat dit object niet?" voor een antwoord van Supabase Storage.
 *
 * WAAROM DIT NIET `status === 404` IS
 * Supabase Storage geeft voor een ontbrekend object een **400**, met de 404
 * alleen in de JSON-body:
 *
 *   HTTP/1.1 400
 *   {"statusCode":"404","error":"not_found","message":"Object not found","code":"NoSuchKey"}
 *
 * Daardoor deed de terugval hieronder op anabolen.is maanden niets: de proxy
 * keek op 404, kreeg 400, en liet elke nog niet bestaande maatvariant
 * doorvallen naar zijn eigen 502. De srcset stond aan, het vangnet erachter
 * niet, en je zag het alleen in browsers die werkelijk uit een srcset kiezen.
 *
 * Een GET op een publiek object kent geen andere reden voor een 400, en zou
 * als 404 naar buiten ook geen schade doen. Dus: 400 en 404 zijn hier beide
 * "bestaat niet".
 */
export function ontbreekt(res: Response | null | undefined): boolean {
  return !res || res.status === 404 || res.status === 400;
}

/**
 * Voor de TRIGGER van de terugval: is deze poging mislukt, om het even waarom?
 *
 * Hier mag je ruimer kijken dan bij `ontbreekt`. Krijg je op een maatvariant
 * een 500 of een 403 van de opslag, dan is het origineel ernaast nog steeds een
 * beter antwoord dan een gat in de pagina: groter dan nodig, maar heel. Alleen
 * als ook het origineel niet lukt valt het alsnog door naar de foutstatus.
 *
 * kuur-is-seo en kamagrasite hadden dit allebei zelf al zo opgeschreven, elk
 * met een eigen regel ernaast. Dit is diezelfde keuze, nu op één plek.
 */
export function mislukt(res: Response | null | undefined): boolean {
  return !res || !res.ok;
}

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

/**
 * De cache voor een FOUTANTWOORD uit de beeldproxy. Zet deze expliciet, ook al
 * voelt een foutpagina als iets dat niemand bewaart.
 *
 * WAAROM
 * De 502's op anabolen.is bleven staan nadat de code al gefixt en uitgerold
 * was. Met een cache-buster erachter gaf dezelfde URL netjes 200, zonder
 * buster nog steeds 502, en het antwoord kwam van Cloudflare met "error code:
 * 502" als body. De verklaring zit in next.config.js:
 *
 *   { source: "/media/:path*", headers: [{ key: "Cache-Control",
 *     value: "public, max-age=86400, s-maxage=604800" }] }
 *
 * Die header geldt voor ELK antwoord op dat pad, dus ook voor het antwoord uit
 * de foutafhandeling, want die zet zelf geen Cache-Control. Een 502 van één
 * ongelukkig moment hangt daarmee een week aan de edge, en een deploy haalt
 * hem er niet af. Zet je hier zelf iets korts, dan wint dat en herstelt de URL
 * binnen een minuut zodra het bestand er wel is.
 */
export const CACHE_FOUT = "public, max-age=0, s-maxage=60";
