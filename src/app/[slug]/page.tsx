import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck, Truck, PackageCheck, Sparkles, ArrowDown } from "lucide-react";
import {
  getBuyPage,
  listBuyPages,
  resolveBuyPageProducts,
  listBlogPosts,
  formatEUR,
} from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { PriceCompareTable } from "@/components/shop/price-compare-table";
import { BuyPageLinks } from "@/components/shop/buy-page-links";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { Breadcrumb } from "@/components/breadcrumb";
import { BULK_TIERS } from "@/lib/bulk-discount";
import { MERCHANT_RETURN_POLICY } from "@/lib/return-policy";

/**
 * Transactionele koop-pagina op root-niveau: /kamagra-kopen.
 *
 * Rij uit buy_pages (migratie 052) bepaalt h1, copy, FAQ en productselectie.
 * Statische routes (/winkel, /contact, /lab, ...) winnen in de App Router altijd
 * van dit dynamische segment, dus dit vangt alleen slugs die hier echt bij
 * horen; al het andere valt door naar notFound().
 *
 * Verhouding met /winkel/<categorie>: die blijft de browse- en filterweergave.
 * Deze pagina is de landingspagina voor de koopterm en heeft eigen H1, title,
 * koopgids, prijstabel en FAQ zodat de twee niet om dezelfde query vechten.
 */

const BASE = "https://kamagrasite.nl";

// Zelfde live-data-regel als de rest van de site: de Supabase-client haalt met
// cache: "no-store" op, dus een statisch gerenderde variant botst daarmee.
// Met generateStaticParams erbij probeerde Next deze route alsnog te
// prerenderen en gaf hij "Page changed from static to dynamic at runtime"
// (HTTP 500) op elke koop-pagina. Vindbaarheid loopt via de sitemap en de
// interne links, niet via prerendering.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getBuyPage(params.slug);
  if (!page) return { title: "Niet gevonden" };
  return {
    title: page.meta_title || page.h1,
    description:
      page.meta_description ||
      page.intro ||
      `${page.h1} bij Kamagra Site. Prijs per stuk vergelijken, discreet verpakt en snel verstuurd vanuit Nederland.`,
    alternates: { canonical: page.canonical_url || `/${page.slug}` },
    robots: page.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title: page.h1, description: page.intro || undefined, type: "website" },
  };
}

