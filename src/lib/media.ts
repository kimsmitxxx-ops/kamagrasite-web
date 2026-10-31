/**
 * Supabase-Storage-URL's omzetten naar paden op ons eigen domein.
 *
 * Aanleiding: in de database staan volledige Supabase-URL's. Elke <Image>, elk
 * og:image, elke JSON-LD-galerij en elke blogtekst zette daarmee de
 * projectnaam van het Supabase-project in de broncode van de pagina. Daardoor
 * kon iedere bezoeker zien waar onze data staat, en kostte elk beeld ook nog
 * een extra DNS- en TLS-ronde naar een vreemde host.
 *
 * Waarom dit in de fetch van de Supabase-client hangt (lib/supabase.ts) en niet
 * per component: er zijn tientallen renderplekken en één nieuwe pagina die het
 * vergeet is het lek weer terug. Op deze plek komt elke query er langs, ook de
 * velden waar je niet aan denkt - body-HTML met een <img> erin, specificaties,
 * een galerij in een JSON-kolom.
 *
 * De paden worden uitgeserveerd door src/app/media, src/app/img en
 * src/app/bestand, die het bestand server-side ophalen.
 */

const SHOP_MAP = "kamagrasite";

// Elke hostnaam, niet alleen de onze: ook een tweede project of een storage-URL
// die iemand later in de database zet mag hier niet door glippen. `sign` staat
// erbij omdat een ondertekende URL net zo goed de host verraadt.
const STORAGE_URL =
  /https?:\/\/[a-z0-9-]+\.supabase\.(?:co|in)\/storage\/v1\/object\/(?:public|sign)\/([^/\s"'`)\\]+)\/([^\s"'`)\\?]+)/gi;

function pad(bucket: string, rest: string): string {
  if (bucket === "product-media" && rest.startsWith(`${SHOP_MAP}/`)) {
    return `/media/${rest.slice(SHOP_MAP.length + 1)}`;
  }
  if (bucket === "blog-images") return `/img/${rest}`;
  return `/bestand/${bucket}/${rest}`;
}

/** Eén URL omzetten. Laat alles wat geen Supabase-storage-URL is ongemoeid. */
export function mediaPad(src?: string | null): string {
  if (!src) return "";
  return src.replace(STORAGE_URL, (_m, bucket: string, rest: string) => pad(bucket, rest));
}

/** Alle storage-URL's in een stuk tekst omzetten (JSON-body, HTML, srcset). */
export function schoonMediaTekst(tekst: string): string {
  return tekst.replace(STORAGE_URL, (_m, bucket: string, rest: string) => pad(bucket, rest));
}

/**
 * De fetch die de Supabase-client gebruikt: haalt het antwoord op en haalt de
 * storage-URL's uit het JSON-antwoord voordat de rest van de app het ziet.
 * Niet-JSON (een bestandsdownload) gaat onaangeroerd door.
 */
export async function schoonFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!(res.headers.get("content-type") || "").includes("json")) return res;

  const tekst = await res.text();
  const schoon = schoonMediaTekst(tekst);
  const kop = new Headers(res.headers);
  // De vervanging maakt de body korter, dus de oorspronkelijke lengte klopt niet meer.
  kop.delete("content-length");
  return new Response(schoon, { status: res.status, statusText: res.statusText, headers: kop });
}

/**
 * De omgekeerde weg: een eigen pad terug naar de echte storage-URL. Alleen voor
 * server-side gebruik, bijvoorbeeld als een beeld naar een ander systeem moet
 * dat niet op ons domein kijkt.
 */
export function storageUrl(eigenPad: string, basis: string): string {
  const b = basis.replace(/\/+$/, "");
  if (eigenPad.startsWith("/media/")) return `${b}/storage/v1/object/public/product-media/${SHOP_MAP}/${eigenPad.slice(7)}`;
  if (eigenPad.startsWith("/img/")) return `${b}/storage/v1/object/public/blog-images/${eigenPad.slice(5)}`;
  if (eigenPad.startsWith("/bestand/")) return `${b}/storage/v1/object/public/${eigenPad.slice(9)}`;
  return eigenPad;
}
