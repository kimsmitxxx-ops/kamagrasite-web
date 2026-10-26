# Plan: deze build wordt kamagrasite.nl

Opgesteld 23 oktober 2026. Alle cijfers hieronder zijn op die datum gemeten,
niet overgenomen uit eerdere documentatie.

## Het besluit

Deze repo (nu `kamagrasite-web`) wordt de shop op **kamagrasite.nl**.
kamagrasite.nl vervalt als shop. De informatiekant gaat naar een aparte
site. Reden: kamagrasite.nl bestaat al, draait al een shop, en heeft een
registratie die loopt sinds oktober 2024. kamagrasite.nl resolvet niet en
staat op nul dagen.

Drie eigendommen, met een vaste verdeelregel:

| zoekopdracht bevat | gaat naar |
|---|---|
| merk + koopintentie ("kamagra kopen", "cenforce bestellen") | **kamagrasite.nl** (shop) |
| merk + informatie ("wat is Cenforce", "kamagra bijwerkingen") | **erectiekompas** (info) |
| klacht, werkzame stof of geregistreerd middel (erectiestoornis, sildenafil, Viagra, Cialis) | **erectiekompas** (info) |

Let op bij het registreren: van de informatiesite is **erectiekompas.com**
(met een k) geregistreerd en heeft nameservers bij icedns.is, maar serveert
nog niets. `erectiekompas.nl` is nog vrij, `erectiecompas.*` met een c bestaat
niet.

## Blokkerend: eerst Search Console

**Begin hier niet aan voordat dit beantwoord is.** Er gaat een complete winkel
op dit domein, en van buitenaf is de Google-stand niet te zien.

1. Vertoningen en klikken van de laatste drie maanden, en op welke termen
2. Staat er iets onder Beveiliging en handmatige maatregelen
3. Aantal geïndexeerd tegenover uitgesloten

Ligt er een handmatige maatregel, dan gaat dit plan niet door en wordt het
alsnog een vers domein.

### Over de leeftijd van dit domein

De eigenaar bevestigt dat het domein nooit van eigenaar is gewisseld. Toch
meldt SIDN:

```
registration    2024-10-19
last changed    2025-12-11
registrar       Internet Domain Service BS Corp.
```

Bij `.nl` reset een verhuizing tussen registrars die registratiedatum niet.
Dat de teller in oktober 2024 begint, wijst er dus op dat het domein ergens
verlopen is en opnieuw vastgelegd, ook bij gelijkblijvend eigendom.
Archive.org past daarbij: capture in juni 2024, niets in december 2024, weer
wel vanaf februari 2025.

Voor Google telt niet wie de eigenaar was maar of de site doorliep. Een
periode zonder iets te serveren leegt de index en laat links vervallen, of dat
nu door verkoop of door een vergeten verlenging komt.

**Plan daarom op twee jaar, niet op achttien.** Dat is nog steeds beter dan
een vers domein en de keuze voor kamagrasite blijft juist, maar bouw geen
verwachting op historie die er waarschijnlijk niet meer is.

Het prestatie-overzicht in Search Console beslist dit. Zijn er vertoningen van
vóór oktober 2024 zonder gat, dan is er wel continuïteit en klopt bovenstaande
inschatting niet.

## Wat er nu op kamagrasite.nl staat

82 unieke URL's uit de sitemaps, en de structuur is niet willekeurig. Iemand
heeft hier bewust aan gewerkt. Dat sluit aan bij "deed ooit goed, daarna
verwaarloosd".

**39 producten**, plat onder `/product/<slug>/`:

```
apcalis-jelly, cenforce-100mg, cenforce-150mg, cenforce-200mg,
cenforce-d-160mg, cialis-original, cobra-120mg, extra-super-p-force,
kamagra-100mg, kamagra-bruistabletten, kamagra-chewable-tabs, kamagra-polo,
lovegra-female-kamagra, lovegra-oral-jelly, oral-jelly, sildaforce-100mg,
sildaforce-100mg-2, sildaforce-150mg, sildaforce-200mg, sildalis-120mg,
sildamax, super-kamagra, super-kamagra-oral-jelly-160mg, super-p-force,
super-vidalista-80mg, tadaforce-20mg, tadaforce-40mg, tadaforce-60mg,
tadapox-80mg, viagra-original, vidalista-20mg, vidalista-40mg,
vidalista-60mg, vidalista-80mg, vidalista-black-80mg,
vidalista-professional-20mg, vilitra-20mg, vilitra-40mg, vilitra-60mg
```

**15 productcategorieën** onder `/product-category/<slug>/`: cenforce, cialis,
cobra, dapoxetine, kamagra, oral-jelly, sildaforce, sildalis, sildenafil,
tadalafil, vardenafil, viagra, vidalista, vilitra, voor-vrouwen.

**24 pagina's**, en dit is het waardevolste deel:

