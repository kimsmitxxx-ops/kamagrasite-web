import Link from "next/link";
import { MapPin, Users, Truck, Store } from "lucide-react";
import { STEDEN, INWONERS_BRON } from "@/lib/steden-nl";

/**
 * Feitenblok op een stadspagina.
 *
 * De acht stadspagina's verschilden tot nu toe alleen in de plaatsnaam: zelfde
 * intro, zelfde vragen, niets plaatselijks. Dit blok zet er gegevens op die
 * per stad echt anders zijn en die na te slaan zijn: de provincie en het
 * inwonertal van CBS, met tabel en peilmoment erbij.
 *
 * Wat hier bewust niet staat: hoeveel mensen in die stad dit middel zouden
 * gebruiken. Dat cijfer bestaat niet, en het terugrekenen uit een landelijk
 * percentage levert een verzonnen gezondheidsstatistiek op.
 */
export function StadFeiten({ slug }: { slug: string }) {
  const stad = STEDEN.find((s) => s.pagina === slug);
  if (!stad) return null;

  const levertijd = stad.land === "NL" ? "1 tot 2 werkdagen" : "1 tot 3 werkdagen";
  const nl = new Intl.NumberFormat("nl-NL");

  return (
    <section className="mt-10 rounded-lg border border-border bg-wash p-5 sm:p-6">
      <h2 className="font-display text-xl text-text">Kamagra kopen in {stad.naam}</h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3">
          <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-subtle">Provincie</dt>
            <dd className="text-sm text-text">{stad.provincie}</dd>
          </div>
        </div>

        {stad.inwoners != null && (
          <div className="flex gap-3">
            <Users size={16} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-text-subtle">Inwoners</dt>
              <dd className="text-sm text-text">{nl.format(stad.inwoners)}</dd>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Truck size={16} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-subtle">Bezorging</dt>
            <dd className="text-sm text-text">
              {levertijd} nadat je betaling binnen is, met PostNL of DPD
            </dd>
          </div>
        </div>

        <div className="flex gap-3">
          <Store size={16} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-subtle">Afhalen</dt>
            <dd className="text-sm text-text">
              Niet mogelijk; wij hebben geen winkel of afhaaladres
            </dd>
          </div>
        </div>
      </dl>

      {stad.inwoners != null && (
        <p className="mt-4 text-xs text-text-subtle">
          Inwonertal: {INWONERS_BRON.bron}, tabel {INWONERS_BRON.tabel}, stand{" "}
          {INWONERS_BRON.peilmoment}.
        </p>
      )}

      <p className="mt-3 text-sm text-text-muted">
        Woon je ergens anders?{" "}
        <Link href="/steden/" className="text-accent hover:underline">
          Kies je eigen stad
        </Link>{" "}
        en je ziet meteen wat er bij jou kan.
      </p>
    </section>
  );
}

export default StadFeiten;
