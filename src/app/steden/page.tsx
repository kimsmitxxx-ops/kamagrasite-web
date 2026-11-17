import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/shop/page-hero";
import { StadKiezer } from "@/components/shop/stad-kiezer";
import { listStadPaginas } from "@/lib/queries";
import { STEDEN } from "@/lib/steden-nl";
import { alternatesNL } from "@/lib/geo-nl";
import { MapPin, ArrowRight } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Kamagra per stad - waar je het wel en niet koopt",
  description:
    "Kies je stad en zie wat er in jouw plaats mogelijk is. Over de toonbank is kamagra in Nederland nergens te koop; online bestellen en laten bezorgen kan wel.",
  alternates: alternatesNL("/steden/"),
};

/**
 * Overzichtspagina voor de stadskiezer.
 *
 * Deze pagina bestaat om twee redenen. Ten eerste geeft hij het antwoord op de
 * vraag "waar koop ik dit in mijn stad" zonder dat daar tientallen bijna
 * identieke pagina's voor nodig zijn. Ten tweede is hij het knooppunt voor de
 * acht stadspagina's die tot 17 nov 2026 weespagina's waren: ze stonden in de
 * sitemap, maar geen enkele pagina linkte ernaar.
 */
export default async function StedenPage() {
  const metPagina = await listStadPaginas();
  const aantalNL = STEDEN.filter((s) => s.land === "NL").length;
  const aantalBE = STEDEN.filter((s) => s.land === "BE").length;

  return (
    <>
      <PageHero
        eyebrow="Per stad"
        title="Kamagra in jouw stad: wat kan er wel?"
        intro="De vraag die bijna iedereen stelt is of het bij hem in de buurt te koop is. Het eerlijke antwoord is nee, en niet door jouw stad. Hieronder lees je waarom, en wat er in plaats daarvan wel kan."
      />

      <section className="mx-auto max-w-3xl px-4 py-12">
        <StadKiezer />

        <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-text-muted">
          <h2 className="font-display text-2xl text-text">Waarom er nergens een winkel is</h2>
          <p>
            Kamagra staat niet in het Nederlandse geneesmiddelenregister. Het middel bevat
            sildenafil, dezelfde werkzame stof als Viagra, en die stof is in Nederland
            receptplichtig. Een apotheek mag het dus alleen meegeven als een arts het heeft
            voorgeschreven, en een gewone winkel mag het helemaal niet verkopen.
          </p>
          <p>
            Dat geldt in Amsterdam net zo hard als in Terneuzen. Kom je toch een fysiek adres tegen
            dat beweert het over de toonbank te verkopen, dan is dat per definitie buiten de regels
            om. Wij hebben geen winkel en geen afhaaladres, en we noemen er ook geen.
          </p>
          <h2 className="font-display text-2xl text-text pt-2">Wat er wel kan</h2>
          <p>
            Online bestellen en thuis laten bezorgen. Wij verzenden zelf vanuit Nederland met PostNL
            of DPD, voor EUR 5 per bestelling. Je pakket gaat de deur uit zodra je betaling binnen
            is: daarna is het in Nederland 1 tot 2 werkdagen onderweg en in Belgie 1 tot 3. De doos
            is neutraal, zonder logo of productnaam, en we bezorgen alleen op een vast huisadres.
          </p>
        </div>
      </section>

      {metPagina.length > 0 && (
        <section className="bg-wash py-12">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-2xl text-text">Steden met een eigen pagina</h2>
            <p className="mt-2 text-sm text-text-muted">
              Voor deze plaatsen schreven we de bezorging en de veelgestelde vragen apart uit.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {metPagina.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}/`}
                    className="group flex items-center justify-between gap-3 rounded-md border border-border bg-paper-soft px-4 py-3 hover:border-accent"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-text">
                      <MapPin size={14} className="text-accent" />
                      {p.nav_label || p.h1}
                    </span>
                    <ArrowRight size={14} className="text-text-subtle group-hover:text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-text-subtle">
              De kiezer hierboven kent {aantalNL} Nederlandse en {aantalBE} Belgische plaatsen. Staat
              jouw stad er niet bij, dan geldt hetzelfde antwoord.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
