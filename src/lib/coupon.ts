/**
 * Kortingscode in de winkelmand.
 *
 * De shop rekent niets zelf uit en kent de codes ook niet: hij vraagt de
 * database (coupon_check / coupon_verzilver, shop-dash migratie 093) of een
 * code klopt en wat hij oplevert. Zo kan een bezoeker die het verzoek zelf
 * opstelt geen korting verzinnen, en kan de mand nooit een ander bedrag
 * tonen dan de bestelling straks rekent.
 */

export type CouponResultaat = {
  ok: boolean;
  /** onbekend | inactief | nog_niet_geldig | verlopen | opgebruikt | minimum */
  reason: string | null;
  /** Tekst voor de bezoeker; alleen gevuld als ok = false. */
  melding: string | null;
  code: string | null;
  kind: "percent" | "fixed" | null;
  value: number | null;
  discount_cents: number;
  label: string | null;
};

export const GEEN_COUPON: CouponResultaat = {
  ok: false,
  reason: null,
  melding: null,
  code: null,
  kind: null,
  value: null,
  discount_cents: 0,
  label: null,
};

/** Zoals de klant hem mag typen: spaties eruit, hoofdletters erin. */
export function schoonCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, "").slice(0, 40);
}

/** Korte samenvatting naast het bedrag, bv. "HERFST10 · 10%". */
export function couponLabel(r: CouponResultaat): string {
  if (!r.code) return "Kortingscode";
  if (r.kind === "percent" && r.value) return `${r.code} · ${r.value}%`;
  return r.code;
}
