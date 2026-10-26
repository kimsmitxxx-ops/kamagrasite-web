# URL-overname van de WordPress-shop

Opgesteld 26 oktober 2026. Alle cijfers komen uit Search Console over
**2025-10-23 t/m 2026-10-23**, opgehaald met het serviceaccount dat
siteFullUser heeft op `sc-domain:kamagrasite.nl`. Niets hieronder is geschat.

**Nulmeting van het domein:** 729 kliks, 89.844 vertoningen, gemiddelde positie
38,3. 85 unieke URL's (82 uit de sitemaps, 3 alleen uit Search Console), waarvan
62 vertoningen hebben.

## Waar het verkeer werkelijk zit

| soort | URL's | kliks/jaar | aandeel |
|---|---|---|---|
| homepage | 1 | 136 | 19% |
| zoekterm-pagina's | 14 | 243 | 33% |
| stadspagina's | 8 | 195 | 27% |
| productpagina's | 40 | 59 | 8% |
| categoriepagina's | 15 | 12 | 2% |
| overig (`/shop`, verzendinfo) | 3 | 20 | 3% |

**Dit is de belangrijkste uitkomst van de meting.** 60% van het verkeer komt uit
zoekterm- en stadspagina's, en de nieuwe build serveerde daarvan bij aanvang
**geen enkele URL**. De productpagina's, waar de bouw zich op richtte, zijn
samen 8% waard. Een overname die alleen producten en categorieën dekt, gooit
dus ruim de helft van het bezit weg.

## Kernregel

De waarde zit in de URL's, niet in het domein. Elke bestaande URL die je door
een nieuwe slug vervangt, gooit precies weg waarvoor dit domein gekozen is. Bij
twijfel wint het cijfer, niet de indeling.

## 1. Productpagina's: route platgeslagen

De build had `/product/<categorie>/<slug>`, de live site heeft plat
`/product/<slug>/`. Dat raakte alle 40 product-URL's. De route is nu plat
(`src/app/product/[slug]/page.tsx`); de categorie komt uit het product zelf in
plaats van uit het pad. **Nul product-redirects nodig.** De paginabron zocht het
product toch al op slug, dus het categoriesegment deed niets behalve URL's
breken.

Drie productslugs in de catalogus week af van de live URL en zijn omgezet, niet
andersom:

| live URL | catalogus had | vertoningen |
|---|---|---|
| `/product/oral-jelly` | `kamagra-oral-jelly` | 1.597 |
| `/product/super-kamagra-oral-jelly-160mg` | `super-kamagra-oral-jelly` | 692 |
| `/product/kamagra-chewable-tabs` | `kamagra-chew` | 330 |

Daarmee lossen 22 van de 40 product-URL's op.

### 18 product-URL's zonder artikel in de catalogus

Dit is geen redirect-vraagstuk maar een assortimentsvraag. Deze producten staan
wél in de WooCommerce-shop en worden dus verkocht; ze zijn alleen nooit in de
nieuwe catalogus terechtgekomen.

**Toevoegen, want ze hebben vertoningen:**

| URL | vertoningen | kliks |
|---|---|---|
| `/product/vidalista-professional-20mg` | 1.679 | 1 |
| `/product/sildaforce-200mg` | 406 | 7 |
| `/product/tadaforce-40mg` | 161 | 0 |
| `/product/tadapox-80mg` | 17 | 3 |
| `/product/cobra-120mg-datum-6-2026` | 17 | 1 |
| `/product/tadaforce-20mg` | 14 | 0 |
| `/product/tadaforce-60mg` | 6 | 0 |
| `/product/lovegra-oral-jelly` | 1 | 0 |
| `/product/sildaforce-150mg` | 1 | 0 |

**Redirecten, nul vertoningen in twaalf maanden:** `apcalis-jelly`,
`cialis-original`, `cobra-120mg`, `extra-super-p-force`, `sildaforce-100mg`,
`sildaforce-100mg-2`, `sildalis-120mg`, `sildamax`, `super-kamagra`,
`viagra-original`.

Let op `/product/cobra-120mg-datum-6-2026`: die slug heeft een
houdbaarheidsdatum in de URL. Niet overnemen als slug, wel redirecten naar het
nieuwe Cobra-artikel.

## 2. Zoekterm-pagina's: slugs omgebogen naar de bestaande URL

De twaalf koop-pagina's in `buy_pages` waren gemaakt voor een leeg domein en
hadden allemaal een `-kopen`-slug die hier niet bestaat. Acht zijn omgezet naar
de URL die er al staat:

