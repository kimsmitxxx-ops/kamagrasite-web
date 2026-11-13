// Komt uit shop-core (src/lib/use-preorder.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
"use client";
import { useEffect, useState } from "react";
import { preorder, preorderVoorMand, type Preorder } from "./preorder";

type Rij = { slug: string; name: string; availability: string | null; verwacht_op: string | null };

/**
 * Wat er in deze mand nog onderweg is, opgehaald bij de winkel zelf.
 *
 * Waarom niet uit de mand: die staat in de localStorage van de bezoeker en
 * blijft daar weken staan. Een pre-orderdatum die we daarin zouden meeschrijven
 * is morgen misschien niet meer waar - en een verzenddatum beloven die niet
 * meer klopt is erger dan hem niet noemen. Daarom vraagt de mand het op bij
 * /api/preorder, dat de stand van nu uit de database leest.
 *
 * `slugs` zijn de id's van de regels in de mand; `cart.add` zet daar de slug
 * van het product in.
 */
export function usePreorderMand(slugs: string[]): {
  /** Per slug de pre-ordertekst, alleen voor wat echt op pre-order staat. */
  perSlug: Record<string, Preorder>;
  /** Eén regel over de hele bestelling, of null als er niets wacht. */
  regel: string | null;
  /** Het aantal dagen tot de zending de deur uit gaat; null als dat niet vast staat. */
  dagen: number | null;
} {
  const sleutel = slugs.slice().sort().join(",");
  const [rijen, setRijen] = useState<Rij[]>([]);

  useEffect(() => {
    if (!sleutel) {
      setRijen([]);
      return;
    }
    let afgebroken = false;
    // Met de schuine streep erachter: deze shops draaien op
    // trailingSlash, en zonder streep kost elke vraag eerst een omleiding.
    fetch("/api/preorder/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: sleutel.split(",") }),
    })
      .then((r) => (r.ok ? r.json() : { producten: [] }))
      .then((d) => {
        if (!afgebroken) setRijen(Array.isArray(d?.producten) ? d.producten : []);
      })
      .catch(() => {
        // Stil: zonder antwoord staat er geen melding, en dat is beter dan een
        // datum verzinnen. De bevestigingsmail noemt de pre-order alsnog.
      });
    return () => {
      afgebroken = true;
    };
  }, [sleutel]);

  const perSlug: Record<string, Preorder> = {};
  for (const r of rijen) {
    const po = preorder(r);
    if (po) perSlug[r.slug] = po;
  }

  // Alleen de regels die nu in de mand zitten laten meetellen.
  const inMand = rijen.filter((r) => slugs.includes(r.slug));
  const mand = preorderVoorMand(inMand);

  return { perSlug, regel: mand ? mand.regel : null, dagen: mand ? mand.dagen : null };
}
