"use client";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

/**
 * Verzendknop van het formulier dat de bezoeker naar Paytail stap 2 post.
 *
 * Alleen de knop is een clientonderdeel, niet het hele formulier: zo blijft het
 * een gewone HTML-POST die ook zonder JavaScript werkt. De onClick roept geen
 * preventDefault, dus het formulier verstuurt daarna normaal.
 *
 * payment_redirect vuurde eerder al in de checkout, bij het versturen van het
 * bestelformulier. Nu de uitlegpagina ertussen zit hoort het event hier: dit is
 * het moment waarop iemand echt naar Paytail vertrekt, en het verschil met
 * order_placed laat zien hoeveel mensen op deze pagina afhaken. track() gebruikt
 * sendBeacon, dus het event overleeft het wegnavigeren.
 */
export function PaytailStep2Button({
  label,
  color,
  textColor,
  orderReference,
}: {
  label: string;
  color: string;
  textColor: string;
  orderReference: string;
}) {
  return (
    <button
      type="submit"
      onClick={() => track("payment_redirect", { order_reference: orderReference })}
      style={{ backgroundColor: color, color: textColor }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-display text-lg shadow-sm transition hover:opacity-90 sm:w-auto sm:px-10"
    >
      {label}
      <ArrowRight size={18} />
    </button>
  );
}
