import { listCategories, listBlogPosts, listProducts, getShop } from "@/lib/queries";

export const revalidate = 3600;

/**
 * /llms.txt - AI-crawler manifest per llmstxt.org spec.
 * Bevat shop-identiteit + diepte-links naar categorie-, product- en
 * kennisbank-content. Producten met noindex blijven eruit.
 */
export async function GET() {
  const [shop, categories, products, blogs] = await Promise.all([
    getShop().catch(() => null),
    listCategories(),
    listProducts({ limit: 200 }),
    listBlogPosts(50),
  ]);

  const indexeerbaar = products.filter((p: any) => p.noindex !== true);

  const lines: string[] = [];
  lines.push("# Kamagra Site");
  lines.push("");
  lines.push("> Nederlandse webshop voor generieke ED-medicatie zonder recept. Kamagra, Cenforce, Vidalista en Vilitra met sildenafil, tadalafil, vardenafil of dapoxetine, rechtstreeks geimporteerd bij Ajanta Pharma, Centurion Laboratories en Sunrise Remedies. Neutraal verpakt, verzonden vanuit Nederland naar NL en BE, betaling via bankoverschrijving. De kennisbank behandelt onset, werkingsduur, doseringen, verschillen tussen de stoffen en wisselwerkingen zoals nitraten en alfablokkers.");
  lines.push("");
  lines.push("## Catalogus");
  lines.push("");
  for (const c of categories) {
    lines.push(`- [${c.name}](https://kamagrasite.nl/winkel/${c.slug}): ${c.description || c.name}`);
  }
  if (indexeerbaar.length > 0) {
    lines.push("");
    lines.push("## Producten");
    lines.push("");
    for (const p of indexeerbaar) {
      const catSlug = (p as any).categories?.slug || "winkel";
      const blurb = p.subtitle || p.description || p.name;
      lines.push(`- [${p.name}](https://kamagrasite.nl/product/${catSlug}/${p.slug}): ${blurb}`);
    }
  }
  lines.push("");
  lines.push("## Kennisbank");
  lines.push("");
  for (const b of blogs.slice(0, 30)) {
    lines.push(`- [${b.title}](https://kamagrasite.nl/kennisbank/${b.slug}): ${b.excerpt || b.title}`);
  }
  lines.push("");
  lines.push("## Herkomst en kwaliteit");
  lines.push("- [Waar onze medicatie vandaan komt](https://kamagrasite.nl/lab): fabrikanten, waarom generiek hetzelfde molecuul is, zelf een strip controleren");
  lines.push("- [Begrippenlijst](https://kamagrasite.nl/begrippenlijst): PDE5-remmer, onset, halfwaardetijd, nitraten en andere termen");
  lines.push("");
  lines.push("## Optional");
  lines.push("- [Sitemap](https://kamagrasite.nl/sitemap.xml)");
  lines.push("- [Contact](https://kamagrasite.nl/contact)");
  lines.push("- [Bezorging](https://kamagrasite.nl/bezorging)");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
