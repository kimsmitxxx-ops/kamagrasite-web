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
  title: "Kamagra per stad: afhalen, winkels en bezorging",
  description:
    "Kun je kamagra ergens afhalen of in een winkel kopen? Het volledige antwoord per situatie, plus wat er in jouw stad wel kan. Kies je plaats en zie het meteen.",
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
          {/* Afhalen is de meestgestelde vraag die we hadden en de slechtst
              beantwoorde: "kamagra afhalen amsterdam", "kamagra kopen winkel
              amsterdam" en varianten daarop zijn samen goed voor 762
              vertoningen in 16 maanden, en daar stond alleen "kan niet"
              tegenover. Het volledige antwoord is genuanceerder dan dat, en
              het staat hier een keer goed zodat de zestien stadspagina's
              ernaar kunnen verwijzen in plaats van het allemaal te herhalen. */}
          <h2 id="afhalen" className="font-display text-2xl text-text pt-2 scroll-mt-24">
            Kan ik het ergens afhalen?
          </h2>
          <p>
            Niet bij ons, en nergens anders over de toonbank. Maar "afhalen" betekent voor de een
            iets anders dan voor de ander, dus de drie varianten los van elkaar.
          </p>
          <p>
            <strong>Bij ons langskomen</strong> kan niet. We hebben geen winkel, geen balie en geen
            magazijn waar je aan kunt bellen, en dat gaat ook niet veranderen. Je ziet ons adres
            daarom nergens als ophaalpunt staan.
          </p>
          <p>
            <strong>Een afhaalpunt als bezorgadres kiezen</strong> kan ook niet. In onze branche
            krijgen we geen contract bij de vervoerders, dus we kunnen niet rechtstreeks naar een
            PostNL-punt of een pakketautomaat versturen. Bij het afrekenen vul je een vast huisadres
            in; een postbus werkt evenmin.
          </p>
          <p>
            <strong>Wat wel gebeurt:</strong> mis je het pakket thuis, dan biedt PostNL of DPD het
            nog een keer aan en gaat het daarna naar het dichtstbijzijnde afhaalpunt. Daar heb je
            zeven dagen om het op te halen met je legitimatie. Dat is de enige manier waarop een
            bestelling bij ons op een afhaalpunt belandt, en daar hoef je niets voor te regelen.
          </p>
          <p>
            Kom je zoekend naar een winkel toch een adres tegen, kijk dan goed wat je voor je hebt.
            Meestal is het een webshop die de stadsnaam in de titel heeft gezet omdat daarop gezocht
            wordt. Soms is het iemand die je op straat iets meegeeft zonder bijsluiter, zonder
            dosering op de strip en zonder dat er iemand aanspreekbaar is als het misgaat. Bij dit
            middel is de dosering het enige dat telt, dus dat is precies het verkeerde moment om het
            niet te weten.
          </p>

          <h2 className="font-display text-2xl text-text pt-2">Wat er wel kan</h2>
          <p>
            Online bestellen en thuis laten bezorgen. Wij verzenden zelf vanuit Nederland met PostNL
            of DPD, voor EUR 5 per bestelling. Je pakket gaat de deur uit zodra je betaling binnen
            is: daarna is het in Nederland 1 tot 2 werkdagen onderweg en in Belgie 1 tot 3. De doos
            is neutraal, zonder logo of productnaam, en we bezorgen alleen op een vast huisadres.
          </p>
          <p>
            Vaak zit achter de vraag om af te halen iets anders: je wilt niet dat er een pakket op
            de mat ligt waar iemand iets uit kan opmaken. Daar is aan gedacht. Er staat geen logo en
            geen productnaam op de doos, alleen je adres, en past het door de brievenbus dan wordt
            er niet eens aangebeld.
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