| nieuwe slug (= bestaande URL) | was | kliks | vertoningen |
|---|---|---|---|
| `cenforce-200` | `cenforce-kopen` | 96 | 9.352 |
| `super-kamagra` | `super-kamagra-kopen` | 28 | 2.470 |
| `lovegra` | `lovegra-kopen` | 19 | 3.769 |
| `kamagra-100-mg` | `kamagra-100mg-kopen` | 11 | 2.131 |
| `kamagra-jelly-kopen` | `kamagra-oral-jelly-kopen` | 5 | 3.865 |
| `vardenafil` | `vardenafil-kopen` | 3 | 1.572 |
| `sildenafil-100mg-bestellen` | `sildenafil-kopen` | 1 | 178 |
| `erectiepillen` | `erectiepillen-kopen` | 0 | 14 |

`kamagra-kopen`, `tadalafil-kopen`, `vidalista-kopen` en `vilitra-kopen` zijn
nieuwe URL's en blijven zoals ze zijn; die bestaan op de live site niet.

### Twee pagina's moeten inhoudelijk mee, niet alleen van slug

De querydata laat zien dat twee URL's iets anders doen dan hun naam suggereert:

- **`/cenforce-200` is een smalle pagina, geen merkpagina.** 64 van de 96 kliks
  komen op "cenforce 200"-varianten: *cenforce 200* (24), *cenforce 200 kopen*
  (14), *cenforce 200 bestellen* (10), *cenforce 200 ervaringen* (5). De
  overgezette pagina dekt de hele reeks 50 t/m 200 mg. De H1 en title moeten op
  200 mg leiden, met de reeks als ondersteuning. Niet omgekeerd.
- **`/vardenafil` rankt in de praktijk op Vilitra.** Van de top-8 queries gaat
  er precies één over vardenafil als stof; de rest is *vilitra*, *kopen vilitra
  in nederland*, *bestellen vilitra nederland*. Het merk hoort dus prominent op
  deze pagina. Dat maakt een losse `vilitra-kopen` overbodig: twee pagina's op
  hetzelfde merk kannibaliseren, en de bestaande URL heeft de historie.

### Vijf zoekterm-pagina's die nog niet bestaan

| URL | kliks | vertoningen | positie | waarom |
|---|---|---|---|---|
| `/kamagra-bestellen-morgen-in-huis` | 60 | 1.607 | **8** | hoogst rankende pagina van het domein |
| `/super-p-force` | 46 | 3.305 | 17 | product zit in de catalogus |
| `/super-vidalista` | 18 | 2.995 | 39 | product zit in de catalogus |
| `/cobra-120-mg` | 16 | 5.805 | 52 | product zit **niet** in de catalogus |
| `/cialis-20mg` | 5 | 285 | 51 | geregistreerd middel, zie beslispunt |
| `/novosil` | 1 | 29 | 8 | product wordt niet verkocht, redirect |

**Pas op bij `/kamagra-bestellen-morgen-in-huis`.** De best presterende query is
*kamagra bestellen morgen in huis ideaal* (401 vertoningen, positie 8). De
checkout van deze shop doet **geen iDEAL**: `paytail_enabled = true`,
`iban_enabled = false`, en de betaalinstructies gaan over een overboeking naar
een rekening die per bestelling verschilt. iDEAL op die pagina beloven is exact
de fout die bij kamagrashop.nl op 19 pagina's staat. De pagina mag over snelle
levering gaan, niet over een betaalmethode die er niet is.

## 3. Stadspagina's: acht URL's, 27% van het verkeer

Deze bestonden in de nieuwe build niet en zijn het op twee na best rankende
bezit van het domein.

| URL | kliks | vertoningen | positie |
|---|---|---|---|
| `/kamagra-den-haag` | 43 | 553 | 23 |
| `/kamagra-rotterdam` | 41 | 547 | 22 |
| `/nijmegen` | 36 | 291 | **7** |
| `/kamagra-amsterdam` | 25 | 3.311 | 26 |
| `/leeuwarden` | 23 | 206 | **8** |
| `/kamagra-groningen` | 15 | 251 | 22 |
| `/utrecht` | 10 | 154 | 15 |
| `/eindhoven` | 2 | 29 | 11 |

**De naamgeving is inconsistent en dat moet zo blijven.** Vier hebben een
`kamagra-`prefix, vier niet. Dat is geen schoonheid maar het is wat Google
kent. Niet uniformeren.

Twee dingen om bij het schrijven vast te houden. De vier zonder prefix staan op
positie 7 tot 15 en de vier met prefix op 22 tot 26, dus de kortere URL's doen
het beter en verdienen geen herschrijving. En acht bijna identieke
stadspagina's zijn doorway-pagina's; elke pagina heeft eigen, controleerbare
inhoud nodig (bezorgtijd, afhaalpunten, lokale levertijd) of het risico is
groter dan de 195 kliks.

