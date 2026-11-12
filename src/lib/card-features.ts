// Komt uit shop-core (src/lib/card-features.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
/**
 * De drie kenmerken onder een productkaart. Staat hier en niet in
 * product-card.tsx omdat dat een client-component is: importeert een
 * server-component daar een functie uit, dan krijgt die een client-verwijzing
 * in plaats van de functie zelf, en klapt de render om op "is not a function".
 * /winkel/ roept dit aan de serverkant aan zodat alleen deze drie korte
 * regels naar de browser gaan in plaats van de volledige usps en subtitle.
 */
export function toFeatures(text?: string, explicitUsps?: string[] | null): string[] {
  if (explicitUsps && explicitUsps.length > 0) {
    return explicitUsps.slice(0, 3);
  }
  if (!text) return [];
  return text
    .split(/(?:\.\s+|,\s+)/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter((s) => s.length > 4)
    .slice(0, 3);
}
