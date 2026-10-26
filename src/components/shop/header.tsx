"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  Truck,
  ShieldCheck,
  ChevronDown,
  Pill,
  Store,
  BookOpen,
} from "lucide-react";
import { mainCategories } from "./data";
import { useCart } from "./cart-store";
import { MobileMenuDrawer } from "./mobile-menu-drawer";

type Lang = "NL" | "EN";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "NL", label: "Nederlands", flag: "🇳🇱" },
  { code: "EN", label: "English", flag: "🇬🇧" },
];

const TOPBAR_ITEMS = [
  { Icon: ShieldCheck, text: "100% leveringsgarantie" },
  { Icon: Truck, text: "Voor 15:00 betaald, dezelfde dag verstuurd" },
  { Icon: Pill, text: "Sildenafil, tadalafil, vardenafil & dapoxetine" },
];

export interface HeaderProps {
  variant?: "default" | "minimal";
}

export function Header(_props: HeaderProps = {}) {
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("NL");
  const [langOpen, setLangOpen] = useState(false);
  const [topIdx, setTopIdx] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);
  const { count, openCart } = useCart();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTopIdx((i) => (i + 1) % TOPBAR_ITEMS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const currentLang = LANGS.find((l) => l.code === lang)!;

  const LangDropdown = (
    <div ref={langRef} className="relative">
      <button
        onClick={() => setLangOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-sm border border-primary-foreground/15 px-2 py-0.5 text-xs font-semibold text-primary-foreground hover:bg-primary-soft"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span>{currentLang.code}</span>
        <ChevronDown size={11} />
      </button>
      {langOpen && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 w-44 rounded-md border border-border bg-surface shadow-lift py-1 z-50"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setLang(l.code);
                  setLangOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-muted ${
                  lang === l.code ? "bg-muted" : ""
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="font-medium">{l.code}</span>
                <span className="text-text-muted">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const current = TOPBAR_ITEMS[topIdx];

  return (
    <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur border-b border-primary-soft text-primary-foreground">
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground/90 text-xs">
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center relative">
          {/* Desktop: all three items evenly spaced, centered */}
          <div className="hidden md:grid w-full grid-cols-3 items-center justify-items-center gap-4">
            {TOPBAR_ITEMS.map(({ Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2">
                <Icon size={13} className="text-accent-soft" />
                <span>{text}</span>
              </span>
            ))}
          </div>
          {/* Mobile: one rotating item, slider with 2s delay */}
          <div className="md:hidden w-full text-center overflow-hidden">
            <span
              key={topIdx}
              className="inline-flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500"
            >
              <current.Icon size={13} className="text-accent-soft" />
              <span>{current.text}</span>
            </span>
          </div>
          <div className="hidden md:block absolute right-4">{LangDropdown}</div>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-5">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden -ml-1 p-1.5 text-primary-foreground hover:text-accent"
          aria-label="Menu openen"
        >
          <Menu size={22} />
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display"
          aria-label="kamagrasite home"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent ring-1 ring-accent/30">
            <Pill size={15} strokeWidth={2.25} className="-rotate-45" />
          </span>
          <span className="leading-none text-base uppercase font-semibold tracking-wider">
            <span className="text-primary-foreground">KAMAGRA</span>{" "}
            <span className="text-accent">EXPERT</span>
          </span>
        </Link>
        <form action="/winkel" method="get" className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-muted" />
            <input
              type="search"
              name="q"
              placeholder={lang === "EN" ? "Search products" : "Zoek producten - bv. kamagra, cenforce, vidalista"}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-accent/40 bg-success-soft text-sm font-medium text-primary placeholder:text-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent shadow-sm"
            />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-0.5">
          <Link
            href="/account"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded text-primary-foreground hover:bg-primary-soft"
            aria-label="Account"
          >
            <User size={19} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded text-primary-foreground hover:bg-primary-soft"
            aria-label="Winkelwagen"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Nav row with mega menus - centered */}
      <div className="hidden lg:block border-t border-primary-soft relative" onMouseLeave={() => setOpenMega(null)}>
        <div className="mx-auto max-w-7xl px-4 h-11 flex items-center justify-center gap-1 text-[15px]">
          {/* Winkel */}
          <div className="relative" onMouseEnter={() => setOpenMega("winkel")}>
            <button
              className={`h-11 inline-flex items-center gap-1.5 px-4 font-semibold uppercase tracking-wider text-[13px] border-b-2 transition-colors ${
                openMega === "winkel"
                  ? "border-accent bg-primary-soft text-accent"
                  : "border-accent/70 bg-primary-soft/40 text-accent hover:bg-primary-soft hover:text-accent"
              }`}
            >
              <Store size={15} strokeWidth={2.25} /> Winkel <ChevronDown size={13} />
            </button>
            {openMega === "winkel" && (
              <div className="absolute top-full left-0 mt-px bg-primary border border-primary-soft shadow-lift text-primary-foreground rounded-b-lg p-4 w-[280px] z-50">
                <p className="text-xs uppercase tracking-wider text-accent-soft font-semibold mb-3 inline-flex items-center gap-1.5 px-2">
                  <Store size={12} /> Categorieën
                </p>
                <div className="space-y-1 text-sm">
                  <Link href="/winkel" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                    Alle producten
                  </Link>
                  {mainCategories.map((c) => (
                    <Link key={c.slug} href={c.to} onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/lab"
            onMouseEnter={() => setOpenMega(null)}
            className="h-11 inline-flex items-center px-4 font-medium text-primary-foreground hover:text-accent border-b-2 border-transparent hover:border-accent transition-colors"
          >
            Kwaliteit
          </Link>

          {/* Kennisbank */}
          <div className="relative" onMouseEnter={() => setOpenMega("kennisbank")}>
            <button
              className={`h-11 inline-flex items-center gap-1 px-4 font-medium text-primary-foreground hover:text-accent border-b-2 transition-colors ${openMega === "kennisbank" ? "border-accent text-accent" : "border-transparent"}`}
            >
              Kennisbank <ChevronDown size={13} />
            </button>
            {openMega === "kennisbank" && (
              <div className="absolute top-full left-0 mt-px bg-primary border border-primary-soft shadow-lift text-primary-foreground rounded-b-lg p-4 w-[260px] z-50">
                <p className="text-xs uppercase tracking-wider text-accent-soft font-semibold mb-3 inline-flex items-center gap-1.5 px-2">
                  <BookOpen size={12} /> Kennisbank
                </p>
                <div className="space-y-1 text-sm">
                  <Link href="/kennisbank" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                    Alle artikelen
                  </Link>
                  <Link href="/kennisbank?cat=kennis" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                    Kennis
                  </Link>
                  <Link href="/kennisbank?cat=onderzoek" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                    Onderzoek
                  </Link>
                  <Link href="/kennisbank?cat=nieuws" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-primary-foreground/80 hover:bg-primary-soft hover:text-accent">
                    Nieuws
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/contact"
            onMouseEnter={() => setOpenMega(null)}
            className="h-11 inline-flex items-center px-4 font-medium text-primary-foreground hover:text-accent border-b-2 border-transparent hover:border-accent transition-colors"
          >
            Contact
          </Link>
        </div>

      </div>
      <MobileMenuDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}

export default Header;
