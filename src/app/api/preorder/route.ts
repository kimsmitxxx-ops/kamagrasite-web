import { NextRequest, NextResponse } from "next/server";
import { supabaseLeesbaar } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde client cachet sinds de TTFB-ronde
// standaard, en juist hier moet elke lees vers zijn.
export const fetchCache = "force-no-store";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

/**
 * Welke artikelen in de mand nog onderweg zijn.
 *
 * De mand zelf weet dat niet: die staat in de localStorage van de bezoeker en
 * blijft daar tot 30 dagen staan. Zou de pre-orderdatum daarin meegaan, dan
 * belooft de mand straks "over 5 dagen" terwijl de zending al binnen is - of
 * erger, terwijl de datum allang verstreken is. Daarom vraagt de mand het hier
 * op, bij de database, en is het antwoord altijd de stand van nu.
 *
 * De sleutel is de slug: zo komt elk item in de mand erin (`cart.add` zet de
 * slug als `id`, ook vanaf een productkaart).
 *
 * Dit geeft niets prijs: dezelfde beschikbaarheid en datum staan op de
 * productpagina zelf.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const ruw = Array.isArray((body as { slugs?: unknown }).slugs) ? (body as { slugs: unknown[] }).slugs : [];
  const slugs = ruw
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (slugs.length === 0) return NextResponse.json({ producten: [] });

  const { data, error } = await supabaseLeesbaar
    .from("products")
    .select("slug, name, availability, verwacht_op")
    .eq("shop_id", SHOP_ID)
    .in("slug", slugs);

  // Niet stil teruggeven dat er niets onderweg is: dan zou een kapotte query
  // de melding laten verdwijnen en de klant op de gewone levertijd rekenen.
  if (error) {
    console.error("pre-order opvragen mislukte", error);
    return NextResponse.json({ error: "Niet gelukt" }, { status: 500 });
  }

  return NextResponse.json({ producten: data ?? [] });
}
