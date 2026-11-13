"use client";
import { cn } from "@/lib/utils";
import { PriceTag } from "./price-tag";
import { Stars } from "./stars";
import { Badge } from "./badge";
import { Tag } from "./tag";
import { ShoppingCart, Plus, Check } from "lucide-react";
import type { MouseEvent } from "react";
import { useCart } from "@/lib/cart-context";

export type ProductCardSize = "sm" | "md" | "lg";

export interface ProductCardProps {
  image: string;
  name: string;
  slug: string;
  priceFrom: number;
  ratingValue?: number;
  ratingCount?: number;
  inStock?: boolean;
  /** Pre-order: het korte label ("Pre-order - over 5 dagen"). */
  preorderLabel?: string | null;
  tag?: string;
  category?: string;
  shortDescription?: string;
  usps?: string[] | null;
  size?: ProductCardSize;
  className?: string;
  onAddToCart?: (slug: string) => void;
}

function toFeatures(text?: string, explicitUsps?: string[] | null): string[] {
  if (explicitUsps && explicitUsps.length > 0) {
    return explicitUsps.slice(0, 3);
  }
  if (!text) return [];
  return text
    .split(/(?:\.\s+|,\s+)/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 4)
    .slice(0, 3);
}

export function ProductCard({
  image,
  name,
  slug,
  priceFrom,
  ratingValue,
  ratingCount,
  inStock = true,
  preorderLabel,
  tag,
  category,
  shortDescription,
  usps,
  size = "md",
  className,
  onAddToCart,
}: ProductCardProps) {
  const isSm = size === "sm";
  const features = toFeatures(shortDescription, usps);
  const cart = useCart();

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    // Hard guard: backend availability check als laatste verdediging tegen
    // bestelbare uitverkocht-status (UI moet 'm al disabled tonen).
    if (!inStock) return;
    if (onAddToCart) {
      onAddToCart(slug);
      return;
    }
    cart.add({
      id: slug,
      sku: slug,
      name,
      price_cents: Math.round(priceFrom * 100),
      image,
      // Tag-based shipping: als de product-card tag === "UT" -> ut-shipping
    });
  }

  return (
    <article
      data-slug={slug}
      className={cn(
        "group h-full bg-surface rounded-lg border border-border overflow-hidden transition-shadow flex flex-col",
        size !== "sm" && "shadow-card hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-square bg-muted overflow-hidden shrink-0">
        <img loading="lazy" decoding="async" src={image} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]" />
        {category && (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-sm bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground backdrop-blur-sm">
            {category}
          </span>
        )}
        {tag && (
          <div className="absolute top-3 right-3">
            <Tag variant="filled">{tag}</Tag>
          </div>
        )}
        {/* Pre-order: wel te bestellen, alleen later leverbaar. Geen
            uitverkocht-streep, want hier hoeft niemand af te haken. */}
        {preorderLabel && (
          <div className="absolute inset-x-0 bottom-0 bg-warning/90 px-2 py-1 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white">
              {preorderLabel}
            </span>
          </div>
        )}
        {!inStock && !preorderLabel && (
          <>
            {/* Diagonale streep + grote pill - onmiskenbaar uitverkocht */}
            <div aria-hidden className="absolute inset-0 bg-background/55 backdrop-blur-[1px]" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
              <span className="inline-block rotate-[-8deg] rounded-md bg-danger px-4 py-1.5 text-sm font-display font-semibold uppercase tracking-wider text-white shadow-lift ring-2 ring-white/80">
                Uitverkocht
              </span>
            </div>
          </>
        )}
      </div>
      <div className={cn("p-4 flex-1 flex flex-col gap-2", isSm && "p-3 gap-1.5")}>
        <h3 className={cn(
          "font-display font-medium text-text leading-tight line-clamp-2 min-h-[2.6em]",
          isSm ? "text-base" : "text-base md:text-lg",
        )}>
          {name}
        </h3>
        {!isSm && (
          <div className="min-h-[1.25rem]">
            {ratingValue != null && <Stars value={ratingValue} size="sm" count={ratingCount} />}
          </div>
        )}
        {!isSm && (
          <ul className="mt-1 space-y-1 min-h-[4.5rem]">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-text leading-snug line-clamp-1">
                <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-accent-muted" />
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <PriceTag variant={isSm ? "single" : "from"} price={priceFrom} priceFrom={priceFrom} className="text-base md:text-lg" />
          {!isSm && (
            <button
              type="button"
              aria-label={
                !inStock
                  ? "Op de wachtlijst"
                  : preorderLabel
                    ? `Bestel ${name} vooruit`
                    : `Voeg ${name} toe aan winkelmand`
              }
              disabled={!inStock}
              onClick={handleAdd}
              className="inline-flex h-9 md:h-11 w-9 md:w-auto items-center justify-center md:gap-1.5 rounded-md bg-accent md:px-3 text-accent-foreground shadow-card transition-all hover:bg-accent-muted hover:shadow-lift active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus size={16} strokeWidth={3} className="hidden md:inline" />
              <ShoppingCart size={16} strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
