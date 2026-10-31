import { NextResponse } from "next/server";
import {
  COOKIE_TOEGANG,
  COOKIE_TOEGANG_OPTIES,
  COOKIE_VERNIEUW,
  COOKIE_VERNIEUW_OPTIES,
  klantClient,
  wisselCodeIn,
} from "@/lib/sessie";

export const dynamic = "force-dynamic";

/** Stap 2 van inloggen: de code uit de mail inwisselen voor een sessie. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const code = String(body?.code ?? "").replace(/\D/g, "");

  if (!email || code.length < 6) {
    return NextResponse.json({ error: "Vul de code van zes cijfers in." }, { status: 400 });
  }

  const tokens = await wisselCodeIn(email, code);
  if (!tokens) {
    return NextResponse.json({ error: "Deze code klopt niet of is verlopen. Vraag een nieuwe aan." }, { status: 401 });
  }

  // De klantrij hoort bij de shop en wordt bij de eerste keer inloggen
  // aangemaakt. Dit gaat namens de klant, want de functie leest auth.uid().
  try {
    await klantClient(tokens.access_token).rpc("find_or_create_customer_for_auth", {
      p_email: email,
      p_full_name: null,
    });
  } catch (e) {
    console.error("klantrij aanmaken na inloggen mislukte", e);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: COOKIE_TOEGANG, value: tokens.access_token, ...COOKIE_TOEGANG_OPTIES });
  res.cookies.set({ name: COOKIE_VERNIEUW, value: tokens.refresh_token, ...COOKIE_VERNIEUW_OPTIES });
  return res;
}
