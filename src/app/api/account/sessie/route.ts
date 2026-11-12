import { NextResponse } from "next/server";
import {
  COOKIE_TOEGANG,
  COOKIE_TOEGANG_OPTIES,
  COOKIE_VERNIEUW,
  COOKIE_VERNIEUW_OPTIES,
  klantBijToken,
  logInMetWachtwoord,
  wisselCodeIn,
} from "@/lib/sessie";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

/**
 * De klantrij van dit adres aan het ingelogde account hangen, en de
 * bestellingen die er los bij liggen eraan koppelen.
 *
 * Adressen worden met kleine letters vergeleken: wie ooit "Jan@Voorbeeld.nl"
 * invulde en inlogt met "jan@voorbeeld.nl" hoort dezelfde klant te zijn.
 */
async function koppelKlantrij(email: string, toegang: string): Promise<void> {
  const klant = await klantBijToken(toegang);
  if (!klant?.id) return;

  const sb = createServiceClient();
  const { data: bestaand } = await sb
    .from("customers")
    .select("id, auth_user_id")
    .eq("shop_id", SHOP_ID)
    .ilike("email", email)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let klantId = bestaand?.id as string | undefined;
  if (!klantId) {
    const { data: nieuw } = await sb
      .from("customers")
      .insert({ shop_id: SHOP_ID, email, name: email, auth_user_id: klant.id })
      .select("id")
      .maybeSingle();
    klantId = nieuw?.id;
  } else if (!bestaand?.auth_user_id) {
    await sb.from("customers").update({ auth_user_id: klant.id }).eq("id", klantId);
  }

  if (!klantId) return;
  // Alleen bestellingen die nog geen klant hebben; een bestelling die al bij
  // iemand hoort blijft waar hij hoort.
  await sb
    .from("orders")
    .update({ customer_id: klantId })
    .eq("shop_id", SHOP_ID)
    .ilike("customer_email", email)
    .is("customer_id", null);
}

/** Stap 2 van inloggen: de code uit de mail inwisselen voor een sessie. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const code = String(body?.code ?? "").replace(/\D/g, "");
  const wachtwoord = String(body?.wachtwoord ?? "");

  if (!email || code.length < 6) {
    return NextResponse.json({ error: "Vul de code van zes cijfers in." }, { status: 400 });
  }

  const tokens = wachtwoord
    ? await logInMetWachtwoord(email, wachtwoord)
    : await wisselCodeIn(email, code);
  if (!tokens) {
    return NextResponse.json(
      {
        error: wachtwoord
          ? "Dit e-mailadres en wachtwoord horen niet bij elkaar. Je kunt ook inloggen met een code per mail."
          : "Deze code klopt niet of is verlopen. Vraag een nieuwe aan.",
      },
      { status: 401 },
    );
  }

  // De klantrij koppelen aan dit account, en de bestellingen die bij dit
  // adres horen eraan hangen. Inloggen is het moment waarop dat mag: wie hier
  // komt heeft de code uit de mail of het wachtwoord van dit account, en
  // bewijst daarmee dat het adres van hem is.
  //
  // Dit ging eerder via de RPC find_or_create_customer_for_auth met het token
  // van de klant. Die functie leest jwt_shop_id(), en in een klant-token zit
  // geen shop_id: hij viel dus elke keer stil op "no shop_id in token" en er
  // werd nooit iets gekoppeld. Met de sleutel van de shop lukt het wel.
  try {
    await koppelKlantrij(email, tokens.access_token);
  } catch (e) {
    console.error("klantrij koppelen na inloggen mislukte", e);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: COOKIE_TOEGANG, value: tokens.access_token, ...COOKIE_TOEGANG_OPTIES });
  res.cookies.set({ name: COOKIE_VERNIEUW, value: tokens.refresh_token, ...COOKIE_VERNIEUW_OPTIES });
  return res;
}
