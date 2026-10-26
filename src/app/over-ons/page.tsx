import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shop/page-hero";
import { listBlogAuthors } from "@/lib/queries";
import {
  Factory,
  ShieldCheck,
  PackageCheck,
  Users,
  BookOpen,
  Mail,
  Truck,
  BadgeCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Over Kamagra Site - wie wij zijn en hoe wij werken",
  description:
    "Kamagra Site importeert generieke ED-medicatie rechtstreeks bij Ajanta Pharma, Centurion Laboratories en Sunrise Remedies. Lees hoe wij werken, wat wij wel en niet beloven en hoe je ons bereikt.",
  alternates: { canonical: "/over-ons" },
};

export const revalidate = 600;

const pillars = [
  {
    icon: Factory,
    h: "Rechtstreeks importeren",
    p: "Wij kopen per productlijn direct bij de fabrikant in, zonder tussenhandel waarin partijen worden omgepakt. Dat houdt de herkomst van een doos navolgbaar en de prijs laag.",
  },
  {
    icon: PackageCheck,
    h: "Discreet als standaard",
    p: "Neutrale doos, geen logo of productnaam op het label, en op je bankafschrift alleen onze bedrijfsnaam. Niet als extra optie, maar bij iedere bestelling.",
  },
  {
    icon: Truck,
    h: "Dezelfde dag de deur uit",
    p: "Betaling binnen voor 15:00 op een werkdag betekent diezelfde dag verstuurd via PostNL. Nederland doorgaans de volgende werkdag, Belgie een dag later.",
  },
  {
    icon: BookOpen,
    h: "Uitleg zonder verkooppraat",
    p: "Onze kennisbank legt uit wanneer je iets juist niet moet gebruiken. Dat kost ons af en toe een bestelling, en dat is precies de bedoeling.",
  },
  {
    icon: ShieldCheck,
    h: "Geen claims die we niet waar kunnen maken",
    p: "Wij zijn importeur, geen laboratorium en geen apotheek. We adverteren dus niet met eigen labanalyses, keurmerken of medisch advies op maat.",
  },
  {
    icon: Users,
    h: "Vragen gaan naar een mens",
    p: "Mail en contactformulier worden door onze eigen klantenservice beantwoord, doorgaans binnen een werkdag. Geen chatbot die in cirkels praat.",
  },
];

