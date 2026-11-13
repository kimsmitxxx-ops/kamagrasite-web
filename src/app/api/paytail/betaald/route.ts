import { NextRequest, NextResponse } from "next/server";
import { getOrderForPayment } from "@/lib/queries";
import { meldBetaald } from "@/lib/paytail";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

/**
 * Onze eigen "Ik heb betaald". De klant ziet de bankgegevens op onze site, dus
 * drukt hij die knop ook hier en niet op de pagina van Paytail.
 *
 * Deze route geeft het alleen door aan shop-dash, dat de melding bij Paytail
 * doet met de rekening die bij deze bestelling hoort en dat ook vastlegt. De
 * browser stuurt dus niets anders mee dan het bestelnummer: wat er gemeld
 * wordt komt uit de database.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  if (!orderId) return NextResponse.json({ error: "Missende velden" }, { status: 400 });

  const order = await getOrderForPayment(orderId);
  if (!order) return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });

  const ok = await meldBetaald(order.id, order.shop_id);

  // Ook als het melden hapert sturen we de klant door naar de bedankt-pagina:
  // hij heeft het geld overgemaakt en dat is wat telt. De melding is voor de
  // administratie van Paytail, niet voor de onze.
  return NextResponse.json({ ok, gemeld: ok });
}
