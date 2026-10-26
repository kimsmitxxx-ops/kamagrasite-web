# Wat de jonge concurrenten doen

Gemeten 26 oktober 2026. Registratiedata komen uit RDAP bij SIDN en Verisign,
paginastructuren uit de sitemaps van de sites zelf, snelheid en structured data
uit een eigen fetch. Niets hieronder komt uit een SEO-tool.

**Eén beperking vooraf, want die bepaalt hoe hard deze conclusies zijn.** Ik kan
van hier geen echte Nederlandse SERP-posities meten; de zoekopdrachten lopen via
een Amerikaanse index. Dat een site in die resultaten bovenaan staat is dus een
aanwijzing, geen gemeten positie. Wat wel hard is: de leeftijd van de domeinen,
hoe de sites zijn opgebouwd en wat ze technisch uitzenden.

## De leeftijd van het veld

| domein | geregistreerd | leeftijd | bijzonderheid |
|---|---|---|---|
| **kamagrakopen24.nl** | 2026-04-04 | **7 maanden** | komt bovenaan op koopzoekopdrachten |
| utrechtapotheek.com | 2025-11-03 | 12 maanden | staat op `client hold` bij de registrar |
| kamabestellen24.nl | 2025-04-23 | 18 maanden | |
| cenforcekopen24.nl | 2025-03-20 | 19 maanden | 14 stadspagina's, eigen "arts"-pagina |
| **kamagrasite.nl** | 2024-10-19 | 24 maanden | onze shop |
| vrije-apotheker.com | 2024-07-22 | 27 maanden | |
| 123kamagra.nl | 2023-09-18 | 37 maanden | |
| bestellen-kamagra.nl | 2021-06-23 | 64 maanden | |
| kamagra24.nl | 2019-04-07 | 91 maanden | |
| kamagrashop.nl | 2019-04-06 | 91 maanden | onze eigen grootste shop |
| kamagra-kopen.nl | 2018-11-08 | 96 maanden | |

Er is dus precies **één** site jonger dan twaalf maanden die in deze niche
meekomt, en dat is kamagrakopen24.nl op zeven maanden. Dat is het interessante
geval, want die heeft geen historie waar wij tegenop moeten kijken. Hij heeft
iets anders.

Let ook op het patroon in de namen en de techniek: kamagrakopen24, kamabestellen24
en cenforcekopen24 draaien alle drie op Elementor 4.3.5 met dezelfde
WordPress-generatie, en de eerste twee hebben letterlijk dezelfde title
("Kamagra Kopen Nederland | Snelle Levering"). Dit is geen rij losse
concurrenten maar **een netwerk van één partij**. Dat verklaart ook waarom de
nieuwste van de drie zo snel staat: hij erft een werkend recept.

## Waar die site van zeven maanden het van heeft

Hij is klein. 55 URL's in totaal, en dat is de hele site:

- **4 echte pagina's**: home, `/winkel/`, `/blogs/`, `/over-ons/`
- **16 producten**, op root-niveau: `/cenforce-200-mg/`, `/kamagra-oral-jelly/`
- **35 blogartikelen**

Dat is de hele vondst: **tweederde van die site is artikelen, en die artikelen
dragen de ranking.** De verhouding is omgekeerd aan de onze. Wij hebben 22
producten, 24 koop-pagina's en 5 artikelen.

Hun artikelen volgen een formule, per product en per dosering:

```
/cenforce-200mg-werking-voordelen-bijwerkingen/
/cenforce-150mg-werking-dosering-bijwerkingen/
/cenforce-100mg-werking-dosering-bijwerkingen/
/cenforce-50-mg-effect-dosering-bijwerkingen/
/careforce-200mg-werking-dosering-bijwerkingen/
/sildamax-jelly-100mg-werking-bijwerkingen/
/super-kamagra-jelly-werking-dosering/
```

plus een laag op de koopterm zelf:

