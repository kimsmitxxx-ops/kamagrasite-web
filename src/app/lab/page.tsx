import Link from "next/link";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/badge";
import { FaqAccordion } from "@/components/faq-accordion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  ScanLine,
  FileCheck2,
  PackageCheck,
  Factory,
  CalendarClock,
  BookOpen,
} from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Herkomst en kwaliteit - waar onze ED-medicatie vandaan komt · Kamagra Site",
  description:
    "Van welke fabrikanten wij importeren, waarom generieke sildenafil hetzelfde molecuul is als Viagra, en hoe je zelf aan de verpakking ziet of een strip klopt.",
  alternates: { canonical: "/lab" },
};

const fabrikanten = [
  {
    name: "Ajanta Pharma",
    plaats: "Mumbai, India",
    lijnen: "Kamagra, Kamagra Oral Jelly, Kamagra Polo, bruistabletten, Lovegra",
    over:
      "Beursgenoteerd bedrijf dat ook gewone receptgeneesmiddelen levert aan apotheken in Azie en Afrika.",
  },
  {
    name: "Centurion Laboratories",
    plaats: "Vadodara, India",
    lijnen: "Cenforce, Vidalista, Vilitra, Super Vidalista",
    over:
      "Gespecialiseerd in PDE5-remmers. Levert de breedste reeks sterktes, van sildenafil 50 mg tot tadalafil 80 mg.",
  },
  {
    name: "Sunrise Remedies",
    plaats: "Ahmedabad, India",
    lijnen: "Super P-Force",
    over:
      "Maakt vooral combinatiepreparaten waarin een PDE5-remmer en dapoxetine in een tablet zitten.",
  },
];

const stappen = [
  {
    icon: Factory,
    step: "01",
    title: "Direct bij de fabrikant",
    body:
      "Wij kopen per productlijn rechtstreeks in, zonder tussenhandel waarin partijen worden omgepakt of gemengd. Dat houdt de herkomst van een doos navolgbaar.",
  },
  {
    icon: ScanLine,
    step: "02",
    title: "Controle bij binnenkomst",
    body:
      "Elke binnenkomende partij controleren we op verzegeling, fabrikantnaam, sterkte, batchcode en houdbaarheidsdatum. Dozen zonder complete codering nemen we niet aan.",
  },
  {
    icon: CalendarClock,
    step: "03",
    title: "Houdbaarheid in de productnaam",
    body:
      "Loopt een partij binnen een jaar af, dan zetten we die datum in de productnaam. Je ziet het dus voordat je bestelt en niet pas als het pakket op de mat ligt.",
  },
];

const zelfControleren = [
  "Fabrikantnaam op doos en blister, en die twee horen gelijk te zijn",
  "Werkzame stof en sterkte, bijvoorbeeld sildenafil citraat 100 mg",
  "Batch- of lotnummer, op doos en blister identiek",
  "Houdbaarheidsdatum (EXP), meestal als maand en jaar",
  "Een onbeschadigde, nergens opengemaakte blister",
];

const faqItems = [
  {
    question: "Is generieke ED-medicatie uit India hetzelfde als Viagra?",
    answer:
      "Het werkzame molecuul is identiek. Sildenafil is sildenafil, of het nu in een Viagra-tablet van Pfizer zit of in een Kamagra-tablet van Ajanta. Het patent op sildenafil is verlopen, waarna andere fabrikanten het mochten gaan maken. Verschillen zitten in de hulpstoffen, de kleur, de vorm en vooral de prijs.",
  },
  {
    question: "Testen jullie elke batch in een laboratorium?",
    answer:
      "Nee, en dat beweren we ook niet. Wij zijn een importeur, geen laboratorium. Wat wij wel doen: direct bij de fabrikant inkopen, bij binnenkomst de verpakking en de codering controleren, en de houdbaarheidsdatum zichtbaar maken in de productnaam. Een shop die claimt elke doos sildenafil zelf op HPLC te meten, vertelt je iets dat in deze markt vrijwel nooit klopt.",
  },
  {
    question: "Hoe weet ik of mijn strip echt is?",
    answer:
      "Kijk naar vier dingen: fabrikantnaam, sterkte, batchcode en houdbaarheidsdatum, en controleer of de codering op de doos en op de blister gelijk is. Een echte blister is strak verzegeld en de tabletten hebben een gelijkmatige kleur en een scherp persprofiel. Twijfel je, stuur ons dan een foto via het contactformulier voordat je iets inneemt.",
  },
  {
    question: "Wat als er iets mis is met mijn bestelling?",
    answer:
      "Beschadigde blisters, een verkeerde sterkte of een houdbaarheidsdatum die korter is dan aangegeven: stuur een foto mee via het contactformulier en we vervangen het in je volgende zending. Komt een pakket niet aan, dan versturen we opnieuw.",
  },
  {
    question: "Waarom is het zoveel goedkoper dan bij de apotheek?",
    answer:
      "De ontwikkelkosten van sildenafil zijn allang terugverdiend, de productie in India is goedkoper en wij verkopen rechtstreeks zonder apotheekmarge. Wat je bij een merkmiddel extra betaalt is de naam en de verpakking, niet een ander molecuul.",
  },
];

