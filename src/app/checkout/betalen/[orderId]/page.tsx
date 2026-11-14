import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Copy, Clock, Building2, Package } from "lucide-react";
import { getOrderForPayment, getOrderItemsForPayment, getPaytailConfig, formatEUR } from "@/lib/queries";
import { haalBetaalgegevens } from "@/lib/paytail";
import { meldFout } from "@/lib/fout-melden";
import { Betaalgegevens } from "@/components/shop/betaalgegevens";
import { PaytailStep2Button } from "@/components/shop/paytail-step2-button";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Betalen - zo maak je het bedrag over",
  description:
    "Uitleg bij de overboeking: wat je in je bankapp invult en waarom alleen het bestelnummer in de omschrijving mag.",
  robots: { index: false, follow: false },
};

/**
 * De betaalpagina, op ons eigen domein.
 *
 * Eerder ging de klant vanaf de checkout rechtstreeks naar Paytail: een vreemd
 * domein, een buitenlandse IBAN op naam van een bedrijf dat hij niet kent, en
 * geen woord uitleg. Dat kost bestellingen. Nu haalt shop-dash de bankgegevens
 * op (centraal, zie lib/paytail.ts daar) en tonen we ze hier, bij de
 * bestelling waar ze bij horen, in onze eigen vormgeving. Ook "Ik heb betaald"
 * gaat via onze eigen route. De klant verlaat de site dus niet meer.
 *
 * De volgorde is op een telefoon bepaald: eerst het betaalblok met de IBAN,
 * pas daarna het besteloverzicht en de achtergrondinformatie. Wie wil betalen
 * hoeft niet te scrollen; wie wil nalezen scrollt vanzelf.
 *
 * Een iframe was de eerste gedachte, maar dat kan niet: Paytail stuurt op elke
 * stap X-Frame-Options: DENY mee.
 *
 * Twee terugvallen, allebei dezelfde: een knop die de klant alsnog naar het
 * betaalscherm van Paytail stuurt (rechtstreeks hun stap 2, hun bevestigscherm
 * slaan we over). De eerste springt aan als het ophalen mislukt, de tweede als
 * shops.paytail_eigen_blok op false staat.
 */
