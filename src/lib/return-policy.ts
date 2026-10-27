/**
 * Retourbeleid voor Google, als schema.org-fragment in elke Offer.
 *
 * Bron: src/app/retourneren: "Retourzendingen zijn niet mogelijk", met 100% leveringsgarantie bij vertraging
 *
 * Daarom MerchantReturnNotPermitted. Dat is geen mooi signaal maar het is wat
 * er staat, en een onjuiste retourclaim in structured data is erger dan geen
 * claim: Google vergelijkt het met de pagina waar merchantReturnLink naar wijst.
 *
 * Wil je hier een gunstiger waarde, dan moet eerst het beleid op de
 * retourpagina veranderen. Niet dit bestand.
 */
export const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "NL",
  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
  merchantReturnLink: "https://kamagrasite.nl/retourneren/",
} as const;
