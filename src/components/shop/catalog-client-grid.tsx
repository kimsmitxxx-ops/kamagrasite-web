"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { isPreorder, preorder } from "@/lib/preorder";

/**
 * Filteren en het grid, in de browser.
 *
 * Waarom hier en niet op de server: de categoriepagina heeft een lege
 * `generateStaticParams` zodat elke categorie op Vercel een ISR-render krijgt
 * in plaats van bij elke aanvraag opnieuw te renderen. Zodra de server
 * `searchParams` leest is de pagina per definitie dynamisch, en die twee
 * dingen samen geven in Next 15 een harde fout: DYNAMIC_SERVER_USAGE, een 500
 * op elke categoriepagina. Onder Next 14 werd dat nog getolereerd, dus dit
 * kwam pas boven na de upgrade naar 15.
 *
 * De filters schrijven hun keuze al in de URL (router.replace in
 * CatalogFilters); hier lezen we die met useSearchParams. Dezelfde URL's
 * blijven dus werken, inclusief een gedeelde link naar een gefilterde lijst,
 * maar de server hoeft er niet meer aan te komen.
 */

export interface GridProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  image_url?: string | null;
  availability?: string | null;
  verwacht_op?: string | null;
  tags?: string[] | null;
  subtitle?: string | null;
  usps?: string[] | null;
  package_type?: string | null;
  stof_slugs?: string[] | null;
  categories?: { name?: string | null } | null;
}

export function CatalogClientGrid({ products }: { products: GridProduct[] }) {
  const sp = useSearchParams();
  const stockOnly = sp.get("stock") === "1";
  const stof = (sp.get("stof") || "").toLowerCase();
  const vorm = (sp.get("vorm") || "").toLowerCase();
  const q = (sp.get("q") || "").trim().toLowerCase();

  const zichtbaar = useMemo(
    () =>
      products.filter((p) => {
        // "Alleen op voorraad" sluit ook een pre-order uit: die ligt niet op de
        // plank, hoe goed de levertijd er ook bij staat.
        if (stockOnly && (p.availability === "OutOfStock" || isPreorder(p as never))) return false;
        if (stof && !(p.stof_slugs || []).includes(stof)) return false;
        if (vorm && (p.package_type || "").toLowerCase() !== vorm) return false;
        if (q) {
          const hooi = `${p.name} ${p.slug} ${(p.tags || []).join(" ")} ${(p.stof_slugs || []).join(" ")} ${p.subtitle || ""}`.toLowerCase();
          if (!hooi.includes(q)) return false;
        }
        return true;
      }),
    [products, stockOnly, stof, vorm, q]
  );

  return (
    <>
      <div className="min-w-0">
        {zichtbaar.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center text-text-muted">
            Geen producten met deze filters.
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted">{zichtbaar.length} producten</p>
            <div className="mt-4 grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {zichtbaar.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}/`} className="block">
                  <ProductCard
                    image={p.image_url || "/assets/cat-erectie.webp"}
                    name={p.name}
                    slug={p.slug}
                    priceFrom={p.price_cents / 100}
                    inStock={p.availability !== "OutOfStock"}
                    preorderLabel={preorder(p as never)?.kaartLabel}
                    category={p.categories?.name ?? undefined}
                    shortDescription={p.subtitle || undefined}
                    usps={p.usps ?? undefined}
                  />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CatalogClientGrid;
