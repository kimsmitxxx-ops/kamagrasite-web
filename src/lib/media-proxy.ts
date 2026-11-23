/**
 * Beeldproxy naar Supabase Storage.
 *
 * Twee redenen dat dit een route handler is en geen rewrite in next.config.js:
 *
 *  1. Een rewrite neemt de response-headers van de bron over. Supabase stuurt
 *     daar `Cache-Control: private, no-cache` en eigen `sb-*`-headers in mee:
 *     het eerste laat elke bezoeker elk beeld opnieuw ophalen, het tweede
 *     verraadt in de netwerk-tab waar het bestand vandaan komt.
 *  2. Hier bouwen we de headers zelf op, dus gaat er alleen door wat we
 *     opschrijven. Dat is een allowlist en geen blocklist, zodat een nieuwe
 *     header van de bron er nooit vanzelf doorheen komt.
 */

import { SB_URL } from "./supabase-config";
import { ontbreekt, mislukt, isMaatVariant, zoekOrigineel, CACHE_TERUGVAL, CACHE_FOUT } from "./afbeelding-terugval";

// Beelden worden nooit onder dezelfde naam inhoudelijk gewijzigd; bij een nieuwe
// foto komt er een nieuwe bestandsnaam. Dus mag dit lang blijven staan.
const CACHE = "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800";

/**
 * Bestaat het object niet (meer)?
 *
 * Supabase Storage antwoordt op een ontbrekend object met **HTTP 400**, en zet
 * de 404 alleen in de JSON-body: `{"statusCode":"404","error":"not_found"}`.
 * De terugval hieronder keek op `status === 404` en sloeg daardoor nooit aan.
 *
 * Gevolg op 20 nov 2026, de dag van de domeinomzetting: 78 van de 129
 * afbeeldingen op de live site gaven een 502. De maatvarianten (`-320w.webp`,
 * `-640w.webp`) bestaan voor deze shop namelijk nog niet, want de foto's zijn
 * geupload voordat die werden klaargezet. Het origineel stond er gewoon
 * (`sildamax.jpg` gaf 200), maar de terugval kwam er niet aan toe.
 *
 * Daarom hier op betekenis controleren en niet op een statuscode: elke
 * mislukte lees telt als ontbrekend, en dan mag de terugval het proberen.
 */

export async function proxyStorage(bucketPad: string, segmenten: string[]): Promise<Response> {
  const pad = (segmenten || []).map(encodeURIComponent).join("/");
  if (!pad || pad.includes("..")) return new Response("Niet gevonden", { status: 404, headers: { "Cache-Control": CACHE_FOUT } });

  const haal = (p: string) =>
    fetch(`${SB_URL}/storage/v1/object/public/${bucketPad}/${p}`, { cache: "no-store" }).catch(() => null);

  let upstream = await fetch(`${SB_URL}/storage/v1/object/public/${bucketPad}/${pad}`, {
    // Onze eigen cache-laag doet het werk; hier geen Next-datacache overheen.
    cache: "no-store",
  }).catch(() => null);

  // Gevraagd om een maatvariant (`naam-640w.webp`) die er nog niet is? Serveer
  // dan het origineel in plaats van een gat.
  //
  // Dit is wat de srcset van <Afbeelding> veilig maakt: die zendt altijd alle
  // maten uit, ook voor de beelden die van voor de maatgeneratie zijn. Zonder
  // deze terugval breekt elk van die beelden zodra de browser een variant
  // kiest, en dat zie je pas op de pagina's die niemand toevallig opent.
  let terugval = false;
  if (mislukt(upstream) && isMaatVariant(pad)) {
    const origineel = await zoekOrigineel(pad, haal);
    if (origineel) {
      upstream = origineel;
      terugval = true;
    }
  }

  // Geen detail uit het antwoord van de bron doorgeven: een foutpagina van
  // Supabase noemt zichzelf, en dat is precies wat hier niet naar buiten mag.
  //
  // De Cache-Control hoort erbij: zonder eigen waarde erft dit antwoord de
  // lange beeldcache uit next.config.js, en hangt een toevallige 502 een week
  // aan de edge. Zie CACHE_FOUT.
  if (!upstream || !upstream.ok || !upstream.body) {
    // Een ontbrekend bestand is een 404 en geen 502. Dat verschil is niet
    // cosmetisch: een 502 leest als "onze server is stuk" en zet je op het
    // verkeerde spoor, precies zoals hierboven gebeurde.
    return new Response("Niet gevonden", { status: ontbreekt(upstream) ? 404 : 502, headers: { "Cache-Control": CACHE_FOUT } });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  const lengte = upstream.headers.get("content-length");
  if (lengte) headers.set("Content-Length", lengte);
  headers.set("Cache-Control", terugval ? CACHE_TERUGVAL : CACHE);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, { status: 200, headers });
}
