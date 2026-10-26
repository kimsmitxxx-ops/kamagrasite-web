import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shop/page-hero";

export const metadata: Metadata = {
  title: "Cookies - wat we wel en niet bewaren · Kamagra Site",
  description:
    "Kamagra Site gebruikt alleen functionele en optionele analytische cookies. Geen tracking voor advertenties. Lees welke cookies wij plaatsen en hoe je ze beheert.",
  alternates: { canonical: "/cookies" },
};

export const revalidate = 86400;

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Cookies"
        title="Wat we wel en niet bewaren"
        intro="Korte uitleg over de cookies die wij gebruiken - en welke we expliciet níét gebruiken. Geen marketing-trackers, geen advertentie-pixels."
      />

      <article className="mx-auto max-w-3xl px-4 py-12 prose prose-sm [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-10 [&>h2]:text-primary [&>h3]:font-display [&>h3]:text-lg [&>h3]:mt-6 [&>p]:leading-relaxed [&_a]:text-accent [&_a]:underline">
        <p>
          Wij plaatsen cookies om de webshop te laten werken. Sommige zijn noodzakelijk
          (winkelmand, sessie), andere zijn optioneel (anonieme bezoekersstatistieken). We
          plaatsen <strong>nooit</strong> tracking-cookies voor advertenties of profielen-
          delen met derde partijen.
        </p>

        <h2>1. Noodzakelijke cookies</h2>
        <p>Deze plaatsen we altijd, anders werkt de site niet:</p>
        <ul>
          <li>
            <strong>kamagrasite.cart.v2</strong> (localStorage) - onthoudt wat in je winkelmand
            zit, zelfs als je tussendoor weggaat. Verloopt niet automatisch, je kunt 'm
            handmatig wissen via je browser.
          </li>
          <li>
            <strong>shop-dash-token</strong> (httpOnly cookie) - alleen actief als je inlogt
            op een eigen klant-account. 7 dagen geldig.
          </li>
          <li>
            <strong>kamagrasite.cookies.v1</strong> (localStorage) - onthoudt je cookie-keuze
            zodat je de banner niet elke pagina opnieuw ziet.
          </li>
          <li>
            <strong>apo_chat_id</strong> (localStorage) - als je de live-chat hebt gebruikt,
            koppelt deze ID je terug aan het lopende gesprek bij een nieuwe sessie.
          </li>
        </ul>

        <h2>2. Optionele analytische cookies</h2>
        <p>
          Alleen actief als je in de banner op <em>"Accepteer alle"</em> klikt:
        </p>
        <ul>
          <li>
            <strong>Anonieme pageviews</strong> - welke pagina&apos;s populair zijn, gemiddelde
            laadtijd, klik-patronen op categorieën. Geen IP-tracking, geen cross-site
            fingerprinting.
          </li>
        </ul>
        <p>Provider: zelf gehoste statistieken via Vercel Analytics (privacy-friendly, geen PII).</p>

        <h2>3. Wat wij níét doen</h2>
        <ul>
          <li>Geen Google Ads / Facebook Pixel / TikTok tracking</li>
          <li>Geen retargeting-cookies</li>
          <li>Geen verkoop van bezoekgegevens aan derden</li>
          <li>Geen profiel-opbouw over meerdere websites</li>
        </ul>

        <h2>4. Cookie-voorkeur wijzigen</h2>
        <p>
          Wis de sleutel <code>kamagrasite.cookies.v1</code> uit je browser-localStorage
          om de banner opnieuw te zien. In Chrome: rechter-muisknop op de site → <em>Inspect</em>{" "}
          → Tab <em>Application</em> → Local Storage → klik op het item en delete.
        </p>

        <h2>5. Vragen?</h2>
        <p>
          Stel je vraag via het <Link href="/contact">contactformulier</Link> of bekijk
          ons volledige <Link href="/privacy">privacy-beleid</Link>.
        </p>
      </article>
    </>
  );
}
