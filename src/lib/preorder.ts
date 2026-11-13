// Komt uit shop-core (src/lib/preorder.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
/**
 * Pre-order: een artikel dat nog onderweg is mag al besteld worden, met de
 * levertijd erbij.
 *
 * In de database staat een datum (`products.verwacht_op`) en niet een aantal
 * dagen: dan blijft "over 5 dagen" kloppen zonder dat iemand het bijwerkt, en
 * valt de tekst terug op "binnenkort leverbaar" zodra die datum verstreken is
 * in plaats van een belofte te doen over een dag die al voorbij is.
 *
 * De dagen worden in Nederlandse tijd geteld. Vercel draait op UTC, en tussen
 * middernacht en 01:00 (of 02:00 in de zomer) zit daar een dag verschil - dan
 * zou de winkel er een dag naast zitten.
 */

export type PreorderBron = {
  availability?: string | null;
  verwacht_op?: string | null;
};

export type Preorder = {
  /** Het aantal dagen tot de verwachte verzending; null zonder bruikbare datum. */
  dagen: number | null;
  /** "20 november", of null zonder datum. */
  datum: string | null;
  /** "vrijdag 20 november", of null zonder datum. */
  datumLang: string | null;
  /** Op de productpagina, naast de prijs: "Leverbaar over 5 dagen". */
  label: string;
  /** Op een productkaart, kort: "Pre-order - over 5 dagen". */
  kaartLabel: string;
  /** In de mand, bij de bestelling en in de mail. */
  verzendRegel: string;
};

const TIJDZONE = "Europe/Amsterdam";

/** Vandaag in Nederland, als YYYY-MM-DD. */
export function vandaagNL(nu: Date = new Date()): string {
  const d = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIJDZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(nu);
  return d; // en-CA geeft precies YYYY-MM-DD
}

/** Hele dagen tussen twee YYYY-MM-DD-dagen, zonder tijdzone-gedoe. */
function dagenTussen(vanaf: string, tot: string): number {
  const a = Date.parse(vanaf + "T00:00:00Z");
  const b = Date.parse(tot + "T00:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/** Staat dit product op pre-order? */
export function isPreorder(p: PreorderBron | null | undefined): boolean {
  return (p?.availability || "") === "PreOrder";
}

/**
 * De teksten voor een pre-order, of null als het product er geen is.
 *
 * `nu` is er voor de tests; in de winkel blijft die leeg.
 */
export function preorder(p: PreorderBron | null | undefined, nu?: Date): Preorder | null {
  if (!isPreorder(p)) return null;

  const ruw = (p?.verwacht_op || "").slice(0, 10);
  const geldig = /^\d{4}-\d{2}-\d{2}$/.test(ruw);
  const dagen = geldig ? dagenTussen(vandaagNL(nu), ruw) : null;

  // Een datum die al voorbij is, is geen levertijd meer. Dan liever geen
  // getal dan een verkeerd getal: de klant mag nog bestellen, maar hij krijgt
  // geen dag te horen die we niet waar kunnen maken.
  if (dagen == null || dagen < 0) {
    return {
      dagen: null,
      datum: null,
      datumLang: null,
      label: "Binnenkort leverbaar",
      kaartLabel: "Pre-order",
      verzendRegel:
        "Dit artikel is onderweg. Je kunt het nu al bestellen; we verzenden het zodra de zending binnen is.",
    };
  }

  const dag = new Date(ruw + "T12:00:00Z");
  const datum = new Intl.DateTimeFormat("nl-NL", {
    timeZone: TIJDZONE,
    day: "numeric",
    month: "long",
  }).format(dag);
  const datumLang = new Intl.DateTimeFormat("nl-NL", {
    timeZone: TIJDZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dag);

  const overDagen =
    dagen === 0 ? "vandaag" : dagen === 1 ? "morgen" : `over ${dagen} dagen`;
  const label =
    dagen === 0
      ? "Vandaag leverbaar"
      : dagen === 1
        ? "Leverbaar vanaf morgen"
        : `Leverbaar over ${dagen} dagen`;
  const kaartLabel = `Pre-order - ${dagen === 0 ? "vandaag" : dagen === 1 ? "morgen" : `over ${dagen} dagen`}`;
  const verzendRegel =
    dagen === 0
      ? `Dit artikel is onderweg en wordt vandaag nog verzonden (${datumLang}).`
      : `Dit artikel is onderweg en wordt ${overDagen} verzonden, rond ${datumLang}.`;

  return { dagen, datum, datumLang, label, kaartLabel, verzendRegel };
}

/**
 * De regel voor een hele bestelling: welk artikel wacht er, en wanneer gaat de
 * zending de deur uit. Alles gaat in één zending, dus de verste datum bepaalt.
 */
export function preorderVoorMand(
  items: { name: string; availability?: string | null; verwacht_op?: string | null }[],
  nu?: Date,
): { namen: string[]; datum: string | null; dagen: number | null; regel: string } | null {
  const wachters = items.filter((it) => isPreorder(it));
  if (wachters.length === 0) return null;

  let verst: Preorder | null = null;
  for (const it of wachters) {
    const po = preorder(it, nu);
    if (!po) continue;
    // Zonder datum (of met een verstreken datum) is de uitkomst onbekend, en
    // dat weegt zwaarder dan elke datum die we wel weten.
    if (!verst || po.dagen == null || (verst.dagen != null && po.dagen > verst.dagen)) verst = po;
  }

  const namen = wachters.map((it) => it.name);
  const lijst =
    namen.length === 1
      ? namen[0]
      : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;

  if (!verst || verst.dagen == null) {
    return {
      namen,
      datum: null,
      dagen: null,
      regel: `${lijst} ${namen.length === 1 ? "is" : "zijn"} nog onderweg. Je bestelling gaat in één zending de deur uit, zodra dat artikel binnen is.`,
    };
  }

  const wanneer =
    verst.dagen === 0 ? "vandaag" : verst.dagen === 1 ? "morgen" : `over ${verst.dagen} dagen`;
  return {
    namen,
    datum: verst.datumLang,
    dagen: verst.dagen,
    regel: `${lijst} ${namen.length === 1 ? "is" : "zijn"} nog onderweg. Je bestelling gaat ${wanneer} in één zending de deur uit, rond ${verst.datumLang}.`,
  };
}

/**
 * Wat er in de schema.org-offer hoort te staan.
 *
 * Een pre-order als "InStock" aanmelden is onjuiste productdata: Google
 * vergelijkt dat met de pagina, waar de levertijd wel staat. PreOrder is een
 * bestaande waarde en vertelt precies wat het is.
 */
export function schemaAvailability(p: PreorderBron | null | undefined): string {
  const a = p?.availability || "";
  if (a === "PreOrder") return "https://schema.org/PreOrder";
  if (a === "OutOfStock") return "https://schema.org/OutOfStock";
  if (a === "BackOrder") return "https://schema.org/BackOrder";
  if (a === "Discontinued") return "https://schema.org/Discontinued";
  return "https://schema.org/InStock";
}
