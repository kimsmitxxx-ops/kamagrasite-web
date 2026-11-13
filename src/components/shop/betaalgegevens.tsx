"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, HelpCircle } from "lucide-react";
import { track } from "@/lib/analytics";
import { formatEUR } from "@/lib/format";
import type { PaytailBetaalgegevens } from "@/lib/paytail";

/**
 * De bankgegevens in onze eigen vormgeving, op onze eigen site. Ze komen
 * server-side bij Paytail vandaan (zie lib/paytail.ts); hier staat alleen de
 * weergave, het kopieren en de knop "Ik heb betaald".
 *
 * De stappen en de gegevens staan expres door elkaar: eerst stonden ze apart,
 * en dan moest je op een telefoon langs een half scherm uitleg scrollen voor
 * je de IBAN zag. Nu is elke stap meteen het veld dat je nodig hebt, met de
 * kopieerknop ernaast. Wit vlak met een dikke accentrand, zodat dit het enige
 * blok op de pagina is dat zo opvalt.
 */

/** Alles in één blok tekst, voor wie liever in één keer kopieert en plakt. */
export function betaalregels(gegevens: PaytailBetaalgegevens): string {
  return [
    `Naam: ${gegevens.naam_ontvanger}`,
    `IBAN: ${gegevens.iban}`,
    `Omschrijving: ${gegevens.omschrijving}`,
    `Bedrag: ${gegevens.bedrag}`,
  ].join("\n");
}

async function naarKlembord(tekst: string) {
  try {
    await navigator.clipboard.writeText(tekst);
  } catch {
    // Oudere browsers en pagina's zonder https-context hebben geen
    // clipboard-API. Dan maar de ouderwetse weg, anders doet de knop niets.
    const hulp = document.createElement("textarea");
    hulp.value = tekst;
    hulp.style.position = "fixed";
    hulp.style.opacity = "0";
    document.body.appendChild(hulp);
    hulp.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(hulp);
  }
}

