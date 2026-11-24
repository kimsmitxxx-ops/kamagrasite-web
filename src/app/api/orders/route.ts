import { NextRequest, NextResponse } from "next/server";
import { preorderVoorMand } from "@/lib/preorder";
import { createServiceClient } from "@/lib/supabase";
import { haalBetaalgegevens } from "@/lib/paytail";
import { unitDiscountPct } from "@/lib/bulk-discount";
import { SHIPPING_FEE_CENTS } from "@/lib/shipping";

export const dynamic = "force-dynamic";
// De route wacht op Paytail (via shop-dash) en op de mails; zonder dit kapt
// Vercel hem na tien seconden af, midden in dat wachten.
export const maxDuration = 30;
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagrasite


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

  // De prijs komt uit de database, niet uit het verzoek.
  //
  // Hier werd `it.price_cents` uit de body gebruikt, met als enige controle
  // dat het een getal was dat niet negatief is. Wie zelf een POST opstelde
  // bepaalde daarmee zijn eigen bedrag, en omdat er per overboeking betaald
  // wordt kwam dat bedrag ook zo op de betaalpagina en de factuur terecht.
  // De kortingscode en de verzendkosten werden al wel serverkant bepaald;
  // de prijs was de laatste die de browser nog mocht invullen.
  //
  // Opzoeken gebeurt op slug en sku, niet op products.id. Het veld `id` uit
  // de mand is namelijk de slug (zie add-to-cart-button en product-card) en
  // products.id is een uuid: een `in("id", [...])` met een slug erin geeft
  // 22P02 en dus geen prijs maar een fout. Een echte uuid die toch
  // meegestuurd wordt pakken we wel mee, vandaar de uuid-filter. En omdat
  // product-card de slug in het veld `sku` zet, gaan beide sleutels langs
  // beide kolommen; dat vangt ook een mand die nog van voor deze wijziging
  // in localStorage staat.
  //
  // Losse `in`-queries per kolom en geen `.or()` met een zelfgebouwde
  // filterstring: een sku met een komma of een aanhalingsteken erin zou die
  // string breken, en dan krijg je stil de verkeerde rijen terug.
  const tekst = (v: any) => (typeof v === "string" ? v.trim() : "");
  const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const ids = Array.from(new Set(items.map((it: any) => tekst(it.id)).filter(isUuid)));
  const sleutels = Array.from(
    new Set(items.flatMap((it: any) => [tekst(it.id), tekst(it.sku)]).filter(Boolean)),
  );
  const prijsPerId = new Map<string, number>();
  const prijsPerSlug = new Map<string, number>();
  const prijsPerSku = new Map<string, number>();
  try {
    const kolommen = "id, sku, slug, price_cents";
    const [opId, opSlug, opSku] = await Promise.all([
      ids.length
        ? supabase.from("products").select(kolommen).eq("shop_id", SHOP_ID).in("id", ids)
        : Promise.resolve({ data: [], error: null }),
      sleutels.length
        ? supabase.from("products").select(kolommen).eq("shop_id", SHOP_ID).in("slug", sleutels)
        : Promise.resolve({ data: [], error: null }),
      sleutels.length
        ? supabase.from("products").select(kolommen).eq("shop_id", SHOP_ID).in("sku", sleutels)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (opId.error) throw opId.error;
    if (opSlug.error) throw opSlug.error;
    if (opSku.error) throw opSku.error;
    for (const r of [...(opId.data || []), ...(opSlug.data || []), ...(opSku.data || [])] as any[]) {
      if (typeof r.price_cents === "number") {
        prijsPerId.set(r.id, r.price_cents);
        if (r.slug) prijsPerSlug.set(tekst(r.slug), r.price_cents);
        if (r.sku) prijsPerSku.set(tekst(r.sku), r.price_cents);
      }
    }
  } catch (e) {
    // Niet doorgaan met de prijs uit de browser: dat is precies het gat dat
    // hier gedicht wordt. Liever een bestelling die niet lukt.
    console.error("bestelling: prijzen ophalen mislukte", e);
    return NextResponse.json({ error: "Bestellen lukte even niet. Probeer het opnieuw of mail ons." }, { status: 503 });
  }

  const zoekPrijs = (it: any): number | undefined => {
    const id = tekst(it.id);
    const sku = tekst(it.sku);
    return prijsPerId.get(id) ?? prijsPerSlug.get(id) ?? prijsPerSku.get(sku) ?? prijsPerSlug.get(sku);
  };

  const onbekend: string[] = [];
  const serverItems = items.map((it: any) => {
    const prijs = zoekPrijs(it);
    if (prijs == null) onbekend.push(tekst(it.name) || tekst(it.sku) || tekst(it.id));
    return { ...it, price_cents: prijs ?? 0 };
  });
  if (onbekend.length > 0) {
    return NextResponse.json(
      { error: `Dit product is niet meer beschikbaar: ${onbekend.join(", ")}. Verwijder het uit je mandje en probeer opnieuw.` },
      { status: 400 },
    );
  }

  // Bulk discount per item-qty applied (shared logic met checkout) - rekent
  // over de serverprijs, niet over het bedrag uit de body.
  let subtotal = 0;
  const adjustedItems = serverItems.map((it: any) => {
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

  // Bestelnummer. De prefix komt uit de shops-rij, niet uit de code: deze
  // repo is een fork en zette hier jarenlang "AP-" neer, de letters van
  // AnabolenPro, op een kamagra-winkel.
  //
  // De terugval is dezelfde waarde als die in de rij staat ("KSI", van
  // KamagraSIte), en nadrukkelijk niet "KS": dat is de prefix van
  // kamagrashop, en twee winkels met hetzelfde bestelnummer lopen vast bij
  // het matchen van verzendlabels.
  let orderPrefix = "KSI";
  try {
    const { data: prefixRij } = await supabase
      .from("shops")
      .select("order_prefix")
      .eq("id", SHOP_ID)
      .single();
    const uitDb = String(prefixRij?.order_prefix || "").trim();
    if (uitDb) orderPrefix = uitDb;
  } catch (e) {
    console.error("bestelnummer: prefix ophalen mislukte, terugval gebruikt", e);
  }
  const reference = `${orderPrefix}-${Date.now().toString(36).toUpperCase()}`;


  const { data: order, error } = await supabase.from("orders").insert({
    shop_id: SHOP_ID,
    customer_id: customerId,
    customer_email: email,
    customer_name: name,
    customer_phone: phone || null,
    shipping_street: fullStreet, shipping_postal: postal, shipping_city: city, shipping_country: country,
    subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total,
    coupon_code: couponCode, discount_cents: discountCents,
    // "awaiting_payment", niet "pending_payment": de constraint
    // orders_status_check laat alleen pending, awaiting_payment, paid,
    // processing, shipped, delivered, cancelled en refunded toe. Met de oude
    // waarde weigerde de database elke bestelling en zag de klant alleen
    // "Bestelling kon niet worden aangemaakt" - van de livegang op 20 nov
    // tot 24 nov 2026 kwam er daardoor geen enkele bestelling binnen.
    status: "awaiting_payment",
    reference,
  }).select().single();

  // Alleen een eigen tekst naar buiten: de melding van de database noemt
  // tabelnamen, constraints en PostgREST-codes, en dat verraadt waar we zitten.
  if (error || !order) {
    console.error("bestelling opslaan mislukt", error);
    return NextResponse.json({ error: "Bestelling kon niet worden aangemaakt." }, { status: 500 });
  }

  // Het product bij de regel zoeken. Het veld `sku` uit de mand is niet altijd
  // een sku: ProductCard zet daar de slug in, en zulke mandjes staan ook al in
  // de localStorage van bezoekers. Zoeken op alleen sku liet de koppeling
  // daardoor leeg, en dan telt de bestelling niet mee in de omzet per product
  // en weet de bevestigingsmail niet dat er een pre-order in zit. Dus: sku,
  // anders slug, anders de naam. (Zelfde aanpak als kamagrashop.)
  const { data: alleProducten } = await supabase
    .from("products").select("id, sku, slug, name, availability, verwacht_op").eq("shop_id", SHOP_ID);
  const bySku = new Map<string, string>();
  const bySlug = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const p of alleProducten || []) {
    if (p.sku) bySku.set(String(p.sku).trim(), p.id);
    if (p.slug) bySlug.set(String(p.slug).trim().toLowerCase(), p.id);
    if (p.name) byName.set(String(p.name).trim().toLowerCase(), p.id);
  }
  const zoekProductId = (it: any): string | null => {
    const sleutel = String(it.sku || "").trim();
    return (
      bySku.get(sleutel) ||
      bySlug.get(sleutel.toLowerCase()) ||
      bySlug.get(String(it.id || "").trim().toLowerCase()) ||
      byName.get(String(it.name || "").trim().toLowerCase()) ||
      null
    );
  };

  // Kolomnamen van de echte, gedeelde order_items-tabel (product_name/
  // quantity/unit_price_cents/total_cents) - sku/name/qty/price_cents bestaan
  // hier niet. Deze insert faalde daardoor altijd stil (geen .select(), geen
  // foutafhandeling): elke bestelling stond wel in `orders`, maar zonder een
  // enkele regel in `order_items`, dus zag de admin alleen een totaalbedrag.
  const { error: itemsError } = await supabase.from("order_items").insert(adjustedItems.map((it: any) => ({
    order_id: order.id,
    product_id: zoekProductId(it),
    product_name: it.name,
    quantity: it.qty,
    unit_price_cents: it.applied_price_cents,
    total_cents: it.applied_price_cents * it.qty,
  })));
  if (itemsError) {
    console.error("bestelling: order_items opslaan mislukte", itemsError);
  }

  // Staat er een pre-order in deze bestelling, dan moet dat bij de bestelling
  // zelf staan. Anders ziet degene die de labels maakt een gewone bestelling en
  // gaat die de deur uit met een artikel dat nog niet op de plank ligt. De
  // beschikbaarheid komt uit de database, niet uit de mand van de bezoeker.
  try {
    const regels = adjustedItems.map((it: any) => {
      const pid = zoekProductId(it);
      const prod = (alleProducten || []).find((p: any) => p.id === pid);
      return {
        name: String(prod?.name || it.name || ""),
        availability: prod?.availability ?? null,
        verwacht_op: prod?.verwacht_op ?? null,
      };
    });
    const po = preorderVoorMand(regels);
    if (po) {
      const notitie = `PRE-ORDER: ${po.regel}`;
      const { error: notitieError } = await supabase
        .from("orders")
        .update({ notes: order.notes ? `${order.notes}
${notitie}` : notitie })
        .eq("id", order.id);
      if (notitieError) console.error("bestelling: pre-ordernotitie opslaan mislukte", notitieError);
    }
  } catch (e) {
    console.error("bestelling: pre-order bepalen mislukte (niet fataal):", e);
  }

  // Bevestigingsmail - de bedankt-pagina zegt "Bevestiging gestuurd naar ...",
  // maar niets in deze route verstuurde ooit iets. Overgenomen uit
  // kamagrashop: shop-dash verstuurt centraal, met de mailroute van deze shop.
  // Non-fataal, want een mislukte mail mag de bestelling niet blokkeren.
  try {
    const dash = process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
    const mailRes = await fetch(`${dash}/api/orders/${order.id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "" },
      body: JSON.stringify({
        shopId: SHOP_ID,
        templateSlug: "order_confirmed",
        toEmail: email,
        vars: { customer_name: name, reference: order.reference },
      }),
    });
    if (!mailRes.ok) {
      console.error("bevestigingsmail mislukte:", mailRes.status, await mailRes.text().catch(() => ""));
    }
  } catch (e) {
    console.error("bevestigingsmail versturen mislukte (niet fataal):", e);
  }
  // Paytail: de rekening voor deze bestelling alvast ophalen en vastleggen.
  //
  // shop-dash doet het echte werk (zie src/lib/paytail.ts voor waarom dat
  // centraal zit) en schrijft het resultaat naar orders.paytail_details. De
  // betaalpagina leest het daarna gewoon uit de bestelling.
  type PaytailShopRij = {
    paytail_enabled: boolean | null;
    paytail_eigen_blok: boolean | null;
    paytail_base_url: string | null;
  };
  let paytailShop: PaytailShopRij | null = null;
  try {
    const { data } = await supabase
      .from("shops")
      .select("paytail_enabled, paytail_eigen_blok, paytail_base_url")
      .eq("id", SHOP_ID)
      .single();
    paytailShop = (data as PaytailShopRij | null) ?? null;

    if (paytailShop?.paytail_enabled && paytailShop.paytail_base_url && paytailShop.paytail_eigen_blok !== false) {
      // Acht seconden: de klant wacht hier op zijn bevestiging. Lukt het niet
      // binnen die tijd, dan haalt de betaalpagina de rekening alsnog op.
      await haalBetaalgegevens(order.id, SHOP_ID, 8000);
    }
  } catch (e) {
    console.error("Paytail-gegevens bij de bestelling vastleggen mislukte (niet fataal):", e);
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

  // De checkout hoeft alleen te weten of er via Paytail betaald wordt; de
  // bankgegevens staan al bij de bestelling en de betaalpagina toont ze.
  const paytailUrl =
    paytailShop?.paytail_enabled && paytailShop.paytail_base_url ? paytailShop.paytail_base_url : null;

  return NextResponse.json({ ok: true, order_id: order.id, total_cents: total, subtotal_cents: subtotal, shipping_cents: shipping, paytailUrl });
}
