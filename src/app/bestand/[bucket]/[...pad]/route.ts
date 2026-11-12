import { proxyStorage } from "@/lib/media-proxy";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

/**
 * Vangnet voor storage-URL's die niet onder /media of /img vallen: een beeld uit
 * de map van een andere shop, of een bucket die later wordt toegevoegd. Zonder
 * deze route zou lib/media.ts zo'n URL wel ontdoen van de hostnaam, maar dan
 * bleef er een pad over dat niets uitserveert.
 *
 * Bewust een allowlist en geen doorgeefluik: anders wordt ons eigen domein een
 * open proxy voor elke bucket in het project, inclusief de bucket met
 * betaalbewijzen.
 */
const TOEGESTAAN = new Set(["product-media", "blog-images"]);

export async function GET(_req: Request, { params }: { params: { bucket: string; pad: string[] } }) {
  if (!TOEGESTAAN.has(params.bucket)) return new Response("Niet gevonden", { status: 404 });
  return proxyStorage(params.bucket, params.pad);
}
