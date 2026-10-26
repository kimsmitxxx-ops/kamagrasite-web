import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, formatEUR, listProducts, listProductReviews } from "@/lib/queries";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { ProductSections } from "@/components/shop/product-sections";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { ProductGallery } from "@/components/shop/product-gallery";
import { PaymentRow } from "@/components/payment-row";
import { RestockNotifyForm } from "@/components/shop/restock-notify-form";
import { ShieldCheck, Truck, Factory, ArrowLeft, MapPin } from "lucide-react";
import { vormLabel } from "@/components/shop/data";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { categorie: string; slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug) as any;
  if (!p) return { title: "Niet gevonden" };
  const noindex = p.noindex === true;
  // canonical_url heeft voorrang - UP producten linken naar UT-equivalent zodat
  // Google de duplicate-content niet straft. Anders default self-canonical.
  const canonical = p.canonical_url || `/product/${params.slug}`;
  return {
    title: p.meta_title || `${p.name} kopen voor ${formatEUR(p.price_cents)}`,
    description: p.meta_description || p.subtitle || p.description || `${p.name} kopen bij Kamagra Site. Zonder recept, discreet verpakt en snel verstuurd.`,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      // Expliciet index/follow: een `undefined` hier overschrijft de
      // `robots`-metadata uit de root-layout, waardoor productpagina's
      // helemaal zonder robots-meta de deur uit gingen.
      : { index: true, follow: true },
    openGraph: {
      title: p.name,
      description: p.subtitle || undefined,
      images: p.image_url ? [{ url: p.image_url }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug) as any;
  if (!p) notFound();

  // De categorie komt uit het product zelf, niet uit de URL. Het pad is plat
  // (/product/<slug>) omdat de 40 bestaande product-URLs van kamagrasite.nl er
  // zo uitzien; een categoriesegment zou ze allemaal laten doodlopen.
  const catSlug = p.categories?.slug || "";

  const [related, reviews] = await Promise.all([
    listProducts({ categorySlug: catSlug, limit: 4 }),
    listProductReviews(p.id, 20),
  ]);
  const media = p.product_media?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const gallery = media.length > 0 ? media : (p.image_url ? [{ url: p.image_url, alt: p.name }] : []);

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
    : null;

  const productJsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.subtitle || p.description,
    image: gallery.map((m: any) => m.url),
    brand: p.tags?.[0] ? { "@type": "Brand", name: p.tags[0] } : undefined,
    offers: {
      "@type": "Offer",
      url: `/product/${p.slug}`,
      priceCurrency: "EUR",
      price: (p.price_cents / 100).toFixed(2),
      availability: p.availability === "OutOfStock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  // AggregateRating alleen als er >=3 echte reviews zijn (Google-minimum)
  if (avgRating != null && reviewsCount >= 3) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(2),
      reviewCount: reviewsCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const faqJsonLd = p.faqs && Array.isArray(p.faqs) && p.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f: any) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <Link href={catSlug ? `/winkel/${catSlug}` : "/winkel"} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
        <ArrowLeft className="h-3 w-3" /> Terug naar {p.categories?.name || "winkel"}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1fr_1fr]">
        <ProductGallery gallery={gallery} productName={p.name} />

        <div>
          {p.categories?.name && <p className="text-xs uppercase tracking-wider text-accent-muted">{p.categories.name}</p>}
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{p.name}</h1>
          {p.subtitle && <p className="mt-3 text-text-muted">{p.subtitle}</p>}

          {p.usps && p.usps.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.usps.slice(0, 3).map((u: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-text">
                  <span className="text-accent font-bold mt-0.5">✓</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-end gap-4">
            <span className="font-display text-4xl">{formatEUR(p.price_cents)}</span>
            {p.compare_at_cents && p.compare_at_cents > p.price_cents && (
              <span className="text-lg text-text-subtle line-through">{formatEUR(p.compare_at_cents)}</span>
            )}
          </div>

          <div className="mt-6">
            {p.availability === "OutOfStock" ? (
              <>
                <div className="rounded-lg border-2 border-danger/40 bg-danger-soft/30 p-5 text-center">
                  <p className="text-danger font-display text-xl">Uitverkocht</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Dit product is op dit moment niet leverbaar. Zet je e-mail hieronder achter - je hoort het direct zodra de nieuwe batch binnen is.
                  </p>
                </div>
                <RestockNotifyForm productId={p.id} productName={p.name} />
              </>
            ) : (
              <AddToCartButton product={p} />
            )}
          </div>

          {/* USPs prominent - onder add-to-cart */}
          <div className="mt-6 grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-paper-soft p-3">
              <Factory className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-text">Direct van de fabrikant</p>
                <p className="text-xs text-text-muted">Verzegelde verpakking met batchcode en houdbaarheidsdatum</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-paper-soft p-3">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-text">Discreet verzonden</p>
                <p className="text-xs text-text-muted">Neutrale verpakking - geen logo of productnaam op het label</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-paper-soft p-3">
              <Truck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-text">Snel verzonden</p>
                <p className="text-xs text-text-muted">100% leveringsgarantie - pakket niet aangekomen? Wij verzenden opnieuw, zonder gedoe.</p>
              </div>
            </div>
          </div>

          {p.package_type && <p className="mt-4 text-xs text-text-muted"><strong>Verpakking:</strong> {vormLabel(p.package_type)}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin size={12} className="text-accent" />
            <strong>Verzonden vanuit:</strong> ons magazijn in Nederland, met PostNL
          </p>

          {/* Betaalopties - zelfde set als checkout zodat klant weet wat hij straks gaat zien */}
          <div className="mt-6 rounded-lg border border-border bg-paper-soft p-3">
            <p className="text-[10px] uppercase tracking-wider text-accent-muted font-semibold mb-2 inline-flex items-center gap-1.5">
              <ShieldCheck size={11} /> Veilig betalen met
            </p>
            <PaymentRow variant="full" />
          </div>
        </div>
      </div>

      {/* Sequentiele secties (SSR) onder hoofd-grid: Beschrijving / Specs / FAQ / Reviews */}
      <ProductSections
        productId={p.id}
        description={p.long_description || p.description || null}
        specifications={p.specifications}
        faqs={p.faqs}
        reviews={reviews}
        reviewsCount={reviewsCount}
        avgRating={avgRating}
      />

      {/* Medische disclaimer onder de product-content (E-E-A-T / YMYL) */}
      <div className="max-w-3xl">
        <MedicalDisclaimer />
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">Gerelateerde producten</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.filter((r) => r.id !== p.id).slice(0, 4).map((r) => (
              <Link key={r.id} href={`/product/${r.slug}`} className="block">
                <ProductCard
                  image={r.image_url || "/assets/cat-erectie.webp"}
                  name={r.name}
                  slug={r.slug}
                  priceFrom={r.price_cents / 100}
                  inStock={r.availability !== "OutOfStock"}
                  tag={r.tags?.[0]}
                  category={r.categories?.name}
                  shortDescription={r.subtitle || undefined}
                  usps={r.usps}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
