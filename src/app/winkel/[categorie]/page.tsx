import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, listProducts, listCategories, sortProducts, listBuyPages } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CollapsibleIntro } from "@/components/shop/collapsible-intro";
import { BuyPageLinks } from "@/components/shop/buy-page-links";
import type { Metadata } from "next";
import { BookOpen, Truck, ShieldCheck, PackageCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { categorie: string };
  searchParams: { stock?: string; stof?: string; vorm?: string; q?: string };
}): Promise<Metadata> {
  const cat = await getCategory(params.categorie);
  if (!cat) return { title: "Niet gevonden" };

  // De koop-pagina (/<categorie>-kopen) is de ranking-target voor "<naam>
  // kopen". Deze pagina is de browse-weergave en krijgt daarom een eigen
  // invalshoek in de title, zodat de twee niet om dezelfde query vechten.
  const filtered = Boolean(searchParams?.stock || searchParams?.stof || searchParams?.vorm || searchParams?.q);

  return {
    title: cat.meta_title || `${cat.name} assortiment - alle varianten en prijzen`,
    description:
      cat.meta_description ||
      cat.description ||
      `Het volledige ${cat.name}-assortiment van Kamagra Site, met prijs en voorraad per variant. Discreet verpakt en snel verstuurd vanuit Nederland.`,
    // Gefilterde varianten zijn facetten van dezelfde lijst: canonical naar de
    // schone URL en uit de index houden, anders indexeert Google elke
    // filtercombinatie als losse pagina.
    alternates: { canonical: `/winkel/${cat.slug}` },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title: cat.name, description: cat.description || undefined, type: "website" },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { categorie: string };
  searchParams: { stock?: string; stof?: string; vorm?: string; q?: string };
}) {
  const [cat, allProducts, allCategories, buyPages] = await Promise.all([
    getCategory(params.categorie),
    listProducts({ categorySlug: params.categorie }),
    listCategories(),
    listBuyPages(),
  ]);
  if (!cat) notFound();

  const stockOnly = searchParams.stock === "1";
  const stof = (searchParams.stof || "").toLowerCase();
  const vorm = (searchParams.vorm || "").toLowerCase();
  const q = (searchParams.q || "").trim().toLowerCase();
  const vormen = Array.from(new Set(allProducts.map((p) => p.package_type).filter(Boolean) as string[]));

  const filtered = allProducts.filter((p) => {
    if (stockOnly && p.availability === "OutOfStock") return false;
    if (stof && !(p.stof_slugs || []).includes(stof)) return false;
    if (vorm && p.package_type !== vorm) return false;
    if (q) {
      const hay = `${p.name} ${p.slug} ${(p.tags || []).join(" ")} ${(p.stof_slugs || []).join(" ")} ${p.subtitle || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const products = sortProducts(filtered);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    url: `/winkel/${cat.slug}`,
    description: cat.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          sku: p.sku,
          image: p.image_url || undefined,
          offers: { "@type": "Offer", price: (p.price_cents / 100).toFixed(2), priceCurrency: "EUR", availability: p.availability === "OutOfStock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
        },
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-6 text-xs text-text-muted">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/winkel" className="hover:underline">Winkel</Link> / <span>{cat.name}</span>
      </div>

      <h1 className="font-display text-3xl md:text-4xl">{cat.name}</h1>
      {cat.description && <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">{cat.description}</p>}

      {cat.intro_html && <CollapsibleIntro html={cat.intro_html} />}

      <div className="mt-6 rounded-lg border border-accent/30 bg-accent-soft/15 p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-text">Bulk-korting actief op {cat.name.toLowerCase()}</p>
          <p className="text-text-muted">Vanaf 5 items <strong>10% korting</strong> · Vanaf 10 items <strong>15% korting</strong> - automatisch verrekend in de mand.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-lg border border-primary-muted bg-primary p-4 text-primary-foreground">
            <h4 className="text-xs uppercase tracking-wider text-accent-soft font-semibold mb-3 inline-flex items-center gap-1.5">
              <BookOpen size={12} /> Categorieën
            </h4>
            <div className="space-y-1 text-sm">
              <Link
                href="/winkel"
                className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent"
              >
                Alle producten
              </Link>
              {allCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/winkel/${c.slug}`}
                  className={`block rounded px-2 py-1.5 ${
                    c.slug === cat.slug
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-primary-foreground/80 hover:bg-primary-soft hover:text-accent"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <CatalogFilters stockOnly={stockOnly} activeStof={stof} activeVorm={vorm} vormen={vormen} />
          {/* Interne links naar de koop-pagina's - die moeten op de
              transactionele termen ranken en hebben links nodig. */}
          <BuyPageLinks pages={buyPages.slice(0, 8)} title="Kopen per soort" compact />
          <div className="rounded-lg border border-border bg-surface p-4 text-text space-y-3 text-sm">
            <h4 className="text-xs uppercase tracking-wider text-accent-muted font-semibold inline-flex items-center gap-1.5">
              <ShieldCheck size={12} /> Onze garanties
            </h4>
            <p className="inline-flex items-start gap-2"><Truck size={14} className="text-accent mt-0.5" /> Voor 15:00 betaald is dezelfde dag verstuurd</p>
            <p className="inline-flex items-start gap-2"><PackageCheck size={14} className="text-accent mt-0.5" /> Neutrale verpakking, geen productnaam op het label</p>
            <p className="inline-flex items-start gap-2"><ShieldCheck size={14} className="text-accent mt-0.5" /> 100% leveringsgarantie, anders opnieuw verstuurd</p>
          </div>
        </aside>

        <div className="min-w-0">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center text-text-muted">
              Geen producten met deze filters.
            </div>
          ) : (
            <>
              <p className="text-sm text-text-muted">{products.length} producten</p>
              <div className="mt-4 grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <Link key={p.id} href={`/product/${p.categories?.slug || cat.slug}/${p.slug}`} className="block">
                    <ProductCard
                      image={p.image_url || "/assets/cat-erectie.webp"}
                      name={p.name}
                      slug={p.slug}
                      priceFrom={p.price_cents / 100}
                      inStock={p.availability !== "OutOfStock"}
                      tag={p.tags?.[0]}
                      category={p.categories?.name}
                      shortDescription={p.subtitle || undefined}
                      usps={p.usps}
                    />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lange SEO-body onder het product-grid (categorie koopgids) */}
      {cat.seo_body_html && (
        <section className="mt-14 border-t border-paper-border pt-12">
          <div
            className="prose max-w-3xl text-text [&>p]:my-4 [&>p]:leading-relaxed [&_a]:text-accent [&_a]:underline [&_a:hover]:text-accent-muted [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-10 [&>h2]:mb-3 [&>h2:first-child]:mt-0 [&>h3]:font-display [&>h3]:text-lg [&>h3]:mt-5 [&>ul]:my-3 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:my-3 [&>ol]:pl-6 [&>ol]:list-decimal"
            dangerouslySetInnerHTML={{ __html: cat.seo_body_html }}
          />
        </section>
      )}

      {/* FAQ-blok + FAQPage JSON-LD voor Google rich results */}
      {cat.faqs && Array.isArray(cat.faqs) && cat.faqs.length > 0 && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: cat.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl text-primary">Veelgestelde vragen</h2>
            <p className="mt-2 text-sm text-text-muted">Over {cat.name.toLowerCase()}.</p>
            <div className="mt-6 space-y-3">
              {cat.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border bg-paper-soft hover:border-accent transition-colors"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-sm font-medium text-text">
                    {f.q}
                    <span className="text-accent text-lg group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-text-muted leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