- Zoekterm-pagina's: `kamagra-jelly-kopen`, `kamagra-bestellen-morgen-in-huis`,
  `kamagra-100-mg`, `sildenafil-100mg-bestellen`, `viagra-kopen`,
  `erectiepillen`, `vardenafil`, `super-kamagra`, `super-p-force`,
  `super-vidalista`, `cenforce-200`, `lovegra`, `cialis-20mg`,
  `cobra-120-mg`, `novosil`
- Stadspagina's: `kamagra-amsterdam`, `kamagra-rotterdam`, `kamagra-den-haag`,
  `kamagra-groningen`, `utrecht`, `eindhoven`, `nijmegen`, `leeuwarden`

**3 artikelen**: `orgasmes-uitstellen`, `jelly-kamagra`, `bijwerkingen-kamagra`.

## Kernregel: de bestaande URL's zijn het bezit

Dit is de belangrijkste instructie in dit document.

De reden om dit domein te kiezen is zijn geschiedenis. Die geschiedenis zit
vast aan URL's, niet aan het domein in het algemeen. Elke bestaande URL die je
vervangt door een nieuwe slug, gooit precies weg waarvoor we hier zitten.

**Bestaat er al een URL voor een onderwerp, gebruik die. Verzin geen nieuwe.**

De twaalf koop-pagina's in `buy_pages` zijn gemaakt voor een leeg domein en
hebben slugs die hier deels al bestaan onder een andere naam. Pas de slug in
`buy_pages` aan, niet de site:

| bestaande URL op kamagrasite | nieuwe koop-pagina | doen |
|---|---|---|
| `/kamagra-jelly-kopen` | `kamagra-oral-jelly-kopen` | slug in `buy_pages` wijzigen naar de bestaande |
| `/kamagra-100-mg` | `kamagra-100mg-kopen` | idem |
| `/sildenafil-100mg-bestellen` | `sildenafil-kopen` | idem |
| `/erectiepillen` | `erectiepillen-kopen` | idem |
| `/vardenafil` | `vardenafil-kopen` | idem |
| `/super-kamagra` | `super-kamagra-kopen` | idem |
| `/cenforce-200` | `cenforce-kopen` | overweeg: bestaande is smaller, mogelijk beide |
| `/lovegra` | `lovegra-kopen` | idem |
| (bestaat niet) | `kamagra-kopen` | nieuw aanmaken |
| (bestaat niet) | `vidalista-kopen`, `vilitra-kopen`, `tadalafil-kopen` | nieuw aanmaken |

Ga dit niet op gevoel doen. Trek eerst per URL de vertoningen uit Search
Console. Een pagina met verkeer houd je op zijn eigen URL. Een pagina met nul
vertoningen in twaalf maanden mag je gerust vervangen.

## Productstructuur: twee opties, kies bewust

De bestaande site gebruikt plat `/product/<slug>/`. Deze build gebruikt
`/product/<categorie>/<slug>`. Dat raakt alle 39 product-URL's.

- **Optie A, aanbevolen:** zet de route in deze build om naar plat
  `/product/<slug>/`. Dan zijn er nul product-redirects nodig en blijft alles
  staan waar Google het kent. Kosten: aanpassen van
  `src/app/product/[categorie]/[slug]/` naar `src/app/product/[slug]/`, plus
  elke `href` die het categoriepad opbouwt.
- **Optie B:** structuur houden en 39 redirects leggen. Werkt ook, maar je
  verliest bij elke redirect iets en je hebt 39 kansen op een fout.

Er staat een kolom `shops.product_url_pattern` in de database, die voor alle
shops op `/:category/:product` staat. Die wordt nergens in de code gelezen,
alleen in de select in `src/lib/queries.ts` meegenomen. Wil je het netjes, dan
maak je die kolom werkend in plaats van het pad hard te coderen. Dat is ook
meteen wat de andere shops in het netwerk later kunnen gebruiken.

## Catalogus afstemmen

De bestaande site heeft 39 producten, de nieuwe catalogus in Supabase onder
shop_id `209efc65-a11e-499c-a74a-3d1c5043758f` heeft er 22. Dat is geen
migratie maar een samenvoeging. Verschillen:

- **Alleen op kamagrasite:** apcalis-jelly, cialis-original, cobra-120mg,
  extra-super-p-force, lovegra-oral-jelly, oral-jelly, sildaforce (4),
  sildalis-120mg, sildamax, super-kamagra, tadaforce (3), tadapox-80mg,
  viagra-original, vidalista-professional-20mg
- **Afwijkende slug voor hetzelfde product:** `kamagra-chewable-tabs` hier
  tegen `kamagra-chew` in de nieuwe catalogus, `super-kamagra-oral-jelly-160mg`
  tegen `super-kamagra-oral-jelly`
- **Alleen in de nieuwe catalogus:** cenforce-50mg

Beslis per product of het mee overgaat. Let bij `viagra-original` en
`cialis-original` op de verdeelregel hierboven: geregistreerde middelen zijn
inhoudelijk het terrein van de informatiesite. Als verkoopartikel horen ze
hier, maar de pagina `/viagra-kopen` is een grensgeval dat de eigenaar moet
beslissen.

## Wat er klaarstaat en meekomt

