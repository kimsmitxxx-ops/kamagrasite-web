// Komt uit shop-core (src/components/uitstellen.tsx). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Onderdelen pas laten draaien als de browser even niets te doen heeft.
 *
 * WAAROM DIT BESTAAT
 * Gemeten op kamagrashop.nl, 19 nov 2026: Lighthouse geeft 94 tot 98 op
 * desktop en 63 tot 74 op mobiel. Het verschil is niet het netwerk (671 KiB
 * totaal, niets render-blocking, serverreactie 330ms) maar de processor:
 * Lighthouse rekent mobiel met een vier keer tragere CPU, en dan telt elke
 * milliseconde hydratatie vier keer mee.
 *
 * De homepage had acht client-componenten die op ELKE pagina meeliepen,
 * waarvan vier niets doen wat de bezoeker in het eerste half seconde nodig
 * heeft: de bezoekersmeting, de winkelwagen-verlaatmeting, GA4 en de
 * cookiemelding. Die hoeven niet te vechten met React om dezelfde hoofdthread.
 *
 * HOE JE HET GEBRUIKT
 * Twee lagen, en ze vullen elkaar aan:
 *
 *   1. `next/dynamic` met `ssr: false` haalt de code uit de hoofdbundel. Dat
 *      scheelt bytes op het kritieke pad.
 *   2. `NaIdle` eromheen zorgt dat hij ook pas DRAAIT als de browser klaar is
 *      met het belangrijke werk. Zonder dit laadt de chunk wel apart, maar
 *      hydrateert hij nog steeds midden in de drukte.
 *
 *   const Meting = dynamic(() => import("@/components/analytics-tracker")
 *     .then((m) => m.AnalyticsTracker), { ssr: false });
 *
 *   <NaIdle><Meting /></NaIdle>
 *
 * WAT JE ER NIET IN STOPT
 * Alles wat de bezoeker kan zien of waar hij op kan klikken voordat de pagina
 * "klaar" is. Dus geen header, geen navigatie, geen productkaart, geen
 * winkelwagenknop. Die moeten juist zo vroeg mogelijk reageren. Dit is voor
 * metingen, widgets en meldingen.
 *
 * TOEGANKELIJKHEID EN SEO
 * De inhoud hiervan staat niet in de server-HTML. Dat is precies de bedoeling
 * bij een meting, maar het betekent ook dat je er niets in zet wat Google moet
 * zien of wat een schermlezer meteen moet aankondigen.
 */
export function NaIdle({
  children,
  /**
   * Noodrem voor browsers zonder requestIdleCallback (Safari had het lang
   * niet). Zonder deze val zou het daar nooit laden.
   */
  uiterlijkNa = 2500,
  /**
   * Zet dit op een gebeurtenis als het onderdeel pas bij interactie hoeft te
   * bestaan. Handig voor een chatwidget: die hoeft niet te laden bij iemand
   * die alleen de prijs komt kijken.
   */
  bijInteractie = false,
}: {
  children: ReactNode;
  uiterlijkNa?: number;
  bijInteractie?: boolean;
}) {
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    if (laden) return;
    let klaar = false;
    const start = () => {
      if (klaar) return;
      klaar = true;
      setLaden(true);
    };

    const opruimers: Array<() => void> = [];

    if (bijInteractie) {
      // passive: deze luisteraars mogen het scrollen nooit vertragen.
      const gebeurtenissen = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
      for (const g of gebeurtenissen) {
        window.addEventListener(g, start, { once: true, passive: true });
        opruimers.push(() => window.removeEventListener(g, start));
      }
    }

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    if (typeof ric === "function") {
      ric(start, { timeout: uiterlijkNa });
    } else {
      const id = window.setTimeout(start, Math.min(uiterlijkNa, 1200));
      opruimers.push(() => window.clearTimeout(id));
    }

    // Altijd een harde bovengrens, ook als idle nooit komt doordat de pagina
    // druk blijft. Beter laat dan nooit: een meting die niet afgaat is een gat
    // in de cijfers, en dat valt pas op als je ze gaat vergelijken.
    const val = window.setTimeout(start, uiterlijkNa);
    opruimers.push(() => window.clearTimeout(val));

    return () => opruimers.forEach((f) => f());
  }, [laden, uiterlijkNa, bijInteractie]);

  return laden ? <>{children}</> : null;
}
