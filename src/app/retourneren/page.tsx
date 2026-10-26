import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/shop/page-hero";
import { FaqAccordion } from "@/components/faq-accordion";
import { ShieldCheck, PackageCheck, Mail, AlertTriangle } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Retour en terugbetaling - Kamagra Site",
  description:
    "Retourzendingen zijn in onze branche niet mogelijk. Wat wel kan: 100% leveringsgarantie bij vertraging of vermissing, en kosteloze vervanging bij een beschadigde of verkeerde levering.",
  alternates: { canonical: "/retourneren" },
};

const cards = [
  {
    icon: ShieldCheck,
    title: "100% leveringsgarantie",
    sub: "Komt je pakket niet aan binnen 14 dagen? Nieuwe verzending zonder discussie of extra kosten.",
  },
  {
    icon: PackageCheck,
    title: "Beschadigd of verkeerd geleverd",
    sub: "Kapotte blister, verkeerde sterkte of een kortere houdbaarheid dan aangegeven? Wij vervangen het kosteloos in je volgende bestelling.",
  },
  {
    icon: AlertTriangle,
    title: "Niet leverbaar item?",
    sub: "Wij bieden een alternatief van gelijke waarde of verzenden het item apart na zodra het weer op voorraad is.",
  },
];

const faq = [
  {
    question: "Kan ik mijn bestelling retourneren of annuleren?",
    answer:
      "Nee. Vanwege de branche waarin wij opereren kunnen wij helaas geen fysiek retour-adres publiek voeren, en zodra je betaling bij ons binnen is, gaat de bestelling in behandeling en kan er niet meer geannuleerd of teruggedraaid worden.",
  },
  {
    question: "Wat als mijn pakket niet aankomt?",
    answer:
      "Is je pakket 14 dagen na de verzenddatum nog steeds niet bezorgd? Dan verzenden wij automatisch een nieuwe zending - zonder discussie en zonder extra kosten. Meld het via het contactformulier op de site met je ordernummer.",
  },
  {
    question: "Wat als een item niet meer leverbaar blijkt?",
    answer:
      "Als tijdens de verwerking blijkt dat een item toch niet meer leverbaar is, bieden wij een alternatief van gelijke waarde aan. Wil je liever wachten? Dan versturen we het niet-leverbare item apart na zodra het weer binnen is - zonder extra verzendkosten.",
  },
  {
    question: "Mijn blisters zijn beschadigd of de sterkte klopt niet. Wat nu?",
    answer:
      "Stuur via het contactformulier een foto van de strip en de doos mee, met je ordernummer erbij. Zie je dat de houdbaarheidsdatum korter is dan op de productpagina stond, of klopt de sterkte niet met wat je besteld hebt, dan vervangen wij het kosteloos in je volgende zending. Neem in dat geval niets in voordat je van ons hoort.",
  },
  {
    question: "Kan ik mijn geld terugkrijgen?",
    answer:
      "Nee, terugbetalingen zijn niet mogelijk. Wat we wel doen: bij niet-aankomst versturen we opnieuw, en bij een beschadigde of verkeerde levering vervangen we het kosteloos in je volgende bestelling. Neem daarom voordat je betaalt goed de tijd om je bestelling te controleren.",
  },
];

export default function RetourPage() {
  return (
    <>
      <PageHero
        eyebrow="Retour & garantie"
        title="Geen retour, wél 100% leveringsgarantie"
        intro="Wij kunnen geen retour-adres publiek voeren, dus retourzendingen zijn niet mogelijk. Terugbetalingen ook niet - zodra je betaling binnen is, gaat je bestelling in behandeling. Wél garanderen we dat je pakket aankomt: doet-ie dat niet, dan verzenden we opnieuw."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-md border border-border bg-surface p-5">
            <c.icon size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-text">{c.title}</h3>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{c.sub}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-6 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg">Let op vóór je betaalt</h2>
              <p className="mt-1.5 text-sm">
                Zodra je betaling bij ons binnen is, gaat je bestelling direct in behandeling. Terugdraaien of
                annuleren is dan niet meer mogelijk. Controleer je bestelling en je adresgegevens dus goed voordat je
                de overboeking uitvoert.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-2xl text-text">Veelgestelde vragen</h2>
            <p className="mt-2 text-sm text-text-muted">
              Twijfel je over jouw situatie?{" "}
              <Link href="/contact" className="text-accent hover:underline">
                Neem contact op
              </Link>
              .
            </p>
            <div className="mt-6 rounded-md border border-border bg-surface p-5">
              <Mail size={16} className="text-accent" />
              <p className="mt-2 font-medium text-text">Klantenservice</p>
              <Link href="/contact" className="text-sm text-accent hover:underline">
                Stuur een bericht via het contactformulier
              </Link>
              <p className="mt-2 text-xs text-text-subtle">Antwoord binnen 1 werkdag.</p>
            </div>
          </div>
          <FaqAccordion items={faq} />
        </div>
      </section>
    </>
  );
}