export default async function BetalenPage({ params }: { params: { orderId: string } }) {
  const [order, paytail] = await Promise.all([getOrderForPayment(params.orderId), getPaytailConfig()]);

  if (!order) notFound();

  // Staat Paytail uit (of ontbreekt de URL), dan hoort de klant op de
  // bedankt-pagina met de bankgegevens van de winkel zelf.
  if (!paytail?.paytail_enabled || !paytail.paytail_base_url) {
    redirect(`/checkout/bedankt/${order.id}`);
  }

  const ref = order.reference || `ORDER-${order.id.slice(0, 8).toUpperCase()}`;
  // Het domein uit de shop-instellingen, met de host van dit verzoek als
  // terugval: Paytail wil een volledige return-URL en die mag niet per
  // ongeluk naar een andere winkel wijzen.
  const domein = paytail.domain || headers().get("host") || "";
  const returnUrl = `https://${domein}/checkout/bedankt/${order.id}?paytail=1`;

  const regels = await getOrderItemsForPayment(order.id);

  const gegevens =
    paytail.paytail_eigen_blok === false
      ? null
      : // shop-dash haalt de rekening op en legt hem meteen vast bij de
        // bestelling; die hoort bij deze ene bestelling en geldt 24 uur.
        await haalBetaalgegevens(order.id, order.shop_id);

  // De terugvalknop is een noodoplossing, dus het hoort op te vallen als een
  // klant hem te zien krijgt. shop-dash logt zelf al waarom het misging;
  // dit zegt dát het de klant raakte.
  if (!gegevens && paytail.paytail_eigen_blok !== false) {
    await meldFout({
      bron: "checkout/betalen",
      bericht: `geen bankgegevens voor ${ref}: klant kreeg de terugvalknop naar Paytail`,
      niveau: "warn",
      context: { order: ref, bedrag: order.total_cents },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-2xl text-primary sm:text-3xl">Nog even betalen</h1>
        <p className="mt-2 text-sm text-text-muted">
          Bestelling <strong className="text-text tabular">{ref}</strong> staat voor je klaar. Je betaalt met een
          gewone bankoverschrijving, dus niet met iDEAL.
        </p>
      </div>

      {gegevens ? (
        <Betaalgegevens orderId={order.id} totaalCenten={order.total_cents} gegevens={gegevens} />
      ) : (
        /* Terugval: wij tonen de bankgegevens niet zelf, dus haalt de klant ze
           op bij Paytail. Een GET naar hun formulier met de velden in de
           querystring: het oude formulier staat dan helemaal voorgevuld, het
           nieuwe (Laravel, sinds 10 november 2026) alleen het bedrag. Geen
           POST naar hun stap 2 meer: dat geeft op het nieuwe formulier een
           405, en die foutpagina kreeg de klant dan te zien. */
        <form action={paytail.paytail_base_url} method="GET" className="mt-6 text-center">
          <input type="hidden" name="return" value={returnUrl} />
          <input type="hidden" name="payers_name" value={order.customer_name || ""} />
          <input type="hidden" name="user_postcode" value={order.shipping_postal || ""} />
          <input type="hidden" name="user_country" value={order.shipping_country || "NL"} />
          <input type="hidden" name="order_number" value={ref} />
          <input type="hidden" name="amount" value={(order.total_cents / 100).toFixed(2)} />
          {/* Het nieuwe formulier leest andere querynamen dan het oude (name,
              postcode, country, order_id in plaats van payers_name,
              user_postcode, user_country, order_number). Allebei meesturen,
              dan staat het op beide formulieren voorgevuld. */}
          <input type="hidden" name="name" value={order.customer_name || ""} />
          <input type="hidden" name="postcode" value={order.shipping_postal || ""} />
          <input type="hidden" name="country" value={order.shipping_country || "NL"} />
          <input type="hidden" name="order_id" value={ref} />
          <div className="rounded-xl border-2 border-accent bg-surface p-6 text-left text-sm text-text-muted">
            <p>
              Klik hieronder voor de bankgegevens: het rekeningnummer (IBAN), de naam van de ontvanger, het bedrag van{" "}
              <strong className="text-text tabular">{formatEUR(order.total_cents)}</strong> en de omschrijving. Op het
              betaalscherm staan je naam, postcode, land en bestelnummer al ingevuld; controleer dat het bestelnummer{" "}
              <strong className="font-mono text-text">{ref}</strong> is. Zet bij de omschrijving van je overboeking
              alleen dat bestelnummer en verder niets, anders weigert de bank de betaling.
            </p>
          </div>
          <PaytailStep2Button
            label={paytail.paytail_btn_label || "Naar de betaalgegevens"}
            color={paytail.paytail_btn_color || "#1a1a2e"}
            textColor={paytail.paytail_btn_text_color || "#f5f0e5"}
            orderReference={ref}
          />
          <p className="mt-3 text-xs text-text-subtle">
            Je gaat naar het beveiligde betaalscherm van onze betaalpartner.
          </p>
        </form>
      )}

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg text-text inline-flex items-center gap-2">
          <Package size={18} className="text-accent" /> Je bestelling
        </h2>
        {regels.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {regels.map((r, i) => (
              <li key={`${r.product_name}-${i}`} className="flex items-baseline justify-between gap-4">
                <span className="text-text">
                  {r.product_name}
                  {r.quantity > 1 && <span className="text-text-muted"> &times; {r.quantity}</span>}
                </span>
                <span className="shrink-0 tabular text-text-muted">{formatEUR(r.total_cents)}</span>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Subtotaal</dt>
            <dd className="tabular text-text">{formatEUR(order.subtotal_cents)}</dd>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between">
              <dt className="text-text-muted">
                Kortingscode{order.coupon_code ? ` ${order.coupon_code}` : ""}
              </dt>
              <dd className="tabular text-accent-muted">−{formatEUR(order.discount_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-text-muted">Verzending</dt>
            <dd className="tabular text-text">
              {order.shipping_cents > 0 ? formatEUR(order.shipping_cents) : "Gratis"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-text">Totaal</dt>
            <dd className="font-display text-xl tabular text-text">{formatEUR(order.total_cents)}</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
          <p>
            Bezorgen naar {order.customer_name}, {order.shipping_street}, {order.shipping_postal}{" "}
            {order.shipping_city}
            {order.shipping_country && order.shipping_country !== "NL" ? ` (${order.shipping_country})` : ""}
          </p>
          {order.customer_email && <p className="mt-1">Bevestiging gaat naar {order.customer_email}</p>}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-paper-soft p-6">
        <h2 className="font-display text-lg text-text">Goed om te weten</h2>
        <ul className="mt-3 space-y-3 text-sm text-text-muted">
          <li className="flex gap-2.5">
            <Building2 size={16} className="shrink-0 text-text-subtle mt-0.5" />
            <span>
              De rekening staat in een EU-land en op naam van het kantoor dat onze betalingen regelt, niet op die van
              de winkel. Dat is bewust: Nederlandse banken accepteren onze betalingen niet, dus loopt het via een
              Europese rekening. Voor jou verandert er niets, want een euro-overboeking binnen de EU kost hetzelfde en
              duurt even lang als eentje binnen Nederland. De naam van de winkel komt niet op je bankafschrift.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Clock size={16} className="shrink-0 text-text-subtle mt-0.5" />
            <span>
              Het geld is meestal dezelfde dag bij ons, soms pas de volgende werkdag. Zodra het binnen is gaat je
              pakket weg en krijg je bericht.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Copy size={16} className="shrink-0 text-text-subtle mt-0.5" />
            <span>
              Deze rekening hoort bij deze bestelling en geldt 24 uur. Wil je later betalen, open deze pagina dan
              opnieuw voor nieuwe gegevens. Gebruik nooit een rekening uit een oudere bestelling of mail: dan kunnen we
              je betaling niet terugvinden.
            </span>
          </li>
        </ul>
      </section>

      <div className="mt-8 text-center text-sm text-text-muted">
        Loopt er iets niet? <Link href="/contact/" className="text-accent hover:underline">Laat het ons weten</Link> of
        stuur een chat (rechtsonder). Vermeld dan je bestelnummer {ref}.
      </div>
    </div>
  );
}
