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

// Beelden worden nooit onder dezelfde naam inhoudelijk gewijzigd; bij een nieuwe
// foto komt er een nieuwe bestandsnaam. Dus mag dit lang blijven staan.
const CACHE = "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800";

export async function proxyStorage(bucketPad: string, segmenten: string[]): Promise<Response> {
  const pad = (segmenten || []).map(encodeURIComponent).join("/");
  if (!pad || pad.includes("..")) return new Response("Niet gevonden", { status: 404 });

  const upstream = await fetch(`${SB_URL}/storage/v1/object/public/${bucketPad}/${pad}`, {
    // Onze eigen cache-laag doet het werk; hier geen Next-datacache overheen.
    cache: "no-store",
  }).catch(() => null);

  // Geen detail uit het antwoord van de bron doorgeven: een foutpagina van
  // Supabase noemt zichzelf, en dat is precies wat hier niet naar buiten mag.
  if (!upstream || !upstream.ok || !upstream.body) {
    return new Response("Niet gevonden", { status: upstream?.status === 404 ? 404 : 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  const lengte = upstream.headers.get("content-length");
  if (lengte) headers.set("Content-Length", lengte);
  headers.set("Cache-Control", CACHE);
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, { status: 200, headers });
}
