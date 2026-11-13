import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

/**
 * POST /api/mandje — een achtergelaten mandje doorgeven aan shop-dash.
 *
 * Tussenstation, want de sleutel voor shop-dash hoort niet in de browser. De
 * browser stuurt hierheen met sendBeacon bij het verlaten van de pagina, dus
 * het antwoord doet er niet toe: alles wat hier misgaat wordt gelogd en
 * verder genegeerd. Een mislukt mandje is geen reden om iets aan de bezoeker
 * te laten merken.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email) return NextResponse.json({ ok: true });

  try {
    const dash = process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
    const res = await fetch(`${dash}/api/storefront/mandje`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "" },
      body: JSON.stringify({
        shopId: SHOP_ID,
        email: body.email,
        items: Array.isArray(body.items) ? body.items : [],
        totalCents: Number(body.totalCents) || 0,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("mandje doorgeven mislukte:", res.status);
  } catch (e) {
    console.error("mandje doorgeven mislukte (niet fataal):", e);
  }

  return NextResponse.json({ ok: true });
}
