/**
 * Betaalgegevens bij Paytail, via shop-dash.
 *
 * Deze shop praat niet zelf met Paytail. Dat gebeurt centraal in shop-dash
 * (`src/lib/paytail.ts` plus `/api/paytail` daar), om één reden: Paytail heeft
 * geen API, we praten met hun betaalformulier en lezen hun HTML. Wijzigen zij
 * iets, dan moet dat op één plek gerepareerd worden en niet in elke webshop.
 * Het enige dat per shop verschilt is `shops.paytail_base_url`, en dat staat
 * in de database.
 *
 * shop-dash legt de opgehaalde rekening meteen vast bij de bestelling
 * (`orders.paytail_details`), dus daar hoeft hier niets voor te gebeuren.
 *
 * Alles faalt zacht: lukt het niet, dan komt hier null of false uit en valt de
 * betaalpagina terug op een knop die de klant alsnog naar het betaalscherm van
 * Paytail stuurt.
 */

import { meldFout } from "./fout-melden";

const TIMEOUT_MS = 12000;

export type PaytailBetaalgegevens = {
  bedrag: string;
  iban: string;
  naam_ontvanger: string;
  bic: string;
  omschrijving: string;
  bank: string | null;
  adres: string | null;
  land: string | null;
  registratienummer: string | null;
};

async function vraagDash(actie: "gegevens" | "betaald", orderId: string, shopId: string) {
  const dash = process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
  const res = await fetch(`${dash}/api/paytail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "",
    },
    body: JSON.stringify({ actie, orderId, shopId }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const antwoord = await res.text().catch(() => "");
    await meldFout({
      bron: "lib/paytail",
      bericht: `shop-dash weigerde "${actie}" voor bestelling ${orderId}`,
      context: { status: res.status, antwoord: antwoord.slice(0, 300), actie },
    });
    return null;
  }
  return (await res.json().catch(() => null)) as { ok?: boolean; gegevens?: PaytailBetaalgegevens } | null;
}

/** Verse bankgegevens voor deze bestelling; shop-dash legt ze ook vast. */
export async function haalBetaalgegevens(orderId: string, shopId: string): Promise<PaytailBetaalgegevens | null> {
  try {
    const j = await vraagDash("gegevens", orderId, shopId);
    return j?.gegevens || null;
  } catch (e) {
    await meldFout({ bron: "lib/paytail", bericht: `gegevens ophalen mislukte voor bestelling ${orderId}`, fout: e });
    return null;
  }
}

/** Het equivalent van de knop "Ik heb betaald" op de pagina van Paytail. */
export async function meldBetaald(orderId: string, shopId: string): Promise<boolean> {
  try {
    const j = await vraagDash("betaald", orderId, shopId);
    return Boolean(j?.ok);
  } catch (e) {
    await meldFout({ bron: "lib/paytail", bericht: `betaling melden mislukte voor bestelling ${orderId}`, fout: e });
    return false;
  }
}
