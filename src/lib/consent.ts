/**
 * Toestemming voor analytische cookies.
 *
 * Bewuste keuze van de eigenaar: meten staat standaard aan, en de melding
 * wegklikken telt als akkoord. Alleen een expliciete "Nee" zet het uit.
 *
 * Dat is opt-out. Voor cookies vraagt de AVG toestemming vooraf en actief, dus
 * dit dekt de regels niet volledig. Het staat hier zo omdat het zo besloten is,
 * niet omdat het over het hoofd is gezien. Wat wel hard is: `denied` wordt
 * overal gerespecteerd, in GA4 en in onze eigen tracking.
 */

export const CONSENT_KEY = "kamagraexpert.consent.analytics";
export const CONSENT_EVENT = "kamagraexpert:consent-changed";

export type ConsentState = "granted" | "denied" | null;

/** De opgeslagen keuze. `null` betekent: nog niets gekozen. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Waar we ons naar gedragen. Niets gekozen telt als akkoord; zie de kop van
 * dit bestand. Gebruik deze functie, niet readConsent, om te beslissen of er
 * gemeten mag worden.
 */
export function effectiveConsent(): "granted" | "denied" {
  return readConsent() === "denied" ? "denied" : "granted";
}

export function writeConsent(state: Exclude<ConsentState, null>) {
  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {}
  // Zodat GA4 en de tracker direct reageren, zonder herladen.
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  } catch {}
}
