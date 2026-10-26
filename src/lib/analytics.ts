import { effectiveConsent } from "./consent";
/**
 * Eigen bezoekers- en conversie-tracking. Geen GA4, geen externe scripts.
 *
 * Cookieloos en zonder PII: een visitor-id en een sessie-id, beide random en
 * niet herleidbaar naar een persoon. Geen IP, geen user-agent, geen cookies --
 * dus ook geen cookiebanner nodig. Events gaan naar /api/track op ons eigen
 * domein (same-origin), wat twee dingen oplost: geen CORS-preflight, en
 * adblockers die cross-domain analytics-beacons tegenhouden hebben hier niets
 * te blokkeren.
 */

const VISITOR_KEY = "an.vid";
const SESSION_KEY = "an.sid";
const SESSION_SEEN_KEY = "an.sseen";

// Standaard sessie-definitie: 30 minuten inactiviteit sluit de sessie af.
// Bewust in localStorage en niet sessionStorage, anders telt elk tweede tabblad
// als een nieuwe sessie en lopen de sessiecijfers structureel te hoog op.
const SESSION_IDLE_MS = 30 * 60 * 1000;

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getVisitorId(): string {
  let v = readStore(VISITOR_KEY);
  if (!v) {
    v = randomId();
    writeStore(VISITOR_KEY, v);
  }
  return v;
}

export function getSessionId(): string {
  const now = Date.now();
  const seen = Number(readStore(SESSION_SEEN_KEY) || 0);
  let s = readStore(SESSION_KEY);
  if (!s || !seen || now - seen > SESSION_IDLE_MS) {
    s = randomId();
    writeStore(SESSION_KEY, s);
  }
  writeStore(SESSION_SEEN_KEY, String(now));
  return s;
}

/** Alleen de hostnaam van de referrer -- nooit de volledige URL met query. */
function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const u = new URL(document.referrer);
    if (u.hostname === location.hostname) return null; // interne navigatie
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function utm() {
  try {
    const p = new URLSearchParams(location.search);
    return {
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

function device(): "mobile" | "tablet" | "desktop" {
  try {
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  } catch {
    return "desktop";
  }
}

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

/**
 * GA4-brug: stuurt hetzelfde event ook naar gtag, vertaald naar het GA4
 * e-commerce vocabulaire zodat het als standaard-event (met omzet) in GA4
 * verschijnt. pageview slaan we over -- de GA4-component meldt page_views al
 * zelf bij elke routewissel. Bedragen rekenen we om van centen naar euro's.
 *
 * De namen links zijn van ons, die rechts van GA4. Waar GA4 een standaardnaam
 * heeft gebruiken we die, want alleen dan vult GA4 de ingebouwde
 * e-commercerapporten en de trechter. Wat GA4 niet kent (een verlaten mand is
 * geen standaard-event) gaat als custom event door onder onze eigen naam.
 */
const GA4_NAMES: Record<string, string> = {
  product_view: "view_item",
  product_list_view: "view_item_list",
  product_click: "select_item",
  add_to_cart: "add_to_cart",
  remove_from_cart: "remove_from_cart",
  view_cart: "view_cart",
  begin_checkout: "begin_checkout",
  add_shipping_info: "add_shipping_info",
  add_payment_info: "add_payment_info",
  order_placed: "purchase",
  search: "search",
  newsletter_signup: "sign_up",
};

/** Events waar GA4 een items-array bij verwacht. */
const GA4_WITH_ITEMS = new Set([
  "view_item",
  "view_item_list",
  "select_item",
  "add_to_cart",
  "remove_from_cart",
  "view_cart",
  "begin_checkout",
  "add_shipping_info",
  "add_payment_info",
  "purchase",
  "cart_abandoned",
  "checkout_abandoned",
]);

/**
 * Bouwt de items-array. Eén product komt binnen als sku/product_slug; een hele
 * mand als een kommalijst in `products`. Zonder items laat GA4 de
 * e-commercerapporten leeg, ook als het bedrag wel klopt.
 */
function ga4Items(props: TrackProps) {
  const listed =
    typeof props.products === "string" && props.products
      ? props.products.split(",").filter(Boolean)
      : [];
  if (listed.length > 0) {
    return listed.map((id) => ({ item_id: id, item_name: id, quantity: 1 }));
  }
  const id = String(props.sku || props.product_slug || props.product_id || "");
  if (!id) return undefined;
  return [
    {
      item_id: id,
      item_name: String(props.product_name || props.product_slug || id),
      quantity: Number(props.qty) || 1,
      ...(typeof props.price_cents === "number"
        ? { price: props.price_cents / 100 }
        : {}),
    },
  ];
}

function forwardToGa4(eventName: string, props: TrackProps) {
  const gtag = window.gtag;
  if (!gtag || eventName === "pageview") return;

  const value =
    typeof props.value_cents === "number" ? props.value_cents / 100 : undefined;
  const name = GA4_NAMES[eventName] || eventName;

  // Centen horen niet in GA4 -- daar staat `value` altijd in euro's. Zou het
  // allebei meegaan, dan telt iemand later de verkeerde kolom op.
  const rest: TrackProps = { ...props };
  delete rest.value_cents;
  delete rest.price_cents;

  const payload: Record<string, unknown> = {
    ...(name === "purchase" || GA4_WITH_ITEMS.has(name) ? {} : rest),
    ...(value !== undefined ? { value, currency: "EUR" } : {}),
  };

  if (GA4_WITH_ITEMS.has(name)) {
    const items = ga4Items(props);
    if (items) payload.items = items;
    if (value !== undefined) payload.currency = "EUR";
  }

  if (name === "purchase") {
    payload.transaction_id = String(props.order_reference || "");
    if (typeof props.shipping_cents === "number") {
      payload.shipping = props.shipping_cents / 100;
    }
  }

  if (name === "cart_abandoned" || name === "checkout_abandoned") {
    // Reden en laatste veld zijn juist het interessante deel: daarmee zie je
    // of iemand wegklikte of het tabblad liet staan, en waar in het formulier.
    payload.reason = String(props.reason || "exit");
    if (props.last_field) payload.last_field = String(props.last_field);
    if (props.items !== undefined) payload.cart_items = Number(props.items) || 0;
  }

  gtag("event", name, payload);
}

/**
 * Verstuurt een event. Faalt altijd stil: tracking mag nooit een bestelling of
 * een navigatie in de weg zitten.
 */
export function track(eventName: string, props: TrackProps = {}) {
  // Een "Nee" in de cookiemelding zet ook onze eigen meting stil. Die is
  // weliswaar cookieloos en zonder persoonsgegevens, maar wie nee zegt
  // bedoelt niet "behalve dan jullie eigen tellertje".
  if (effectiveConsent() === "denied") return;
  if (typeof window === "undefined") return;
  try {
    forwardToGa4(eventName, props);
  } catch {}
  try {
    const body = JSON.stringify({
      event_name: eventName,
      path: location.pathname,
      referrer_host: referrerHost(),
      ...utm(),
      device: device(),
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      props,
    });

    // sendBeacon overleeft het wegnavigeren van de pagina -- belangrijk voor
    // events die vlak voor een redirect vuren, zoals payment_redirect.
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
