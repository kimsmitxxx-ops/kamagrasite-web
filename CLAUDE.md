# CLAUDE.md

Brief voor Claude Code werk in de kamagrasite-web repo.

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run lint     # next lint (eslint-config-next 14)
```

Geen test runner. Content-management + images gaan via het shop-dash sister-repo (`../shop-dash`).

## Wat dit is

Publieke Next.js webshop voor **kamagrasite.nl** — generieke ED-medicatie (sildenafil, tadalafil, vardenafil, dapoxetine). Fork van anabolenpro-nextjs, aangepast voor Kamagra-focus met lichter mint/teal thema.

Data leeft in Supabase (`rexqfwibxawqnvrzbdoo`, eu-west-3; de pooler accepteert de tenant alleen op `aws-1-eu-west-3.pooler.supabase.com`) — dezelfde database als **shop-dash** (admin dashboard + 3-agent blog pipeline). Alle content (blogs, product-catalog, categorieën, shop-config incl. `payment_instructions`, order-flow) leest deze site direct uit die DB.

Shop-slug: `kamagrasite` — shop_id = `209efc65-a11e-499c-a74a-3d1c5043758f`.

## Architectuur

Next.js 14 App Router, TypeScript strict, Tailwind. Path alias `@/*` → `./src/*`. UI is Nederlands. Zwaar SSR.

### Routing

- `/` — home (hero + category tiles + featured products + FAQ + trust)
- `/winkel` + `/winkel/[categorie]` — catalog met sidebar filters (categorie / beschikbaarheid)
- `/product/[categorie]/[slug]` — product-detail (gallery, USPs, AddToCart, sections, related)
- `/kennisbank` + `/kennisbank/[slug]` — blogs uit Supabase `blog_posts` waar `is_published = true` én `shop_id` matcht
- `/checkout` → `/checkout/bedankt/[orderId]` — bank-transfer + crypto uit `shops.payment_instructions` JSONB
- `/account`, `/account/login`, `/account/orders/[id]` — noindex
- `/begrippenlijst` — glossary van ED-termen (sildenafil, PDE5, tadalafil, half-life, etc)
- Info pages: `/lab` (herkomst en kwaliteit), `/bezorging`, `/retourneren`, `/voorwaarden`, `/cookies`, `/privacy`, `/contact`, `/over-ons`

### Verwijderde routes (t.o.v. anabolenpro-basis)

- `/[stof]` — AAS-stof pagina's (testosteron, trenbolone, etc.) — NIET van toepassing op Kamagra
- `/keuzehulp` — AAS kuur wizard — vervangen door directe categorie-navigatie
- `/risicos-en-bijwerkingen` — anabolen-specifieke bloedwerk-copy — vervangen door FAQ-blok

### Images: /img/* + /media/* rewrite

`next.config.js` heeft `/img/:path* → ${SUPABASE_URL}/storage/v1/object/public/blog-images/:path*` en `/media/:path* → product-media/kamagrasite` rewrites. Gebruikers zien geen Supabase URLs in view-source.

### Cart & checkout

Zie `src/lib/cart-context.tsx` — localStorage-based cart met 30d TTL (48u minimum-regel gedeeld met alle sites). Checkout POST → `/api/orders`.

## Product-catalog

De 22 producten die kamagrashop.nl vraagt zijn geïmporteerd via `../shop-dash/scripts/import-kamagrashop-catalog.mjs` met shop_id filter. Prijzen, foto's en descriptions komen van de bron.

Categorieën (auto-created bij import):
- `kamagra` — Kamagra 100mg, Oral Jelly, Chew, Polo, Bruistabletten, Lovegra
- `cenforce` — Cenforce 50/100/150/200/D-160
- `vidalista` — Vidalista 20/40/60/80, Black, Super
- `vilitra` — Vilitra 20/40/60
- `combo-preparaten` — Super P Force, Super Kamagra Oral Jelly, Super Vidalista

## Content-tone (kamagrasite bedrijfsprofiel)

Praktisch, informatief en no-nonsense. Geen prestatie-angst pseudo-medische taal. Doelgroep 25-55 mannen die gewoon informatie willen. Concrete werkzame-stof namen (sildenafil, tadalafil, vardenafil) + hun onset/halfwaardetijd. Eerlijk over wisselwerkingen (nitraten, alfablokkers), wanneer arts consulteren, verschillen tussen merken en generiek.

Zie `../shop-dash` → cron_schedules waar `slug=kamagrasite AND agent_type=blog_writer` het bedrijfsprofiel voor de Schrijver-agent bevat.

## Content in de database

Producten, categorieen, de shop-rij en de blog-metadata worden gevuld door
`../shop-dash/scripts/kamagrasite-content.mjs`. Dat script is idempotent: het
schrijft subtitle, description, long_description, meta, usps, faqs,
specificaties, stof_slugs, package_type en sort_order per product, plus de
intro- en SEO-teksten van de vijf categorieen. Pas de teksten daar aan en draai
het script opnieuw, dan blijft de hele catalogus consistent.

De oorspronkelijke import nam de productteksten van kamagrashop.nl over,
inclusief links naar die shop en claims die niet kloppen. Die zijn vervangen.

## RLS

De site draait op de anon key. Zonder `shop-dash/supabase/051-kamagrasite-public-read.sql`
geeft de `categories`-tabel een lege lijst terug en geven alle
`/winkel/<categorie>`-pagina's dus 404. Die migratie moet in de Supabase
SQL-editor gedraaid zijn voordat een deploy zin heeft.

## Lokaal bouwen naast een draaiende dev-server

`next.config.js` leest `NEXT_DIST_DIR`. Draait er al een dev-server in dezelfde
map, bouw dan met `NEXT_DIST_DIR=.next-check npm run build` zodat de twee elkaars
`.next` niet slopen.

## Live-data rules

Zelfde als anabolenpro: `dynamic = "force-dynamic"` + `revalidate = 0` op alle DB-pagina's. Klant is allergisch voor stale cache.

## Env vars

Zelfde als anabolenpro-nextjs (Supabase URL + anon key + service role). Het verschil is alleen de shop_id constant in de code.

## Git

Identity: `kimsmitxxx-ops <kimsmitxxx@gmail.com>`. Pass inline via `-c user.name= -c user.email=`. Token in `C:\Users\Administrator\Downloads\gh-token.txt`.

Repo: [github.com/kimsmitxxx-ops/kamagrasite-web](https://github.com/kimsmitxxx-ops/kamagrasite-web).

## Cross-repo workflow

- **Blog + content changes** → shop-dash admin UI met shop=kamagrasite filter; DB in Supabase
- **Product-catalog** → shop-dash of `import-kamagrashop-catalog.mjs`
- **UI / component changes** → deze repo direct
