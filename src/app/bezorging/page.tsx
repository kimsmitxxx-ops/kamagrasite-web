import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/shop/page-hero";
import { FaqAccordion } from "@/components/faq-accordion";
import { Truck, PackageCheck, Clock, Globe2, ShieldCheck, MapPin } from "lucide-react";
import { alternatesNL } from "@/lib/geo-nl";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Bezorging - Kamagra Site",
  description:
    "Verzonden vanuit Nederland via PostNL en DPD, EUR 5 per bestelling. Discreet, met track & trace, alleen naar huisadressen.",
  alternates: alternatesNL("/bezorging/"),
};

// Een tarief voor alle bestemmingen, gelijk aan wat de kassa rekent
// (SHIPPING_FEE_CENTS in lib/shipping.ts). Stond hier op EUR 10 en EUR 15
// terwijl er EUR 5 werd afgerekend; wijzig je het tarief, pas dan allebei aan.
const carriers = [
  { name: "PostNL Standaard NL", cost: "€5,00", note: "1-2 werkdagen na verzending." },
  { name: "PostNL België", cost: "€5,00", note: "1-3 werkdagen na verzending." },
  { name: "DPD Nederland", cost: "€5,00", note: "Alternatief PostNL, 1-2 werkdagen na verzending." },
  { name: "DPD EU", cost: "€5,00", note: "Binnen 3-5 werkdagen naar DE, FR, AT, ES, IT, PL, SE." },
];

const usps = [
  { icon: Clock, title: "Snel verzonden", sub: "Je bestelling gaat de deur uit zodra je betaling binnen is." },
  { icon: PackageCheck, title: "Neutrale verpakking", sub: "Geen logo, geen productnaam, geen vermelding op label." },
  { icon: ShieldCheck, title: "100% leveringsgarantie", sub: "Komt je pakket niet aan? Wij verzenden opnieuw - geen discussie, geen extra kosten." },
  { icon: Globe2, title: "EU-breed bezorgd", sub: "NL en BE dagelijks. DE, FR, AT, ES, IT, PL, SE binnen 3-5 werkdagen." },
];

const faq = [
  {
    question: "Hoe snel wordt mijn pakket verstuurd?",
    answer:
      "Zodra je betaling binnen is, maken we het pakket klaar en gaat het de eerstvolgende werkdag de deur uit. Betalingen in het weekend verwerken we op maandag.",
  },
  {
    question: "Hoe ziet de verpakking eruit?",
    answer:
      "Neutrale bruine of grijze doos zonder logo, productnaam of branding op de buitenkant. Op het verzendlabel staat alleen onze bedrijfsnaam en jouw adres. Niets verraadt de inhoud.",
  },
  {
    question: "Kan ik mijn order volgen?",
    answer:
      "Ja. Zodra het label is aangemaakt, ontvang je per e-mail een track & trace-code van PostNL of DPD.",
  },
  {
    question: "Wat als ik niet thuis ben?",
    answer:
      "PostNL of DPD biedt het pakket nog één keer aan. Daarna gaat het naar het dichtstbijzijnde afhaalpunt van de betreffende vervoerder. Je hebt daar 7 dagen om het op te halen met je legitimatie.",
  },
  {
    question: "Bezorgen jullie ook naar PostNL-afhaalpunten?",
    answer:
      "Nee, wij kunnen helaas niet direct naar PostNL-afhaalpunten versturen omdat we in onze branche geen contract met PostNL kunnen afsluiten. We verzenden alleen naar vaste huisadressen. Mis je het pakket op je huisadres, dan gaat het wel naar je dichtstbijzijnde afhaalpunt.",
  },
  {
    question: "Wordt er een handtekening gevraagd?",
    answer:
      "Nee. Standaard vragen we geen handtekening bij ontvangst - je pakket wordt gewoon bezorgd of in de brievenbus / bij de buren gelaten volgens de standaard PostNL/DPD-procedure.",
  },
  {
    question: "Wat is de maximale leveringstermijn?",
    answer:
      "Maximaal 14 dagen na verzending. Is je pakket na 14 dagen nog steeds niet aangekomen door vertraging of vermissing? Dan verzenden wij automatisch een nieuwe bestelling - zonder discussie.",
  },
  {
    question: "Kan ik meerdere producten tegelijk bestellen?",
    answer:
      "Ja. Alles gaat als een zending de deur uit, dus je betaalt eenmaal verzendkosten, ongeacht hoeveel doosjes je bestelt. Vanaf vijf items geldt bovendien automatisch bulk-korting.",
  },
];

