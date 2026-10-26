/**
 * Verzendkosten-logica.
 *
 * Kamagra Site verstuurt alles vanuit een magazijn in Nederland, dus elke
 * bestelling is een zending met een vast tarief. De twee-locatie-constructie
 * uit de anabolenpro-basis is hier bewust uit gesloopt.
 */

import type { CartItem } from "@/lib/cart-context";

export const SHIPPING_FEE_CENTS = 1000; // EUR 10 per bestelling

export type ShippingBreakdown = {
  shippingCents: number;
  itemCount: number;
};

export function computeShipping(items: CartItem[]): ShippingBreakdown {
  const itemCount = items.reduce((n, it) => n + it.qty, 0);
  return {
    shippingCents: items.length === 0 ? 0 : SHIPPING_FEE_CENTS,
    itemCount,
  };
}
