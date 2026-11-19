/**
 * Steden voor de stadskiezer.
 *
 * Waarom een lijst in de code en geen pagina per stad: een eigen pagina voor
 * elke plaats levert tientallen teksten op die alleen in de plaatsnaam
 * verschillen, en dat is precies het sjabloon dat de acht bestaande
 * stadspagina's nu al zijn. De kiezer geeft het antwoord in plaats daarvan
 * direct op de pagina. Blijkt uit de meting dat een stad vaak gevraagd wordt
 * (event `stad_gekozen`), dan krijgt die alsnog een echte eigen pagina.
 *
 * Per stad staan alleen harde, naslaanbare gegevens: provincie, en voor de
 * acht steden met een eigen pagina het inwonertal van CBS (zie
 * INWONERS_BRON). Alles wat niet te controleren is blijft eruit. Er bestaat
 * bijvoorbeeld geen cijfer over hoeveel mensen per gemeente dit middel
 * gebruiken, en dat terugrekenen uit een landelijk percentage zou betekenen
 * dat we een gezondheidsstatistiek verzinnen.
 */

export type Land = "NL" | "BE";

export interface Stad {
  naam: string;
  /** Provincie; bij BE de Belgische provincie. */
  provincie: string;
  land: Land;
  /** Andere schrijfwijzen waarop iemand kan zoeken. */
  alias?: string[];
  /** Slug van de eigen pagina, als die bestaat (buy_pages met tag 'stad'). */
  pagina?: string;
  /**
   * Inwonertal volgens CBS. Alleen ingevuld voor steden met een eigen pagina;
   * zie INWONERS_BRON voor tabel en peilmoment.
   */
  inwoners?: number;
}

