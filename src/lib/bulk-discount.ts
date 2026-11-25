// Het tarief staat in lib/shipping.ts en nergens anders. Eerder stond het
// hier, daar en in de bestelroute alle drie apart, met als gevolg dat ze uit
// elkaar konden lopen zonder dat iets klaagde.
import { SHIPPING_FEE_CENTS } from "./shipping";

// Bulk-korting matrix, per aantal van dezelfde regel: 3+ = 10%, 5+ = 15%,
// 10+ = 20%. Server (orders API) en client (winkelmand/checkout) gebruiken
// dezelfde logica. De teksten op winkel, categorie en hero noemen deze zelfde
// staffel en moeten dus meeveranderen als deze lijst verandert.
export const BULK_TIERS = [
  { qty: 10, pct: 20 },
  { qty: 5, pct: 15 },
  { qty: 3, pct: 10 },
];

export function unitDiscountPct(qty: number): number {
  for (const t of BULK_TIERS) if (qty >= t.qty) return t.pct;
  return 0;
}

/**
 * De volgende staffel voor één regel: hoeveel stuks er nog bij moeten, welk
 * percentage dat oplevert en hoe ver je er al bent.
 *
 * Bewust per regel en niet over de hele mand, want zo werkt de korting hier
 * ook: `unitDiscountPct` kijkt naar het aantal van één product. Een balk over
 * het mandtotaal (zoals op kamagrashop, waar de staffel op het bedrag zit) zou
 * hier een belofte doen die de rekenmachine niet nakomt.
 *
 * Null = de hoogste staffel is al gehaald.
 */
export function nextTier(qty: number): { pct: number; remaining: number; progressPct: number } | null {
  const oplopend = [...BULK_TIERS].sort((a, b) => a.qty - b.qty);
  let vorige = 0;
  for (const t of oplopend) {
    if (qty < t.qty) {
      const span = t.qty - vorige;
      const progressPct = span > 0 ? Math.min(100, Math.max(0, Math.round(((qty - vorige) / span) * 100))) : 0;
      return { pct: t.pct, remaining: t.qty - qty, progressPct };
    }
    vorige = t.qty;
  }
  return null;
}

export function lineSubtotalCents(priceCents: number, qty: number): number {
  const pct = unitDiscountPct(qty);
  return Math.round(priceCents * (1 - pct / 100)) * qty;
}

export interface CartLikeItem {
  price_cents: number;
  qty: number;
}


/**
 * `couponCents` is de korting van een ingevulde kortingscode. Die komt altijd
 * van de server (app.coupon_korting in de database, via /api/coupon) en wordt
 * hier alleen nog afgetrokken - de staffelkorting gaat er eerst af, de code
 * daarna. Nooit meer dan het subtotaal, zodat verzending altijd betaald blijft.
 */
export function calcTotals(items: CartLikeItem[], couponCents = 0) {
  let subtotalRaw = 0;
  let subtotal = 0;
  let savings = 0;
  for (const it of items) {
    subtotalRaw += it.price_cents * it.qty;
    const sub = lineSubtotalCents(it.price_cents, it.qty);
    subtotal += sub;
  }
  savings = subtotalRaw - subtotal;
  const coupon = Math.min(Math.max(couponCents, 0), subtotal);
  // Een magazijn, dus een vast verzendtarief per bestelling.
  const shipping = items.length === 0 ? 0 : SHIPPING_FEE_CENTS;
  const total = subtotal - coupon + shipping;
  return { subtotalRaw, subtotal, savings, coupon, shipping, total };
}
