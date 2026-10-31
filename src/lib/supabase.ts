/**
 * Supabase server-side client voor data fetching in Next.js server components.
 *
 * Fallback URL + anon key zijn hardcoded - beide PUBLIC. RLS-policies in
 * shop-dash migration 051 scopen alle SELECT-queries naar kamagrasite shop_id.
 * Zonder env vars op Vercel werkt de shop dus alsnog.
 */
import { createClient } from "@supabase/supabase-js";

import { SB_URL, SB_ANON } from "./supabase-config";
import { schoonFetch } from "./media";

/**
 * READ-only client via anon key - voor product/blog/category listings.
 * RLS-policies scopen alles per shop_id.
 */
export const supabase = createClient(SB_URL, SB_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
  // Zie anabolenpro en anabolendoktor: Next cachet fetches in de Vercel Data
  // Cache en die overleeft een deploy, dus force-dynamic alleen levert alsnog
  // oude data uit Supabase.
  //
  // schoonFetch haalt bovendien de storage-URL's uit het antwoord, zodat geen
  // enkele pagina de projectnaam van Supabase in de broncode kan zetten. Zie
  // lib/media.ts voor waarom dat hier zit en niet per component.
  global: { fetch: (url, init) => schoonFetch(url, { ...init, cache: "no-store" }) },
});

/**
 * WRITE client - gebruikt SUPABASE_SHOP_KEY (SERVER-only!): de per-shop sleutel met rol
 * shop_server, die alleen de rijen van deze shop opent (shop-dash migratie 059). Vereist
 * voor writes zoals orders + payment_screenshots + restock_notifications
 * binnen de eigen shop. Faalt met duidelijke error als env var mist.
 * Gebruik in Route Handlers, NOOIT in client components.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SHOP_KEY || "";
  if (!key) {
    throw new Error("SUPABASE_SHOP_KEY ontbreekt (per-shop Supabase-sleutel, rol shop_server)");
  }
  return createClient(SB_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => schoonFetch(url, init) },
  });
}

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  image_url: string | null;
  category_id: string | null;
  package_type: string | null;
  tags: string[] | null;
  stof_slugs?: string[] | null;
  availability: string | null;
  is_active: boolean;
  is_featured?: boolean;
  noindex?: boolean;
  specifications?: Record<string, string> | null;
  faqs?: { q: string; a: string }[] | null;
  usps?: string[] | null;
  categories?: { slug: string; name: string } | null;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  intro_html: string | null;
  seo_body_html: string | null;
  faqs: { q: string; a: string }[] | null;
  meta_title: string | null;
  meta_description: string | null;
  hero_image: string | null;
  sort_order: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  image_url: string | null;
  image_alt: string | null;
  category: string | null;
  published_at: string;
  author: string | null;
  author_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
};
