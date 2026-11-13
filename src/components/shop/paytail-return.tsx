"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { track } from "@/lib/analytics";

/**
 * Bij terugkeer van Paytail (?paytail=1) is de bestelling al betaald en moet
 * de winkelmand alsnog leeg - dat gebeurt normaal vóór het afrekenen, maar bij
 * een Paytail-bestelling wachten we daar expres mee tot de klant hier
 * terugkomt, anders is een afgebroken betaling de mand kwijt. Dit is een
 * server component (BedanktPage), vandaar dit kleine clientonderdeel.
 *
 * Deze pagina laadt alleen als Paytail zelf hierheen terugstuurt na een
 * afgeronde betaling - de browser hier zien is dus het enige echte signaal
 * dat iemand de betaling op Paytail ook echt heeft afgemaakt (er is geen
 * webhook). order_placed (bij het versturen van het formulier) laat alleen
 * zien dat iemand naar Paytail vertrok, niet of hij terugkwam. Zelfde
 * event-naam als retakopen gebruikt voor dezelfde terugkeer.
 */
export function PaytailReturnClearCart({ orderReference }: { orderReference: string }) {
  const cart = useCart();
  useEffect(() => {
    cart.clear();
    track("order_confirmed", { order_reference: orderReference });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