```
/cenforce-kopen-nederland-gids/
/kamagra-kopen-veilig-online-bestellen-tips/
/sildenafil-kopen-zonder-recept-nederland-gids/
/kamagra-jelly-kopen-zonder-recept-nederland/
```

Elk artikel is **ongeveer 2.200 woorden** met elf koppen, een FAQ van acht
vragen, een auteursnaam met datum, en precies twee links naar de bijbehorende
productpagina. Niet meer. De verkoop zit in de productpagina, de ranking in het
artikel.

En er is een derde laag die wij helemaal niet hebben: brede onderwerpen zonder
merknaam. `/erectieproblemen-oorzaken/`, `/erectiepillen-werking-voordelen-risicos-gids/`,
`/testosteron-verhogen/`, `/seksuele-gezondheid-leefstijltips-mannen/`,
`/wat-is-kamagra/`.

## De bevinding die tegen onze eigen indeling in gaat

Dat laatste rijtje staat **op de shop zelf**, niet op een aparte informatiesite.

Onze indeling van 23 oktober stuurt alle voorlichting naar erectiekompas.com,
met de uitdrukkelijke afspraak dat die site niet naar de shop verwijst, in geen
enkele richting. De enige site in dit veld die binnen zeven maanden is
opgekomen, doet precies het omgekeerde: voorlichting en verkoop op één domein,
met interne links van het artikel naar het product.

Ik ga daar niet over, en er kunnen redenen voor de scheiding zijn die niets met
SEO te maken hebben. Maar het is wel het verschil tussen ons plan en het enige
werkende voorbeeld van een jong domein in deze niche, en dat hoort in dit
document te staan. De prijs van de scheiding is in `PLAN-KAMAGRASITE.md` al
benoemd en geaccepteerd; wat er nu bij komt is dat de concurrentie die prijs
niet betaalt.

## De autoriteitstruc, en waarom wij hem niet moeten kopiëren

`cenforcekopen24.nl` heeft een pagina `/dr-david-ziegelmann/`. Een arts met een
naam, "MD (Geneeskunde)", tien jaar ervaring in seksuele gezondheid, een
LinkedIn-link. Precies het signaal waar onze eigen strategie op wacht.

Kijk je door, dan houdt het geen stand:

- geen BIG-nummer, nergens
- geen foto, alleen een placeholder-SVG
- zijn titel is "Medisch & Seksuele Gezondheid **Content Auteur**", geen
  behandelaar
- zijn werkgever is de webshop zelf
- de pagina zegt zelf dat hij **niet** medisch eindverantwoordelijk is voor de
  site, alleen dat hij content schrijft

De artikelen op het zustersite dragen trouwens een andere naam, "Linda Stivens",
zonder enige vermelde kwalificatie.

Twee dingen om hieruit mee te nemen. Het eerste is dat de **vorm** het werk doet:
een benoemde auteur met een eigen pagina en `Person`-schema in de broncode. Het
tweede is dat onze blokkade zelfgekozen is. Erectiekompas wacht op een echte
BIG-geregistreerde eindverantwoordelijke; de concurrent heeft er een verzonnen.
Dat laatste gaan we niet doen, en niet alleen om nette redenen: een
onverifieerbare arts is precies wat een melding bij de IGJ of de
Reclame Code Commissie aantrekkelijk maakt.

Wat wél kan, zonder arts: artikelen ondertekenen met een bestaande, benoemde
persoon in een eerlijke rol, en dat met `Person`-schema uitzenden. Een
inkoper die de batches ziet, of de eigenaar met zijn echte naam. Dat is een
controleerbare bewering en het is hetzelfde formaat.

## Wat ze technisch uitzenden, naast ons gelegd

