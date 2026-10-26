"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { armCartAbandonment, setCartSnapshot } from "@/lib/cart-abandon";

/**
 * Houdt de verlaten-mand-meting op de hoogte van wat er in de winkelmand ligt.
 *
 * Staat los van de mand zelf, zodat de cart-context niets van tracking hoeft
 * te weten. Rendert niets; hangt in de layout binnen de CartProvider.
 */
export function CartAbandonTracker() {
  const { items, total } = useCart();

  useEffect(() => {
    armCartAbandonment();
  }, []);

  useEffect(() => {
    setCartSnapshot({
      count: items.reduce((s, i) => s + i.qty, 0),
      valueCents: Math.round(total),
      items: items.map((i) => ({
        id: String(i.id),
        name: String(i.name),
        qty: i.qty,
        priceCents: i.price_cents,
      })),
    });
  }, [items, total]);

  return null;
}