export const STEDEN: Stad[] = [
  // --- Nederland ---
  { naam: "Amsterdam", provincie: "Noord-Holland", land: "NL", inwoners: 950787, pagina: "kamagra-amsterdam" },
  { naam: "Rotterdam", provincie: "Zuid-Holland", land: "NL", inwoners: 675253, pagina: "kamagra-rotterdam" },
  { naam: "Den Haag", provincie: "Zuid-Holland", land: "NL", alias: ["s-Gravenhage", "Gravenhage"], inwoners: 568749, pagina: "kamagra-den-haag" },
  { naam: "Utrecht", provincie: "Utrecht", land: "NL", inwoners: 379523, pagina: "utrecht" },
  { naam: "Eindhoven", provincie: "Noord-Brabant", land: "NL", inwoners: 250896, pagina: "eindhoven" },
  { naam: "Groningen", provincie: "Groningen", land: "NL", inwoners: 244469, pagina: "kamagra-groningen" },
  { naam: "Nijmegen", provincie: "Gelderland", land: "NL", inwoners: 190483, pagina: "nijmegen" },
  { naam: "Leeuwarden", provincie: "Friesland", land: "NL", inwoners: 130862, pagina: "leeuwarden" },
  { naam: "Tilburg", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Almere", provincie: "Flevoland", land: "NL" },
  { naam: "Breda", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Apeldoorn", provincie: "Gelderland", land: "NL" },
  { naam: "Arnhem", provincie: "Gelderland", land: "NL" },
  { naam: "Haarlem", provincie: "Noord-Holland", land: "NL" },
  { naam: "Enschede", provincie: "Overijssel", land: "NL" },
  { naam: "Amersfoort", provincie: "Utrecht", land: "NL" },
  { naam: "Zaandam", provincie: "Noord-Holland", land: "NL", alias: ["Zaanstad"] },
  { naam: "Hoofddorp", provincie: "Noord-Holland", land: "NL", alias: ["Haarlemmermeer"] },
  { naam: "Zwolle", provincie: "Overijssel", land: "NL" },
  { naam: "Leiden", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Maastricht", provincie: "Limburg", land: "NL" },
  { naam: "Dordrecht", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Ede", provincie: "Gelderland", land: "NL" },
  { naam: "Alphen aan den Rijn", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Alkmaar", provincie: "Noord-Holland", land: "NL" },
  { naam: "Emmen", provincie: "Drenthe", land: "NL" },
  { naam: "Delft", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Venlo", provincie: "Limburg", land: "NL" },
  { naam: "Deventer", provincie: "Overijssel", land: "NL" },
  { naam: "Helmond", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Oss", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Hilversum", provincie: "Noord-Holland", land: "NL" },
  { naam: "Heerlen", provincie: "Limburg", land: "NL" },
  { naam: "Amstelveen", provincie: "Noord-Holland", land: "NL" },
  { naam: "Roosendaal", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Purmerend", provincie: "Noord-Holland", land: "NL" },
  { naam: "Schiedam", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Spijkenisse", provincie: "Zuid-Holland", land: "NL", alias: ["Nissewaard"] },
  { naam: "Lelystad", provincie: "Flevoland", land: "NL" },
  { naam: "Hengelo", provincie: "Overijssel", land: "NL" },
  { naam: "Vlaardingen", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Gouda", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Assen", provincie: "Drenthe", land: "NL" },
  { naam: "Hoorn", provincie: "Noord-Holland", land: "NL" },
  { naam: "Bergen op Zoom", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Capelle aan den IJssel", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Veenendaal", provincie: "Utrecht", land: "NL" },
  { naam: "Katwijk", provincie: "Zuid-Holland", land: "NL" },
  { naam: "Zeist", provincie: "Utrecht", land: "NL" },
  { naam: "Nieuwegein", provincie: "Utrecht", land: "NL" },
  { naam: "Den Bosch", provincie: "Noord-Brabant", land: "NL", alias: ["s-Hertogenbosch", "Hertogenbosch"] },
  { naam: "Sittard", provincie: "Limburg", land: "NL", alias: ["Sittard-Geleen", "Geleen"] },
  { naam: "Doetinchem", provincie: "Gelderland", land: "NL" },
  { naam: "Kerkrade", provincie: "Limburg", land: "NL" },
  { naam: "Middelburg", provincie: "Zeeland", land: "NL" },
  { naam: "Vlissingen", provincie: "Zeeland", land: "NL" },
  { naam: "Terneuzen", provincie: "Zeeland", land: "NL" },
  { naam: "Harderwijk", provincie: "Gelderland", land: "NL" },
  { naam: "Roermond", provincie: "Limburg", land: "NL" },
  { naam: "Hoogeveen", provincie: "Drenthe", land: "NL" },
  { naam: "Heerenveen", provincie: "Friesland", land: "NL" },
  { naam: "Sneek", provincie: "Friesland", land: "NL" },
  { naam: "Drachten", provincie: "Friesland", land: "NL" },
  { naam: "Almelo", provincie: "Overijssel", land: "NL" },
  { naam: "Tiel", provincie: "Gelderland", land: "NL" },
  { naam: "Zutphen", provincie: "Gelderland", land: "NL" },
  { naam: "Wageningen", provincie: "Gelderland", land: "NL" },
  { naam: "Woerden", provincie: "Utrecht", land: "NL" },
  { naam: "Houten", provincie: "Utrecht", land: "NL" },
  { naam: "Barneveld", provincie: "Gelderland", land: "NL" },
  { naam: "Waalwijk", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Uden", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Veldhoven", provincie: "Noord-Brabant", land: "NL" },
  { naam: "Oosterhout", provincie: "Noord-Brabant", land: "NL" },

  // --- Belgie ---
  { naam: "Antwerpen", provincie: "Antwerpen", land: "BE" },
  { naam: "Gent", provincie: "Oost-Vlaanderen", land: "BE" },
  { naam: "Brussel", provincie: "Brussels Hoofdstedelijk Gewest", land: "BE", alias: ["Bruxelles"] },
  { naam: "Charleroi", provincie: "Henegouwen", land: "BE" },
  { naam: "Luik", provincie: "Luik", land: "BE", alias: ["Liege"] },
  { naam: "Brugge", provincie: "West-Vlaanderen", land: "BE" },
  { naam: "Namen", provincie: "Namen", land: "BE", alias: ["Namur"] },
  { naam: "Leuven", provincie: "Vlaams-Brabant", land: "BE" },
  { naam: "Mechelen", provincie: "Antwerpen", land: "BE" },
  { naam: "Hasselt", provincie: "Limburg", land: "BE" },
  { naam: "Kortrijk", provincie: "West-Vlaanderen", land: "BE" },
  { naam: "Oostende", provincie: "West-Vlaanderen", land: "BE" },
  { naam: "Aalst", provincie: "Oost-Vlaanderen", land: "BE" },
  { naam: "Genk", provincie: "Limburg", land: "BE" },
  { naam: "Sint-Niklaas", provincie: "Oost-Vlaanderen", land: "BE" },
  { naam: "Roeselare", provincie: "West-Vlaanderen", land: "BE" },
  { naam: "Turnhout", provincie: "Antwerpen", land: "BE" },
];

/** Kleine letters, zonder accenten, leestekens en spaties: zo matcht "Den Haag" ook op "denhaag". */
export function normaliseer(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Zoekt op naam en op alias; geeft niets terug bij een lege invoer. */
export function zoekSteden(invoer: string, land?: Land, max = 6): Stad[] {
  const q = normaliseer(invoer);
  if (!q) return [];
  const kandidaten = land ? STEDEN.filter((s) => s.land === land) : STEDEN;
  const treffers = kandidaten.filter((s) =>
    [s.naam, ...(s.alias ?? [])].some((n) => normaliseer(n).includes(q))
  );
  // Wie met de naam begint staat vooraan: op "ha" hoort Haarlem boven Den Haag.
  treffers.sort((a, b) => {
    const aBegint = normaliseer(a.naam).startsWith(q) ? 0 : 1;
    const bBegint = normaliseer(b.naam).startsWith(q) ? 0 : 1;
    if (aBegint !== bBegint) return aBegint - bBegint;
    return a.naam.localeCompare(b.naam, "nl");
  });
  return treffers.slice(0, max);
}

/** Exacte match op naam of alias, voor een ingetypte stad zonder klik. */
export function vindStad(invoer: string, land?: Land): Stad | null {
  const q = normaliseer(invoer);
  if (!q) return null;
  const kandidaten = land ? STEDEN.filter((s) => s.land === land) : STEDEN;
  return (
    kandidaten.find((s) => [s.naam, ...(s.alias ?? [])].some((n) => normaliseer(n) === q)) ?? null
  );
}

/**
 * Waar de inwonertallen vandaan komen. Opgehaald bij CBS en niet geschat:
 * tabel 37230ned (Bevolkingsontwikkeling; regio per maand), stand eind
 * september 2026. Zet je nieuwe steden erbij, haal het cijfer dan bij dezelfde
 * tabel op in plaats van het ergens over te typen.
 */
export const INWONERS_BRON = {
  bron: "CBS",
  tabel: "37230ned",
  peilmoment: "september 2026",
} as const;

export const STEDEN_MET_PAGINA = STEDEN.filter((s) => s.pagina);
