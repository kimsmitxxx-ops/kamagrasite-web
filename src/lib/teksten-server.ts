// Komt uit shop-core (src/lib/teksten-server.ts). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
import "server-only";
import { TEKSTEN } from "@/lib/teksten-config";

/**
 * Teksten die in shop-dash zijn aangepast over de woordenlijst van deze site
 * heen leggen (shop-dash migratie 109 en 110).
 *
 * Eén systeem voor alle shops. De verdeling:
 *
 *   src/lib/teksten-config.ts   per repo: welke shop dit is en welke
 *                               woordenlijst erbij hoort
 *   src/lib/teksten/nl.ts       per repo: de woordenlijst zelf, de bron van
 *                               alle tekst zolang niemand iets aanpast
 *   teksten.config.mjs          per repo: waar het registratiescript de
 *                               woordenlijst en de indeling vindt
 *   dit bestand                 uit shop-core, overal gelijk
 *
 * Waarom de afwijkingen over de code heen en niet in plaats daarvan: een
 * tekstwijziging in een nieuwe deploy blijft dan doorkomen voor alles wat
 * niemand heeft aangepast, en "terug naar standaard" in het dashboard is
 * simpelweg de rij weggooien.
 *
 * Alleen aanroepen vanaf de server: dit gebruikt de shop-sleutel.
 */

/**
 * De lijst wordt bij elk paginaverzoek opgevraagd, dus hij blijft een minuut
 * hangen. Een tekst die een minuut achterloopt kan; een databasebevraging per
 * bezoeker niet. Het dashboard purgt de pagina na opslaan, dus in de praktijk
 * staat het er meteen op.
 */
const CACHE_MS = 60_000;
let cache: { waarde: Afwijking[]; tot: number } | null = null;

type Afwijking = { sleutel: string; merk: string; waarde: unknown };

function url() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rexqfwibxawqnvrzbdoo.supabase.co";
}

async function haalAfwijkingen(): Promise<Afwijking[]> {
  if (cache && cache.tot > Date.now()) return cache.waarde;

  const key = process.env.SUPABASE_SHOP_KEY || "";
  if (!key || !TEKSTEN.shopId) return cache?.waarde ?? [];

  try {
    const r = await fetch(
      `${url()}/rest/v1/site_teksten?shop_id=eq.${TEKSTEN.shopId}&select=sleutel,merk,waarde`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      },
    );
    if (!r.ok) throw new Error(String(r.status));
    const rijen = (await r.json()) as Afwijking[];
    if (!Array.isArray(rijen)) throw new Error("geen lijst");
    cache = { waarde: rijen, tot: Date.now() + CACHE_MS };
    return rijen;
  } catch {
    // Database even onbereikbaar: de teksten uit de code zijn een prima site.
    return cache?.waarde ?? [];
  }
}

/**
 * Eén waarde op een puntpad zetten, zonder de woordenlijst zelf aan te raken.
 *
 * De woordenlijst is een module-constante: die muteren zou de aangepaste
 * tekst van het ene verzoek aan het volgende doorgeven, en bij een merk-eigen
 * tekst zelfs aan het verkeerde merk. Daarom wordt alleen het pad naar de
 * sleutel gekopieerd; de rest blijft gedeeld, dus dit kost niets.
 *
 * Een pad dat niet bestaat wordt overgeslagen: een sleutel die uit de code is
 * verdwenen mag geen vreemde tak in het woordenboek aanmaken.
 */
function metPad<T>(bron: T, pad: string[], waarde: unknown): T {
  const [kop, ...rest] = pad;
  if (!bron || typeof bron !== "object" || Array.isArray(bron)) return bron;
  const object = bron as Record<string, unknown>;
  if (!(kop in object)) return bron;

  if (rest.length === 0) {
    // De vorm moet kloppen: tekst blijft tekst, lijst blijft lijst. Anders
    // krijgt een component iets wat hij niet kan weergeven.
    const huidig = object[kop];
    const past =
      (typeof huidig === "string" && typeof waarde === "string") ||
      (Array.isArray(huidig) && Array.isArray(waarde));
    if (!past) return bron;
    return { ...object, [kop]: waarde } as T;
  }

  const kind = metPad(object[kop], rest, waarde);
  if (kind === object[kop]) return bron;
  return { ...object, [kop]: kind } as T;
}

/**
 * De aangepaste teksten over een woordenlijst heen leggen.
 *
 * `merkSlug` is alleen nodig bij een shop die meerdere merken op dezelfde
 * shop-rij bedient; een tekst die voor dat merk apart is aangepast wint dan
 * van de shopbrede tekst ('*').
 */
export async function metTeksten<T extends object>(basis: T, merkSlug = "*"): Promise<T> {
  const afwijkingen = await haalAfwijkingen();
  if (afwijkingen.length === 0) return basis;

  let dict = basis;
  // Eerst shopbreed, daarna het merk: het merk overschrijft dus.
  const opVolgorde = [...afwijkingen].sort(
    (a, b) => (a.merk === "*" ? -1 : 0) - (b.merk === "*" ? -1 : 0),
  );
  for (const rij of opVolgorde) {
    if (rij.merk !== "*" && rij.merk !== merkSlug) continue;
    if (typeof rij.sleutel !== "string" || !rij.sleutel) continue;
    dict = metPad(dict, rij.sleutel.split("."), rij.waarde);
  }
  return dict;
}

/**
 * De woordenlijst van deze site, met de aangepaste teksten erin. Dit is wat
 * een pagina hoort te gebruiken.
 *
 * Een site met meerdere merken of talen geeft zijn eigen basis mee; de rest
 * roept hem zonder argumenten aan.
 */
export async function teksten<T extends object = typeof TEKSTEN.woordenlijst>(
  basis?: T,
  merkSlug = "*",
): Promise<T> {
  return metTeksten((basis ?? TEKSTEN.woordenlijst) as T, merkSlug);
}
