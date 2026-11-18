import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Welke build draait hier?
 *
 * Op 18 november 2026 bleven de deploys hangen en was dat niet te zien: alle
 * sites gaven 200 met de verwachte inhoud, maar serveerden een oudere build.
 * shop-dash kon die vraag wel beantwoorden, want de gezondheidsrun geeft het
 * commit-sha terug; de shops hadden daar niets voor, dus "staat mijn fix
 * live?" was voor zeven van de negen projecten niet te beantwoorden. Een 200
 * zegt niets over de versie.
 *
 * Hier staat dat sha, de tak en de Next-versie waarmee gebouwd is. De
 * gezondheidsrun in shop-dash vraagt het per shop op en zet het in zijn
 * samenvatting; vergelijken doe je met `git log` van de repo.
 *
 * Achter de gedeelde sleutel, niet publiek: een commit-sha hoort niemand
 * anders iets te zeggen, en op kuur.is mag al helemaal niets naar buiten dat
 * niet hoeft. Zonder sleutel is dit een 404 en niet een 401, zodat het bestaan
 * van de route ook niets verraadt.
 */
export async function GET(req: NextRequest) {
  const verwacht = process.env.SHOP_DASH_API_KEY || "";
  const gegeven = req.headers.get("x-shop-dash-key") || "";
  if (verwacht.length < 16 || gegeven.length !== verwacht.length) {
    return new NextResponse("not found", { status: 404 });
  }
  let diff = 0;
  for (let i = 0; i < gegeven.length; i++) diff |= gegeven.charCodeAt(i) ^ verwacht.charCodeAt(i);
  if (diff !== 0) return new NextResponse("not found", { status: 404 });

  let next: string | null = null;
  try {
    // De echte versie uit het geïnstalleerde pakket, niet uit package.json van
    // de repo: na een upgrade die niet gedeployd is zouden die verschillen, en
    // juist dat verschil willen we zien.
    next = (require("next/package.json") as { version: string }).version;
  } catch {
    next = null;
  }

  return NextResponse.json({
    build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
    tak: process.env.VERCEL_GIT_COMMIT_REF || null,
    deployment: process.env.VERCEL_DEPLOYMENT_ID || null,
    next,
  });
}
