/** Dezelfde shop-rij als in queries.ts; die exporteert hem niet. */
const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

/**
 * Fouten melden bij shop-dash, zodat ze in error_log staan en niet alleen in
 * de Vercel-logs van deze shop.
 *
 * Die Vercel-logs zijn per project, kort bewaard, en niemand kijkt erin: de
 * bevestigingsmail van deze winkel liep een week lang op een 401 stuk zonder
 * dat iets dat zei. shop-dash heeft al een foutenlog met een scherm erbij;
 * dit stuurt de melding daarheen (/api/fout) met de shop erbij.
 *
 * Gooit nooit en wacht hooguit vier seconden: een logregel die niet aankomt
 * mag een bestelling of een pagina niet onderuithalen. console.error blijft
 * ook gebeuren, zodat de Vercel-logs blijven werken voor wie daar toch kijkt.
 * Geen sleutels, cookies of IBAN's in de context: shop-dash laat die er
 * sowieso uit, maar het hoort hier al niet in te gaan.
 */
export async function meldFout({
  bron,
  bericht,
  fout,
  niveau = "error",
  context = {},
}: {
  /** Route of taak waar het gebeurde, bijv. "api/orders" of "checkout/betalen". */
  bron: string;
  bericht: string;
  fout?: unknown;
  niveau?: "error" | "warn";
  context?: Record<string, unknown>;
}): Promise<void> {
  const melding =
    fout instanceof Error ? fout.message : fout == null ? undefined : typeof fout === "string" ? fout : JSON.stringify(fout);
  console.error(`[${bron}] ${bericht}`, melding ?? "", context);
  try {
    const dash = (process.env.SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app").replace(/\/+$/, "");
    const res = await fetch(`${dash}/api/fout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shop-dash-key": process.env.SHOP_DASH_API_KEY || "",
      },
      body: JSON.stringify({ shopId: SHOP_ID, bron, bericht, fout: melding, niveau, context }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("[fout-melden] shop-dash weigerde de melding", res.status);
  } catch (e) {
    console.error("[fout-melden] melden bij shop-dash mislukte", e);
  }
}
