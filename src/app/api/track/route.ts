import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SHOP_ID = process.env.ANALYTICS_SHOP_ID || "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagraexpert

/**
 * Whitelist. Alles wat hier niet in staat wordt geweigerd, zodat een willekeurige
 * bezoeker de tabel niet kan vervuilen met verzonnen event-namen.
 */
const ALLOWED_EVENTS = new Set([
  "pageview",
  "product_view",
  "add_to_cart",
  "view_cart",
  "begin_checkout",
  "order_placed",
  "payment_redirect",
  "order_confirmed",
  "cart_restored",
  "restock_notify",
  "contact_submit",
  "chat_opened",
  "newsletter_signup",
  "cart_abandoned",
  "checkout_abandoned",
  "remove_from_cart",
  "add_shipping_info",
  "add_payment_info",
  "product_list_view",
  "product_click",
  "search",
  "calculator_used",
  "cta_click",
  "scroll_depth",
]);

const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|startpagina|startpage|brave|yandex|baidu)\./;
const SOCIAL_HOSTS =
  /(^|\.)(facebook|instagram|t\.co|twitter|x|linkedin|reddit|tiktok|youtube|pinterest|snapchat|whatsapp|telegram)\./;

/**
 * Bepaalt de verkeersbron server-side, zodat het dashboard niet per rij hoeft te
 * gokken en de indeling overal identiek is.
 */
function classifySource(referrerHost: string | null, utmSource?: string, utmMedium?: string): string {
  if (utmSource || utmMedium) return "campaign";
  if (!referrerHost) return "direct";
  if (/(^|\.)google\./.test(referrerHost)) return "google_organic";
  if (SEARCH_HOSTS.test(referrerHost)) return "search_other";
  if (SOCIAL_HOSTS.test(referrerHost)) return "social";
  return "referral";
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return new NextResponse(null, { status: 204 });

    const eventName = str(body.event_name, 40);
    const sessionId = str(body.session_id, 64);
    const visitorId = str(body.visitor_id, 64);
    if (!eventName || !ALLOWED_EVENTS.has(eventName) || !sessionId || !visitorId) {
      return new NextResponse(null, { status: 204 });
    }

    const referrerHost = str(body.referrer_host, 120);
    const utmSource = str(body.utm_source, 60) || undefined;
    const utmMedium = str(body.utm_medium, 60) || undefined;

    // Land uit de edge-header; niets fijnmaziger dan dat, en geen IP.
    const country =
      req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || null;

    const device = ["mobile", "tablet", "desktop"].includes(body.device) ? body.device : null;

    // props begrenzen zodat niemand hier een grote payload in kwijt kan.
    let props: Record<string, unknown> = {};
    if (body.props && typeof body.props === "object" && !Array.isArray(body.props)) {
      props = Object.fromEntries(
        Object.entries(body.props as Record<string, unknown>)
          .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
          .slice(0, 12)
          .map(([k, v]) => [k.slice(0, 32), typeof v === "string" ? v.slice(0, 200) : v]),
      );
    }

    const sb = createServiceClient();
    await sb.from("analytics_events").insert({
      shop_id: SHOP_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      event_name: eventName,
      path: str(body.path, 300),
      referrer_host: referrerHost,
      source_group: classifySource(referrerHost, utmSource, utmMedium),
      utm_source: utmSource ?? null,
      utm_medium: utmMedium ?? null,
      utm_campaign: str(body.utm_campaign, 80),
      device,
      country: country ? country.slice(0, 2).toUpperCase() : null,
      props,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    // Tracking mag nooit een fout naar de bezoeker teruggeven.
    return new NextResponse(null, { status: 204 });
  }
}
