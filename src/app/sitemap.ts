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
    // Deze drie stonden er niet in terwijl ze wel bestaan en indexeerbaar zijn.
    // Retourneren hoort erbij omdat die pagina meeweegt in het vertrouwen dat
    // een bezoeker in de winkel heeft; voorwaarden en privacy zijn de pagina's
    // waar een koper naar zoekt voordat hij bestelt.
    { url: `${BASE}/retourneren/`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE}/voorwaarden/`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${BASE}/privacy/`, changeFrequency: "yearly" as const, priority: 0.2 },
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
  const productRoutes = products
    .filter((p: any) => p.noindex !== true)
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
