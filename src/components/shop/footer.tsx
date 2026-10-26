import Link from "next/link";
import { PaymentRow } from "@/components/payment-row";
import { NewsletterForm } from "@/components/newsletter-form";
import { Mail, Pill, PackageCheck, Clock } from "lucide-react";
import { mainCategories, STOF_FILTERS } from "./data";

const KENNISBANK_LINKS = [
  { href: "/kennisbank/kamagra-vs-viagra-verschil-uitleg", label: "Kamagra vs Viagra" },
  { href: "/kennisbank/sildenafil-tadalafil-vardenafil-welke-past-bij-jou", label: "Welke stof past bij jou" },
  { href: "/kennisbank/wisselwerkingen-ed-medicatie-nitraten-alfablokkers", label: "Wisselwerkingen" },
  { href: "/kennisbank/dapoxetine-uitgestelde-ejaculatie-hoe-werkt-het", label: "Dapoxetine bij PE" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-12 lg:grid-cols-[1.2fr_3fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/15 text-accent ring-1 ring-accent/30">
              <Pill size={18} strokeWidth={2.25} className="-rotate-45" />
            </span>
            <span className="leading-none">
              <span className="text-primary-foreground">Kamagra</span>{" "}
              <span className="text-accent">Expert</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-primary-foreground/70 max-w-sm leading-relaxed">
            Generieke ED-medicatie met sildenafil, tadalafil, vardenafil en dapoxetine.
            Rechtstreeks geimporteerd van Ajanta Pharma, Centurion Laboratories en
            Sunrise Remedies, verstuurd vanuit Nederland.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-primary-foreground/70">
            <li className="inline-flex items-center gap-2">
              <PackageCheck size={14} className="text-accent" /> Neutrale verpakking, geen productnaam op het label
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock size={14} className="text-accent" /> Voor 15:00 betaald op een werkdag is dezelfde dag verstuurd
            </li>
            <li>
              <Link href="/contact" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-accent">
                <Mail size={14} className="text-accent" /> Contactformulier
              </Link>
            </li>
          </ul>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="font-display text-base mb-3 text-primary-foreground">Middelen</h4>
            <ul className="space-y-2 text-sm">
              {mainCategories.map((c) => (
                <li key={c.slug}>
                  <Link href={c.to} className="text-primary-foreground/70 hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/winkel" className="text-accent hover:text-accent-soft">
                  Alle producten →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base mb-3 text-primary-foreground">Werkzame stof</h4>
            <ul className="space-y-2 text-sm">
              {STOF_FILTERS.map((s) => (
                <li key={s.slug}>
                  <Link href={`/winkel?stof=${s.slug}`} className="text-primary-foreground/70 hover:text-accent">
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/begrippenlijst" className="text-accent hover:text-accent-soft">
                  Begrippenlijst →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base mb-3 text-primary-foreground">Kennisbank</h4>
            <ul className="space-y-2 text-sm">
              {KENNISBANK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-primary-foreground/70 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li><Link href="/kennisbank" className="text-accent hover:text-accent-soft">Alle artikelen →</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base mb-3 text-primary-foreground">Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/bezorging" className="text-primary-foreground/70 hover:text-accent">Bezorging</Link></li>
              <li><Link href="/retourneren" className="text-primary-foreground/70 hover:text-accent">Retourneren</Link></li>
              <li><Link href="/lab" className="text-primary-foreground/70 hover:text-accent">Herkomst &amp; kwaliteit</Link></li>
              <li><Link href="/contact" className="text-primary-foreground/70 hover:text-accent">Contact</Link></li>
              <li><Link href="/over-ons" className="text-primary-foreground/70 hover:text-accent">Over ons</Link></li>
              <li><Link href="/voorwaarden" className="text-primary-foreground/70 hover:text-accent">Voorwaarden</Link></li>
              <li><Link href="/privacy" className="text-primary-foreground/70 hover:text-accent">Privacy</Link></li>
              <li><a href="/sitemap.xml" className="text-primary-foreground/70 hover:text-accent">Sitemap</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-soft">
        <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          <NewsletterForm variant="footer-mini" heading="Nieuwe voorraad en aanbiedingen in je inbox" />
          <div className="lg:justify-self-end">
            <p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/60 mb-2">Betaalmethoden</p>
            <PaymentRow />
          </div>
        </div>
      </div>

      <div className="border-t border-primary-soft bg-primary-soft/40">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Kamagra Site B.V. · Vestigingsadres, KvK- en BTW-nummer staan op de factuur</p>
          <p>Geneesmiddelen zonder recept. Lees de bijsluiter en overleg bij twijfel met een arts.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
