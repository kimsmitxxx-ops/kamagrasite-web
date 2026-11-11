import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { unitDiscountPct } from "@/lib/bulk-discount";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagrasite
const SHIPPING_FEE_CENTS = 1000; // EUR 10 per zending

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const {
    email, name,
    street, house_number,
    postal, city, country = "NL",
    phone, items, discount_code,
    create_account, password,
  } = body;

  if (!email || !name || !street || !postal || !city || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missende velden" }, { status: 400 });
  }

  // Validate items shape
  for (const it of items) {
    if (
      typeof it?.sku !== "string" ||
      typeof it?.name !== "string" ||
      typeof it?.price_cents !== "number" ||
      typeof it?.qty !== "number" ||
      it.price_cents < 0 ||
      it.qty <= 0
    ) {
      return NextResponse.json({ error: "Ongeldige cart-item" }, { status: 400 });
    }
  }

  // Service-role client - writes moeten RLS-policies overslaan.
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (e) {
    // De melding van de throw noemt de naam van de Supabase-sleutel; die blijft
    // in de serverlog en gaat niet mee naar de browser.
    console.error("bestelling: server-config onvolledig", e);
    return NextResponse.json({ error: "Bestellen lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }

  let customerId: string | null = null;
  try {
    const { data } = await supabase.rpc("find_or_create_customer", {
      p_shop_id: SHOP_ID, p_email: email, p_name: name, p_phone: phone || null,
    });
    customerId = typeof data === "string" ? data : null;
  } catch {}

  // Bulk discount per item-qty applied (shared logic met checkout)
  let subtotal = 0;
  const adjustedItems = items.map((it: any) => {
    const pct = unitDiscountPct(it.qty);
    const unitAdj = Math.round(it.price_cents * (1 - pct / 100));
    subtotal += unitAdj * it.qty;
    return { ...it, applied_price_cents: unitAdj, discount_pct: pct };
  });

  // Shipping = EUR 10 per bestelling; alles gaat als een zending de deur uit.
  // Kortingscode. Wat de browser meestuurt is een claim; de database bepaalt
  // of de code bestaat, nog geldig is, aan het minimumbedrag komt en wat hij
  // oplevert, en zet in dezelfde stap de gebruiksteller omhoog. Een code met
  // max_uses = 1 kan dus niet twee keer tegelijk verzilverd worden.
  //
  // De korting rekent over het subtotaal NA de staffelkorting, net als in de
  // mand: staffel eerst, code daarna.
  let discountCents = 0;
  let couponCode: string | null = null;
  if (typeof discount_code === "string" && discount_code.trim()) {
    const { data: couponRijen, error: couponError } = await supabase.rpc("coupon_verzilver", {
      p_shop_id: SHOP_ID,
      p_code: discount_code.trim().toUpperCase(),
      p_subtotal_cents: subtotal,
    });
    const c = Array.isArray(couponRijen) ? couponRijen[0] : couponRijen;
    if (couponError) {
      // Niet de bestelling laten klappen op een kortingscode: zonder korting
      // verder is beter dan een klant die niet kan afrekenen.
      console.error("bestelling: kortingscode verzilveren mislukte", couponError);
    } else if (c?.ok) {
      discountCents = Math.min(Number(c.discount_cents) || 0, subtotal);
      couponCode = c.code;
    } else {
      // Wel weigeren als de code echt niet (meer) kan: anders ziet de klant in
      // de mand een bedrag dat de bestelling niet rekent.
      return NextResponse.json(
        { error: c?.melding || "Deze kortingscode is niet geldig." },
        { status: 400 },
      );
    }
  }

  const shipping = items.length === 0 ? 0 : SHIPPING_FEE_CENTS;
  const total = subtotal - discountCents + shipping;

  const fullStreet = house_number ? `${street} ${house_number}` : street;

  const { data: order, error } = await supabase.from("orders").insert({
    shop_id: SHOP_ID,
    customer_id: customerId,
    customer_email: email,
    customer_name: name,
    customer_phone: phone || null,
    shipping_street: fullStreet, shipping_postal: postal, shipping_city: city, shipping_country: country,
    subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total,
    coupon_code: couponCode, discount_cents: discountCents,
    status: "pending_payment",
    reference: `AP-${Date.now().toString(36).toUpperCase()}`,
  }).select().single();

  // Alleen een eigen tekst naar buiten: de melding van de database noemt
  // tabelnamen, constraints en PostgREST-codes, en dat verraadt waar we zitten.
  if (error || !order) {
    console.error("bestelling opslaan mislukt", error);
    return NextResponse.json({ error: "Bestelling kon niet worden aangemaakt." }, { status: 500 });
  }

  // Resolve product_id by sku (cart items van ProductCard hebben slug-as-id)
  const skus = Array.from(new Set(adjustedItems.map((it: any) => it.sku).filter(Boolean)));
  const { data: skuRows } = await supabase.from("products").select("id, sku").eq("shop_id", SHOP_ID).in("sku", skus);
  const skuToId = new Map((skuRows || []).map((r: any) => [r.sku, r.id]));

  // Kolomnamen van de echte, gedeelde order_items-tabel (product_name/
  // quantity/unit_price_cents/total_cents) - sku/name/qty/price_cents bestaan
  // hier niet. Deze insert faalde daardoor altijd stil (geen .select(), geen
  // foutafhandeling): elke bestelling stond wel in `orders`, maar zonder een
  // enkele regel in `order_items`, dus zag de admin alleen een totaalbedrag.
  const { error: itemsError } = await supabase.from("order_items").insert(adjustedItems.map((it: any) => ({
    order_id: order.id,
    product_id: skuToId.get(it.sku) || null,
    product_name: it.name,
    quantity: it.qty,
    unit_price_cents: it.applied_price_cents,
    total_cents: it.applied_price_cents * it.qty,
  })));
  if (itemsError) {
    console.error("bestelling: order_items opslaan mislukte", itemsError);
  }

  // Account aanmaken, als de klant dat vinkje bij het afrekenen aanzette.
  //
  // Dit stond er niet, terwijl de checkout het vinkje en een verplicht
  // wachtwoordveld wel toonde: de klant koos een wachtwoord en er gebeurde
  // vervolgens niets mee. Niet fataal voor de bestelling, dus na de order en
  // met een eigen try: een account dat niet lukt mag geen bestelling kosten.
  //
  // shop-dash beheert de accounts (service-role); wij hebben die sleutel
  // bewust niet. Bestaat het adres al, dan maakt shop-dash niets nieuws aan en
  // blijft het bestaande wachtwoord gelden.
  if (create_account === true && typeof password === "string" && password.length >= 8) {
    try {
      const dash = process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
      const res = await fetch(`${dash}/api/storefront/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "" },
        body: JSON.stringify({ shopId: SHOP_ID, action: "create", email, password, name }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        console.error("account aanmaken mislukte:", res.status, await res.text().catch(() => ""));
      }
    } catch (e) {
      console.error("account aanmaken mislukte (niet fataal):", e);
    }
  }

  return NextResponse.json({ ok: true, order_id: order.id, total_cents: total, subtotal_cents: subtotal, shipping_cents: shipping });
}
