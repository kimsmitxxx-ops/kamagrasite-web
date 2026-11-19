/**
 * Meest verkochte producten.
 *
 * Deze volgorde is NIET verzonnen en ook geen redactionele keuze. Hij komt uit
 * de WooCommerce-shop die op dit moment op kamagrasite.nl draait, opgehaald op
 * 19 november 2026 via de publieke Store API:
 *
 *   /wp-json/wc/store/v1/products?orderby=popularity
 *
 * WooCommerce sorteert daarop met total_sales, dus dit is wat er in deze
 * winkel echt over de toonbank is gegaan. De nieuwe shop heeft zelf nog geen
 * bestellingen, dus zonder deze bron zou "meest verkocht" een verzinsel zijn.
 *
 * Vervang dit zodra de nieuwe shop genoeg eigen bestellingen heeft: dan komt
 * de volgorde uit order_items en hoeft er niets meer handmatig bij.
 */

/** Slugs in afnemende volgorde van verkoop; alle twaalf bestaan in de catalogus. */
export const BESTSELLER_SLUGS = [
  "vidalista-black-80mg",
  "kamagra-100mg",
  "super-kamagra",
  "sildalis-120mg",
  "cenforce-200mg",
  "cenforce-100mg",
  "oral-jelly",
  "sildamax",
  "vidalista-80mg",
  "sildaforce-200mg",
  "cobra-120mg",
  "super-vidalista-80mg",
] as const;

/** Wanneer de lijst is opgehaald, voor op de pagina zelf. */
export const BESTSELLER_PEILDATUM = "november 2026";

/**
 * Zet een productlijst in de volgorde van de bestsellerlijst en houdt alleen
 * over wat erin staat. Producten die niet leverbaar zijn vallen af: een
 * "meest verkocht"-blok vol uitverkochte artikelen helpt niemand.
 */
export function sorteerOpVerkoop<T extends { slug: string; availability?: string | null }>(
  producten: T[],
  aantal = 5
): T[] {
  const rang = new Map<string, number>(BESTSELLER_SLUGS.map((s, i) => [s, i]));
  return producten
    .filter((p) => rang.has(p.slug) && p.availability !== "OutOfStock")
    .sort((a, b) => (rang.get(a.slug) ?? 999) - (rang.get(b.slug) ?? 999))
    .slice(0, aantal);
}
