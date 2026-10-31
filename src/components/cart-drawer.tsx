"use client";
import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/format";
import Link from "next/link";

export function CartDrawer() {
  const cart = useCart();
  if (!cart.isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={cart.close}>
      <div className="flex h-full w-full max-w-md flex-col bg-paper-soft shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-paper-border p-4">
          <h2 className="font-display text-lg">Winkelmand ({cart.count})</h2>
          <button onClick={cart.close} className="rounded p-1 hover:bg-paper"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">Mand is leeg</p>
          ) : cart.items.map((it) => (
            <div key={it.id} className="flex gap-3 border-b border-paper-border py-3">
              {it.image && /* eslint-disable-next-line @next/next/no-img-element */ <img loading="lazy" decoding="async" src={it.image} alt={it.name} className="h-16 w-16 rounded object-cover" />}
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{it.name}</p>
                <p className="text-xs text-text-muted">{formatEUR(it.price_cents)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => cart.setQty(it.id, it.qty - 1)} className="rounded border border-paper-border p-1 hover:bg-paper"><Minus className="h-3 w-3" /></button>
                  <span className="min-w-[2ch] text-center text-xs">{it.qty}</span>
                  <button onClick={() => cart.setQty(it.id, it.qty + 1)} className="rounded border border-paper-border p-1 hover:bg-paper"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <button onClick={() => cart.remove(it.id)} className="text-text-subtle hover:text-danger"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        {cart.items.length > 0 && (
          <div className="border-t border-paper-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm">Totaal</span>
              <span className="font-display text-xl">{formatEUR(cart.total)}</span>
            </div>
            <Link href="/checkout" onClick={cart.close} className="block rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground hover:bg-accent-soft">
              Afrekenen
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
