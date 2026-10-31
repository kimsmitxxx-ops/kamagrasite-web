import { supabase, type Product, type Category, type BlogPost } from "./supabase";

// Hardcoded shop_id voor kamagrasite - fallback voor scoped JWT die niet werkt.
// RLS-policies in shop-dash migration 051 staan anon SELECT toe op deze shop.
const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

// Volgorde waarin productlijnen in het grid verschijnen. Kamagra is de bekendste
// naam en de meest gezochte term, daarna de overige sildenafil-lijnen, dan
// tadalafil en vardenafil, en als laatste de combi-preparaten.
const LIJN_VOLGORDE = [
  "kamagra",
  "cenforce",
  "vidalista",
  "vilitra",
  "super p-force",
  "super kamagra",
  "super vidalista",
  "lovegra",
];

function lijnScore(name: string): number {
  const n = name.toLowerCase();
  let best = 999;
  for (let i = 0; i < LIJN_VOLGORDE.length; i++) {
    if (n.includes(LIJN_VOLGORDE[i])) best = Math.min(best, i);
  }
  return best;
}

// Sorteer producten: eerst op productlijn, daarna op de handmatige sort_order
// uit shop-dash, en binnen dezelfde lijn van lage naar hoge dosering/prijs.
export function sortProducts<T extends { name: string; sort_order?: number | null; price_cents?: number }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const la = lijnScore(a.name);
    const lb = lijnScore(b.name);
    if (la !== lb) return la - lb;
    const sa = a.sort_order ?? 999;
    const sb = b.sort_order ?? 999;
    if (sa !== sb) return sa - sb;
    return (a.price_cents ?? 0) - (b.price_cents ?? 0);
  });
}

// Alle queries try/catch-safe: returnen lege array/null bij DB-error
// zodat Next.js build niet faalt en pagina's gracefully renderen.

export async function listFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const { data } = await supabase.from("products")
      .select("*, categories(slug, name)")
      .eq("shop_id", SHOP_ID)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order")
      .limit(limit);
    return (data ?? []) as Product[];
  } catch { return []; }
}

export async function listProducts(opts: { categorySlug?: string; tag?: string; limit?: number } = {}): Promise<Product[]> {
  try {
    let q = supabase.from("products")
      .select("*, categories(slug, name)")
      .eq("shop_id", SHOP_ID)
      .eq("is_active", true)
      .order("sort_order");
    if (opts.categorySlug) {
      const cat = await supabase.from("categories").select("id").eq("shop_id", SHOP_ID).eq("slug", opts.categorySlug).maybeSingle();
      if (cat.data) q = q.eq("category_id", cat.data.id);
    }
    if (opts.tag) q = q.contains("tags", [opts.tag]);
    if (opts.limit) q = q.limit(opts.limit);
    const { data } = await q;
    return (data ?? []) as Product[];
  } catch { return []; }
}

export async function getProduct(slug: string) {
  try {
    const { data } = await supabase.from("products")
      .select("*, categories(slug, name), product_media(url, alt, sort_order, is_primary)")
      .eq("shop_id", SHOP_ID)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data;
  } catch { return null; }
}

export async function listCategories(): Promise<Category[]> {
  try {
    const { data } = await supabase.from("categories")
      .select("*")
      .eq("shop_id", SHOP_ID)
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Category[];
  } catch { return []; }
}

export async function getCategory(slug: string): Promise<Category | null> {
  try {
    const { data } = await supabase.from("categories")
      .select("*")
      .eq("shop_id", SHOP_ID)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return data as Category | null;
  } catch { return null; }
}

export async function listBlogPosts(limit = 50): Promise<BlogPost[]> {
  try {
    const { data } = await supabase.from("blog_posts")
      .select("id, slug, title, excerpt, image_url, category, published_at, author, meta_title, meta_description, body")
      .eq("shop_id", SHOP_ID)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as BlogPost[];
  } catch { return []; }
}

