import { Info } from "lucide-react";

/**
 * De melding boven het grid als er uitverkochte artikelen tussen staan.
 *
 * Van kamagrashop overgenomen, en om dezelfde reden: 14 van de 39 artikelen
 * liggen hier niet op de plank. Wie dat voor het eerst ziet denkt dat de winkel
 * leegstaat, terwijl er bijna altijd iets met dezelfde werkzame stof en
 * dezelfde sterkte wél direct weg kan.
 *
 * Geen datum en geen belofte: op kamagrashop stond hier een "we verwachten
 * rond <datum> weer alles op voorraad", en die datum werd uitgerekend als
 * vandaag plus drie weken, dus hij schoof elke dag mee en kwam nooit. Wat
 * onderweg is heeft een echte verwachte datum, en die staat op de
 * productpagina zelf.
 *
 * Alleen op de winkel- en categoriepagina's, waar die uitverkochte artikelen
 * ook echt in de lijst staan. Niet op de homepage.
 */
export function Voorraadmelding() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-paper-border bg-paper-soft p-4">
      <Info size={18} className="mt-0.5 shrink-0 text-accent" />
      <div className="text-sm">
        <p className="font-semibold text-text">Niet alles ligt op dit moment op de plank</p>
        <p className="mt-1 text-text-muted">
          Een deel van het assortiment staat uitverkocht. Er is bijna altijd een alternatief met
          dezelfde werkzame stof en dezelfde sterkte dat wel direct verzonden wordt; op elke
          uitverkochte productpagina staan die alternatieven erbij. Is een artikel onderweg, dan zie
          je op de pagina zelf wanneer we het verwachten en kun je het nu al bestellen.
        </p>
      </div>
    </div>
  );
}

export default Voorraadmelding;