export default async function BuyPage({ params }: { params: { slug: string } }) {
  const page = await getBuyPage(params.slug);
  if (!page) notFound();

  const [products, allPages, blogs] = await Promise.all([
    resolveBuyPageProducts(page),
    listBuyPages(),
    listBlogPosts(60),
  ]);

  const inStock = products.filter((p) => p.availability !== "OutOfStock");
  const cheapest = inStock.length > 0 ? Math.min(...inStock.map((p) => p.price_cents)) : null;

  const relatedSlugs = page.related_slugs ?? [];
  const related = relatedSlugs.length > 0
    ? (relatedSlugs.map((s) => allPages.find((p) => p.slug === s)).filter(Boolean) as typeof allPages)
    : allPages.filter((p) => p.slug !== page.slug).slice(0, 6);

  // Kennisbank-artikelen die bij deze koopterm horen. Matcht op de losse
  // woorden uit nav_label/h1 zodat /kamagra-oral-jelly-kopen ook de algemene
  // kamagra-artikelen oppikt. Puur interne links - geen nieuwe content.
  const needles = (page.nav_label || page.h1)
    .toLowerCase()
    .replace(/\bkopen\b|\bbestellen\b/g, "")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3);
  const relatedBlogs = blogs
    .filter((b) => {
      const hay = `${b.title} ${b.excerpt || ""}`.toLowerCase();
      return needles.some((n) => hay.includes(n));
    })
    .slice(0, 4);


  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.h1,
    url: `${BASE}/${page.slug}`,
    description: page.meta_description || page.intro || undefined,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          sku: p.sku,
          image: p.image_url || undefined,
          url: `${BASE}/product/${p.slug}`,
          offers: {
            "@type": "Offer",
            hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
            price: (p.price_cents / 100).toFixed(2),
            priceCurrency: "EUR",
            availability:
              p.availability === "OutOfStock"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
          },
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Winkel", item: `${BASE}/winkel` },
      { "@type": "ListItem", position: 3, name: page.h1, item: `${BASE}/${page.slug}` },
    ],
  };

  const faqs = Array.isArray(page.faqs) ? page.faqs : [];
  const faqJsonLd = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Winkel", href: "/winkel" },
          { label: page.nav_label || page.h1 },
        ]}
      />

      {/* H1 is exact de zoekterm. Prijs-vanaf en voorraad staan direct eronder
          zodat de bezoeker boven de vouw ziet wat het kost en of het er is. */}
      <h1 className="font-display text-3xl md:text-4xl">{page.h1}</h1>
      {page.intro && <p className="mt-3 max-w-3xl text-text-muted leading-relaxed">{page.intro}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {cheapest != null && (
          <p className="text-text">
            Vanaf <span className="font-display text-2xl text-accent">{formatEUR(cheapest)}</span>
          </p>
        )}
        <p className="text-text-muted">
          {inStock.length} van {products.length} direct leverbaar
        </p>
        <a href="#aanbod" className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-muted">
          Naar het aanbod <ArrowDown size={14} />
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-paper-soft p-3 text-sm">
          <Truck size={16} className="mt-0.5 shrink-0 text-accent" />
          <span className="text-text-muted">Voor 15:00 betaald is dezelfde dag verstuurd</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-paper-soft p-3 text-sm">
          <PackageCheck size={16} className="mt-0.5 shrink-0 text-accent" />
          <span className="text-text-muted">Neutrale verpakking, geen productnaam op het label</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-paper-soft p-3 text-sm">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
          <span className="text-text-muted">100% leveringsgarantie, anders opnieuw verstuurd</span>
        </div>
      </div>

      {page.show_bulk_block && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-soft/15 p-4">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
          <div className="text-sm">
            <p className="font-semibold text-text">Bulk-korting staat automatisch aan</p>
            <p className="text-text-muted">
              {BULK_TIERS.slice()
                .sort((a, b) => a.qty - b.qty)
                .map((t) => `vanaf ${t.qty} items ${t.pct}% korting`)
                .join(" en ")}
              , verrekend in de winkelmand. Je hoeft geen code in te vullen.
            </p>
          </div>
        </div>
      )}

      <section id="aanbod" className="mt-10 scroll-mt-28">
        <h2 className="font-display text-2xl text-primary">Het aanbod</h2>
        {products.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center text-text-muted">
            Er staan nu geen producten bij deze selectie.{" "}
            <Link href="/winkel" className="text-accent underline">
              Bekijk de hele winkel
            </Link>
            .
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="block">
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
        )}
      </section>

      {page.show_price_table && products.length > 1 && <PriceCompareTable products={products} />}

      {page.seo_body_html && (
        <section className="mt-14 border-t border-paper-border pt-12">
          <div
            className="prose max-w-3xl text-text [&>p]:my-4 [&>p]:leading-relaxed [&_a]:text-accent [&_a]:underline [&_a:hover]:text-accent-muted [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-10 [&>h2]:mb-3 [&>h2:first-child]:mt-0 [&>h3]:font-display [&>h3]:text-lg [&>h3]:mt-5 [&>ul]:my-3 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:my-3 [&>ol]:pl-6 [&>ol]:list-decimal [&_table]:w-full [&_table]:my-5 [&_th]:text-left [&_th]:py-2 [&_td]:py-2 [&_td]:border-t [&_td]:border-border"
            dangerouslySetInnerHTML={{ __html: page.seo_body_html }}
          />
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl text-primary">Veelgestelde vragen</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-lg border border-border bg-paper-soft transition-colors hover:border-accent"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-text">
                  {f.q}
                  <span className="text-lg text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-text-muted">{f.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedBlogs.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl text-primary">Meer lezen in de kennisbank</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {relatedBlogs.map((b) => (
              <li key={b.id}>
                <Link href={`/kennisbank/${b.slug}`} className="text-accent underline hover:text-accent-muted">
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="max-w-3xl">
        <MedicalDisclaimer />
      </div>

      <BuyPageLinks
        pages={related}
        currentSlug={page.slug}
        title="Andere koop-pagina's"
        intro="Zoek je een andere variant of werkzame stof? Die staan hier."
      />
    </div>
  );
}
