import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").trim().toLowerCase();
  const honeypot = String(body?.website || "").trim();

  if (honeypot.length > 0) return NextResponse.json({ ok: true });
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Geldig e-mailadres vereist" }, { status: 400 });
  }

  // Service-role client - RLS blokkeert anon inserts op leads.
  let sb;
  try {
    sb = createServiceClient();
  } catch (e) {
    // De melding van de throw noemt de naam van de Supabase-sleutel; die blijft
    // in de serverlog en gaat niet mee naar de browser.
    console.error("nieuwsbrief: server-config onvolledig", e);
    return NextResponse.json({ error: "Aanmelden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }

  // `leads` table exists per migration 003; UPSERT op unique (shop_id, email)
  const { error } = await sb.from("leads").upsert(
    { shop_id: SHOP_ID, email, source: "newsletter", subscribed: true },
    { onConflict: "shop_id,email" },
  );
  // Alleen een eigen tekst naar buiten: de melding van de database noemt
  // tabelnamen, constraints en PostgREST-codes, en dat verraadt waar we zitten.
  if (error) {
    console.error("nieuwsbrief-aanmelding mislukt", error);
    return NextResponse.json({ error: "Aanmelden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