## 4. Categoriepagina's: 15 redirects

De build serveert `/winkel/<categorie>` en heeft vijf categorieën; de live site
heeft `/product-category/<slug>` met vijftien. Allemaal redirecten:

| live URL | vertoningen | naar |
|---|---|---|
| `/product-category/kamagra` | 2.251 | `/winkel/kamagra` |
| `/product-category/oral-jelly` | 913 | `/kamagra-jelly-kopen` |
| `/product-category/sildenafil` | 640 | `/sildenafil-100mg-bestellen` |
| `/product-category/voor-vrouwen` | 375 | `/lovegra` |
| `/product-category/vidalista` | 290 | `/winkel/vidalista` |
| `/product-category/cialis` | 160 | `/tadalafil-kopen` |
| `/product-category/tadalafil` | 115 | `/tadalafil-kopen` |
| `/product-category/sildaforce` | 62 | `/winkel/cenforce` |
| `/product-category/cenforce` | 2 | `/winkel/cenforce` |
| `/product-category/cobra` | 0 | `/cobra-120-mg` |
| `/product-category/dapoxetine` | 0 | `/super-kamagra` |
| `/product-category/sildalis` | 0 | `/winkel/combo-preparaten` |
| `/product-category/vardenafil` | 0 | `/vardenafil` |
| `/product-category/viagra` | 0 | `/sildenafil-100mg-bestellen` |
| `/product-category/vilitra` | 0 | `/winkel/vilitra` |

## 5. Overige URL's

| live URL | kliks | vertoningen | besluit |
|---|---|---|---|
| `/shop` | 3 | 697 | redirect naar `/winkel` |
| `/verzenden-retourneren` | 17 | 220 | redirect naar `/bezorging`; de build splitst dit in twee pagina's |
| `/viagra-kopen` | 0 | 30 | redirect naar `/sildenafil-100mg-bestellen` |
| `/viagra-kopen-ideal` | 0 | 46 | redirect; stond niet in de sitemap en belooft iDEAL |
| `/orgasmes-uitstellen` | 0 | 5 | naar erectiekompas, conform de verdeelregel |
| `/bijwerkingen-kamagra` | 0 | 0 | naar erectiekompas |
| `/jelly-kamagra` | 0 | 0 | naar erectiekompas |

De drie informatieve URL's waren het twijfelgeval in `PLAN-KAMAGRASITE.md`:
bestaande URL met historie tegen de koop/info-scheiding. **De cijfers beslissen
het en ze zijn nul.** Ze mogen weg.

## 6. Beslispunten voor de eigenaar

1. **Verzendkosten spreken elkaar op drie plekken tegen.** De code rekent
   `SHIPPING_FEE_CENTS = 1000`, dus EUR 10 per bestelling.
   `shops.shipping_nl_cents` staat op 0. De live site rekent **niets** voor
   brievenbuspost en EUR 6,95 voor aangetekend of PakjeGemak, met verzending
   dezelfde dag bij betaling voor 17:00. Er gaan straks klanten over van een
   shop met gratis verzending naar een shop die EUR 10 rekent. Dat is een
   prijsbesluit, geen bug, dus ik heb er niets aan veranderd.
2. **Geregistreerde middelen.** `/viagra-kopen` en `/cialis-20mg` gaan over
   Viagra en Cialis als merk. Volgens de verdeelregel is dat informatieterrein,
   als verkoopartikel horen ze hier. Beide hebben bij elkaar 5 kliks, dus er
   staat weinig op het spel; het raakt wel de toets op publieksreclame voor
   receptgeneesmiddelen.
3. **Welke van de negen ontbrekende producten met vertoningen komen erbij?**
   Sildaforce, Tadaforce, Tadapox, Cobra en Vidalista Professional staan in de
   WooCommerce-shop maar niet in de nieuwe catalogus.

## 7. Wat af is en wat nog moet

Af:

- productroute platgeslagen, 22 product-URL's lossen op zonder redirect
- drie productslugs omgezet naar de live URL
- acht koop-pagina-slugs omgezet naar de live URL, inclusief de interne
  verwijzingen in `product_slugs` en `related_slugs`

Nog te doen:

- H1, title en intro van `/cenforce-200` op 200 mg richten, en Vilitra
  prominent op `/vardenafil`
- vijf nieuwe zoekterm-pagina's en acht stadspagina's als `buy_pages`-rijen
- de redirects uit paragraaf 4 en 5 in `next.config.js`
- negen producten toevoegen of hun URL's redirecten
- `vilitra-kopen` opheffen ten gunste van `/vardenafil`

De domeinwissel komt daarna. Zolang die niet is gedaan blijft dit allemaal
onzichtbaar, dus er is geen haast anders dan de volgorde zelf.
