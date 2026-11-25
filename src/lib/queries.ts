import { supabase, createServiceClient, type Product, type Category, type BlogPost } from "./supabase";

// Hardcoded shop_id voor kamagrasite - fallback voor scoped JWT die niet werkt.
// RLS-policies in shop-dash migration 051 staan anon SELECT toe op deze shop.
export const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

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

// Sorteer producten: uitverkocht altijd onderaan, dan op productlijn, dan op
// de handmatige sort_order uit shop-dash, en binnen dezelfde lijn van lage
// naar hoge dosering/prijs.
//
// Uitverkocht zakt naar beneden omdat een bezoeker die bovenaan een rij
// "niet op voorraad" ziet staan afhaakt voordat hij bij de producten komt die
// hij wél kan bestellen. Van de 39 producten staat ruim een derde op
// OutOfStock, dus dat is geen theoretisch geval.
//
// PreOrder zakt bewust NIET mee: dat is besteld-en-onderweg en gewoon te
// kopen, zie het pre-order-model in shop-dash. Die hoort dus tussen de
// normale producten te blijven staan.
export function sortProducts<T extends {
  name: string;
  sort_order?: number | null;
  price_cents?: number;
  availability?: string | null;
}>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const ua = a.availability === "OutOfStock" ? 1 : 0;
    const ub = b.availability === "OutOfStock" ? 1 : 0;
    if (ua !== ub) return ua - ub;
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
      .select("*, categories!products_category_id_fkey(slug, name)")
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
      .select(
        // Alleen bij een categoriepagina de koppeltabel erbij halen: met
        // !inner valt een product zonder categorie anders helemaal weg.
        opts.categorySlug ? "*, categories!products_category_id_fkey(slug, name)" + ", product_categories!inner(category_id)" : "*, categories!products_category_id_fkey(slug, name)",
      )
      .eq("shop_id", SHOP_ID)
      .eq("is_active", true)
      .order("sort_order");
    if (opts.categorySlug) {
      const cat = await supabase.from("categories").select("id").eq("shop_id", SHOP_ID).eq("slug", opts.categorySlug).maybeSingle();
      // Een product kan in meerdere categorieën staan (migratie 103), dus de
      // koppeltabel is leidend. Hiervoor telde ook een oude WooCommerce-tag
      // met dezelfde naam mee, en dat maakte "haal dit product uit de
      // categorie" in het dashboard zinloos: de tag bleef staan.
      if (cat.data) q = q.eq("product_categories.category_id", cat.data.id);
    }
    if (opts.tag) q = q.contains("tags", [opts.tag]);
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    // PostgREST geeft bij een mislukte embed een foutobject in plaats van
    // rijen. Dat werd hier stil een lege lijst, en een lege lijst ziet eruit
    // als een shop zonder producten. De omzetting gaat daarom via unknown en
    // de fout gaat naar het logboek.
    if (error) console.error("producten ophalen mislukte", error);
    return (data ?? []) as unknown as Product[];
  } catch (e) {
    console.error("producten ophalen gooide", e);
    return [];
  }
}

