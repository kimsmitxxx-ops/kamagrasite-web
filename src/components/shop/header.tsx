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
  MapPin,
} from "lucide-react";
import { SearchAutocomplete } from "./search-autocomplete";
import { STEDEN_MET_PAGINA } from "@/lib/steden-nl";
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
  { Icon: Truck, text: "Verstuurd zodra je betaling binnen is" },
  { Icon: Pill, text: "Sildenafil, tadalafil, vardenafil & dapoxetine" },
];

// De vier merken die los in de balk staan, en de rest die onder "Meer"
// valt. Vier is wat er past naast Steden, Kennisbank, Kwaliteit en Contact
// zonder dat de balk op een telefoonformaat omvalt.
const NAV_MERK_SLUGS = ["kamagra", "cenforce", "vidalista", "vilitra"];
const NAV_MERKEN = mainCategories.filter((c) => NAV_MERK_SLUGS.includes(c.slug));
const NAV_OVERIG = mainCategories.filter((c) => !NAV_MERK_SLUGS.includes(c.slug));

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
        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-xs font-semibold text-text hover:bg-veil"
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
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border text-text">
      {/* Top utility bar */}
      <div className="bg-background text-text text-xs">
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
          className="lg:hidden -ml-1 p-1.5 text-text hover:text-accent"
          aria-label="Menu openen"
        >
          <Menu size={22} />
        </button>
        {/* Het echte logo van kamagrasite.nl, zoals het al sinds 2020 op het
            domein staat. Hiervoor stond hier een nagemaakt merkteken: een
            pil-icoon met de naam in twee kleuren. Het origineel staat op wit,
            wat meteen de reden is dat deze balk wit moest worden. */}
        <Link href="/" className="inline-flex items-center" aria-label="Kamagrasite home">
          <img
            src="/logo-kamagrasite.jpg"
            alt="Kamagrasite.nl - officieel importeur"
            width={421}
            height={77}
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        {/* Zoeken met suggesties, zoals kamagrashop. Hiervoor stond hier een
            gewoon formulier dat je naar /winkel?q= stuurde: je zag pas na een
            paginawissel of er iets was. Nu komen de producten meteen onder de
            balk tevoorschijn, met foto en prijs. Enter blijft naar /winkel
            gaan, dus wie dat gewend is merkt er niets van. */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <SearchAutocomplete
            placeholder={lang === "EN" ? "Search products" : "Zoek producten - bv. kamagra, cenforce, vidalista"}
          />
        </div>
        <nav className="ml-auto flex items-center gap-0.5">
          <Link
            href="/account/"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded text-text hover:bg-veil"
            aria-label="Account"
          >
            <User size={19} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded text-text hover:bg-veil"
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
      <div className="hidden lg:block border-t border-border relative" onMouseLeave={() => setOpenMega(null)}>
        <div className="mx-auto max-w-7xl px-4 h-11 flex items-center justify-center gap-1 text-[15px]">
          {/* Winkel */}
          {/* De merken staan los in de balk in plaats van weggestopt achter
              een knop "Winkel". Iemand die op kamagra zoekt wil Kamagra zien
              staan, niet eerst een winkelmenu openklappen. Het scheelt een
              klik, het zet de productnamen in de navigatie van elke pagina, en
              het maakt de balk meteen anders dan die van de andere shops. */}
          {NAV_MERKEN.map((c) => (
            <Link
              key={c.slug}
              href={c.to}
              onMouseEnter={() => setOpenMega(null)}
              className="h-11 inline-flex items-center px-3 font-medium text-text hover:text-accent border-b-2 border-transparent hover:border-accent transition-colors"
            >
              {c.name}
            </Link>
          ))}

          {/* De rest van het assortiment, plus de weg naar de hele catalogus. */}
          <div className="relative" onMouseEnter={() => setOpenMega("winkel")}>
            <button
              className={`h-11 inline-flex items-center gap-1 px-3 font-medium border-b-2 transition-colors ${
                openMega === "winkel" ? "border-accent text-accent" : "border-transparent text-text hover:text-accent"
              }`}
            >
              Meer <ChevronDown size={13} />
            </button>
            {openMega === "winkel" && (
              <div className="absolute top-full left-0 mt-px bg-background border border-border shadow-lift text-text rounded-b-lg p-4 w-[280px] z-50">
                <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3 inline-flex items-center gap-1.5 px-2">
                  <Store size={12} /> Overig assortiment
                </p>
                <div className="space-y-1 text-sm">
                  {NAV_OVERIG.map((c) => (
                    <Link key={c.slug} href={c.to} onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent">
                      {c.name}
                    </Link>
                  ))}
                  <Link href="/winkel/" onClick={() => setOpenMega(null)} className="mt-2 block rounded px-2 py-1.5 font-medium text-accent hover:bg-veil">
                    Alle producten &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/lab/"
            onMouseEnter={() => setOpenMega(null)}
            className="h-11 inline-flex items-center px-4 font-medium text-text hover:text-accent border-b-2 border-transparent hover:border-accent transition-colors"
          >
            Kwaliteit
          </Link>

          {/* Steden. De stadspagina's waren weespagina's: ze stonden in de
              sitemap maar geen enkele pagina linkte ernaar, terwijl ze samen
              goed zijn voor ruim een kwart van de kliks. Vandaar een eigen
              uitklapmenu in plaats van alleen een regel in de footer.
              De lijst komt uit lib/steden-nl.ts, want de header is een
              clientonderdeel en kan de database niet zelf bevragen. */}
          <div className="relative" onMouseEnter={() => setOpenMega("steden")}>
            <button
              className={`h-11 inline-flex items-center gap-1 px-4 font-medium text-text hover:text-accent border-b-2 transition-colors ${openMega === "steden" ? "border-accent text-accent" : "border-transparent"}`}
            >
              Steden <ChevronDown size={13} />
            </button>
            {openMega === "steden" && (
              <div className="absolute top-full left-0 mt-px bg-background border border-border shadow-lift text-text rounded-b-lg p-4 w-[420px] z-50">
                <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3 inline-flex items-center gap-1.5 px-2">
                  <MapPin size={12} /> Kamagra per stad
                </p>
                {/* Drie kolommen sinds het er zestien zijn; in twee kolommen
                    werd de lijst zo lang dat hij onder de fold uitkwam. */}
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
                  {STEDEN_MET_PAGINA.map((s) => (
                    <Link
                      key={s.pagina}
                      href={`/${s.pagina}/`}
                      onClick={() => setOpenMega(null)}
                      className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent"
                    >
                      {s.naam}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/steden/"
                  onClick={() => setOpenMega(null)}
                  className="mt-3 block rounded px-2 py-1.5 text-sm font-medium text-accent hover:bg-veil"
                >
                  Alle steden en bezorging &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Kennisbank */}
          <div className="relative" onMouseEnter={() => setOpenMega("kennisbank")}>
            <button
              className={`h-11 inline-flex items-center gap-1 px-4 font-medium text-text hover:text-accent border-b-2 transition-colors ${openMega === "kennisbank" ? "border-accent text-accent" : "border-transparent"}`}
            >
              Kennisbank <ChevronDown size={13} />
            </button>
            {openMega === "kennisbank" && (
              <div className="absolute top-full left-0 mt-px bg-background border border-border shadow-lift text-text rounded-b-lg p-4 w-[260px] z-50">
                <p className="text-xs uppercase tracking-wider text-accent-soft font-semibold mb-3 inline-flex items-center gap-1.5 px-2">
                  <BookOpen size={12} /> Kennisbank
                </p>
                <div className="space-y-1 text-sm">
                  <Link href="/kennisbank/" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent">
                    Alle artikelen
                  </Link>
                  <Link href="/kennisbank/?cat=kennis" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent">
                    Kennis
                  </Link>
                  <Link href="/kennisbank/?cat=onderzoek" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent">
                    Onderzoek
                  </Link>
                  <Link href="/kennisbank/?cat=nieuws" onClick={() => setOpenMega(null)} className="block rounded px-2 py-1.5 text-text-muted hover:bg-veil hover:text-accent">
                    Nieuws
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/contact/"
            onMouseEnter={() => setOpenMega(null)}
            className="h-11 inline-flex items-center px-4 font-medium text-text hover:text-accent border-b-2 border-transparent hover:border-accent transition-colors"
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
