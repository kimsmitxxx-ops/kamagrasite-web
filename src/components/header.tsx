"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export function Header({ categories }: { categories: { slug: string; name: string }[] }) {
  const cart = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-primary-muted bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-4 py-3">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            kamagra<span className="text-accent">site</span>
          </Link>
          <form
            onSubmit={(e) => { e.preventDefault(); router.push(`/winkel?q=${encodeURIComponent(q)}`); }}
            className="hidden flex-1 max-w-md md:block"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/40" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Zoek kamagra, cenforce, vidalista…"
                className="w-full rounded-full border border-primary-muted bg-primary-soft px-4 py-2 pl-9 text-sm text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:border-accent"
              />
            </div>
          </form>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <Link href="/winkel" className="rounded-full px-3 py-2 text-sm hover:bg-primary-soft">Winkel</Link>
            <Link href="/kennisbank" className="rounded-full px-3 py-2 text-sm hover:bg-primary-soft">Kennisbank</Link>
            <Link href="/lab" className="rounded-full px-3 py-2 text-sm hover:bg-primary-soft">Kwaliteit</Link>
            <Link href="/account" className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-primary-muted px-3 py-2 text-sm hover:bg-primary-soft">
              <User className="h-4 w-4" /> Account
            </Link>
            <button
              onClick={cart.open}
              className="relative ml-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-soft"
            >
              <ShoppingCart className="h-4 w-4" /> Mand
              {cart.count > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{cart.count}</span>}
            </button>
          </nav>
          <button className="ml-auto rounded-full bg-primary-soft p-2 md:hidden" onClick={() => setOpen(!open)}>
            <Menu className="h-4 w-4" />
          </button>
        </div>
        {/* Categorie strip */}
        <div className="hidden gap-3 overflow-x-auto border-t border-primary-muted/40 pb-2 pt-2 md:flex">
          {categories.map((c) => (
            <Link key={c.slug} href={`/winkel/${c.slug}`} className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-xs hover:bg-primary-muted">
              {c.name}
            </Link>
          ))}
        </div>
        {open && (
          <div className="space-y-1 border-t border-primary-muted/40 pb-3 pt-3 md:hidden">
            <Link href="/winkel" className="block rounded px-3 py-2 text-sm">Winkel</Link>
            <Link href="/kennisbank" className="block rounded px-3 py-2 text-sm">Kennisbank</Link>
            <Link href="/account" className="block rounded px-3 py-2 text-sm">Account</Link>
            <div className="border-t border-primary-muted/40 pt-2">
              {categories.map((c) => (
                <Link key={c.slug} href={`/winkel/${c.slug}`} className="block rounded px-3 py-1.5 text-sm">{c.name}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
