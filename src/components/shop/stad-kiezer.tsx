"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Search, Store, Truck, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import { zoekSteden, vindStad, STEDEN_MET_PAGINA, type Land, type Stad } from "@/lib/steden-nl";

/**
 * Kies je stad en zie wat er in jouw plaats mogelijk is.
 *
 * Het antwoord is voor elke stad in de kern hetzelfde en dat is bewust: over
 * de toonbank is dit in Nederland en Belgie nergens te koop. Kamagra is hier
 * niet geregistreerd en sildenafil geeft de apotheek alleen op recept mee. Een
 * zoeker die winkels in de buurt belooft zou dus of leeg blijven of verzonnen
 * adressen tonen, en dat laatste gebeurt hier niet.
 *
 * Wat de kiezer wel doet: het eerlijke antwoord geven op de vraag die iemand
 * intypt, met de bezorging naar die plaats erbij, en doorverwijzen naar de
 * eigen pagina van die stad als die bestaat. Tegelijk legt hij via
 * `stad_gekozen` vast welke plaatsen gevraagd worden, zodat een nieuwe
 * stadspagina op echte vraag gebaseerd is in plaats van op een gok.
 */
export function StadKiezer({ compact = false }: { compact?: boolean }) {
  const [land, setLand] = useState<Land>("NL");
  const [invoer, setInvoer] = useState("");
  const [gekozen, setGekozen] = useState<Stad | null>(null);
  const [geenTreffer, setGeenTreffer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggesties = useMemo(
    () => (gekozen ? [] : zoekSteden(invoer, land)),
    [invoer, land, gekozen]
  );

  function kies(stad: Stad) {
    setGekozen(stad);
    setInvoer(stad.naam);
    setGeenTreffer(false);
    // Hiermee zie je in het dashboard welke steden gevraagd worden.
    track("stad_gekozen", { stad: stad.naam, provincie: stad.provincie, land: stad.land, heeft_pagina: Boolean(stad.pagina) });
  }

  function verstuur(e: React.FormEvent) {
    e.preventDefault();
    const stad = vindStad(invoer, land) ?? suggesties[0] ?? null;
    if (stad) {
      kies(stad);
      return;
    }
    // Ook een plaats die wij niet in de lijst hebben is bruikbare informatie.
    setGekozen(null);
    setGeenTreffer(true);
    if (invoer.trim()) track("stad_gekozen", { stad: invoer.trim(), land, onbekend: true });
  }

  function opnieuw() {
    setGekozen(null);
    setGeenTreffer(false);
    setInvoer("");
    inputRef.current?.focus();
  }

  return (
    <div className={compact ? "" : "rounded-lg border border-border bg-paper-soft p-5 sm:p-6"}>
      <div className="flex items-start gap-2.5">
        <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <h2 className="font-display text-xl text-text">Kamagra kopen in jouw stad</h2>
          <p className="mt-1 text-sm text-text-muted">
            Kies je plaats en je ziet meteen wat er in jouw stad kan en wat niet.
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-md border border-border bg-background p-0.5 text-sm">
        {(["NL", "BE"] as Land[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLand(l);
              opnieuw();
            }}
            className={
              l === land
                ? "rounded px-3 py-1.5 bg-accent text-accent-foreground font-medium"
                : "rounded px-3 py-1.5 text-text-muted hover:text-text"
            }
          >
            {l === "NL" ? "Nederland" : "Belgie"}
          </button>
        ))}
      </div>

      <form onSubmit={verstuur} className="relative mt-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          ref={inputRef}
          type="search"
          value={invoer}
          onChange={(e) => {
            setInvoer(e.target.value);
            setGekozen(null);
            setGeenTreffer(false);
          }}
          placeholder={land === "NL" ? "Bijvoorbeeld Eindhoven of Zwolle" : "Bijvoorbeeld Antwerpen of Gent"}
          aria-label="Jouw stad"
          className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-28 text-sm text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 h-8 rounded px-4 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-soft"
        >
          Bekijk
        </button>

        {suggesties.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-paper-soft shadow-lift">
            {suggesties.map((s) => (
              <li key={`${s.land}-${s.naam}`}>
                <button
                  type="button"
                  onClick={() => kies(s)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-veil"
                >
                  <span className="text-text">{s.naam}</span>
                  <span className="text-xs text-text-subtle">{s.provincie}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {gekozen && <Antwoord stad={gekozen} onOpnieuw={opnieuw} />}

      {/* Vaste links naar de stadspagina's, met de zoekterm als ankertekst.
          De kiezer erboven is voor de bezoeker; dit is wat de stadspagina's
          interne linkwaarde geeft op precies de term waarop ze moeten ranken.
          Zonder deze links waren het weespagina's. */}
      {!gekozen && !geenTreffer && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs uppercase tracking-wider text-text-subtle">Veelgezocht</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {STEDEN_MET_PAGINA.map((s) => (
              <li key={s.pagina}>
                <Link href={`/${s.pagina}/`} className="text-text-muted hover:text-accent hover:underline">
                  Kamagra kopen {s.naam}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {geenTreffer && (
        <div className="mt-4 rounded-md border border-border bg-wash p-4 text-sm text-text-muted">
          Die plaats staat niet in onze lijst, maar dat verandert niets aan het antwoord: ook daar is
          het niet over de toonbank te koop en bezorgen we gewoon aan de deur.{" "}
          <Link href="/winkel/" className="text-accent hover:underline">
            Naar de winkel
          </Link>
        </div>
      )}
    </div>
  );
}

function Antwoord({ stad, onOpnieuw }: { stad: Stad; onOpnieuw: () => void }) {
  const levertijd = stad.land === "NL" ? "1 tot 2 werkdagen" : "1 tot 3 werkdagen";
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-tint px-4 py-3">
        <p className="font-display text-lg text-text">
          Kamagra in {stad.naam}
        </p>
        <p className="text-xs text-text-muted">{stad.provincie}</p>
      </div>

      <div className="divide-y divide-border bg-paper-soft">
        <div className="flex gap-3 px-4 py-3.5">
          <Store size={16} className="mt-0.5 shrink-0 text-text-subtle" />
          <div>
            <p className="text-sm font-medium text-text">Geen fysieke winkel in {stad.naam}</p>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">
              Niet omdat {stad.naam} iets mist: in heel{" "}
              {stad.land === "NL" ? "Nederland" : "Belgie"} koop je dit nergens over de toonbank.
              Kamagra is hier niet als geneesmiddel geregistreerd, en sildenafil geeft de apotheek
              alleen mee op recept van een arts.
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-3.5">
          <Truck size={16} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-medium text-text">Online bestellen kan wel</p>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">
              Wij verzenden zelf vanuit Nederland. Je pakket gaat de deur uit zodra je betaling
              binnen is en is daarna {levertijd} onderweg naar {stad.naam}. Neutrale verpakking,
              EUR 5 verzendkosten, alleen naar een vast huisadres.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-wash px-4 py-3">
        <Link
          href="/winkel/"
          className="inline-flex items-center gap-2 rounded bg-accent px-4 h-9 text-sm font-medium text-accent-foreground hover:bg-accent-muted"
        >
          Naar de winkel <ArrowRight size={14} />
        </Link>
        {stad.pagina && (
          <Link href={`/${stad.pagina}/`} className="text-sm text-accent hover:underline">
            Meer over bestellen in {stad.naam}
          </Link>
        )}
        <button type="button" onClick={onOpnieuw} className="ml-auto text-sm text-text-subtle hover:text-text">
          Andere stad
        </button>
      </div>
    </div>
  );
}

export default StadKiezer;
