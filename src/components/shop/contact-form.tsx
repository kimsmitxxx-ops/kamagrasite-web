"use client";
import { useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

const SHOP_DASH_URL = process.env.NEXT_PUBLIC_SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    order_number: "",
    subject: "Vraag over een bestelling",
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const message = form.order_number
        ? `[Onderwerp: ${form.subject}]\n[Order: ${form.order_number}]\n\n${form.message}`
        : `[Onderwerp: ${form.subject}]\n\n${form.message}`;
      const res = await fetch(`${SHOP_DASH_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: SHOP_ID,
          visitorName: form.name,
          visitorEmail: form.email,
          subject: form.subject,
          message,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Versturen mislukt (${res.status})`);
      }
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Verbindingsfout - probeer opnieuw");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-md border border-primary-muted bg-primary p-6 text-primary-foreground lg:p-8"
    >
      <h2 className="font-display text-2xl text-primary-foreground">Stuur een bericht</h2>
      <p className="mt-2 text-sm text-primary-foreground/75">
        Reactie binnen 48 uur. Voeg je ordernummer toe als het om een lopende bestelling gaat.
      </p>

      {sent ? (
        <div className="mt-6 rounded-md border border-success/40 bg-success-soft/30 p-5 text-sm text-primary-foreground">
          <CheckCircle2 size={18} className="text-success" />
          <p className="mt-2 font-medium">Bedankt, je bericht staat in onze inbox.</p>
          <p className="mt-1 text-primary-foreground/75">
            We reageren binnen 48 uur op {form.email || "het opgegeven e-mailadres"}. Voor spoed
            gebruik je de live chat rechtsonder.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-primary-foreground mb-1.5">Naam</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Voor- en achternaam"
              className="w-full h-11 px-3 rounded border border-primary-muted bg-primary-soft text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-primary-foreground mb-1.5">E-mail</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jij@voorbeeld.nl"
              className="w-full h-11 px-3 rounded border border-primary-muted bg-primary-soft text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-primary-foreground mb-1.5">
              Ordernummer (optioneel)
            </span>
            <input
              value={form.order_number}
              onChange={(e) => setForm({ ...form, order_number: e.target.value })}
              placeholder="ORDER-XXXXXXXX"
              className="w-full h-11 px-3 rounded border border-primary-muted bg-primary-soft text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <div>
            <label className="block text-sm font-medium text-primary-foreground mb-1.5">
              Onderwerp
            </label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full h-11 px-3 rounded border border-primary-muted bg-primary-soft text-sm text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option>Vraag over een bestelling</option>
              <option>Vraag over een product of verpakking</option>
              <option>Retour aanmelden</option>
              <option>Productadvies</option>
              <option>Anders</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-foreground mb-1.5">
              Bericht
            </label>
            <textarea
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Beschrijf je vraag zo concreet mogelijk."
              className="w-full px-3 py-2.5 rounded border border-primary-muted bg-primary-soft text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          {err && (
            <p className="text-sm text-danger inline-flex items-center gap-1">
              <AlertCircle size={13} /> {err}
            </p>
          )}
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-xs text-primary-foreground/55">
              Door te versturen ga je akkoord met onze{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                privacyverklaring
              </Link>
              .
            </p>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded bg-accent px-5 h-11 text-sm font-semibold text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Versturen…
                </>
              ) : (
                <>
                  <ShieldCheck size={14} /> Verstuur bericht
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
