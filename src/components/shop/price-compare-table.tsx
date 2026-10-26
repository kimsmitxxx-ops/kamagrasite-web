import Link from "next/link";
import { formatEUR } from "@/lib/queries";
import { parsePackUnits, parsePackUnitLabel, pricePerUnitCents } from "@/lib/pack-size";
import { unitDiscountPct } from "@/lib/bulk-discount";
import type { Product } from "@/lib/supabase";
import { TrendingDown } from "lucide-react";

/**
 * Prijsvergelijking per stuk over alle producten van een koop-pagina.
 *
 * Dit is het blok dat de koop-pagina onderscheidt van /winkel/<categorie>: geen
 * grid met plaatjes maar een harde tabel met prijs per tablet of zakje, van
 * goedkoop naar duur. Dat is precies de vergelijking die een bezoeker met
 * koopintentie zelf zit te maken, en geen concurrent in deze niche biedt hem.
 *
 * De kortingskolommen komen uit bulk-discount.ts - dezelfde module die de
 * winkelmand en de orders-API gebruiken. Zou die matrix veranderen, dan
 * verandert deze tabel mee en blijft de getoonde prijs dus kloppen met wat er
 * straks daadwerkelijk wordt afgerekend.
 */
export function PriceCompareTable({ products }: { products: Product[] }) {
  const rows = products.map((p) => {
    const units = parsePackUnits(p.specifications, p.name);
    return {
      product: p,
      units,
      unitLabel: parsePackUnitLabel(p.specifications, p.name),
      perUnit: pricePerUnitCents(p.price_cents, units),
    };
  });

  // Goedkoopste per stuk eerst. Rijen zonder bekende inhoud kunnen niet
  // vergeleken worden en gaan naar onderen.
  const sorted = [...rows].sort((a, b) => {
    if (a.perUnit == null && b.perUnit == null) return a.product.price_cents - b.product.price_cents;
    if (a.perUnit == null) return 1;
    if (b.perUnit == null) return -1;
    return a.perUnit - b.perUnit;
  });

  const comparable = sorted.filter((r) => r.perUnit != null);
  if (comparable.length < 2) return null;

  const cheapest = comparable[0];
  const tier5 = unitDiscountPct(5);
  const tier10 = unitDiscountPct(10);

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-primary">Prijs per stuk vergelijken</h2>
      <p className="mt-2 max-w-3xl text-sm text-text-muted leading-relaxed">
        De pakketprijs zegt weinig, want de inhoud verschilt per product. Hieronder staat wat je
        per tablet of zakje betaalt, van goedkoop naar duur. De laatste twee kolommen zijn de
        prijs per stuk zodra de bulk-korting ingaat.
      </p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-paper-soft text-left">
              <th scope="col" className="px-3 py-2.5 font-semibold text-text">Product</th>
              <th scope="col" className="px-3 py-2.5 font-semibold text-text">Inhoud</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold text-text">Pakketprijs</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold text-text">Per stuk</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold text-text-muted">Vanaf 5 ({tier5}%)</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold text-text-muted">Vanaf 10 ({tier10}%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((r) => {
              const p = r.product;
              const href = `/product/${p.slug}`;
              const isCheapest = r.perUnit != null && r === cheapest;
              const oos = p.availability === "OutOfStock";
              return (
                <tr key={p.id} className={isCheapest ? "bg-accent-soft/15" : undefined}>
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <Link href={href} className="font-medium text-text hover:text-accent hover:underline">
                      {p.name}
                    </Link>
                    {isCheapest && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                        <TrendingDown size={10} /> Laagste per stuk
                      </span>
                    )}
                    {oos && <span className="ml-2 text-xs text-danger">uitverkocht</span>}
                  </th>
                  <td className="whitespace-nowrap px-3 py-2.5 text-text-muted">
                    {r.units ? `${r.units} ${r.unitLabel || "stuks"}` : "niet opgegeven"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-text">{formatEUR(p.price_cents)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-text">
                    {r.perUnit != null ? formatEUR(r.perUnit) : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-text-muted">
                    {r.perUnit != null ? formatEUR(r.perUnit * (1 - tier5 / 100)) : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-text-muted">
                    {r.perUnit != null ? formatEUR(r.perUnit * (1 - tier10 / 100)) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-text-muted">
        Prijzen per stuk zijn berekend uit de pakketprijs gedeeld door de opgegeven inhoud. De
        korting geldt per aantal pakketten in je mand en wordt daar automatisch verrekend.
      </p>
    </section>
  );
}

export default PriceCompareTable;
