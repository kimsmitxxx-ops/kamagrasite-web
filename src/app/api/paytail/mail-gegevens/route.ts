import { NextRequest, NextResponse } from "next/server";
import { getOrderForPayment, getPaytailConfig, getPaytailDetails, markeerGegevensMail } from "@/lib/queries";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

/**
 * Mailt de bankgegevens naar de klant, zodat hij ze later vanaf zijn bank kan
 * pakken zonder de betaalpagina terug te hoeven zoeken.
 *
 * De betaalpagina roept dit aan zodra het betaalblok in beeld staat. Alleen de
 * eerste keer gaat er een mail uit: de gegevens staan dan al bij de order en
 * wie de pagina ververst of later terugkomt hoort niet elke keer post te
 * krijgen. Wat er gemaild wordt komt uit de database, niet uit de browser.
 *
 * shop-dash is de centrale verzender, net als bij de orderbevestiging.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  if (!orderId) return NextResponse.json({ error: "Missende velden" }, { status: 400 });

  const [order, details, paytail] = await Promise.all([
    getOrderForPayment(orderId),
    getPaytailDetails(orderId),
    getPaytailConfig(),
  ]);
  if (!order || !order.customer_email) return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });
  if (!details?.iban) return NextResponse.json({ ok: true, gemaild: false, reden: "geen gegevens" });
  if (details.gegevens_gemaild_op) return NextResponse.json({ ok: true, gemaild: false, reden: "al gemaild" });
  // Twee mislukte pogingen is genoeg. Daarna blijft het bij de gegevens op de
  // pagina zelf en kan de klantenservice de mail met één klik alsnog sturen.
  if (Number(details.gegevens_mail_pogingen || 0) >= 2) {
    return NextResponse.json({ ok: true, gemaild: false, reden: "eerdere pogingen mislukt" });
  }

  const ref = order.reference || `ORDER-${order.id.slice(0, 8).toUpperCase()}`;
  const domein = paytail?.domain || req.headers.get("host") || "";
  const dash = process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";

  try {
    const res = await fetch(`${dash}/api/orders/${order.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "" },
      body: JSON.stringify({
        shopId: order.shop_id,
        templateSlug: "payment_details",
        toEmail: order.customer_email,
        vars: {
          customer_name: order.customer_name || "",
          reference: ref,
          betaal_naam: String(details.naam_ontvanger || ""),
          betaal_iban: String(details.iban || ""),
          betaal_bic: String(details.bic || ""),
          betaal_omschrijving: String(details.omschrijving || ref),
          betaal_bedrag: String(details.bedrag || (order.total_cents / 100).toFixed(2)),
          betaallink: `https://${domein}/checkout/betalen/${order.id}`,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("betaalgegevens mailen mislukte:", res.status, await res.text().catch(() => ""));
      await markeerGegevensMail(order.id, false);
      return NextResponse.json({ ok: false, gemaild: false }, { status: 502 });
    }
  } catch (e) {
    console.error("betaalgegevens mailen gooide", e);
    await markeerGegevensMail(order.id, false);
    return NextResponse.json({ ok: false, gemaild: false }, { status: 502 });
  }

  await markeerGegevensMail(order.id, true);
  return NextResponse.json({ ok: true, gemaild: true });
}
