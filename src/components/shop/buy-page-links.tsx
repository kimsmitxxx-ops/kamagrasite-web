import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BuyPage } from "@/lib/queries";

/**
 * Interne link-cluster tussen de koop-pagina's.
 *
 * Elke koop-pagina linkt naar zijn zusters, zodat ze samen een cluster vormen
 * in plaats van losse eilanden die alleen vanuit de sitemap te vinden zijn. De
 * anchor is de volledige zoekterm uit h1, niet "lees meer" - dat is het hele
 * punt van interne links.
 */
export function BuyPageLinks({
  pages,
  title = "Direct naar",
  intro,
  currentSlug,
  compact = false,
}: {
  pages: BuyPage[];
  title?: string;
  intro?: string;
  currentSlug?: string;
  compact?: boolean;
}) {
  const items = pages.filter((p) => p.slug !== currentSlug);
  if (items.length === 0) return null;

  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-muted">{title}</h4>
        <ul className="space-y-1 text-sm">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/${p.slug}/`} className="text-text-muted hover:text-accent hover:underline">
                {p.h1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mt-14 border-t border-paper-border pt-10">
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      {intro && <p className="mt-2 max-w-3xl text-sm text-text-muted">{intro}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/${p.slug}/`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-paper-soft px-4 py-3 transition-colors hover:border-accent"
          >
            <span className="text-sm font-medium text-text">{p.h1}</span>
            <ArrowRight size={15} className="shrink-0 text-text-subtle transition-colors group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BuyPageLinks;
