import { listCategories, listBlogPosts, listProducts, listBuyPages, getShop } from "@/lib/queries";

export const revalidate = 3600;

const BASIS = "https://kamagrasite.nl";

/**
 * Elke URL met afsluitende slash, want de site draait met `trailingSlash:
 * true`. Zonder slash is elke link hier een 308, en een crawler die een
 * manifest afloopt hoort geen zeventig omleidingen te krijgen.
 */
const url = (pad: string) => `${BASIS}/${pad.replace(/^\/+|\/+$/g, "")}/`;

/**
 * /llms.txt - AI-crawler manifest per llmstxt.org spec.
 *
 * Shop-identiteit plus diepte-links naar categorieen, producten, koop-pagina's
 * en de kennisbank. Producten met noindex blijven eruit.
 *
 * Twee dingen hier rechtgezet op 20 nov 2026, de dag van de domeinomzetting:
 * de categorieen stonden nog op de oude /winkel/<slug>-route die inmiddels
 * permanent omleidt naar /<slug>/, en geen enkele link had een afsluitende
 * slash. Alle 58 links waren dus een omleiding, negen daarvan zelfs twee.
 * Daarnaast ontbraken de koop-pagina's volledig, terwijl dat juist de teksten
 * zijn waarop we gevonden willen worden, de zestien stadspagina's incluis.
 */
export async function GET() {
  const [shop, categories, products, blogs, buyPages] = await Promise.all([
    getShop().catch(() => null),
    listCategories(),
    listProducts({ limit: 200 }),
    listBlogPosts(50),
    listBuyPages(),
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
    // Schone URL sinds de categorieen van /winkel/<slug> naar /<slug>/ zijn.
    lines.push(`- [${c.name}](${url(c.slug)}): ${c.description || c.name}`);
  }
  if (indexeerbaar.length > 0) {
    lines.push("");
    lines.push("## Producten");
    lines.push("");
    for (const p of indexeerbaar) {
      const blurb = p.subtitle || p.description || p.name;
      lines.push(`- [${p.name}](${url(`product/${p.slug}`)}): ${blurb}`);
    }
  }

  // Koop-pagina's: de uitgeschreven teksten per middel, per dosering en per
  // stad. Gesplitst, want een stadspagina beantwoordt een andere vraag dan een
  // stofpagina en dat onderscheid is nu juist wat een taalmodel moet zien.
  const teLinken = buyPages.filter((p) => p.noindex !== true && !p.canonical_url);
  const steden = teLinken.filter((p) => p.tag === "stad");
  const onderwerpen = teLinken.filter((p) => p.tag !== "stad");
  if (onderwerpen.length > 0) {
    lines.push("");
    lines.push("## Middelen en doseringen");
    lines.push("");
    for (const p of onderwerpen) {
      lines.push(`- [${p.h1}](${url(p.slug)}): ${p.meta_description || p.intro || p.h1}`);
    }
  }
  if (steden.length > 0) {
    lines.push("");
    lines.push("## Per stad");
    lines.push("");
    lines.push("Kamagra is in Nederland nergens over de toonbank te koop en afhalen kan niet; deze pagina's leggen dat per stad uit en behandelen elk een eigen onderwerp.");
    lines.push("");
    for (const p of steden) {
      lines.push(`- [${p.h1}](${url(p.slug)}): ${p.meta_description || p.intro || p.h1}`);
    }
  }

  lines.push("");
  lines.push("## Kennisbank");
  lines.push("");
  for (const b of blogs.slice(0, 30)) {
    lines.push(`- [${b.title}](${url(`kennisbank/${b.slug}`)}): ${b.excerpt || b.title}`);
  }
  lines.push("");
  lines.push("## Herkomst en kwaliteit");
  lines.push(`- [Waar onze medicatie vandaan komt](${url("lab")}): fabrikanten, waarom generiek hetzelfde molecuul is, zelf een strip controleren`);
  lines.push(`- [Begrippenlijst](${url("begrippenlijst")}): PDE5-remmer, onset, halfwaardetijd, nitraten en andere termen`);
  lines.push("");
  lines.push("## Optional");
  // Een bestandsnaam krijgt geen slash, anders is het geen bestand meer.
  lines.push(`- [Sitemap](${BASIS}/sitemap.xml)`);
  lines.push(`- [Contact](${url("contact")})`);
  lines.push(`- [Bezorging](${url("bezorging")})`);
  lines.push(`- [Kamagra per stad: afhalen, winkels en bezorging](${url("steden")})`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
