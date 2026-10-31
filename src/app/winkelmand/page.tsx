"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/format";
import { calcTotals, unitDiscountPct } from "@/lib/bulk-discount";
import { Trash2, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";

export default function WinkelmandPage() {
  const cart = useCart();
  const totals = calcTotals(cart.items);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl">Winkelmand</h1>
      {cart.items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-paper-border bg-paper-soft p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-text-subtle" />
          <p className="mt-3 text-text-muted">Je mand is leeg</p>
          <Link href="/winkel" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-soft">
            Naar winkel
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((it) => {
              const pct = unitDiscountPct(it.qty);
              const unit = pct > 0 ? Math.round(it.price_cents * (1 - pct / 100)) : it.price_cents;
              const lineTotal = unit * it.qty;
              return (
              <div key={it.id} className="flex gap-4 rounded-xl border border-paper-border bg-paper-soft p-4">
                {it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img loading="lazy" decoding="async" src={it.image} alt={it.name} className="h-20 w-20 rounded object-cover" />}
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  {pct > 0 ? (
                    <p className="text-sm">
                      <span className="text-text-subtle line-through tabular">{formatEUR(it.price_cents)}</span>
                      <span className="ml-2 text-accent font-medium tabular">{formatEUR(unit)}</span>
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                        <Sparkles size={10} /> Bulk-korting −{pct}%
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">{formatEUR(it.price_cents)}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => cart.setQty(it.id, it.qty - 1)} className="rounded border border-paper-border p-1"><Minus className="h-3 w-3" /></button>
                    <span className="min-w-[2ch] text-center">{it.qty}</span>
                    <button onClick={() => cart.setQty(it.id, it.qty + 1)} className="rounded border border-paper-border p-1"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => cart.remove(it.id)} className="ml-auto text-text-subtle hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="font-display text-lg tabular">{formatEUR(lineTotal)}</p>
              </div>
              );
            })}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border border-paper-border bg-paper-soft p-6">
              <h2 className="font-display text-xl">Overzicht</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span>Subtotaal</span>
                <span>{formatEUR(totals.subtotalRaw)}</span>
              </div>
              {totals.savings > 0 && (
                <div className="mt-2 flex justify-between text-sm text-accent-muted">
                  <span>Bulk-korting</span>
                  <span>−{formatEUR(totals.savings)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between text-sm text-text-muted">
                <span>Verzending</span>
                <span>{formatEUR(totals.shipping)}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-paper-border pt-4 text-lg font-display">
                <span>Totaal</span>
                <span>{formatEUR(totals.total)}</span>
              </div>
              <Link href="/checkout" className="mt-5 block rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-accent-foreground hover:bg-accent-soft">
                Naar checkout
              </Link>
              <p className="mt-3 text-center text-[11px] text-text-subtle">
                Verzending €10 per bestelling, ongeacht het aantal items.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
