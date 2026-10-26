import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shop/page-hero";

export const metadata: Metadata = {
  title: "Algemene voorwaarden - Kamagra Site",
  description:
    "De algemene voorwaarden van Kamagra Site B.V.: bestelproces, betaling, levering, garantie, aansprakelijkheid en herroepingsrecht.",
};

export const revalidate = 86400;

const sections: { id: string; title: string; body: string[] }[] = [
  {
    id: "definities",
    title: "1. Definities",
    body: [
      "Kamagra Site: Kamagra Site B.V., gevestigd in Nederland. Ons vestigingsadres, KvK- en BTW-nummer staan op de factuur die je na je bestelling ontvangt.",
      "Klant: de natuurlijke of rechtspersoon die een overeenkomst aangaat met Kamagra Site.",
      "Producten: alle door Kamagra Site aangeboden artikelen, te weten generieke geneesmiddelen met sildenafil, tadalafil, vardenafil of dapoxetine als werkzame stof.",
    ],
  },
  {
    id: "toepasselijkheid",
    title: "2. Toepasselijkheid",
    body: [
      "Deze voorwaarden zijn van toepassing op elk aanbod van Kamagra Site en op elke tot stand gekomen overeenkomst tussen Kamagra Site en klant.",
      "Voordat een overeenkomst wordt gesloten, wordt de tekst van deze voorwaarden langs elektronische weg ter beschikking gesteld.",
    ],
  },
  {
    id: "aanbod",
    title: "3. Het aanbod",
    body: [
      "Alle aanbiedingen op de website zijn vrijblijvend en zolang de voorraad strekt.",
      "Het aanbod bevat een volledige en nauwkeurige omschrijving, inclusief werkzame stof, sterkte, toedieningsvorm en fabrikant.",
      "Kennelijke vergissingen of fouten in het aanbod binden Kamagra Site niet.",
    ],
  },
  {
    id: "overeenkomst",
    title: "4. Totstandkoming overeenkomst",
    body: [
      "De overeenkomst komt tot stand op het moment dat de klant het aanbod heeft aanvaard via een bestelling en de betaling door Kamagra Site is bevestigd.",
      "Kamagra Site kan zich binnen wettelijke kaders op de hoogte stellen of de klant aan zijn betalingsverplichtingen kan voldoen.",
    ],
  },
  {
    id: "retour-en-terugbetaling",
    title: "5. Retour en terugbetaling",
    body: [
      "Vanwege de aard van onze producten en de vertrouwelijke branche waarin wij opereren, kunnen wij geen fysiek retour-adres publiek voeren. Retourzendingen zijn daarom niet mogelijk.",
      "Terugbetaling van een geplaatste en betaalde bestelling is niet mogelijk. Zodra de betaling bij ons binnen is, gaat de bestelling in behandeling en kan er niet meer worden geannuleerd of teruggedraaid.",
      "Komt je pakket door vertraging of vermissing niet aan? Dan sturen wij binnen 14 dagen na de oorspronkelijke verzenddatum kosteloos een nieuwe zending - zonder discussie.",
      "Zijn bepaalde items op het moment van verwerking niet leverbaar? Dan bieden wij alternatieve items van gelijke waarde aan, of verzenden we die items apart na zodra ze weer op voorraad zijn.",
    ],
  },
  {
    id: "prijzen",
    title: "6. Prijzen en betaling",
    body: [
      "De op de website vermelde prijzen zijn in euro's en inclusief 21% BTW.",
      "Betaling vindt plaats via bank-overboeking (IBAN) of crypto (BTC/ETH/USDT). Zodra de betaling bij ons binnen is, gaat de bestelling in behandeling.",
      "Kamagra Site behoudt zich het recht voor prijzen te wijzigen; eenmaal geplaatste orders blijven ongewijzigd.",
    ],
  },
  {
    id: "levering",
    title: "7. Levering",
    body: [
      "Kamagra Site neemt de grootst mogelijke zorgvuldigheid in acht bij ontvangst en uitvoering van bestellingen.",
      "Het adres dat door de klant is opgegeven, geldt als plaats van levering. Wij verzenden uitsluitend naar vaste huisadressen (geen PostNL-afhaalpunten als aflever-optie).",
      "Genoemde levertijden zijn indicatief. De maximale leveringstermijn bedraagt 14 dagen, gerekend vanaf de dag na verzending. Is het pakket dan nog niet aangekomen, dan verzenden wij automatisch opnieuw.",
      "Het risico van beschadiging en vermissing gaat over op de klant op het moment van bezorging aan het opgegeven huisadres.",
    ],
  },
  {
    id: "garantie",
    title: "8. Conformiteit van de levering",
    body: [
      "Kamagra Site staat ervoor in dat het geleverde product overeenkomt met de werkzame stof, de sterkte, de toedieningsvorm en de fabrikant zoals vermeld op de productpagina, en dat de verpakking ongeopend en voorzien van batchcode en houdbaarheidsdatum wordt geleverd.",
      "Wijkt de levering daarvan af, of is de verpakking bij ontvangst beschadigd, dan vervangt Kamagra Site het product kosteloos in de volgende zending. Meld dit binnen veertien dagen na ontvangst via het contactformulier, met foto van doos en blister.",
    ],
  },
  {
    id: "aansprakelijkheid",
    title: "9. Aansprakelijkheid en verantwoord gebruik",
    body: [
      "De producten van Kamagra Site zijn geneesmiddelen die in Nederland gewoonlijk op recept via de apotheek worden verstrekt. Kamagra Site levert zonder recept en verstrekt geen medisch advies op maat; er vindt dus geen beoordeling door een arts plaats.",
      "De klant verklaart meerderjarig te zijn en verantwoordelijk te zijn voor een veilig gebruik. Dat betekent in elk geval: niet gebruiken in combinatie met nitraten, poppers of riociguat, en eerst een arts raadplegen bij hart- en vaatziekten, een recent infarct of beroerte, een lage of slecht ingestelde bloeddruk, lever- of nierproblemen of bij gebruik van alfablokkers.",
      "Kamagra Site aanvaardt geen aansprakelijkheid voor schade die voortvloeit uit gebruik dat afwijkt van de gebruikelijke dosering of uit gebruik ondanks een van de hierboven genoemde contra-indicaties.",
    ],
  },
  {
    id: "klachten",
    title: "10. Klachtenregeling",
    body: [
      "Klachten over de uitvoering van de overeenkomst dienen binnen redelijke termijn, volledig en duidelijk omschreven, te worden ingediend bij Kamagra Site via het contactformulier op de website.",
      "Kamagra Site reageert binnen 14 dagen na ontvangst van de klacht met een inhoudelijke reactie of een indicatie van de termijn waarop dat gebeurt.",
      "Komen klant en Kamagra Site er onderling niet uit, dan kan het geschil worden voorgelegd aan de bevoegde rechter te Rotterdam.",
    ],
  },
  {
    id: "toepasselijk-recht",
    title: "11. Toepasselijk recht",
    body: [
      "Op overeenkomsten tussen Kamagra Site en klant is uitsluitend Nederlands recht van toepassing.",
    ],
  },
];

export default function VoorwaardenPage() {
  return (
    <>
      <PageHero
        eyebrow="Juridisch"
        title="Algemene voorwaarden Kamagra Site B.V."
        intro="Versie 3.2 - laatst bijgewerkt op 12 juni 2026. Deze voorwaarden gelden voor elke bestelling die je via onze webshop plaatst."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-10 lg:grid-cols-[260px_1fr]">
        <nav className="lg:sticky lg:top-28 self-start">
          <p className="text-xs uppercase tracking-[0.15em] text-text-subtle mb-3">Inhoud</p>
          <ul className="space-y-2 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-text-muted hover:text-accent">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose-clean max-w-3xl space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-display text-2xl text-text">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm text-text-muted leading-relaxed">
                {s.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-md border border-border bg-surface p-5 text-sm text-text-muted">
            Vragen over deze voorwaarden? Stel ze via het{" "}
            <Link href="/contact" className="text-accent hover:underline">
              contactformulier
            </Link>
            .
          </div>
        </article>
      </section>
    </>
  );
}
