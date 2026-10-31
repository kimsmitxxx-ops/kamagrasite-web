"use client";
import { useState } from "react";
import { Mail, ArrowRight, KeyRound } from "lucide-react";

/**
 * Inloggen in twee stappen: adres invullen, dan de code uit de mail.
 *
 * Deze pagina praat alleen met ons eigen domein. Hiervoor stond hier de
 * Supabase-client, die de projectnaam en de publieke sleutel in de JS-bundle
 * zette en rechtstreeks met de authenticatieserver praatte. Het inwisselen van
 * de code doet de server nu (src/lib/sessie.ts).
 */
export default function LoginPage() {
  const [stap, setStap] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const vraagCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setFout(null);
    try {
      const r = await fetch("/api/account/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setFout(j.error || "Er ging iets mis. Probeer het opnieuw.");
      } else {
        setStap("code");
      }
    } catch {
      setFout("Er ging iets mis. Probeer het opnieuw.");
    }
    setBusy(false);
  };

  const stuurCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFout(null);
    try {
      const r = await fetch("/api/account/sessie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setFout(j.error || "Deze code klopt niet.");
        setBusy(false);
        return;
      }
      window.location.href = "/account/";
    } catch {
      setFout("Er ging iets mis. Probeer het opnieuw.");
      setBusy(false);
    }
  };

  if (stap === "code") {
    return (
      <div className="mx-auto mt-20 max-w-md px-6">
        <h1 className="font-display text-3xl">Code invullen</h1>
        <p className="mt-2 text-sm text-text-muted">
          We hebben een code van zes cijfers gestuurd naar <strong>{email}</strong>.
        </p>
        <form onSubmit={stuurCode} className="mt-6 space-y-3">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-lg border border-paper-border bg-paper-soft px-4 py-3 pl-10 text-center text-lg tracking-[0.4em] outline-none focus:border-accent"
            />
          </div>
          {fout && <p className="text-sm text-danger">{fout}</p>}
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
          >
            {busy ? "Controleren…" : "Inloggen"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <button
          onClick={() => { setStap("email"); setCode(""); setFout(null); }}
          className="mt-6 w-full text-center text-xs text-text-subtle hover:text-text"
        >
          Ander e-mailadres gebruiken
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-md px-6">
      <h1 className="font-display text-3xl">Inloggen</h1>
      <p className="mt-2 text-sm text-text-muted">
        Geen wachtwoord. Vul je e-mailadres in en we sturen een inlogcode.
      </p>
      <form onSubmit={vraagCode} className="mt-6 space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@email.com"
            className="w-full rounded-lg border border-paper-border bg-paper-soft px-4 py-3 pl-10 text-sm outline-none focus:border-accent"
          />
        </div>
        {fout && <p className="text-sm text-danger">{fout}</p>}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
        >
          {busy ? "Versturen…" : "Stuur inlogcode"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-text-subtle">Geen account? Wordt automatisch aangemaakt.</p>
    </div>
  );
}