export default function HerkomstPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground border-y border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
          <div>
            <Badge variant="accent" className="bg-accent/20 text-accent-soft">Herkomst en kwaliteit</Badge>
            <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Hetzelfde molecuul, <span className="text-accent-soft">zonder de merknaam</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80 leading-relaxed">
              Wij importeren rechtstreeks bij drie Indiase fabrikanten die generieke PDE5-remmers
              maken. Hieronder lees je wie dat zijn, waarom het werkzame molecuul identiek is aan
              dat in Viagra, Cialis en Levitra, en hoe je zelf aan een strip ziet of hij klopt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#controleren"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-soft"
              >
                <ScanLine size={16} /> Zelf je strip controleren
              </Link>
              <Link
                href="/winkel"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-5 py-3 text-sm font-medium hover:bg-primary-soft"
              >
                Naar de winkel <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-soft font-semibold">
              Wat wij wel en niet zijn
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-accent-soft shrink-0 mt-0.5" />
                <span className="text-primary-foreground/85">
                  Importeur die rechtstreeks bij de fabrikant koopt
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-accent-soft shrink-0 mt-0.5" />
                <span className="text-primary-foreground/85">
                  Controle op verzegeling, codering en houdbaarheid bij binnenkomst
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle size={16} className="text-primary-foreground/40 shrink-0 mt-0.5" />
                <span className="text-primary-foreground/60">
                  Geen laboratorium, dus geen eigen HPLC-analyses
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle size={16} className="text-primary-foreground/40 shrink-0 mt-0.5" />
                <span className="text-primary-foreground/60">
                  Geen apotheek, dus geen recept en geen medisch advies op maat
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Onze route</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-primary leading-tight">
              Van fabriek tot brievenbus in drie stappen
            </h2>
            <p className="mt-4 text-primary/70 leading-relaxed">
              Niets spannends, wel consequent. Hoe korter de keten, hoe kleiner de kans dat er
              onderweg iets is omgepakt of verwisseld.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {stappen.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.step} className="relative rounded-xl border border-paper-border bg-paper-soft p-7 shadow-card">
                  <span className="absolute -top-3 left-7 inline-flex items-center rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground tabular">
                    {p.step}
                  </span>
                  <Icon size={28} className="text-accent" />
                  <h3 className="mt-4 font-display text-xl text-primary leading-tight">{p.title}</h3>
                  <p className="mt-2 text-sm text-primary/70 leading-relaxed">{p.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-background border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading variant="eyebrow-plus-display" eyebrow="Onze fabrikanten">
            Wie onze productlijnen maakt
          </SectionHeading>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {fabrikanten.map((f) => (
              <div key={f.name} className="rounded-lg border border-border bg-surface p-5 hover:border-accent transition-colors">
                <Factory size={20} className="text-accent" />
                <h3 className="mt-3 font-display text-lg text-text leading-tight">{f.name}</h3>
                <p className="mt-1 text-xs text-text-subtle">{f.plaats}</p>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">{f.over}</p>
                <dl className="mt-4 border-t border-border pt-3 text-xs">
                  <dt className="text-text-subtle">Productlijnen</dt>
                  <dd className="mt-1 text-text">{f.lijnen}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-text-muted leading-relaxed">
            Deze fabrikanten produceren onder de Indiase GMP-regels. Dat is niet hetzelfde als een
            Europese handelsvergunning: generieke ED-medicatie uit India is in Nederland niet
            geregistreerd en wordt hier niet via de apotheek verkocht. Wij zeggen er liever eerlijk
            bij wat de status is dan dat we met een keurmerk schermen dat niet bestaat.
          </p>
        </div>
      </section>

      <section id="controleren" className="bg-paper border-t border-border scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl border border-accent/30 bg-accent-soft/10 p-8 lg:p-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
            <div>
              <Badge variant="accent">Zelf controleren</Badge>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-primary leading-tight">
                Vijf dingen die op <span className="text-accent">elke echte strip</span> staan
              </h2>
              <p className="mt-4 text-primary/75 leading-relaxed max-w-xl">
                Je hoeft geen apotheker te zijn om een vervalsing eruit te pikken. Loop deze punten
                langs zodra je pakket binnen is, voordat je iets inneemt.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-primary/80">
                {zelfControleren.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <FileCheck2 size={16} className="text-accent shrink-0 mt-0.5" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-primary/75 leading-relaxed">
                Klopt er iets niet, neem dan niets in en{" "}
                <Link href="/contact" className="text-accent underline">
                  stuur ons een foto
                </Link>
                . We lossen het op in je volgende zending.
              </p>
            </div>
            <div className="rounded-xl border border-paper-border bg-paper-soft p-6">
              <PackageCheck size={22} className="text-accent" />
              <h3 className="mt-3 font-display text-lg text-primary">Hoe je bestelling aankomt</h3>
              <p className="mt-2 text-sm text-primary/70 leading-relaxed">
                In een neutrale doos zonder logo of productnaam op het label. Op je bankafschrift
                staat alleen onze bedrijfsnaam, niet wat je hebt besteld.
              </p>
              <Link
                href="/bezorging"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-muted"
              >
                Meer over bezorging <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:py-20">
          <SectionHeading
            variant="eyebrow-plus-display"
            eyebrow="Veelgestelde vragen"
            className="text-primary [&_*]:text-primary"
          >
            Over herkomst en echtheid
          </SectionHeading>
          <div className="mt-8">
            <FaqAccordion items={faqItems} tone="light" />
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <ShieldCheck size={32} className="text-accent shrink-0" />
            <div>
              <h3 className="font-display text-2xl text-primary-foreground">
                Eerst uitzoeken welke stof bij je past?
              </h3>
              <p className="mt-1 text-primary-foreground/70 max-w-xl">
                In de kennisbank staat het verschil tussen sildenafil, tadalafil en vardenafil, plus
                de wisselwerkingen waar je echt op moet letten.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kennisbank"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-soft"
            >
              <BookOpen size={16} /> Naar kennisbank
            </Link>
            <Link
              href="/winkel"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-5 py-3 text-sm font-medium hover:bg-primary-soft"
            >
              Naar de winkel <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
