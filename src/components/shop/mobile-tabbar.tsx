"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Store, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-store";
import { MobileSearchSheet } from "./mobile-search-sheet";

export function MobileTabBar() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (p: string) => pathname === p || (p !== "/" && pathname.startsWith(p));

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 inline-flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors",
      active ? "text-accent" : "text-primary-foreground/70 hover:text-primary-foreground",
    );

  return (
    <>
      <nav
        aria-label="Hoofdnavigatie"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-primary/95 backdrop-blur border-t border-primary-soft text-primary-foreground"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch">
          <Link href="/" className={tabClass(pathname === "/")}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link href="/winkel/" className={tabClass(isActive("/winkel"))}>
            <Store size={20} />
            <span>Winkel</span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={tabClass(false)}
          >
            <Search size={20} />
            <span>Zoeken</span>
          </button>
          <button
            type="button"
            onClick={openCart}
            className={cn(tabClass(false), "relative")}
            aria-label="Winkelmand openen"
          >
            <span className="relative">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular">
                  {count}
                </span>
              )}
            </span>
            <span>Wagen</span>
          </button>
          <Link href="/account/" className={tabClass(isActive("/account"))}>
            <User size={20} />
            <span>Account</span>
          </Link>
        </div>
      </nav>
      <MobileSearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default MobileTabBar;
