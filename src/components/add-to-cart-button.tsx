"use client";
import { Plus, Minus, ShoppingCart, Sparkles, ShieldCheck, Smartphone, Bitcoin } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/queries";
import { track } from "@/lib/analytics";
import type { Product } from "@/lib/supabase";

const BULK_TIERS = [
  { qty: 1, discountPct: 0 },
  { qty: 5, discountPct: 10 },
  { qty: 10, discountPct: 15 },
];

export function AddToCartButton({ product }: { product: Product }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);

  // Productweergave melden. Zonder dit event is er geen noemer voor de
  // mand-ratio: je ziet dan wel hoeveel mensen iets toevoegen, maar niet
  // hoeveel er keken.
  useEffect(() => {
    track("product_view", {
      product_slug: product.slug,
      product_name: String(product.name),
      sku: product.sku,
      price_cents: product.price_cents,
      value_cents: product.price_cents,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  function addToCart() {
    // Gebruik slug als cart-id (stabiel tussen productcard + productdetail).
    // Anders zag cart-context dezelfde stof als 2 verschillende items en werd
    // de bulk-korting niet toegepast.
    cart.add(
      {
        id: product.slug,
        sku: product.sku,
        name: product.name,
        price_cents: product.price_cents,
        image: product.image_url,
      },
      qty,
    );
    track("add_to_cart", {
      product_name: String(product.name),
      product_slug: product.slug,
      sku: product.sku,
      qty,
      value_cents: product.price_cents * qty,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2">
        <div className="inline-flex items-center rounded-md border border-border bg-surface">
          <button
            type="button"
            onClick={dec}
            disabled={qty <= 1}
            aria-label="Verminder aantal"
            className="h-12 w-10 inline-flex items-center justify-center text-text disabled:opacity-40"
          >
            <Minus size={16} />
          </button>
          <span className="h-12 w-12 inline-flex items-center justify-center font-display text-lg tabular">{qty}</span>
          <button
            type="button"
            onClick={inc}
            aria-label="Verhoog aantal"
            className="h-12 w-10 inline-flex items-center justify-center text-text"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 h-12 text-sm font-semibold text-accent-foreground hover:bg-accent-soft active:scale-[0.99] transition-all"
        >
          <ShoppingCart size={16} /> Toevoegen aan mand · {formatEUR(product.price_cents * qty)}
        </button>
      </div>

      <div className="rounded-md border border-accent/30 bg-accent-soft/15 p-3">
        <p className="text-xs font-semibold text-text inline-flex items-center gap-1.5">
          <Sparkles size={14} className="text-accent" /> Bulk-korting - klik om aantal te kiezen
        </p>
        <div className="mt-2 space-y-2">
          {BULK_TIERS.map((t, i) => {
            const unit = Math.round(product.price_cents * (1 - t.discountPct / 100));
            const lineSubtotal = unit * t.qty;
            const baseSubtotal = product.price_cents * t.qty;
            const savings = baseSubtotal - lineSubtotal;
            const next = BULK_TIERS[i + 1];
            const active = qty >= t.qty && (!next || qty < next.qty);
            return (
              <button
                type="button"
                key={t.qty}
                onClick={() => setQty(t.qty)}
                aria-pressed={active}
                className={`w-full text-left rounded-md border bg-background px-3 py-2.5 transition-all hover:border-accent hover:shadow-card ${
                  active ? "border-accent ring-2 ring-accent/30 shadow-card" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-1.5 w-20">
                    <span className="font-display text-lg text-text tabular">{t.qty}</span>
                    <span className="text-[11px] uppercase tracking-wider text-text-subtle">{t.qty === 1 ? "stuk" : "stuks"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text tabular font-medium">{formatEUR(unit)} / st</p>
                    <p className="text-[11px] text-text-muted tabular">totaal {formatEUR(lineSubtotal)}</p>
                  </div>
                  {t.discountPct > 0 ? (
                    <div className="text-right">
                      <span className="inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent tabular">
                        −{t.discountPct}%
                      </span>
                      <p className="mt-0.5 text-[11px] font-semibold text-accent tabular">Bespaar {formatEUR(savings)}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-subtle">basis-prijs</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Veilig betalen blok */}
      <div className="rounded-md border border-border bg-surface p-3">
        <p className="text-xs font-semibold text-text inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-accent" /> Veilig &amp; snel betalen
        </p>
        <p className="mt-1.5 text-[11px] text-text-muted leading-snug">
          Bankoverschrijving via je eigen bank-app (IBAN). Geen kaart, geen tussenpartij - gewoon je gewone bank.
          Bestelling gaat direct na ontvangst betaling de deur uit.
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-text">
            <Smartphone size={11} className="text-accent" /> Bank-app
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-text">
            IBAN
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-text">
            <Bitcoin size={11} className="text-accent" /> Crypto
          </span>
        </div>
      </div>
    </div>
  );
}
