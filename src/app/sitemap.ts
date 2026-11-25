import { MetadataRoute } from "next";
import { listProducts, listCategories, listBlogPosts, listBuyPages } from "@/lib/queries";

const BASE = "https://kamagrasite.nl";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs, buyPages] = await Promise.all([
    listProducts({ limit: 500 }),
    listCategories(),
    listBlogPosts(200),
    listBuyPages(),
  ]);

  const staticRoutes = [
    { url: `${BASE}/`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${BASE}/winkel/`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE}/kennisbank/`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/begrippenlijst/`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/lab/`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/over-ons/`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE}/bezorging/`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE}/steden/`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE}/contact/`, changeFrequency: "monthly" as const, priority: 0.3 },
    // Retourneren blijft erin: dat is geen juridische kleine lettertjes maar
    // een pagina waar een twijfelende koper echt naar zoekt, en de waarden
    // erop voeden het MerchantReturnPolicy-schema.
    { url: `${BASE}/retourneren/`, changeFrequency: "monthly" as const, priority: 0.4 },

    // /voorwaarden/, /privacy/ en /cookies/ staan hier bewust NIET meer in.
    // Ze zijn op 23 nov 2026 op noindex gezet: juridische verplichte tekst
    // zonder zoekwaarde. Een noindex-pagina die je wel indient levert in
    // Search Console de melding "Submitted URL marked noindex" op, dus die
    // twee instellingen horen bij elkaar te blijven. Blijven gewoon
    // bereikbaar via de footer.
  ];

  // Koop-pagina's staan hoog in de sitemap: dit zijn de pagina's die op de
  // transactionele zoektermen moeten ranken.
  const buyRoutes = buyPages
    .filter((p) => p.noindex !== true && !p.canonical_url)
    .map((p) => ({
      url: `${BASE}/${p.slug}/`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.95,
    }));

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE}/${c.slug}/`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Alleen index-baar (UT-merk) producten in sitemap. noindex=true wordt
  // expliciet uitgesloten zodat Google ze niet via sitemap ontdekt.
  //
  // Ook eruit: producten met een canonical_url die naar een andere pagina
  // wijst. Een paar slugs bestaan twee keer, als product en als koop-pagina
  // (super-p-force en super-kamagra), en die vochten in Search Console om
  // dezelfde zoekterm: de koop-pagina stond op plek 17 en de productpagina op
  // 48. De productpagina verwijst nu via canonical_url naar de koop-pagina,
  // en dan hoort hij niet meer in de sitemap, want je vraagt Google niet om
  // een pagina op te halen waarvan je zelf zegt dat een andere de echte is.
  const productRoutes = products
    .filter((p: any) => p.noindex !== true)
    .filter((p: any) => {
      const c = String(p.canonical_url || "").trim();
      if (!c) return true;
      const eigen = `/product/${p.slug || p.sku}`;
      return c === eigen || c === `${eigen}/` || c === `${BASE}${eigen}` || c === `${BASE}${eigen}/`;
    })
    .map((p) => ({
      url: `${BASE}/product/${p.slug || p.sku}/`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const blogRoutes = blogs.map((b) => ({
    url: `${BASE}/kennisbank/${b.slug}/`,
    lastModified: new Date(b.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...buyRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
