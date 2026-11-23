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
import { alternatesNL } from "@/lib/geo-nl";

export const metadata: Metadata = {
  title: "Over Kamagra Site - wie wij zijn en hoe wij werken",
  description:
    "Kamagra Site importeert generieke ED-medicatie rechtstreeks bij Ajanta Pharma, Centurion Laboratories en Sunrise Remedies. Lees hoe wij werken, wat wij wel en niet beloven en hoe je ons bereikt.",
  alternates: alternatesNL("/over-ons/"),
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
    h: "De deur uit zodra je betaald hebt",
    // Stond hier als "doorgaans de volgende werkdag". Dat is een snellere
    // belofte dan we overal elders doen (1 tot 2 werkdagen) en dan we kunnen
    // waarmaken; PostNL geeft daar geen garantie op.
    p: "Zodra de betaling binnen is gaat het pakket via PostNL of DPD de deur uit. Daarna is het in Nederland 1 tot 2 werkdagen onderweg, in Belgie 1 tot 3.",
  },
  {
    icon: BookOpen,
    h: "Uitleg zonder verkooppraat",
    p: "Op de koop-pagina's staat ook wanneer je iets juist niet moet nemen, en bij welke medicijnen je eerst een arts spreekt. Dat kost ons af en toe een bestelling, en dat is precies de bedoeling.",
  },
  {
    icon: ShieldCheck,
    h: "Geen claims die we niet waar kunnen maken",
    p: "Wij zijn importeur, geen laboratorium en geen apotheek. We adverteren dus niet met eigen labanalyses, keurmerken of medisch advies op maat.",
  },
  {
    icon: Users,
    h: "Vragen gaan naar een mens",
    // "Binnen een werkdag" stond hier, maar de belofte op alle shops is 48
    // uur. Een snellere toezegging die je niet altijd haalt is erger dan een
    // ruimere die je wel haalt.
    p: "Mail en contactformulier worden door onze eigen klantenservice beantwoord, binnen 48 uur. Geen chatbot die in cirkels praat.",
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
                <Link href="/lab/" className="text-accent hover:underline">
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

      {/* Waarom er stadspagina's zijn. Dit stond nergens uitgelegd, terwijl
          het wel de helft van de site beslaat en de meeste bezoekers via zo'n
          pagina binnenkomen. Eerlijk houden: wij bezorgen overal, maar we
          hebben nergens een winkel, en dat staat hier dus ook met zoveel
          woorden. */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="space-y-5 text-text-muted leading-relaxed">
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">
              Waarom wij per stad schrijven
            </p>
            <h2 className="font-display text-3xl text-text">
              De vraag is lokaal, het antwoord is dat eigenlijk niet
            </h2>
            <p>
              Mensen zoeken naar &quot;kamagra kopen Nijmegen&quot; of &quot;afhalen in
              Amsterdam&quot;. Logisch, want zo zoek je ook naar een fietsenmaker of een
              kapper. Alleen klopt de aanname eronder hier niet: er is in Nederland geen
              enkele stad waar dit over de toonbank gaat. Het middel is niet geregistreerd
              en sildenafil is receptplichtig, dus de apotheek geeft het alleen mee op
              recept en een gewone winkel mag het helemaal niet verkopen.
            </p>
            <p>
              Je kunt die zoeker twee dingen geven. Een pagina die doet alsof er wel een
              afhaalpunt om de hoek zit, of het echte antwoord. Wij doen het tweede. Op elke
              stadspagina staat dat afhalen niet kan, waarom dat zo is, en wat er dan wel
              kan: bestellen en thuis laten bezorgen, vanuit Nederland, in een doos waar
              niets op staat.
            </p>
            <p>
              Dat wij nergens een pand hebben, verandert niets aan waar we bezorgen. Van
              Maastricht tot Leeuwarden, van Middelburg tot Assen: zelfde levertijd, zelfde
              neutrale verpakking, zelfde prijs. Een postcode in Zeeland is voor PostNL geen
              bijzonderheid.
            </p>
            <p>
              Per stad schrijven we bovendien over iets anders, omdat zestien keer hetzelfde
              verhaal niemand verder helpt. De ene pagina gaat over het verschil tussen de
              werkzame stoffen, de andere over bijwerkingen, over dosering opbouwen, of over
              hoe je namaak herkent. Zo heeft elke pagina een reden om te bestaan, ook als
              je toevallig net niet in die stad woont.
            </p>
            <Link
              href="/steden/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-muted font-medium"
            >
              Bekijk alle steden en hoe de bezorging werkt &rarr;
            </Link>
          </div>

          <div className="rounded-md border border-border bg-surface p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">
              Waar we bezorgen
            </p>
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              Overal in Nederland en Belgie, op elk vast huisadres. Geen afhaalpunt en geen
              pakketautomaat, want in onze branche krijgen we daar geen contract voor. Mis je
              het pakket thuis, dan biedt de vervoerder het opnieuw aan en gaat het daarna
              alsnog naar het dichtstbijzijnde afhaalpunt.
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Nederland</dt>
                <dd className="text-text">1 tot 2 werkdagen nadat je betaling binnen is</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Belgie</dt>
                <dd className="text-text">1 tot 3 werkdagen</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Vervoerder</dt>
                <dd className="text-text">PostNL of DPD, in een neutrale doos</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-text-muted">Afhalen</dt>
                <dd className="text-text">
                  Nergens mogelijk.{" "}
                  <Link href="/steden/#afhalen" className="text-accent hover:underline">
                    Zo zit dat precies
                  </Link>
                </dd>
              </div>
            </dl>
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
                  <Link className="text-accent hover:underline" href="/contact/">
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
                href="/kennisbank/wisselwerkingen-ed-medicatie-nitraten-alfablokkers/"
                className="text-accent hover:underline"
              >
                gids over wisselwerkingen
              </Link>
              .
            </p>
            <Link
              href="/contact/"
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