const timeline = [
  { t: "Stap 1", h: "Bestelling geplaatst", d: "Je krijgt meteen je bestelnummer en de betaalgegevens op het scherm." },
  { t: "Stap 2", h: "Betaling binnen", d: "Je maakt het bedrag over per bankoverschrijving. Zodra we het zien, is je order in behandeling." },
  { t: "Stap 3", h: "Order ingepakt", d: "Wij controleren sterkte, batchcode en houdbaarheidsdatum per item en pakken neutraal in." },
  { t: "Stap 4", h: "Bij PostNL / DPD", d: "Zodra het label actief is, kun je het pakket volgen met track & trace." },
  { t: "Stap 5", h: "Bezorgd", d: "NL: tussen 09:00 en 21:30 aan je vaste huisadres. BE: 1-3 werkdagen. Rest EU: 3-5 werkdagen." },
];

export default function BezorgingPage() {
  return (
    <>
      <PageHero
        eyebrow="Bezorging"
        title="Snel verzonden, discreet verpakt, track & trace"
        intro="Wij verzenden zelf vanuit Nederland met PostNL of DPD, voor EUR 5 per bestelling. Je pakket gaat de deur uit zodra je betaling binnen is. Alleen naar vaste huisadressen - geen postbussen, geen afhaalpunten als aflever-optie."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {usps.map((u) => (
          <div key={u.title} className="rounded-md border border-border bg-surface p-5">
            <u.icon size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-text">{u.title}</h3>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{u.sub}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="font-display text-2xl text-text">Bezorgopties &amp; tarieven</h2>
        <p className="mt-2 text-sm text-text-muted">
          Verzending is altijd €10 (NL) of €15 (BE/EU). Wij rekenen deze kosten altijd door - geen gratis-verzending drempel.
        </p>
        <div className="mt-6 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-text-muted">
                <th className="px-5 py-3 font-medium">Methode</th>
                <th className="px-5 py-3 font-medium w-28">Tarief</th>
                <th className="px-5 py-3 font-medium">Levertijd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {carriers.map((c) => (
                <tr key={c.name} className="bg-background">
                  <td className="px-5 py-4 font-medium text-text">{c.name}</td>
                  <td className="px-5 py-4 tabular text-text">{c.cost}</td>
                  <td className="px-5 py-4 text-text-muted">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-text-subtle">
          Een bestelling is altijd een zending, dus je betaalt eenmaal verzendkosten hoeveel doosjes je ook bestelt.
        </p>
      </section>

      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-accent font-semibold">Tijdlijn</p>
            <h2 className="mt-2 font-display text-2xl text-text">Van bestelling tot deurmat</h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Transparant per stap. Je weet altijd waar je pakket zich bevindt.
            </p>
          </div>
          <ol className="space-y-5">
            {timeline.map((s) => (
              <li key={s.h} className="grid grid-cols-[110px_1fr] gap-4 items-start">
                <span className="text-xs uppercase tracking-[0.12em] text-text-subtle tabular pt-1">{s.t}</span>
                <div>
                  <p className="font-medium text-text">{s.h}</p>
                  <p className="text-sm text-text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Truck size={22} className="text-accent" />
            <h2 className="mt-3 font-display text-2xl text-text">Veelgestelde vragen</h2>
            <p className="mt-2 text-sm text-text-muted">
              Antwoord niet gevonden? Stuur een bericht via{" "}
              <Link href="/contact" className="text-accent hover:underline">contact</Link>.
            </p>
            <div className="mt-6 rounded-md border border-border bg-surface p-5 text-sm text-text-muted">
              <MapPin size={16} className="text-accent" />
              <p className="mt-2 font-medium text-text">Magazijn Nederland</p>
              <p>Verzending vanuit onze eigen NL-locatie.</p>
              <p className="mt-1 text-xs text-text-subtle">Geen bezoek mogelijk - alleen verzending.</p>
            </div>
          </div>
          <FaqAccordion items={faq} />
        </div>
      </section>
    </>
  );
}
