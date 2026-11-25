import type { Product } from "@/lib/supabase";

/**
 * Wat je in plaats hiervan kunt nemen.
 *
 * Staat een product uitverkocht of op pre-order, dan is de pagina een
 * doodlopende weg: de klant kan zijn e-mailadres achterlaten of weggaan. Terwijl
 * er bijna altijd iets met dezelfde werkzame stof en dezelfde sterkte op de
 * plank ligt. Dat hoort op die pagina te staan, niet alleen onderaan tussen de
 * gerelateerde producten.
 *
 * Alleen wat er echt ligt telt mee: een pre-order is geen alternatief voor een
 * uitverkocht artikel, want dan ben je nog steeds aan het wachten.
 *
 * De volgorde: eerst dezelfde werkzame stof, dan dezelfde vorm (tablet, jelly,
 * kauwtablet), dan dezelfde categorie, en bij gelijke stand het dichtst bij de
 * prijs van het product dat de klant wilde. Dat laatste voorkomt dat iemand die
 * naar een artikel van 11 euro keek een alternatief van 30 euro voorgeschoteld
 * krijgt.
 */

type Kandidaat = Product & { rating_value?: number | null; rating_count?: number };

/** Basisnaam zonder de "(datum ...)"-toevoeging, om varianten te herkennen. */
function basisnaam(naam: string): string {
  return naam.replace(/\s*\(datum [^)]*\)\s*$/i, "").trim().toLowerCase();
}

export function alternatievenVoor(product: Product, alle: Kandidaat[], max = 3): Kandidaat[] {
  const eigenStoffen = new Set((product.stof_slugs || []).map((s) => s.toLowerCase()));
  const eigenBasis = basisnaam(product.name);

  const gescoord = alle
    .filter((p) => {
      if (p.id === product.id) return false;
      // Alleen wat vandaag verzonden kan worden.
      if ((p.availability || "InStock") !== "InStock") return false;
      // Een datum-variant van hetzelfde artikel is geen alternatief maar
      // hetzelfde product; die staat al in de variantkiezer.
      if (basisnaam(p.name) === eigenBasis) return false;
      return true;
    })
    .map((p) => {
      const stoffen = (p.stof_slugs || []).map((s) => s.toLowerCase());
      const zelfdeStof = stoffen.some((s) => eigenStoffen.has(s));
      const zelfdeVorm = !!p.package_type && p.package_type === product.package_type;
      const zelfdeCategorie = !!p.category_id && p.category_id === product.category_id;

      let score = 0;
      if (zelfdeStof) score += 4;
      if (zelfdeVorm) score += 2;
      if (zelfdeCategorie) score += 1;

      return { p, score, prijsverschil: Math.abs((p.price_cents || 0) - (product.price_cents || 0)) };
    })
    // Zonder gedeelde stof of categorie is het geen alternatief maar zomaar
    // een ander product; dan liever niets tonen.
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.prijsverschil - b.prijsverschil);

  return gescoord.slice(0, max).map((x) => x.p);
}
