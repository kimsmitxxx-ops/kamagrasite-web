"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Compacte melding over meten, met een echte weigerknop.
 *
 * Mag niet in de weg zitten, dus: klein kaartje linksonder, geen overlay, de
 * site blijft gewoon bedienbaar. Ernaast klikken of Escape sluit hem, en dat
 * telt als akkoord omdat meten standaard aan staat. Zie src/lib/consent.ts
 * voor waarom dat zo gekozen is.
 *
 * "Nee" is een gewone, even leesbare knop. Dat is het minimum: een melding
 * waarin weigeren wegstopt is erger dan geen melding.
 */
export function ConsentNotice() {
  const [zichtbaar, setZichtbaar] = useState(false);
  const kaart = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Alleen tonen zolang er nog niets gekozen is.
    if (readConsent() === null) setZichtbaar(true);
  }, []);

  useEffect(() => {
    if (!zichtbaar) return;

    const sluit = () => {
      writeConsent("granted");
      setZichtbaar(false);
    };
    const buiten = (e: MouseEvent) => {
      if (kaart.current && !kaart.current.contains(e.target as Node)) sluit();
    };
    const toets = (e: KeyboardEvent) => {
      if (e.key === "Escape") sluit();
    };

    // In een timeout, anders vangt dezelfde klik die de pagina opende hem al op.
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", buiten);
      document.addEventListener("keydown", toets);
    }, 0);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", buiten);
      document.removeEventListener("keydown", toets);
    };
  }, [zichtbaar]);

  if (!zichtbaar) return null;

  const kies = (keuze: "granted" | "denied") => {
    writeConsent(keuze);
    setZichtbaar(false);
  };

  return (
    <div
      ref={kaart}
      role="region"
      aria-label="Cookiemelding"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm rounded-xl border border-black/10 bg-white/95 p-4 text-[13px] leading-relaxed text-neutral-700 shadow-lg backdrop-blur-sm sm:right-auto dark:border-white/15 dark:bg-neutral-900/95 dark:text-neutral-200"
    >
      <p>
        We meten anoniem hoe de site gebruikt wordt. Geen advertenties.{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:no-underline"
        >
          Privacybeleid
        </Link>
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => kies("granted")}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-neutral-900"
        >
          Oké
        </button>
        <button
          type="button"
          onClick={() => kies("denied")}
          className="rounded-full border border-black/15 px-4 py-1.5 text-[13px] font-medium transition-colors hover:border-black/40 dark:border-white/25 dark:hover:border-white/60"
        >
          Nee
        </button>
      </div>
    </div>
  );
}
