import { Sparkles, PartyPopper } from "lucide-react";
import { nextTier, unitDiscountPct } from "@/lib/bulk-discount";

/**
 * Voortgang naar de volgende bulk-staffel, voor één regel in de mand.
 *
 * De mand liet alleen zien welke korting je al had. Dat is de helft van het
 * verhaal: iemand met twee doosjes zit één stap van 10% af en kon dat nergens
 * zien. Overgenomen van kamagrashop, maar daar hangt de staffel aan het
 * bedrag en hier aan het aantal per regel, dus de balk staat bij de regel en
 * niet bij het mandtotaal.
 *
 * `compact` laat de balk weg en houdt alleen de regel tekst over, voor de
 * lade waar weinig ruimte is.
 */
export function BulkVoortgang({ qty, compact = false }: { qty: number; compact?: boolean }) {
  const volgende = nextTier(qty);

  if (!volgende) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-accent">
        <PartyPopper size={11} className="shrink-0" />
        Hoogste bulk-korting van {unitDiscountPct(qty)}% gehaald
      </p>
    );
  }

  const stuks = volgende.remaining === 1 ? "1 stuk" : `${volgende.remaining} stuks`;

  return (
    <div className="mt-2">
      {/* Geen inline-flex: dan breekt de zin op een smal scherm tussen de
          losse stukken af en staat "1 stuk" op een eigen regel. Zo loopt hij
          als gewone tekst door, met het icoon ervoor. */}
      <p className="flex items-start gap-1.5 text-[11px] text-text-muted">
        <Sparkles size={11} className="mt-[2px] shrink-0 text-accent" />
        <span>
          Nog <strong className="tabular text-text">{stuks}</strong> tot {volgende.pct}% bulk-korting
        </span>
      </p>
      {!compact && (
        <div className="mt-1 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-paper-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${volgende.progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default BulkVoortgang;
