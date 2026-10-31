import { NextResponse } from "next/server";
import { vraagInlogcode } from "@/lib/sessie";

export const dynamic = "force-dynamic";

/**
 * Stap 1 van inloggen: een code laten mailen.
 *
 * Het antwoord is altijd hetzelfde, ook als het adres niet bestaat of als het
 * mailen mislukt. Anders is dit een manier om te achterhalen wie er klant is.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  const gelukt = await vraagInlogcode(email);
  if (!gelukt) console.error("inlogcode aanvragen mislukte voor een adres");

  return NextResponse.json({ ok: true });
}
