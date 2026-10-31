import { createClient } from "@supabase/supabase-js";

import { SB_URL, SB_ANON } from "./supabase-config";
import { schoonFetch } from "./media";

/**
 * Klantsessies, volledig aan onze kant. Dit deel is bewust vrij van
 * next/headers en Buffer, zodat middleware.ts het in de edge-runtime kan
 * gebruiken; lib/sessie.ts zet er het lezen van cookies bovenop.
 *
 * Hiervoor liep dit via @supabase/ssr in de browser. Dat werkte, maar het
 * betekende dat de bezoeker zelf met de authenticatieserver van Supabase praatte:
 * de projectnaam en de publieke sleutel stonden in de JS-bundle, de verzoeken
 * waren in de netwerk-tab te zien, en de sessiecookies heetten
 * sb-<projectnaam>-auth-token.
 *
 * Nu praat alleen de server met de authenticatieserver. De browser krijgt twee
 * eigen cookies die hij niet kan lezen (httpOnly) en die niets verraden. Wie de
 * accounts beheert blijft ongewijzigd, dus bestaande accounts werken gewoon en
 * de RLS-regels die op auth.uid() staan blijven gelden: we sturen het
 * toegangstoken van de klant mee bij elke query.
 *
 * Inloggen gaat met de code van zes cijfers die al in de inlogmail staat. Een
 * aanklikbare link kan niet: die zou naar de authenticatieserver wijzen en dus
 * in de mailbox van de klant verraden waar de data staat.
 */

export const COOKIE_TOEGANG = "klant_sessie";
export const COOKIE_VERNIEUW = "klant_vernieuw";

// secure uit op localhost, anders komt het cookie bij ontwikkelen nooit aan.
const VEILIG = process.env.NODE_ENV === "production";

export const COOKIE_TOEGANG_OPTIES = { httpOnly: true, secure: VEILIG, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 };
export const COOKIE_VERNIEUW_OPTIES = { httpOnly: true, secure: VEILIG, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

export type Tokens = { access_token: string; refresh_token: string };

async function authVerzoek(pad: string, body: unknown, bearer?: string): Promise<Response> {
  return fetch(`${SB_URL}/auth/v1/${pad}`, {
    method: "POST",
    headers: {
      apikey: SB_ANON,
      Authorization: `Bearer ${bearer || SB_ANON}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
}

function tokensUit(j: unknown): Tokens | null {
  const t = j as Partial<Tokens>;
  return t?.access_token && t?.refresh_token ? { access_token: t.access_token, refresh_token: t.refresh_token } : null;
}

/** Laat een inlogcode mailen. Maakt het account aan als het nog niet bestaat. */
export async function vraagInlogcode(email: string): Promise<boolean> {
  try {
    const r = await authVerzoek("otp", { email, create_user: true });
    return r.ok;
  } catch {
    return false;
  }
}

/** Wissel de code uit de mail in voor een sessie. */
export async function wisselCodeIn(email: string, code: string): Promise<Tokens | null> {
  try {
    const r = await authVerzoek("verify", { type: "email", email, token: code });
    if (!r.ok) return null;
    return tokensUit(await r.json());
  } catch {
    return null;
  }
}

export async function vernieuwTokens(refresh: string): Promise<Tokens | null> {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return null;
    return tokensUit(await r.json());
  } catch {
    return null;
  }
}

export async function meldAf(toegang: string): Promise<void> {
  try {
    await authVerzoek("logout", {}, toegang);
  } catch {}
}

/**
 * Hoeveel seconden dit token nog geldig is. Het token komt uit ons eigen
 * httpOnly-cookie en wordt aan de bron alsnog op zijn signatuur gecontroleerd,
 * dus hier is alleen de houdbaarheidsdatum interessant.
 */
export function restgeldigheid(toegang: string): number {
  try {
    const deel = toegang.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(deel.padEnd(Math.ceil(deel.length / 4) * 4, "=")));
    return typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : 0;
  } catch {
    return 0;
  }
}

/** Een databaseclient die namens de klant praat, zodat RLS op auth.uid() blijft werken. */
export function klantClient(toegang: string) {
  return createClient(SB_URL, SB_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${toegang}` },
      fetch: (url, init) => schoonFetch(url, { ...init, cache: "no-store" }),
    },
  });
}

/** De klant achter dit toegangstoken, of null als het token niet (meer) geldig is. */
export async function klantBijToken(toegang: string) {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${toegang}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return null;
    const user = (await r.json()) as { id: string; email?: string; user_metadata?: Record<string, unknown> };
    if (!user?.id) return null;
    return { id: user.id, email: user.email || "", metadata: user.user_metadata || {}, sb: klantClient(toegang) };
  } catch {
    return null;
  }
}
