"use client";

import dynamic from "next/dynamic";

/**
 * Onderdelen die pas na de eerste weergave hoeven te hydrateren.
 *
 * Ze stonden met `dynamic(..., { ssr: false })` in de root-layout, maar Next
 * 15 staat dat niet meer toe in een server component. Het uitstellen zelf is
 * ongewijzigd: deze module is een client-component en doet exact dezelfde
 * dynamische import, dus er gaat nog steeds niets van mee in de server-HTML.
 */
// CartDrawer is alleen zichtbaar als gebruiker op cart-icoon klikt -> defer hydratie
export const CartDrawer = dynamic(() => import("@/components/shop/cart-drawer").then((m) => m.CartDrawer), {
  ssr: false,
});

// Defer chat-widget - niet kritiek voor FCP/LCP; pas hydrateren na main content
export const WhatsAppFab = dynamic(() => import("@/components/whatsapp-fab").then((m) => m.WhatsAppFab), {
  ssr: false,
});
