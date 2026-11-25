import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { formatEUR } from "@/lib/format";
import type { Product } from "@/lib/supabase";
import { Afbeelding } from "@/components/afbeelding";

/**
 * De alternatieven bij een artikel dat niet direct verzonden kan worden.
 *
 * Compacte regels en geen productkaarten: dit staat in de smalle kolom naast
 * de foto, direct onder de melding dat het artikel uitverkocht is of nog
 * onderweg. Drie regels die je in een oogopslag leest zijn daar bruikbaarder
 * dan drie kaarten die de koopknop van de pagina duwen.
 */
export function AlternatievenBlok({
  producten,
  titel,
  toelichting,
}: {
  producten: (Product & { rating_value?: number | null })[];
  titel: string;
  toelichting: string;
}) {
  if (producten.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-border bg-paper-soft p-3.5">
      <p className="text-sm font-semibold text-text">{titel}</p>
      <p className="mt-0.5 text-xs text-text-muted">{toelichting}</p>
      <ul className="mt-3 space-y-2">
        {producten.map((a) => (
          <li key={a.id}>
            <Link
              href={`/product/${a.slug}/`}
              className="group flex items-center gap-3 rounded-md border border-border bg-background p-2 transition-colors hover:border-accent"
            >
              <Afbeelding
                src={a.image_url || "/assets/cat-erectie.webp"}
                alt={a.name}
                width={48}
                height={48}
                sizes="48px"
                maxBreedte={48}
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text group-hover:text-accent">
                  {a.name}
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <Check size={11} strokeWidth={3} className="text-accent-muted" /> direct leverbaar
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold text-primary tabular">{formatEUR(a.price_cents)}</span>
                <ArrowRight size={13} className="ml-auto mt-0.5 text-text-subtle group-hover:text-accent" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlternatievenBlok;
