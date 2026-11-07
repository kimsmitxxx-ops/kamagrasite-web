import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { schoonCode, type CouponResultaat } from "@/lib/coupon";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagrasite

/**
 * Raadpogingen afremmen. Een kortingscode is kort en te raden (WELKOM10,
 * KORTING5), dus zonder rem kan iemand er duizenden per minuut proberen.
 * Dit is met opzet simpel: een teller in het geheugen van deze instance.
 * Dat is geen harde grens - Vercel start meerdere instances - maar het haalt
 * de aantrekkelijkheid uit scripted raden. De echte bescherming is dat een
 * code alleen korting geeft en nooit toegang.
 */
const POGINGEN = new Map<string, { n: number; tot: number }>();
const VENSTER_MS = 10 * 60 * 1000;
const MAX_POGINGEN = 40;

function teVaak(ip: string): boolean {
  const nu = Date.now();
  const rij = POGINGEN.get(ip);
  if (!rij || nu > rij.tot) {
    POGINGEN.set(ip, { n: 1, tot: nu + VENSTER_MS });
    // Verlopen rijen opruimen, anders groeit de Map bij een lange instance.
    if (POGINGEN.size > 5000) {
      for (const [k, v] of POGINGEN) if (nu > v.tot) POGINGEN.delete(k);
    }
    return false;
  }
  rij.n += 1;
  return rij.n > MAX_POGINGEN;
}

const mislukt = (melding: string, reason: string): CouponResultaat => ({
  ok: false,
  reason,
  melding,
  code: null,
  kind: null,
  value: null,
  discount_cents: 0,
  label: null,
});

/**
 * POST /api/coupon  body: { code, subtotal_cents }
 *
 * `subtotal_cents` is het subtotaal NA de staffelkorting; daar rekent de code
 * over. Het antwoord is puur informatief voor de mand: bij het plaatsen van
 * de bestelling wordt de code opnieuw gecontroleerd en pas dan verzilverd.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = schoonCode(String(body?.code || ""));
  const subtotal = Number(body?.subtotal_cents);

  if (!code) return NextResponse.json(mislukt("Vul een kortingscode in.", "leeg"), { status: 400 });
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json(mislukt("Je mand is leeg.", "geen_mand"), { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "onbekend";
  if (teVaak(ip)) {
    return NextResponse.json(mislukt("Te veel pogingen. Probeer het later opnieuw.", "te_vaak"), { status: 429 });
  }

  let sb;
  try {
    sb = createServiceClient();
  } catch (e) {
    console.error("kortingscode: client aanmaken mislukte", e);
    return NextResponse.json(mislukt("Controleren lukte even niet.", "serverfout"), { status: 500 });
  }

  const { data, error } = await sb.rpc("coupon_check", {
    p_shop_id: SHOP_ID,
    p_code: code,
    p_subtotal_cents: Math.round(subtotal),
  });

  // De melding van de database blijft in de serverlog; naar buiten gaat alleen
  // onze eigen tekst, zodat niets verraadt waar de codes staan.
  if (error) {
    console.error("kortingscode controleren mislukt", error);
    return NextResponse.json(mislukt("Controleren lukte even niet.", "serverfout"), { status: 500 });
  }

  const rij = (Array.isArray(data) ? data[0] : data) as CouponResultaat | undefined;
  if (!rij) return NextResponse.json(mislukt("Deze kortingscode kennen we niet.", "onbekend"));

  return NextResponse.json(rij, { headers: { "Cache-Control": "no-store" } });
}
