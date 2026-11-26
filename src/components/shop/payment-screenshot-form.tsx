"use client";
import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, AlertCircle } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function PaymentScreenshotForm({ orderId, customerEmail }: { orderId: string; customerEmail: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function handleFile(f: File | null) {
    setErr(null);
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setErr("Alleen JPG/PNG/WebP toegestaan");
      return;
    }
    if (f.size > MAX_BYTES) {
      setErr(`Bestand te groot (max 5MB, jouw bestand is ${(f.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("order_id", orderId);
      fd.append("email", customerEmail);
      const res = await fetch("/api/payment-screenshot", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error || "Upload mislukt");
        return;
      }
      setDone(true);
    } catch {
      setErr("Verbindingsfout - probeer opnieuw");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-success/40 bg-success-soft/30 p-4 flex items-start gap-2.5">
        <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-text">Screenshot ontvangen, dank je</p>
          {/* Stond hier als "wij zetten je bestelling in behandeling". Dat
              gebeurde ook letterlijk: de upload zette de bestelling op een
              betaald-stand zonder dat iemand geld had gezien. Dat is eruit
              (shop-dash migratie 125), dus deze tekst belooft het ook niet
              meer. */}
          <p className="mt-1 text-xs text-text-muted">
            We koppelen je betaling eraan zodra die op de rekening staat. Je pakket
            gaat weg als het geld binnen is.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label
        className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border-strong bg-background p-4 cursor-pointer hover:border-accent transition-colors"
      >
        <Upload size={20} className="text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <p className="text-sm font-medium text-text truncate">{file.name}</p>
              <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-text">Kies screenshot</p>
              <p className="text-xs text-text-muted">JPG / PNG / WebP, max 5MB</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>
      <button
        type="submit"
        disabled={busy || !file}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Uploaden…
          </>
        ) : (
          <>
            <Upload size={15} /> Verstuur screenshot
          </>
        )}
      </button>
      {err && (
        <p className="text-xs text-danger inline-flex items-center gap-1">
          <AlertCircle size={12} /> {err}
        </p>
      )}
      {/* "Versleuteld opgeslagen" stond hier en dat is meer dan we kunnen
          hardmaken. Wat wel klopt en nagekeken is: de opslag staat op privé en
          is alleen met een tijdelijke link te openen, dus niemand komt erbij
          buiten onze klantenservice. */}
      <p className="text-[11px] text-text-subtle">
        Je screenshot staat niet openbaar en is alleen voor onze klantenservice, om je
        betaling terug te vinden.
      </p>
    </form>
  );
}