Werk dat af is en alleen een ander `shop_id` nodig heeft:

- `buy_pages` (shop-dash migratie 052) is bewust shop-agnostisch, elke rij
  hangt aan een `shop_id`
- Twaalf koop-pagina's met gevulde copy, FAQ's en interne link-cluster
- `src/components/shop/price-compare-table.tsx`: prijs per tablet of zakje,
  goedkoopste eerst, met staffelkolommen uit `bulk-discount.ts`
- `src/lib/pack-size.ts`: leest `specifications.Inhoud`, valt terug op de
  productnaam
- Onderhoudsmodus in `src/middleware.ts` via `shops.maintenance_mode`, met
  previewsleutel
- CollectionPage-, BreadcrumbList- en FAQPage-schema op de koop-pagina's
- Facetten op `/winkel/<categorie>` staan op noindex met canonical naar de
  schone URL

De vijf bestaande artikelen horen **niet** hier maar op de informatiesite:
Kamagra vs Viagra, Cenforce vs Kamagra, Sildenafil/tadalafil/vardenafil,
Dapoxetine, en de wisselwerkingen. Verplaatsen door hun `shop_id` te wijzigen.

## Niet doen

- **Geen datums terugzetten.** Google dateert een pagina op het moment dat hij
  hem voor het eerst tegenkomt, niet op `datePublished`. Het levert niets op
  en geeft tegenstrijdige signalen op een medisch onderwerp. Gebruik de echte
  schrijfdatum, of toon geen datum op evergreen content.
- **Geen bestaande URL's wegredirecten zonder de cijfers te hebben gezien.**
- **Geen bijna-identieke slugs maken** voor hetzelfde onderwerp. Een
  concurrent in deze niche heeft vijf varianten op "jelly kopen" staan; dat is
  kannibalisatie en het schuurt tegen doorway-pagina's.
- **Verwijder de stadspagina's niet** zonder te kijken wat ze doen. Lokale
  intentie is laagcompetitief en er staan er acht.

## Openstaande vragen voor de eigenaar

1. De drie Search Console-cijfers hierboven.
2. Wie bezat kamagrasite.nl toen het goed liep?
3. Welke van de 17 extra producten op kamagrasite gaan mee?
4. Blijft `/viagra-kopen` op de shop, of valt dat onder de informatiesite?

## Beantwoord: geen verwijzingen tussen de sites

De eigenaar heeft bevestigd dat erectiekompas **niet** naar de shop verwijst,
in geen enkele richting. Dat is een bewuste keuze en staat niet meer ter
discussie, maar het heeft één gevolg dat je bij het bouwen moet aanhouden.

**De informatiesite draagt niets bij aan deze shop.** Geen doorverwijzing,
geen interne links, geen autoriteit. kamagrasite.nl moet volledig op eigen
kracht ranken. Reken er dus niet op dat "de content staat op de andere site".

Dat betekent niet dat deze shop leeg is. Wat hier al staat telt mee:

- Twaalf koop-pagina's met elk een gevulde `seo_body_html`, een FAQ-blok en
  de prijs-per-stuk-tabel. Dat zijn volwaardige pagina's, geen kale
  categorie-lijsten.
- 39 productpagina's en 15 categorieën
- Acht stadspagina's met lokale koopintentie

Waar deze shop in mag uitbreiden, binnen de verdeelregel (merk + koopintentie):

- Koopgidsen die commercieel geformuleerd zijn: "welke kamagra moet ik
  kiezen", "oral jelly of tabletten kopen", "goedkoopste erectiepil per pil"
- Meer stadspagina's. Er staan er acht, Nederland heeft er meer, en lokale
  intentie is laagcompetitief.
- Een prijsvergelijkings-hub rond de bestaande tabel

Wat hier **niet** komt, want dat is het terrein van de informatiesite:
"wat is kamagra", "kamagra bijwerkingen", "sildenafil werking". Dat kost deze
shop reëel zoekvolume. Dat is de prijs van de scheiding en die is geaccepteerd.

### Eén uitzondering waar je op gaat stuiten

De bestaande site heeft informatieve URL's met historie, zoals
`/bijwerkingen-kamagra` en `/orgasmes-uitstellen`. Volgens de verdeelregel
horen die op de informatiesite. Volgens de kernregel hierboven zijn bestaande
URL's met verkeer juist het bezit waarvoor we dit domein kozen.

Bij conflict wint het cijfer, niet de regel. Haal de vertoningen op uit Search
Console. Heeft zo'n pagina verkeer, laat hem staan waar hij staat. Heeft hij
niets, verhuis hem dan naar de informatiesite. Een indeling dient het
resultaat, niet andersom.

## Volgorde

1. Search Console-check, en pas doorgaan bij groen licht
2. Per bestaande URL de vertoningen ophalen, daarmee de redirectkaart vaststellen
3. Slugs in `buy_pages` aanpassen aan de bestaande URL's
4. Productstructuur kiezen (optie A of B) en doorvoeren
5. Catalogus samenvoegen
6. Pas daarna live, met de onderhoudsmodus eraf