export async function getProduct(slug: string) {
  try {
    const { data } = await supabase.from("products")
      .select("*, categories!products_category_id_fkey(slug, name), product_media(url, alt, sort_order, is_primary)")
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

/**
 * Bestond deze blogslug ooit, los van of hij gepubliceerd is?
 *
 * WAAROM DIT EEN RPC IS EN GEEN SELECT
 * De eerste versie deed een gewone select op blog_posts. Die werkte niet, en
 * dat was juist goed: RLS laat de sleutel van een shop alleen gepubliceerde
 * rijen zien, dus kwam een uitgezet artikel als leeg terug en bleef de 404
 * staan. Nagemeten met de sleutel van de site: de rij kwam als [] terug terwijl
 * hij wel bestaat. De fix was dus dode code, en typecheck en build merkten dat
 * niet.
 *
 * De RLS-regel verruimen zou betekenen dat de publieke sleutel de titels en
 * teksten van concepten kan lezen, en dat is precies het lek dat migratie 054
 * dichtte. blog_slug_bestaat (migratie 126) geeft daarom alleen een boolean
 * terug: dat de URL bestaat weet de bezoeker al, want hij vraagt hem op.
 *
 * WAARVOOR
 * Zodat de route onderscheid kan maken tussen "bestaat niet" (404, terecht) en
 * "bestaat wel maar staat uit" (301 naar het overzicht). Een artikel uitzetten
 * zette daarvoor stil een rankende URL op een 404.
 */
export async function blogSlugBestaat(slug: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc("blog_slug_bestaat", {
      p_shop_id: SHOP_ID,
      p_slug: slug,
    });
    return data === true;
  } catch { return false; }
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

/**
 * De bestelling achter de bedankt-pagina.
 *
 * Twee dingen die hier fout stonden en samen elke bestelling op een 404 lieten
 * eindigen (de pagina doet `notFound()` als dit null teruggeeft):
 *
 *  * `email` bestaat niet op orders, de kolom heet `customer_email`. PostgREST
 *    geeft dan een foutobject in plaats van een rij.
 *  * de lees-client op de anon-sleutel mag orders niet zien: anon heeft alleen
 *    een insert-policy (`orders_public_insert`), geen select. Dit moet dus via
 *    de shopsleutel, net als bij kamagrashop.
 *
 * De fout wordt gelogd en niet geslikt, anders is een kapotte query straks weer
 * niet van een onbekende bestelling te onderscheiden.
 */
export async function getOrderForConfirmation(orderId: string) {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("orders")
      .select("id, reference, customer_email, customer_name, total_cents, subtotal_cents, shipping_cents, created_at")
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID)
      .maybeSingle();
    if (error) console.error("bestelling voor de bedankt-pagina ophalen mislukte", error);
    return data;
  } catch (e) {
    console.error("bestelling voor de bedankt-pagina ophalen mislukte", e);
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

/**
 * De stadspagina's, op tag in plaats van op een lijst in de code.
 *
 * Deze pagina's waren weespagina's: ze stonden in de sitemap maar er
 * linkte geen enkele pagina naartoe, niet uit het menu en niet uit de footer.
 * Ze zijn daardoor alleen via Google te vinden en krijgen geen interne
 * linkwaarde. Via de tag verschijnt een nieuwe stad die in shop-dash wordt
 * aangemaakt vanzelf in de footer.
 */
export async function listStadPaginas(): Promise<BuyPage[]> {
  const { data, error } = await supabase.from("buy_pages")
    .select(BUY_PAGE_COLS)
    .eq("shop_id", SHOP_ID)
    .eq("is_published", true)
    .eq("tag", "stad")
    .order("nav_label");
  if (error) {
    console.error("stadspagina's ophalen mislukte", error);
    return [];
  }
  return (data ?? []) as unknown as BuyPage[];
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
        .select("*, categories!products_category_id_fkey(slug, name)")
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
        .select("*, categories!products_category_id_fkey(slug, name)")
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

// ---------------------------------------------------------------------------
// Betaalpagina (Paytail)
//
// Overgenomen uit kamagrashop, waar deze flow al draait. Het verschil met daar
// is alleen de client: deze repo heeft geen metHerkansing, dus die staat
// hieronder. De shop praat zelf niet met Paytail; dat doet shop-dash centraal.
// Zie src/lib/paytail.ts voor het waarom.
// ---------------------------------------------------------------------------

// Een herkansing bij een netwerk- of databasehapering. Zonder retry wordt zo'n
// hapering een harde 404 op de pagina waar iemand net zijn bestelling heeft
// geplaatst, en dat ziet eruit alsof de bestelling is verdwenen.
async function metHerkansing<T>(wat: string, fn: () => Promise<{ data: T | null; error: unknown }>): Promise<T | null> {
  for (let poging = 1; poging <= 2; poging++) {
    try {
      const { data, error } = await fn();
      if (!error) return data;
      console.error(wat + ": ophalen mislukte (poging " + poging + ")", error);
    } catch (e) {
      console.error(wat + ": ophalen gooide (poging " + poging + ")", e);
    }
    if (poging === 1) await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

export type OrderForPayment = {
  id: string;
  shop_id: string;
  reference: string | null;
  customer_name: string | null;
  customer_email: string | null;
  shipping_street: string | null;
  shipping_postal: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  coupon_code: string | null;
  discount_cents: number;
  status: string | null;
};

export async function getOrderForPayment(orderId: string) {
  return metHerkansing<OrderForPayment>("betaalpagina order", async () => {
    const sb = createServiceClient();
    const res = await sb
      .from("orders")
      .select(
        "id, shop_id, reference, customer_name, customer_email, shipping_street, shipping_postal, shipping_city, shipping_country, subtotal_cents, shipping_cents, total_cents, coupon_code, discount_cents, status"
      )
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID)
      .maybeSingle();
    return { data: res.data as OrderForPayment | null, error: res.error };
  });
}

export type OrderRegelForPayment = {
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
};

/** De regels van de bestelling, zodat de klant op de betaalpagina ziet waar hij voor betaalt. */
export async function getOrderItemsForPayment(orderId: string): Promise<OrderRegelForPayment[]> {
  const rijen = await metHerkansing<OrderRegelForPayment[]>("betaalpagina regels", async () => {
    const sb = createServiceClient();
    const res = await sb
      .from("order_items")
      .select("product_name, quantity, unit_price_cents, total_cents")
      .eq("order_id", orderId)
      .order("product_name");
    return { data: res.data as OrderRegelForPayment[] | null, error: res.error };
  });
  return rijen || [];
}

export type PaytailConfig = {
  paytail_enabled: boolean | null;
  paytail_eigen_blok: boolean | null;
  paytail_base_url: string | null;
  paytail_btn_label: string | null;
  paytail_btn_color: string | null;
  paytail_btn_text_color: string | null;
  domain: string | null;
};

export async function getPaytailConfig(): Promise<PaytailConfig | null> {
  return metHerkansing<PaytailConfig>("betaalpagina paytail-config", async () => {
    const sb = createServiceClient();
    const res = await sb
      .from("shops")
      .select(
        "paytail_enabled, paytail_eigen_blok, paytail_base_url, paytail_btn_label, paytail_btn_color, paytail_btn_text_color, domain"
      )
      .eq("id", SHOP_ID)
      .maybeSingle();
    return { data: res.data as PaytailConfig | null, error: res.error };
  });
}

/** De bij de bestelling bewaarde Paytail-gegevens, zoals ze naar de klant gingen. */
export async function getPaytailDetails(orderId: string): Promise<Record<string, unknown> | null> {
  const rij = await metHerkansing<{ paytail_details: Record<string, unknown> | null }>(
    "betaalpagina opgeslagen gegevens",
    async () => {
      const sb = createServiceClient();
      const res = await sb
        .from("orders")
        .select("paytail_details")
        .eq("id", orderId)
        .eq("shop_id", SHOP_ID)
        .maybeSingle();
      return { data: res.data as { paytail_details: Record<string, unknown> | null } | null, error: res.error };
    }
  );
  return rij?.paytail_details || null;
}

/**
 * Houdt bij of de bankgegevens naar de klant zijn gemaild.
 *
 * Bij succes komt de datum erin en gaat er nooit meer een mail uit. Bij een
 * mislukking tellen we de poging, want zonder die teller probeerde elke
 * paginalading het opnieuw.
 */
export async function markeerGegevensMail(orderId: string, gelukt: boolean): Promise<void> {
  try {
    const sb = createServiceClient();
    const huidig = (await getPaytailDetails(orderId)) || {};
    const bij = gelukt
      ? { gegevens_gemaild_op: new Date().toISOString() }
      : { gegevens_mail_pogingen: Number(huidig.gegevens_mail_pogingen || 0) + 1 };
    const { error } = await sb
      .from("orders")
      .update({ paytail_details: { ...huidig, ...bij } })
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID);
    if (error) console.error("betaalpagina: mailmarkering opslaan mislukte", error);
  } catch (e) {
    console.error("betaalpagina: mailmarkering opslaan gooide", e);
  }
}

/**
 * Heeft deze shop een verzendroute voor mail?
 *
 * shop-dash weigert met "SMTP niet geconfigureerd voor deze shop" als er
 * helemaal geen weg is ingesteld. Deze shop verstuurt via de KingSMTP-API
 * (shops.settings.kingsmtp). De bedankt-pagina beloofde eerder een
 * bevestigingsmail terwijl er niets stond; liever niets beweren dan iets
 * beweren dat niet gebeurt.
 *
 * Bij twijfel luidt het antwoord nee: een mislukte lees mag geen belofte
 * opleveren.
 */
export async function heeftMailroute(): Promise<boolean> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("shops")
      .select("settings")
      .eq("id", SHOP_ID)
      .maybeSingle();
    if (error) {
      console.error("mailroute uitlezen mislukte", error);
      return false;
    }
    const inst = data?.settings as {
      smtp?: { host?: string };
      smtp_transactioneel?: { host?: string };
      kingsmtp?: { api_key?: string; api_host?: string; from?: string };
    } | null;
    // Drie wegen, en eentje is genoeg. De orderbevestiging is bij shop-dash een
    // transactioneel sjabloon, en daarvoor gaat de KingSMTP-API voor op een
    // mailbox: een shop met alleen kingsmtp verstuurt die mail dus wel. Keek
    // deze functie alleen naar settings.smtp, dan zei de bedankt-pagina
    // onterecht dat er geen bevestiging komt.
    //
    // Niet op api_key kijken: die staat sinds migratie 107 in de Vault en niet
    // meer in settings. Deze shop mailt wel degelijk via KingSMTP, maar zei
    // daardoor op de bedankt-pagina "we hebben je bestelling op <adres> staan"
    // in plaats van "bevestiging gestuurd naar <adres>". Een afzender plus een
    // api_host is het bewijs dat de route is ingericht; of de sleutel klopt
    // weet alleen shop-dash, en dat is daar ook de juiste plek.
    const kingsmtp = inst?.kingsmtp;
    const viaKing = Boolean(kingsmtp?.api_key || (kingsmtp?.from && kingsmtp?.api_host));
    return Boolean(viaKing || inst?.smtp_transactioneel?.host || inst?.smtp?.host);
  } catch (e) {
    console.error("mailroute uitlezen gooide", e);
    return false;
  }
}
