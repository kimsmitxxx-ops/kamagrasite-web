import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrderForConfirmation,
  getShopPaymentInstructions,
  formatEUR,
} from "@/lib/queries";
import { PaymentScreenshotForm } from "@/components/shop/payment-screenshot-form";
import { CheckCircle2, Copy, Building2, Bitcoin, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Bestelling geplaatst - betaalinstructies",
  description:
    "Je bestelling staat klaar. Op deze pagina vind je de betaalgegevens en kun je een screenshot van je betaling versturen om verwerking te bespoedigen.",
  robots: { index: false, follow: false },
};

export default async function BedanktPage({ params }: { params: { orderId: string } }) {
  const [order, payment] = await Promise.all([
    getOrderForConfirmation(params.orderId),
    getShopPaymentInstructions(),
  ]);

  if (!order) notFound();

  const ref = `ORDER-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-success/40 bg-success-soft/30 p-6 text-center">
        <CheckCircle2 size={36} className="mx-auto text-success" />
        <h1 className="mt-3 font-display text-3xl text-primary">Bedankt voor je bestelling!</h1>
        <p className="mt-2 text-text-muted">
          Bestelling <strong className="text-text tabular">{ref}</strong> · totaal{" "}
          <strong className="text-text tabular">{formatEUR(order.total_cents)}</strong>
        </p>
        <p className="mt-1 text-xs text-text-subtle">
          Bevestiging gestuurd naar {order.email}
        </p>
      </div>

      {/* Bank / IBAN betaalblok */}
      {payment?.iban && (
        <section className="mt-8 rounded-xl border border-primary-muted bg-primary text-primary-foreground p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-soft font-semibold inline-flex items-center gap-1.5">
            <Building2 size={12} /> Bankoverschrijving - eenvoudigste route
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-primary-foreground/60 text-xs">Bedrag</dt>
              <dd className="font-display text-2xl tabular">{formatEUR(order.total_cents)}</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/60 text-xs">Onder vermelding van</dt>
              <dd className="font-mono text-base bg-primary-soft rounded px-2 py-1 inline-block mt-0.5">{ref}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-primary-foreground/60 text-xs">IBAN</dt>
              <dd className="font-mono text-base bg-primary-soft rounded px-2 py-1 inline-block mt-0.5">
                {payment.iban}
              </dd>
            </div>
            {payment.account_holder && (
              <div>
                <dt className="text-primary-foreground/60 text-xs">Ten name van</dt>
                <dd>{payment.account_holder}</dd>
              </div>
            )}
            {payment.bank_name && (
              <div>
                <dt className="text-primary-foreground/60 text-xs">Bank</dt>
                <dd>{payment.bank_name}</dd>
              </div>
            )}
            {payment.bic && (
              <div>
                <dt className="text-primary-foreground/60 text-xs">BIC</dt>
                <dd className="font-mono text-sm">{payment.bic}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Crypto-blok */}
      {payment?.crypto_addresses && payment.crypto_addresses.length > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold inline-flex items-center gap-1.5">
            <Bitcoin size={12} /> Crypto-betaling (alternatief)
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Stuur het exacte bedrag (omrekenen naar coin van keuze) naar één van deze addresses. Voor markt-koers gebruik je
            een live-converter zoals coinbase.com/converter.
          </p>
          <ul className="mt-4 space-y-3">
            {payment.crypto_addresses.map((c) => (
              <li key={c.address} className="rounded-lg border border-paper-border bg-paper-soft p-3">
                <p className="text-xs font-semibold text-text">{c.label} <span className="text-text-muted">({c.ticker})</span></p>
                <p className="mt-1 font-mono text-xs break-all text-text-muted">{c.address}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Algemene instructies HTML uit DB */}
      {payment?.instructions_html && (
        <section className="mt-6 rounded-xl border border-border bg-paper-soft p-6">
          <div
            className="prose prose-sm max-w-none text-text [&>p]:my-2 [&_a]:text-accent [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: payment.instructions_html }}
          />
        </section>
      )}

      {/* Screenshot upload - speed it up */}
      <section className="mt-8 rounded-xl border-2 border-accent/40 bg-accent-soft/20 p-6">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg text-text">Verzending bespoedigen?</h2>
            <p className="mt-1 text-sm text-text-muted">
              Stuur een screenshot van je betaling. Zodra wij die zien zetten we je bestelling al in behandeling - vaak
              uren sneller dan wachten tot de overboeking binnen is.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <PaymentScreenshotForm orderId={order.id} customerEmail={order.email} />
        </div>
      </section>

      <div className="mt-10 text-center text-sm text-text-muted">
        Vragen? <Link href="/contact" className="text-accent hover:underline">Contact opnemen</Link>{" "}
        of stuur ons een chat (rechtsonder).
      </div>
    </div>
  );
}
