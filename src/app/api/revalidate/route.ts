import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { SB_TAG } from "@/lib/supabase";
import { TEKSTEN_TAG } from "@/lib/teksten-server";

/**
 * On-demand ISR cache busting. shop-dash POSTt hier wanneer een admin iets
 * opslaat (product/blog/categorie/pagina). Token = REVALIDATE_TOKEN env.
 *
 * Body: { all?: true, paths?: string[], tags?: string[] }
 *
 * Twee dingen die hier stil misgingen, allebei gevonden op 20 nov 2026 toen
 * zestien stadspagina's na een databasewijziging gewoon de oude tekst bleven
 * tonen terwijl de purge {"ok":true} teruggaf:
 *
 *  1. `all: true` werd genegeerd. En dat is nu juist wat shop-dash bij een
 *     gewone opslagactie stuurt (zie purge-site.ts, de standaardbody). De
 *     route las alleen paths en tags, vond lege lijsten, en meldde succes.
 *     Elke wijziging in het dashboard bleef dus tot het eind van het
 *     ISR-venster hangen. kamagrashop had deze fix al, deze shop niet.
 *
 *  2. Een pad zonder afsluitende slash doet niets. Deze site draait met
 *     `trailingSlash: true`, dus de cachesleutel is "/nijmegen/" en niet
 *     "/nijmegen". Gemeten: het eerste pad deed niets, het tweede wel.
 *     Dat raakt ook de knoppen in shop-dash, die "/winkel" en "/kennisbank"
 *     sturen. Daarom normaliseren we hier en purgen we beide vormen, zodat
 *     elke aanroeper het goed doet zonder dat hij dat hoeft te weten.
 */

/** Beide schrijfwijzen, want met trailingSlash is alleen de ene de sleutel. */
function metEnZonderSlash(pad: string): string[] {
  const p = pad.startsWith("/") ? pad : `/${pad}`;
  if (p === "/") return ["/"];
  // Een pad met een bestandsnaam (/sitemap.xml) krijgt nooit een slash.
  if (/\.[a-z0-9]+$/i.test(p)) return [p];
  const kaal = p.replace(/\/+$/, "");
  return [kaal, `${kaal}/`];
}
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-revalidate-token") || req.nextUrl.searchParams.get("token");
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected) return NextResponse.json({ error: "REVALIDATE_TOKEN niet geconfigureerd" }, { status: 500 });
  if (token !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];

  if (body?.all === true) {
    // De tag op de Supabase-fetch is wat er echt toe doet: alle pagina's lezen
    // daardoorheen, dus die ene tag haalt productprijzen, koop-pagina's en
    // stadsteksten in een keer onderuit. De paden erbij voor de twee routes
    // die niet via een losse query lopen.
    tags.push(SB_TAG, TEKSTEN_TAG);
    paths.push("/", "/sitemap.xml");
  }

  const gepurgd: string[] = [];
  for (const p of paths) {
    for (const variant of metEnZonderSlash(p)) {
      try { revalidatePath(variant, "page"); gepurgd.push(variant); } catch {}
    }
  }
  for (const t of tags) { try { revalidateTag(t); } catch {} }

  return NextResponse.json({ ok: true, revalidated: { paths: gepurgd, tags } });
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST with x-revalidate-token and body { paths: [...] }" });
}
