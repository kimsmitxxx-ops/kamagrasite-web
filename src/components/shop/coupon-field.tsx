"use client";
import { useEffect, useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { schoonCode } from "@/lib/coupon";

/**
 * Kortingscode invullen in de mand en op de checkout.
 *
 * Het veld zegt zelf niets over geldigheid: het stuurt de code naar de
 * CartProvider, die hem bij de server controleert. Wat hier staat is dus
 * altijd hetzelfde verhaal als wat de bestelling straks rekent.
 */
export function CouponField({ compact = false }: { compact?: boolean }) {
  const cart = useCart();
  const [tekst, setTekst] = useState("");
  const [open, setOpen] = useState(false);

  // Een code uit een eerder bezoek staat al in de mand; die hoort dan ook in
  // het veld te staan in plaats van onzichtbaar mee te rekenen.
  useEffect(() => {
    if (cart.couponCode) {
      setTekst(cart.couponCode);
      setOpen(true);
    }
  }, [cart.couponCode]);

  const toepassen = () => {
    const schoon = schoonCode(tekst);
    if (schoon) cart.setCouponCode(schoon);
  };

  const verwijderen = () => {
    cart.clearCoupon();
    setTekst("");
  };

  const toegepast = cart.coupon.ok && cart.coupon.discount_cents > 0;
  const fout = !cart.couponBusy && cart.couponCode && !cart.coupon.ok ? cart.coupon.melding : null;

  if (!open && !cart.couponCode) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-muted hover:underline"
      >
        <Tag size={12} /> Kortingscode invullen
      </button>
    );
  }

  return (
    <div className={compact ? "mt-3" : "mt-4"}>
      {toegepast ? (
        <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
          <Check size={14} className="shrink-0 text-accent-muted" />
          <span className="flex-1 text-xs font-medium text-accent-muted">
            Code <span className="font-mono">{cart.coupon.code}</span> toegepast
          </span>
          <button
            type="button"
            onClick={verwijderen}
            title="Kortingscode weghalen"
            className="text-text-subtle hover:text-danger"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={tekst}
            onChange={(e) => setTekst(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Op de checkout staat dit veld binnen het bestelformulier:
                // Enter mag de bestelling niet plaatsen.
                e.preventDefault();
                toepassen();
              }
            }}
            placeholder="Kortingscode"
            aria-label="Kortingscode"
            className="min-w-0 flex-1 rounded-lg border border-paper-border bg-paper px-3 py-2 font-mono text-sm uppercase outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={toepassen}
            disabled={cart.couponBusy || !tekst.trim()}
            className="shrink-0 rounded-lg border border-paper-border px-3 py-2 text-xs font-semibold hover:bg-paper-soft disabled:opacity-40"
          >
            {cart.couponBusy ? "…" : "Toepassen"}
          </button>
        </div>
      )}
      {fout && <p className="mt-1.5 text-xs text-danger">{fout}</p>}
    </div>
  );
}
