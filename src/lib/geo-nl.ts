// Komt uit shop-core (src/lib/geo-nl.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
/**
 * Taal- en landsignalen. Google leidt bij een .nl vanzelf af dat de site op
 * Nederland mikt, maar bij .com, .ws en .is doet hij dat niet, en de oude
 * instelling "internationale targeting" in Search Console bestaat niet meer.
 * Wat er dan overblijft zijn de signalen hieronder, en die horen op elke shop
 * hetzelfde te zijn.
 *
 * Wat we uitzenden:
 *   - `lang="nl"` op <html> (staat in de layout)
 *   - og:locale nl_NL
 *   - hreflang nl-NL en nl-BE naar dezelfde URL, plus x-default; we leveren
 *     echt aan beide landen, dus dit is geen trucje
 *   - een Organization-blok met areaServed NL en BE, inLanguage nl-NL en EUR
 *
 * Niets hiervan wordt verzonnen: adres, KvK en BTW komen uit de shop-rij en
 * blijven weg als ze er niet staan.
 */

export const OG_LOCALE = "nl_NL";

/** De landen waaraan deze shops daadwerkelijk leveren. */
export const LEVERLANDEN = ["NL", "BE"] as const;

/**
 * hreflang-regels voor een pagina. Dezelfde URL voor nl-NL en nl-BE: er is
 * maar een versie van de pagina en die bedient allebei de landen.
 *
 * De paden blijven relatief; Next zet er zelf  voor. Dat
 * scheelt een site-URL doorgeven op elke aanroep en kan dus ook niet
 * verkeerd gaan.
 */
export function hreflangVoor(pad: string): Record<string, string> {
  return { "nl-NL": pad, "nl-BE": pad, "x-default": pad };
}

export interface ShopGegevens {
  name?: string | null;
  domain?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  description?: string | null;
  kvk?: string | null;
  btw?: string | null;
  address_street?: string | null;
  address_postal?: string | null;
  address_city?: string | null;
  address_country?: string | null;
}

/**
 * Organization-schema met de landsignalen erin. Velden die leeg zijn in de
 * shop-rij blijven weg in plaats van dat er iets plausibels wordt ingevuld.
 */
export function organisatieJsonLd(shop: ShopGegevens | null, siteUrl: string) {
  const adres =
    shop?.address_city || shop?.address_street || shop?.address_postal
      ? {
          "@type": "PostalAddress",
          streetAddress: shop?.address_street || undefined,
          postalCode: shop?.address_postal || undefined,
          addressLocality: shop?.address_city || undefined,
          addressCountry: shop?.address_country || "NL",
        }
      : { "@type": "PostalAddress", addressCountry: "NL" };

  const identifiers = [
    shop?.kvk ? { "@type": "PropertyValue", name: "KvK", value: shop.kvk } : null,
    shop?.btw ? { "@type": "PropertyValue", name: "BTW", value: shop.btw } : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: shop?.name || undefined,
    url: siteUrl,
    description: shop?.description || undefined,
    logo: shop?.logo_url || `${siteUrl.replace(/\/$/, "")}/icon.png`,
    email: shop?.email || undefined,
    telephone: shop?.phone || undefined,
    address: adres,
    // Dit is het punt van dit bestand: expliciet zeggen voor welk land en in
    // welke taal deze site bedoeld is.
    areaServed: LEVERLANDEN.map((land) => ({ "@type": "Country", name: land })),
    inLanguage: "nl-NL",
    currenciesAccepted: "EUR",
    ...(identifiers.length > 0 ? { identifier: identifiers } : {}),
  };
}

/**
 * `alternates` voor een pagina: de canonical die er al stond, plus de
 * hreflang-regels. Nodig omdat Next de `alternates` van een pagina de
 * `alternates` van de layout laat vervangen in plaats van aanvullen; zonder
 * dit verdwijnt de hreflang op elke pagina die zijn eigen canonical zet.
 */
export function alternatesNL(canonical: string) {
  return { canonical, languages: hreflangVoor(canonical) };
}
