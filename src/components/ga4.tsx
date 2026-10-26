"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, effectiveConsent, type ConsentState } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 met Consent Mode v2.
 *
 * Meten staat standaard aan, zie src/lib/consent.ts. Advertentiesignalen staan
 * altijd uit; alleen analytics_storage volgt de keuze van de bezoeker.
 *
 * Kiest iemand alsnog "Nee" terwijl gtag al draait, dan sturen we een
 * consent-update denied. Daarna blijft het script staan maar zet het niets
 * meer weg. Dat is hoe Consent Mode bedoeld is; het script verwijderen zou
 * niets extra's opleveren.
 *
 * Staat los van lib/analytics.ts: die is cookieloos en meet ook bezoekers met
 * een adblocker, die googletagmanager.com tegenhouden.
 */
export function GA4({ measurementId }: { measurementId: string }) {
  // Begint op null, niet op "granted". Anders injecteert next/script het
  // gtag-script al bij de eerste render, en dan helpt het niet meer dat we
  // daarna null teruggeven: het script staat er dan al. Wie "Nee" heeft
  // gekozen zou GA4 alsnog laden.
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setConsent(effectiveConsent());
    const bij = (e: Event) => {
      const keuze = (e as CustomEvent).detail as ConsentState;
      const nieuw = keuze === "denied" ? "denied" : "granted";
      setConsent(nieuw);
      window.gtag?.("consent", "update", { analytics_storage: nieuw });
    };
    window.addEventListener(CONSENT_EVENT, bij);
    return () => window.removeEventListener(CONSENT_EVENT, bij);
  }, []);

  // Vervolg-pageviews bij client-side navigatie; de standaardsnippet stuurt
  // alleen de eerste.
  useEffect(() => {
    if (consent !== "granted" || !pathname || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, consent]);

  if (!measurementId || consent !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
