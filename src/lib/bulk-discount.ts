// Bulk-korting matrix. Per item-qty.
// 5+ items = 10%, 10+ items = 15%. Server (orders API) en client
// (winkelmand/checkout) gebruiken dezelfde logica.
export const BULK_TIERS = [
  { qty: 10, pct: 15 },
  { qty: 5, pct: 10 },
];

export function unitDiscountPct(qty: number): number {
  for (const t of BULK_TIERS) if (qty >= t.qty) return t.pct;
  return 0;
}

export function lineSubtotalCents(priceCents: number, qty: number): number {
  const pct = unitDiscountPct(qty);
  return Math.round(priceCents * (1 - pct / 100)) * qty;
}

export interface CartLikeItem {
  price_cents: number;
  qty: number;
}

const SHIPPING_FEE_CENTS = 1000; // EUR 10 per bestelling

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