function KopieerKnop({ tekst, label = "Kopieer", ariaLabel }: { tekst: string; label?: string; ariaLabel?: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={async () => {
        await naarKlembord(tekst);
        setGekopieerd(true);
        setTimeout(() => setGekopieerd(false), 1800);
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-paper-soft px-3 py-2 text-xs text-text transition hover:bg-surface"
    >
      {gekopieerd ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      {gekopieerd ? "Gekopieerd" : label}
    </button>
  );
}

function Nummer({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {n}
    </span>
  );
}

/** Een stap die tegelijk een in te vullen veld is. */
function Stap({
  n,
  label,
  waarde,
  kopieer,
  extra,
}: {
  n: number;
  label: string;
  waarde: string;
  kopieer: string;
  extra?: string;
}) {
  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <Nummer n={n} />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{label}</p>
          {/* Naam, IBAN, bedrag en omschrijving zijn alle vier even
              belangrijk, dus alle vier hetzelfde lettertype en formaat. Eerder
              sprong het bedrag eruit en werd de omschrijving over het hoofd
              gezien, en juist die moet kloppen. */}
          <p className="mt-0.5 break-words font-mono text-lg leading-snug text-text">{waarde}</p>
          {extra && <p className="mt-1 text-xs text-text-muted">{extra}</p>}
        </div>
        <KopieerKnop tekst={kopieer} ariaLabel={`Kopieer ${label}`} />
      </div>
    </li>
  );
}

/** Een stap zonder veld, alleen tekst. */
function StapTekst({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <Nummer n={n} />
      <p className="flex-1 text-sm text-text-muted">{children}</p>
    </li>
  );
}

export function Betaalgegevens({
  orderId,
  totaalCenten,
  gegevens,
}: {
  orderId: string;
  totaalCenten: number;
  gegevens: PaytailBetaalgegevens;
}) {
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // De klant krijgt deze gegevens ook per mail, zodat hij ze later vanaf zijn
  // bank kan pakken zonder deze pagina terug te hoeven zoeken. Dat gebeurt
  // vanuit de browser en niet tijdens het renderen, want anders wacht de
  // pagina op de mailserver. De route verstuurt hooguit één keer per
  // bestelling; de bewaking daarvoor staat server-side.
  const gemaild = useRef(false);
  useEffect(() => {
    if (gemaild.current) return;
    gemaild.current = true;
    fetch("/api/paytail/mail-gegevens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    }).catch(() => {});
  }, [orderId]);

  const betaald = async () => {
    setBezig(true);
    setFout(null);
    track("payment_reported", { order_reference: gegevens.omschrijving });
    try {
      const res = await fetch("/api/paytail/betaald", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      // Of de melding bij Paytail nu aankwam of niet: het geld is onderweg en
      // de klant hoort de bevestiging te zien. Mislukt de melding, dan staat
      // dat in onze logs en vinden we de betaling alsnog op het kenmerk.
      if (!res.ok && res.status !== 503) {
        const j = await res.json().catch(() => ({}));
        setFout(j.error || "Melden lukte niet. Probeer het nog een keer.");
        setBezig(false);
        return;
      }
      window.location.href = `/checkout/bedankt/${orderId}?paytail=1`;
    } catch {
      setFout("Verbindingsfout. Probeer het nog een keer.");
      setBezig(false);
    }
  };

  const heeftExtra = Boolean(gegevens.land || gegevens.bic || gegevens.bank || gegevens.adres);

  return (
    <>
      <section className="mt-6 rounded-xl border-2 border-accent bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Zo maak je het over</p>
          <KopieerKnop tekst={betaalregels(gegevens)} label="Kopieer alles" />
        </div>

        <ol className="mt-3">
          <StapTekst n={1}>Open de app van je bank en kies overboeken.</StapTekst>
          <Stap n={2} label="IBAN (het rekeningnummer)" waarde={gegevens.iban} kopieer={gegevens.iban} />
          <Stap n={3} label="Naam ontvanger" waarde={gegevens.naam_ontvanger} kopieer={gegevens.naam_ontvanger} />
          <Stap n={4} label="Bedrag" waarde={formatEUR(totaalCenten)} kopieer={gegevens.bedrag} />
          <Stap
            n={5}
            label="Omschrijving"
            waarde={gegevens.omschrijving}
            kopieer={gegevens.omschrijving}
            extra="Zet hier alleen dit nummer. Typ er niets bij, anders weigert de bank de betaling."
          />
          <StapTekst n={6}>Verstuur de overboeking en klik hieronder op &quot;Ik heb betaald&quot;.</StapTekst>
        </ol>
      </section>

      <BankappUitleg gegevens={gegevens} totaalCenten={totaalCenten} />

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={betaald}
          disabled={bezig}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 font-display text-lg text-accent-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {bezig && <Loader2 size={18} className="animate-spin" />}
          {bezig ? "Bezig" : "Ik heb betaald"}
        </button>
        <p className="mt-3 text-xs text-text-subtle">
          Klik hierop als je de overboeking hebt verstuurd. Je krijgt deze gegevens ook per mail.
        </p>
        {fout && <p className="mt-2 text-sm text-danger">{fout}</p>}
      </div>

      {heeftExtra && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg text-text inline-flex items-center gap-2">
            <HelpCircle size={18} className="text-accent" /> Vraagt je bank om meer gegevens?
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Je maakt over naar een rekening in het buitenland. Sommige banken vragen daar meer bij: het land, het
            adres van de bank of de BIC-code. Alles wat we daarover hebben staat hieronder. Vraagt je bank er niet om,
            dan heb je dit niet nodig.
          </p>
          <div className="mt-4">
            {gegevens.land && <Veld label="Land" waarde={gegevens.land} />}
            {gegevens.adres && <Veld label="Adres van de bank" waarde={volledigAdres(gegevens)} />}
            {gegevens.bank && <Veld label="Naam van de bank" waarde={gegevens.bank} />}
            {gegevens.bic && <Veld label="BIC of SWIFT (code van de bank)" waarde={gegevens.bic} />}
            {gegevens.registratienummer && (
              <Veld label="Registratienummer van de ontvanger" waarde={gegevens.registratienummer} />
            )}
          </div>
        </section>
      )}
    </>
  );
}

/**
 * Het adres met het land erachter, zodat je het in één keer kunt plakken.
 * Paytail geeft die twee los terug en sommige banken willen een compleet
 * adres; het land er apart bij zoeken is dan net het duwtje om af te haken.
 *
 * Let op bij het label: dit is het adres van de BANK, niet van de ontvanger.
 * Paytail noemt het "geregistreerd adres" en zet het tussen de bankgegevens,
 * en J. Jasinskio 16C in Vilnius is het geregistreerde adres van TESLAPAY UAB.
 * De ontvanger zelf is een ander bedrijf in een ander land.
 */
function volledigAdres(g: PaytailBetaalgegevens): string {
  const adres = (g.adres || "").trim().replace(/,s*$/, "");
  const land = (g.land || "").trim();
  if (!land) return adres;
  if (adres.toLowerCase().includes(land.toLowerCase())) return adres;
  return adres + ", " + land;
}

/**
 * Waar de overboekknop zit in de apps die hier het meest langskomen.
 *
 * Alleen de naam van de knop, geen schermpad: dat wijzigt bij elke update van
 * zo'n app en een verkeerde aanwijzing is erger dan geen aanwijzing. De drie
 * bovenste zijn nagekeken op de eigen uitleg van de bank (ING: Betalen, dan
 * Overschrijven; Rabobank en ABN AMRO: Overboeken).
 */
const BANKEN_KNOPPEN: Array<{ bank: string; knop: string }> = [
  { bank: "ING", knop: "Betalen, dan Overschrijven" },
  { bank: "Rabobank", knop: "Overboeken" },
  { bank: "ABN AMRO", knop: "de gele knop Overboeken" },
  { bank: "SNS", knop: "Overboeken" },
  { bank: "bunq", knop: "Overboeken" },
  { bank: "Revolut", knop: "Overboeken of Transfer" },
];

/** Eén regel in het nagebootste bankscherm. */
function SchermRegel({ label, waarde, nadruk }: { label: string; waarde: string; nadruk?: boolean }) {
  return (
    <div className="border-b border-border px-3 py-2 last:border-b-0">
      <p className="text-[10px] uppercase tracking-wide text-text-subtle">{label}</p>
      <p className={`mt-0.5 break-words font-mono text-sm ${nadruk ? "text-accent-muted" : "text-text"}`}>{waarde}</p>
    </div>
  );
}

/**
 * Een nagebootst scherm van een bankapp met de echte gegevens van deze
 * bestelling erin.
 *
 * Reden: veel mensen verwachten iDEAL en hebben nog nooit zelf een
 * overboeking ingevuld. Ze herkennen het scherm wel zodra ze het zien, dus
 * laten we het zien in plaats van het te beschrijven. Geen schermafbeelding
 * van een echte bank: die is van hen, hij veroudert, en hij klopt nooit voor
 * iedereen.
 */
function BankappUitleg({ gegevens, totaalCenten }: { gegevens: PaytailBetaalgegevens; totaalCenten: number }) {
  return (
    <details className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <summary className="cursor-pointer font-display text-base text-text">
        Nog nooit zo betaald? Zo ziet het eruit in je bankapp
      </summary>

      <p className="mt-3 text-sm text-text-muted">
        Het is een gewone overboeking, hetzelfde als een rekening betalen of geld naar iemand sturen. Je hebt er geen
        iDEAL voor nodig en je hoeft nergens in te loggen behalve in je eigen bankapp.
      </p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Het nagebootste scherm, met de gegevens van deze bestelling. */}
        <div className="mx-auto w-full max-w-[230px] shrink-0 rounded-[1.6rem] border-4 border-primary bg-paper-soft p-2 shadow-sm">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-primary-muted" />
          <div className="rounded-xl border border-border bg-surface">
            <p className="border-b border-border px-3 py-2 text-xs font-semibold text-text">Nieuwe overboeking</p>
            <SchermRegel label="Naar rekening (IBAN)" waarde={gegevens.iban} nadruk />
            <SchermRegel label="Naam" waarde={gegevens.naam_ontvanger} />
            <SchermRegel label="Bedrag" waarde={formatEUR(totaalCenten)} />
            <SchermRegel label="Omschrijving" waarde={gegevens.omschrijving} nadruk />
          </div>
          <div className="mt-2 rounded-lg bg-accent px-3 py-2 text-center text-xs font-semibold text-accent-foreground">
            Versturen
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">Waar vind je dat scherm?</p>
          <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
            {BANKEN_KNOPPEN.map((b) => (
              <li key={b.bank} className="flex gap-2">
                <span className="w-24 shrink-0 font-semibold text-text">{b.bank}</span>
                <span>{b.knop}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-text-muted">
            Andere bank? Zoek naar Overboeken of Geld overmaken. Elke bank in Nederland en België heeft het, meestal
            op het eerste scherm.
          </p>
          <p className="mt-3 text-xs text-text-subtle">
            De twee velden die moeten kloppen zijn het rekeningnummer en de omschrijving. De rest vult je bank zelf
            aan.
          </p>
        </div>
      </div>
    </details>
  );
}

function Veld({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        {/* Zelfde formaat als in het betaalblok hierboven: ook deze velden
            typt iemand over in zijn bankapp. */}
        <p className="mt-0.5 break-words font-mono text-lg leading-snug text-text">{waarde}</p>
      </div>
      <KopieerKnop tekst={waarde} ariaLabel={`Kopieer ${label}`} />
    </div>
  );
}
