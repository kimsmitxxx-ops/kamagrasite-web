import { track, getSessionId } from "./analytics";

/**
 * Verlaten winkelmand meten.
 *
 * Een verlaten mand is geen klik die je kunt opvangen: het is het uitblijven
 * van een bestelling. Daarom houdt deze module een momentopname van de mand
 * bij en kijkt hij wanneer de bezoeker weggaat.
 *
 * Wanneer we `cart_abandoned` sturen:
 *  - `pagehide` -- de bezoeker verlaat de pagina echt (tab sluiten, terug naar
 *    Google, adresbalk). Dit is het betrouwbare vertreksignaal en werkt ook op
 *    mobiel. We sturen met sendBeacon, dus het event overleeft het vertrek.
 *  - de pagina is 30 minuten onafgebroken verborgen. Dat vangt het tabblad dat
 *    blijft openstaan terwijl de bezoeker allang weg is.
 *
 * Wanneer juist NIET:
 *  - er is deze sessie al een bestelling geplaatst (`markOrderPlaced`);
 *  - we staan op het punt naar de betaalpagina te springen
 *    (`suppressAbandon`) -- dat is geen afhaken maar doorlopen;
 *  - het is in deze sessie al een keer gestuurd. Eén sessie met een gevulde
 *    mand zonder bestelling telt als één verlaten mand, niet als tien. Een
 *    tabwissel heen en weer levert dus geen extra events op.
 *
 * Heeft de bezoeker de kassa al bereikt, dan heet het `checkout_abandoned` en
 * sturen we het laatst aangeraakte veld mee. Dat laat zien wáár in het
 * formulier het misgaat in plaats van alleen dát het misgaat.
 */

type Snapshot = {
  count: number;
  valueCents: number;
  /** Korte omschrijving van de inhoud, voor GA4-items. */
  items: { id: string; name: string; qty: number; priceCents: number }[];
};

const FIRED_KEY = "an.cart_abandoned";
const HIDDEN_ABANDON_MS = 30 * 60 * 1000;

let snapshot: Snapshot = { count: 0, valueCents: 0, items: [] };
let reachedCheckout = false;
let lastField: string | null = null;
let orderPlaced = false;
let suppressed = false;
let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
let armed = false;

/** Al gestuurd in deze sessie? Sessie-id komt uit de eigen tracking. */
function alreadyFired(): boolean {
  try {
    return localStorage.getItem(FIRED_KEY) === getSessionId();
  } catch {
    return false;
  }
}

function markFired() {
  try {
    localStorage.setItem(FIRED_KEY, getSessionId());
  } catch {}
}

function fire(reason: "exit" | "idle") {
  if (orderPlaced || suppressed) return;
  if (snapshot.count <= 0) return;
  if (alreadyFired()) return;
  markFired();

  const base = {
    reason,
    items: snapshot.count,
    value_cents: snapshot.valueCents,
    products: snapshot.items.map((i) => i.id).join(",").slice(0, 200),
  };

  if (reachedCheckout) {
    track("checkout_abandoned", { ...base, last_field: lastField || "onbekend" });
  } else {
    track("cart_abandoned", base);
  }
}

function onPageHide() {
  fire("exit");
}

function onVisibility() {
  if (document.visibilityState === "hidden") {
    if (hiddenTimer) clearTimeout(hiddenTimer);
    hiddenTimer = setTimeout(() => {
      if (document.visibilityState === "hidden") fire("idle");
    }, HIDDEN_ABANDON_MS);
  } else if (hiddenTimer) {
    clearTimeout(hiddenTimer);
    hiddenTimer = null;
  }
}

/** Zet de luisteraars klaar. Idempotent, dus veilig bij elke render. */
export function armCartAbandonment() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("visibilitychange", onVisibility);
}

/** De mand is gewijzigd. Roep dit aan bij elke wijziging van de inhoud. */
export function setCartSnapshot(next: Snapshot) {
  snapshot = next;
  // Mand leeggemaakt zonder bestelling: het vertreksignaal hoort opnieuw te
  // mogen vuren zodra er weer iets in ligt.
  if (next.count === 0 && !orderPlaced) {
    try {
      if (localStorage.getItem(FIRED_KEY) === getSessionId()) localStorage.removeItem(FIRED_KEY);
    } catch {}
  }
}

/** De bezoeker is op de kassa beland. */
export function markCheckoutReached() {
  reachedCheckout = true;
}

/** Laatst aangeraakte formulierveld, voor `checkout_abandoned`. */
export function markCheckoutField(name: string) {
  lastField = name;
}

/** Er is besteld: vanaf nu is er niets meer om te verlaten. */
export function markOrderPlaced() {
  orderPlaced = true;
  try {
    localStorage.removeItem(FIRED_KEY);
  } catch {}
}

/**
 * Tijdelijk uitzetten rond een bewuste navigatie weg van de site, zoals de
 * sprong naar de betaalomgeving. Zonder dit zou elke betaling ook als een
 * verlaten mand binnenkomen.
 */
export function suppressAbandon() {
  suppressed = true;
}
