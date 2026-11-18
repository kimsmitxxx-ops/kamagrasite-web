import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagrasite

/**
 * GET /api/search?q=... - voor de autocomplete in de header. Zoekt op naam,
 * dezelfde `search_text` die /winkel/ ook al gebruikt, en geeft genoeg terug
 * om meteen een rijtje met foto + titel + prijs te tonen zonder een tweede
 * round-trip naar de productpagina.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const { data } = await supabase.from("products")
      .select("name, slug, image_url, price_cents, availability, verwacht_op")
      .eq("shop_id", SHOP_ID)
      .eq("is_active", true)
      .ilike("search_text", `%${q}%`)
      .order("sort_order")
      .limit(8);
    return NextResponse.json({ results: data ?? [] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