export default async function OverOnsPage() {
  const authors = await listBlogAuthors();

  return (
    <>
      <PageHero
        eyebrow="Over Kamagra Site"
        title="Generieke ED-medicatie, zonder de drempel en zonder de merktoeslag"
        intro="Kamagra Site is een Nederlandse importeur van generieke erectiemiddelen. Wij halen Kamagra, Cenforce, Vidalista en Vilitra rechtstreeks bij de fabrikant en sturen ze discreet vanuit Nederland door. Geen wachtkamer, geen gesprek waar je tegenop ziet, en geen apotheekprijs voor een molecuul waarvan het patent allang is verlopen."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-10 lg:grid-cols-2 items-start">
        <div className="space-y-5 text-text-muted leading-relaxed">
          <p>
            Erectieproblemen komen veel vaker voor dan het gesprek erover doet vermoeden. Ruwweg
            een op de drie mannen krijgt er ooit mee te maken, en met de leeftijd loopt dat op. Toch
            blijft het voor veel mannen bij googelen om twee uur s nachts.
          </p>
          <p>
            Wij zijn begonnen omdat die combinatie onnodig duur en onnodig ongemakkelijk is. De
            werkzame stof in Kamagra is dezelfde sildenafil als in Viagra. Het patent daarop is
            verlopen, de ontwikkelkosten zijn terugverdiend en generieke fabrikanten maken hetzelfde
            molecuul voor een fractie van de prijs. Wat je bij een merkmiddel extra betaalt is de
            naam op de doos.
          </p>
          <p>
            Daar hoort wel eerlijkheid bij over wat wij niet zijn. Wij leveren zonder recept, dus er
            kijkt geen arts met je mee. Gebruik je nitraten, heb je hartklachten of slik je
            alfablokkers, dan is overleg met een huisarts geen formaliteit maar noodzaak. Die
            informatie staat bij ons vooraan in plaats van onderaan in de kleine lettertjes.
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">In het kort</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-text-muted">Wat we verkopen</dt>
              <dd className="text-text">
                Generieke PDE5-remmers met sildenafil, tadalafil of vardenafil, en combinaties met
                dapoxetine
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-text-muted">Fabrikanten</dt>
              <dd className="text-text">
                Ajanta Pharma, Centurion Laboratories en Sunrise Remedies.{" "}
                <Link href="/lab" className="text-accent hover:underline">
                  Meer over herkomst
                </Link>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-text-muted">Verzending</dt>
              <dd className="text-text">Vanuit Nederland met PostNL, neutraal verpakt</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-text-muted">Levergebied</dt>
              <dd className="text-text">Nederland en Belgie</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-36 shrink-0 text-text-muted">Betalen</dt>
              <dd className="text-text">Bankoverschrijving, geen creditcard of tussenpartij</dd>
            </div>
          </dl>
        </div>
      </section>

      {authors.length > 0 && (
        <section className="bg-paper border-y border-border">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Onze schrijvers</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-primary">
              Wie er achter onze content staat
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {authors.map((a) => (
                <article
                  key={a.id}
                  id={a.slug}
                  className="rounded-xl border border-primary-muted bg-surface p-6 scroll-mt-20"
                >
                  <header className="flex items-start gap-4">
                    {a.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.avatar_url}
                        alt={`Profielfoto ${a.name}`}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-paper-border shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center text-accent font-display text-xl shrink-0">
                        {a.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-text">{a.name}</h3>
                      {a.role && <p className="text-xs text-text-muted">{a.role}</p>}
                    </div>
                  </header>
                  {a.bio_long && (
                    <p className="mt-4 text-sm text-text-muted leading-relaxed">{a.bio_long}</p>
                  )}
                  {a.credentials && a.credentials.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {a.credentials.map((c) => (
                        <li
                          key={c}
                          className="inline-flex items-center gap-1 rounded-full bg-paper-soft px-2.5 py-0.5 text-[11px] text-text-muted border border-border"
                        >
                          <BadgeCheck size={11} className="text-accent" /> {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="font-display text-3xl text-text max-w-2xl">Zes dingen die ons werk sturen</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.h} className="rounded-md border border-border bg-background p-5">
                <p.icon size={20} className="text-accent" />
                <h3 className="mt-3 font-display text-lg text-text">{p.h}</h3>
                <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-md border border-border bg-surface p-8 lg:p-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Bedrijfsgegevens</p>
            <h2 className="mt-2 font-display text-2xl text-text">Kamagra Site</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 text-text-muted">Vestiging</dt>
                <dd className="text-text">Nederland</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-text-muted">KvK en BTW</dt>
                <dd className="text-text">Staan op de factuur die je na je bestelling ontvangt.</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-text-muted">Contact</dt>
                <dd className="text-text">
                  <Link className="text-accent hover:underline" href="/contact">
                    contactformulier op de site
                  </Link>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 text-text-muted">Reactietijd</dt>
                <dd className="text-text">Doorgaans binnen een werkdag</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-text-subtle">
              Bezoek aan het magazijn is niet mogelijk. Voor vragen over een lopende bestelling is
              het contactformulier de snelste route, met je ordernummer erbij.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Onze positie</p>
            <h2 className="mt-2 font-display text-2xl text-text">Eerlijk, niet pushy</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              De middelen die wij verkopen zijn generieke geneesmiddelen die in Nederland normaal
              gesproken op recept via de apotheek gaan. Wij leveren ze zonder recept. Dat betekent
              dat de verantwoordelijkheid voor een veilige keuze deels bij jou komt te liggen, en
              dat wij je daar zo goed mogelijk bij willen informeren.
            </p>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Gebruik je nitraten of poppers, dan is een PDE5-remmer levensgevaarlijk. Heb je
              hartklachten, een lage bloeddruk of gebruik je alfablokkers, overleg dan eerst met een
              arts. Wat die combinaties precies doen staat in onze{" "}
              <Link
                href="/kennisbank/wisselwerkingen-ed-medicatie-nitraten-alfablokkers"
                className="text-accent hover:underline"
              >
                gids over wisselwerkingen
              </Link>
              .
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-soft transition-colors"
            >
              <Mail size={15} /> Stel je vraag
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
