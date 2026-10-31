import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

/**
 * POST /api/restock-notify
 *  body: { product_id, email, name?, website? (honeypot) }
 * Honeypot field "website" - als ingevuld is het een bot, stil return 200.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product_id = String(body?.product_id || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const name = String(body?.name || "").trim();
  const honeypot = String(body?.website || "").trim();

  if (honeypot.length > 0) {
    // Bot detected - silent OK zonder schrijven
    return NextResponse.json({ ok: true });
  }

  if (!product_id || !email || !email.includes("@")) {
    return NextResponse.json({ error: "product_id en geldig e-mailadres vereist" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", product_id)
    .eq("shop_id", SHOP_ID)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
  }

  // Service-role client - RLS blokkeert anon inserts op restock_notifications.
  let write;
  try {
    write = createServiceClient();
  } catch (e) {
    console.error("voorraadmelding: server-config onvolledig", e);
    return NextResponse.json({ error: "Aanmelden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }

  const { error } = await write
    .from("restock_notifications")
    .upsert(
      {
        product_id,
        email,
        visitor_name: name || null,
        notified_at: null,
        unsubscribed_at: null,
      },
      { onConflict: "product_id,email", ignoreDuplicates: false },
    );

  // Zie newsletter/route.ts: de melding van de database blijft in de serverlog.
  if (error) {
    console.error("voorraadmelding aanmelden mislukt", error);
    return NextResponse.json({ error: "Aanmelden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