export async function getBlogPost(slug: string): Promise<(BlogPost & { author_info?: BlogAuthor | null }) | null> {
  try {
    const { data } = await supabase.from("blog_posts")
      .select("*, blog_authors(id, slug, name, role, bio_short, bio_long, avatar_url, expertise, credentials)")
      .eq("shop_id", SHOP_ID)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return null;
    const { blog_authors, ...post } = data as any;
    return { ...post, author_info: blog_authors || null } as any;
  } catch { return null; }
}

export type BlogAuthor = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio_short: string | null;
  bio_long: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
  credentials: string[] | null;
};

export async function listBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    const { data } = await supabase.from("blog_authors")
      .select("id, slug, name, role, bio_short, bio_long, avatar_url, expertise, credentials, sort_order")
      .eq("shop_id", SHOP_ID)
      .eq("is_active", true)
      .order("sort_order");
    return (data ?? []) as BlogAuthor[];
  } catch { return []; }
}

export type ProductReview = {
  id: string;
  rating: number;
  author_name: string;
  title: string | null;
  body: string | null;
  created_at: string;
  published_at: string | null;
};

export async function listProductReviews(productId: string, limit = 20): Promise<ProductReview[]> {
  try {
    const { data } = await supabase.from("product_reviews")
      .select("id, rating, author_name, title, body, created_at, published_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .eq("is_spam", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as ProductReview[];
  } catch { return []; }
}

/**
 * Kolommen van `shops` die de anon key mag lezen. Expliciet in plaats van
 * `select("*")`, want sinds shop-dash migratie 054 heeft anon alleen nog
 * kolom-grants: `settings` (met smtp-wachtwoord en kortingscodes) en
 * `paytail_api_key` zijn afgeschermd, en `select("*")` zou dus afketsen op
 * "permission denied for column". Voeg je een publieke kolom toe aan shops,
 * dan moet die hier én in de GRANT van 054 erbij.
 */
const SHOP_PUBLIC_COLUMNS =
  "id, slug, name, domain, email, iban, bank_name, kvk, btw, created_at, updated_at, logo_url, description, phone, address_street, address_postal, address_city, address_country, bic, shipping_free_above_cents, shipping_nl_cents, shipping_be_cents, shipping_de_cents, shipping_eu_cents, payment_instructions, order_prefix, reminder_days, is_active, theme_color, meta_title, meta_description, paytail_enabled, paytail_base_url, paytail_return_path, paytail_btn_label, paytail_btn_color, paytail_btn_text_color, iban_enabled, maintenance_mode, maintenance_message, noindex, product_url_pattern, default_meta_title_template, default_meta_description_template, llms_txt" as const;

export async function getShop() {
  try {
    const { data } = await supabase
      .from("shops")
      .select(SHOP_PUBLIC_COLUMNS)
      .eq("id", SHOP_ID)
      .maybeSingle();
    return data;
  } catch { return null; }
}

export type PaymentInstructions = {
  bank_name?: string;
  iban?: string;
  bic?: string;
  account_holder?: string;
  crypto_addresses?: Array<{ label: string; ticker: string; address: string }>;
  instructions_html?: string;
};

export async function getShopPaymentInstructions(): Promise<PaymentInstructions | null> {
  try {
    const { data } = await supabase
      .from("shops")
      .select("payment_instructions")
      .eq("id", SHOP_ID)
      .maybeSingle();
    return (data?.payment_instructions as PaymentInstructions) || null;
  } catch {
    return null;
  }
}

export async function getOrderForConfirmation(orderId: string) {
  try {
    const { data } = await supabase
      .from("orders")
      .select("id, email, customer_name, total_cents, subtotal_cents, shipping_cents, created_at")
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

// Staat in lib/format.ts omdat client-componenten het nodig hebben en dit
// bestand de Supabase-client aanmaakt. Hier doorgegeven zodat server-code die
// het al importeerde niets hoeft te wijzigen.
export { formatEUR } from "./format";

// ---------------------------------------------------------------------------
// Koop-pagina's (buy_pages, migratie 052)
//
// Transactionele landingspagina's op root-niveau: /kamagra-kopen. Bestaan naast
// /winkel/<categorie>, die de browse-/filterweergave blijft. Elke rij kiest
// declaratief zijn producten; resolveBuyPageProducts unieert die bronnen.
// ---------------------------------------------------------------------------

export type BuyPage = {
  id: string;
  slug: string;
  h1: string;
  nav_label: string | null;
  meta_title: string | null;
  meta_description: string | null;
  intro: string | null;
  seo_body_html: string | null;
  faqs: { q: string; a: string }[] | null;
  product_slugs: string[] | null;
  category_slugs: string[] | null;
  stof_slugs: string[] | null;
  tag: string | null;
  show_price_table: boolean;
  show_bulk_block: boolean;
  related_slugs: string[] | null;
  canonical_url: string | null;
  noindex: boolean;
  sort_order: number;
  updated_at: string;
};

const BUY_PAGE_COLS =
  "id, slug, h1, nav_label, meta_title, meta_description, intro, seo_body_html, faqs, " +
  "product_slugs, category_slugs, stof_slugs, tag, show_price_table, show_bulk_block, " +
  "related_slugs, canonical_url, noindex, sort_order, updated_at";

export async function listBuyPages(): Promise<BuyPage[]> {
  try {
    const { data } = await supabase.from("buy_pages")
      .select(BUY_PAGE_COLS)
      .eq("shop_id", SHOP_ID)
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as unknown as BuyPage[];
  } catch { return []; }
}

export async function getBuyPage(slug: string): Promise<BuyPage | null> {
  try {
    const { data } = await supabase.from("buy_pages")
      .select(BUY_PAGE_COLS)
      .eq("shop_id", SHOP_ID)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as unknown as BuyPage) || null;
  } catch { return null; }
}

/**
 * Lost de productselectie van een koop-pagina op.
 *
 * Expliciete product_slugs houden hun eigen volgorde en staan vooraan - zo kan
 * een pagina zijn beste aanbod bovenaan zetten. Wat daarna via categorie, stof
 * of tag binnenkomt gaat door sortProducts en wordt op id gededupliceerd.
 */
export async function resolveBuyPageProducts(page: BuyPage): Promise<Product[]> {
  const explicit = page.product_slugs ?? [];
  const cats = page.category_slugs ?? [];
  const stoffen = (page.stof_slugs ?? []).map((s) => s.toLowerCase());

  try {
    const batches: Product[][] = [];

    if (explicit.length > 0) {
      const { data } = await supabase.from("products")
        .select("*, categories(slug, name)")
        .eq("shop_id", SHOP_ID)
        .eq("is_active", true)
        .in("slug", explicit);
      const bySlug = new Map((data ?? []).map((p: any) => [p.slug, p as Product]));
      // Volgorde van product_slugs aanhouden, niet die van de DB.
      batches.push(explicit.map((s) => bySlug.get(s)).filter(Boolean) as Product[]);
    }

    for (const c of cats) {
      batches.push(sortProducts(await listProducts({ categorySlug: c })));
    }

    if (page.tag) {
      batches.push(sortProducts(await listProducts({ tag: page.tag })));
    }

    if (stoffen.length > 0) {
      const { data } = await supabase.from("products")
        .select("*, categories(slug, name)")
        .eq("shop_id", SHOP_ID)
        .eq("is_active", true)
        .overlaps("stof_slugs", stoffen);
      batches.push(sortProducts((data ?? []) as Product[]));
    }

    // Geen enkel criterium gezet: val terug op de hele catalogus in plaats van
    // een lege pagina uitleveren.
    if (batches.length === 0) {
      batches.push(sortProducts(await listProducts()));
    }

    const seen = new Set<string>();
    const out: Product[] = [];
    for (const batch of batches) {
      for (const p of batch) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        out.push(p);
      }
    }
    return out;
  } catch { return []; }
}