| | kamagrakopen24 | cenforcekopen24 | kamagrasite.nl nu (WP) | onze nieuwe build |
|---|---|---|---|---|
| laadtijd homepage | 1,52s | 2,17s (eerste hit 11,9s) | 1,30s | lokaal gemeten, nog geen CDN-cijfer |
| HTML-gewicht | 177 kb | 330 kb | 113 kb | 94 kb shared JS |
| scripttags | 39 | 29 | 50 | |
| `Article` + `Person` | **ja** | **ja** | nee | nee |
| `Product` + `Offer` | nee (op home) | nee (op home) | nee | **ja** |
| `FAQPage` | in de pagina, niet in schema | idem | nee | **ja** |
| `CollectionPage` + `ItemList` | nee | nee | nee | **ja** |

Onze koop-pagina's zijn ruimer dan ik had verwacht: `/cenforce-200/` komt op
1.402 woorden en een stadspagina op 961, inclusief productblok, prijstabel en
FAQ. Qua omvang zitten we dus niet achter. Qua schema zitten we op de
commerciële kant zelfs voor. Waar we achterlopen is de **artikellaag en het
auteurssignaal**.

## Wat zij slecht doen, en wat dat ons oplevert

- **De sitemap van cenforcekopen24 staat vol WordPress-afval**: `/sample-page/`,
  `/blog-grid/`, `/blog-grid-2-columns/`, `/product-grid-2-columns/`,
  `/product-grid-3-columns/`, `/products-grid-4-columns/`,
  `/product-grid-full-width/`, `/landing-page/`, `/wishlist-2/`,
  `/qr-code-view/` en een `/onze-hardlopens/` dat een mislukte vertaling van
  "our runners" lijkt. Tien van hun 48 pagina's zijn demo-rommel die
  geïndexeerd mag worden.
- **Onverifieerbare claims**: "Officiële Kamagra importeur in Nederland", "Als
  beste getest", "Meer dan 15.000 klanten gingen u voor", producten met 5,00
  sterren. Geen KvK-nummer, geen adres, geen vindbare rechtspersoon. Dat is een
  kwetsbaarheid, niet iets om na te doen.
- **Eerste hit van 11,9 seconden** bij cenforcekopen24. Hun cache is koud en
  blijft koud.

## Concreet, in de orde waarin ik het zou doen

1. **Een artikellaag per product en per dosering.** Dat is hun hele voorsprong
   en het is na te bouwen. 22 producten betekent 22 artikelen van rond de 2.000
   woorden, elk met een eigen FAQ en twee links naar de productpagina. Begin bij
   de doseringen waar nu al vertoningen op staan: Cenforce 200, Vidalista 20 en
   Vilitra 20 hebben samen 10.000 vertoningen zonder dat er een artikel achter
   zit. Let op [[feedback_generator_verzint_bronnen]]: elk artikel feitelijk
   nalopen voor publicatie.
2. **Een benoemde auteur met `Person`-schema en een eigen pagina.** Een echte
   persoon in een eerlijke rol. Dit is het signaal dat beide concurrenten
   uitzenden en wij niet, en het kost geen arts.
3. **Zes stadspagina's erbij.** Zij dekken Almere, Apeldoorn, Breda, Haarlem,
   Tilburg en Venlo, wij niet. Wij hebben Leeuwarden dat zij missen, en dat
   staat op positie 8. Alleen doen als elke pagina eigen, controleerbare inhoud
   krijgt; acht of veertien bijna gelijke pagina's is een doorway-patroon.
4. **WhatsApp als besteloptie noemen.** cenforcekopen24 heeft er twee pagina's
   voor, en wij hebben de WhatsApp-knop al in de build zitten. Dat is een
   kanaal dat hier blijkbaar werkt, en bij een shop die alleen overboeking
   aanbiedt haalt het een drempel weg.
5. **De brede informatieve laag.** Dit is de openstaande vraag uit de paragraaf
   hierboven en geen taak tot die beantwoord is.

Wat ik expres **niet** adviseer: hun claims overnemen, hun doseringen overnemen
(ze verkopen Hey Bull 200 mg en Vega Extra Cobra 200, en wij hebben net
beargumenteerd waarom 120 mg al boven de zinvolle grens ligt), of een arts
verzinnen.
