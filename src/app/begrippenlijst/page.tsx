import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Begrippenlijst ED-medicatie - PDE5, sildenafil, tadalafil, onset | Kamagra Site",
  description:
    "Uitleg van de begrippen die je tegenkomt op kamagrasite.nl en in de kennisbank: PDE5-remmer, sildenafil, tadalafil, vardenafil, dapoxetine, onset, halfwaardetijd, nitraten en meer.",
  alternates: { canonical: "/begrippenlijst" },
};

type Term = {
  id: string;
  term: string;
  short: string;
  body: string;
  related?: string[];
  link?: string;
};

const TERMS: Term[] = [
  {
    id: "ajanta",
    term: "Ajanta Pharma",
    short: "Indiase fabrikant van de Kamagra-lijn",
    body: "Beursgenoteerde Indiase farmaceut die onder meer Kamagra, Kamagra Oral Jelly, Kamagra Polo, de bruistabletten en Lovegra produceert. Ajanta levert ook gewone receptgeneesmiddelen aan apotheken in Afrika en Azie en werkt onder de Indiase GMP-standaard. De fabrikantnaam staat op de doos en op de blister.",
    related: ["kamagra", "generiek"],
    link: "/lab",
  },
  {
    id: "alfablokker",
    term: "Alfablokker",
    short: "Prostaat- en bloeddrukmedicatie die slecht combineert met PDE5",
    body: "Middelen als tamsulosine, alfuzosine en doxazosine verlagen de bloeddruk door bloedvaten te verwijden. Een PDE5-remmer doet dat ook, dus samen kun je flink gaan duizelen of flauwvallen. Combineren kan soms wel, maar dan met minimaal vier tot zes uur ertussen en met de laagste dosering. Bespreek dit met je arts voordat je begint.",
    related: ["pde5-remmer", "hypotensie"],
  },
  {
    id: "batchcode",
    term: "Batchcode",
    short: "Productiecode van de partij",
    body: "Code op doos en blister die aangeeft uit welke productierun de tabletten komen. Fabrikanten gebruiken hem om een partij te kunnen traceren en zo nodig terug te roepen. Voor jou is hij vooral handig als controle: de code op de doos en die op de blister horen gelijk te zijn.",
    related: ["blister", "houdbaarheid"],
  },
  {
    id: "bioequivalentie",
    term: "Bio-equivalentie",
    short: "Generiek gedraagt zich in het lichaam hetzelfde als het merk",
    body: "Een generiek middel is bio-equivalent als het dezelfde hoeveelheid werkzame stof op dezelfde snelheid in het bloed brengt als het origineel. Daar zit een toegestane marge op. Voor sildenafil betekent dat: de 100 mg uit een Kamagra-tablet geeft in de praktijk dezelfde bloedspiegel als 100 mg uit een Viagra-tablet.",
    related: ["generiek", "sildenafil"],
  },
  {
    id: "blister",
    term: "Blister",
    short: "De doordrukstrip waarin tabletten zitten",
    body: "Aluminium-plastic strip met doordrukvakjes. Op de blister hoor je de merknaam, de sterkte, een batch- of lotnummer en een houdbaarheidsdatum (EXP) te zien. Ontbreekt een van die vier, dan klopt er iets niet. Bewaar tabletten in de blister tot gebruik: licht en vocht tasten de werkzame stof aan.",
    related: ["batchcode", "houdbaarheid"],
    link: "/lab",
  },
  {
    id: "bruistablet",
    term: "Bruistablet",
    short: "Tablet die je oplost in water",
    body: "Kamagra bruistabletten los je op in een half glas water. De werkzame stof is al opgelost zodra je drinkt, waardoor de opname meestal iets sneller gaat dan bij een gewone tablet. Praktisch voor wie moeite heeft met slikken. De dosering is gelijk: 100 mg sildenafil per tablet.",
    related: ["sildenafil", "onset"],
    link: "/winkel/kamagra",
  },
  {
    id: "cenforce",
    term: "Cenforce",
    short: "Sildenafil van Centurion Laboratories",
    body: "Productlijn met sildenafil in 50, 100, 150 en 200 mg. Doordat de lijn zo veel sterktes heeft kun je rustig opbouwen: begin op 50 of 100 mg en ga pas hoger als dat echt nodig blijkt. Cenforce D combineert 100 mg sildenafil met 60 mg dapoxetine.",
    related: ["sildenafil", "centurion", "titratie"],
    link: "/winkel/cenforce",
  },
  {
    id: "centurion",
    term: "Centurion Laboratories",
    short: "Indiase fabrikant van Cenforce, Vidalista en Vilitra",
    body: "Producent uit Gujarat die drie van onze productlijnen maakt: Cenforce met sildenafil, Vidalista met tadalafil en Vilitra met vardenafil. Ook hier geldt: fabrikantnaam, batchcode en houdbaarheidsdatum horen op de verpakking te staan.",
    related: ["cenforce", "vidalista", "vilitra"],
    link: "/lab",
  },
  {
    id: "cgmp",
    term: "cGMP",
    short: "De stof die je erectie in stand houdt",
    body: "Cyclisch guanosinemonofosfaat. Bij seksuele prikkeling maakt je lichaam stikstofmonoxide aan, dat de aanmaak van cGMP op gang brengt. cGMP ontspant de gladde spieren in de zwellichamen, waardoor er bloed in stroomt. Het enzym PDE5 breekt cGMP weer af. Een PDE5-remmer vertraagt die afbraak, zodat de erectie langer standhoudt.",
    related: ["pde5-remmer", "stikstofmonoxide"],
  },
  {
    id: "contra-indicatie",
    term: "Contra-indicatie",
    short: "Reden om een middel juist niet te gebruiken",
    body: "Situatie waarin een middel schade kan doen. Bij PDE5-remmers zijn dat onder meer: gebruik van nitraten of riociguat, een hartinfarct of beroerte in de afgelopen zes maanden, ernstig hart- of leverfalen, een zeer lage of slecht ingestelde bloeddruk, en netvliesaandoeningen zoals retinitis pigmentosa. Herken je jezelf hierin, overleg dan eerst met een arts.",
    related: ["nitraten", "naion", "hypotensie"],
  },
  {
    id: "dapoxetine",
    term: "Dapoxetine",
    short: "SSRI tegen vroegtijdige zaadlozing",
    body: "Kortwerkende SSRI die is ontwikkeld voor gebruik vlak voor de seks, niet als dagelijks antidepressivum. Je neemt hem een tot drie uur van tevoren met een glas water. In onderzoek verlengt dapoxetine de tijd tot ejaculatie gemiddeld twee tot drie keer. Veelvoorkomende bijwerkingen: misselijkheid, duizeligheid en hoofdpijn. Combineer dapoxetine niet met andere SSRI-antidepressiva, MAO-remmers of partydrugs.",
    related: ["premature-ejaculatie", "super-p-force"],
    link: "/kennisbank/dapoxetine-uitgestelde-ejaculatie-hoe-werkt-het",
  },
  {
    id: "ed",
    term: "Erectiele disfunctie (ED)",
    short: "Moeite om een erectie te krijgen of te houden",
    body: "Het terugkerend niet kunnen krijgen of vasthouden van een erectie die voldoende is voor seks. Af en toe is normaal en zegt weinig. Bij aanhoudende klachten zit er vaak iets lichamelijks onder: bloedvatproblemen, diabetes, een lage testosteronspiegel of medicatie. Juist daarom is een keer je bloeddruk en bloedsuiker laten meten geen overbodige luxe. Een erectieprobleem is soms het eerste signaal van iets anders.",
    related: ["psychogene-ed", "pde5-remmer"],
  },
  {
    id: "flushing",
    term: "Flushing",
    short: "Blozen en warmte in gezicht en nek",
    body: "De meest voorkomende bijwerking van PDE5-remmers. Je bloedvaten verwijden zich niet alleen in de penis maar overal, en dat voel je als warmte in gezicht, nek en borst. Onschuldig, en het verdwijnt vanzelf als het middel is uitgewerkt. Alcohol versterkt het effect.",
    related: ["pde5-remmer", "hypotensie"],
  },
  {
    id: "generiek",
    term: "Generiek geneesmiddel",
    short: "Zelfde werkzame stof, andere naam",
    body: "Een kopie van een merkgeneesmiddel waarvan het patent is verlopen, met dezelfde werkzame stof in dezelfde sterkte. Het verschil zit in naam, vorm, kleur, hulpstoffen en prijs. Sildenafil uit een Kamagra-tablet is hetzelfde molecuul als sildenafil uit een Viagra-tablet. Het prijsverschil komt doordat de ontwikkelkosten allang zijn terugverdiend.",
    related: ["bioequivalentie", "viagra"],
  },
  {
    id: "halfwaardetijd",
    term: "Halfwaardetijd",
    short: "Tijd waarin de helft van de stof is afgebroken",
    body: "Zegt hoe lang een middel in je lichaam blijft hangen. Sildenafil en vardenafil zitten rond de vier uur, wat neerkomt op een werkzame periode van vier tot zes uur. Tadalafil zit rond de zeventien en een half uur, waardoor het tot ongeveer 36 uur merkbaar blijft. Dat verschil bepaalt vooral of je de timing moet plannen of niet.",
    related: ["onset", "werkingsduur", "tadalafil"],
  },
  {
    id: "houdbaarheid",
    term: "Houdbaarheidsdatum (EXP)",
    short: "Tot wanneer de volledige sterkte gegarandeerd is",
    body: "Staat als EXP op doos en blister, meestal als maand en jaar. Na die datum is het middel niet meteen gevaarlijk, maar neemt de hoeveelheid werkzame stof af. Bewaar tabletten droog en onder de 25 graden, dus niet in de badkamer. Bij ons staat een korte houdbaarheid in de productnaam, zodat je het ziet voordat je bestelt.",
    related: ["batchcode", "blister"],
  },
  {
    id: "hypotensie",
    term: "Hypotensie",
    short: "Te lage bloeddruk",
    body: "PDE5-remmers verlagen je bloeddruk een beetje. Bij gezonde gebruikers merk je daar niets van. In combinatie met nitraten, alfablokkers, veel alcohol of bij een toch al lage bloeddruk kan de daling wel flink zijn: duizelig worden, sterretjes zien of flauwvallen. Ga dan zitten of liggen tot het zakt, en gebruik zeker geen nitraat als tegenmaatregel.",
    related: ["nitraten", "alfablokker"],
  },
  {
    id: "kamagra",
    term: "Kamagra",
    short: "Sildenafil van Ajanta Pharma",
    body: "De bekendste generieke sildenafil-lijn, standaard 100 mg per eenheid. Verkrijgbaar als tablet, oral jelly, kauwtablet, zuigtablet (Polo) en bruistablet. De werkzame stof is in alle vormen dezelfde. Het verschil zit in hoe snel je lichaam hem opneemt en hoe prettig je de inname vindt.",
    related: ["sildenafil", "ajanta", "oral-jelly"],
    link: "/winkel/kamagra",
  },
  {
    id: "lovegra",
    term: "Lovegra",
    short: "Sildenafil 100 mg in een roze tablet, op de markt gebracht voor vrouwen",
    body: "Dezelfde sildenafil als in Kamagra, verkocht onder een naam gericht op vrouwen. Eerlijk is eerlijk: het bewijs dat sildenafil bij vrouwen de opwinding of het orgasme verbetert is mager en studies spreken elkaar tegen. Het middel verhoogt wel de doorbloeding, met dezelfde bijwerkingen en dezelfde contra-indicaties als bij mannen.",
    related: ["sildenafil", "kamagra"],
  },
  {
    id: "naion",
    term: "NAION",
    short: "Zeldzame oogaandoening met plotseling gezichtsverlies",
    body: "Non-arteritische anterieure ischemische opticusneuropathie: een zeldzame aandoening waarbij de oogzenuw te weinig bloed krijgt en het zicht in een oog plotseling uitvalt. Er zijn meldingen van NAION bij gebruikers van PDE5-remmers, vooral bij mensen die er al aanleg voor hebben. Plotseling verlies van zicht betekent: direct stoppen en meteen een arts bellen.",
    related: ["contra-indicatie", "pde5-remmer"],
  },
  {
    id: "nitraten",
    term: "Nitraten",
    short: "Hartmedicatie die nooit samen met PDE5-remmers mag",
    body: "Isosorbidemononitraat, isosorbidedinitraat, nitroglycerinespray en de nitraatpleister worden voorgeschreven bij angina pectoris. Samen met een PDE5-remmer kan de bloeddruk zo ver wegzakken dat het levensgevaarlijk wordt. Dit is geen voorzorgsadvies maar een absolute contra-indicatie. Poppers met amylnitriet vallen in dezelfde categorie.",
    related: ["poppers", "contra-indicatie", "hypotensie"],
    link: "/kennisbank/wisselwerkingen-ed-medicatie-nitraten-alfablokkers",
  },
  {
    id: "onset",
    term: "Onset",
    short: "Tijd tot het middel begint te werken",
    body: "Sildenafil en vardenafil hebben ongeveer 30 tot 60 minuten nodig, tadalafil 30 minuten tot twee uur. Een oral jelly of bruistablet werkt vaak wat sneller omdat de stof al is opgelost. Een vette maaltijd vertraagt sildenafil en vardenafil flink, terwijl tadalafil daar nauwelijks last van heeft.",
    related: ["halfwaardetijd", "werkingsduur", "oral-jelly"],
  },
  {
    id: "oral-jelly",
    term: "Oral jelly",
    short: "Sildenafil in gelvorm, in sachets",
    body: "Zakje gel met 100 mg sildenafil dat je leegknijpt in je mond en doorslikt. Omdat de stof al is opgelost begint de opname meteen en treedt het effect doorgaans sneller in dan bij een tablet. Praktisch voor wie moeite heeft met slikken, en de smaakjes maken het minder klinisch.",
    related: ["kamagra", "onset"],
    link: "/winkel/kamagra",
  },
  {
    id: "pde5-remmer",
    term: "PDE5-remmer",
    short: "De werkingsklasse van sildenafil, tadalafil en vardenafil",
    body: "Middel dat het enzym fosfodiesterase type 5 remt. Dat enzym breekt cGMP af, de stof die de bloedvaten in de zwellichamen ontspant. Door de afbraak te vertragen blijft de erectie beter staan. Let op: er gebeurt pas iets bij seksuele prikkeling. Zonder opwinding doet een PDE5-remmer niets.",
    related: ["cgmp", "sildenafil", "tadalafil", "vardenafil"],
  },
  {
    id: "poppers",
    term: "Poppers",
    short: "Amyl- of butylnitriet, in de praktijk een nitraat",
    body: "Snuifmiddel dat de bloedvaten in een klap verwijdt. Samen met een PDE5-remmer kan de bloeddruk catastrofaal dalen. Dat poppers en erectiepillen in hetzelfde uitgaanscircuit rondgaan maakt die combinatie niet minder gevaarlijk: niet doen, ook niet met een paar uur ertussen.",
    related: ["nitraten", "contra-indicatie"],
  },
  {
    id: "premature-ejaculatie",
    term: "Premature ejaculatie (PE)",
    short: "Te snel klaarkomen, vaak binnen een minuut",
    body: "Klaarkomen eerder dan gewenst, met in de klinische definitie een tijd tot ejaculatie van ongeveer een minuut en het gevoel er geen controle over te hebben. Komt vaker voor dan erectieproblemen en wordt een stuk minder vaak besproken. Dapoxetine is het middel dat er specifiek voor is ontwikkeld. Bekkenbodemtraining en gedragstechnieken werken er goed naast.",
    related: ["dapoxetine", "super-p-force"],
  },
  {
    id: "priapisme",
    term: "Priapisme",
    short: "Erectie die langer dan vier uur aanhoudt",
    body: "Langdurige erectie zonder opwinding, meestal pijnlijk. Zeldzaam bij PDE5-remmers, maar wel een spoedgeval: zonder zuurstofrijk bloed raakt het weefsel na enkele uren blijvend beschadigd. Duurt een erectie langer dan vier uur, ga dan naar de spoedeisende hulp en wacht het niet af.",
    related: ["pde5-remmer", "contra-indicatie"],
  },
  {
    id: "psychogene-ed",
    term: "Psychogene ED",
    short: "Erectieprobleem met een psychische oorzaak",
    body: "Spanning, prestatiedruk, vermoeidheid of gedoe in de relatie kunnen een erectie net zo goed in de weg zitten als dichtslibbende bloedvaten. Vuistregel: heb je bij het wakker worden of bij masturbatie wel een stevige erectie en bij je partner niet, dan wijst dat richting psychogeen. Een PDE5-remmer kan de vicieuze cirkel doorbreken, maar lost de oorzaak niet op.",
    related: ["ed"],
  },
  {
    id: "sildenafil",
    term: "Sildenafil",
    short: "De werkzame stof in Kamagra, Cenforce en Viagra",
    body: "De bekendste PDE5-remmer. Werkt na 30 tot 60 minuten, houdt vier tot zes uur aan en heeft een halfwaardetijd van ongeveer vier uur. Gebruikelijke dosering is 50 of 100 mg, maximaal eenmaal per 24 uur. Een vette maaltijd vertraagt de opname merkbaar. Typische bijwerkingen: blozen, hoofdpijn, verstopte neus, maagklachten en soms een blauwe waas over je zicht.",
    related: ["pde5-remmer", "kamagra", "cenforce", "onset"],
    link: "/winkel?stof=sildenafil",
  },
  {
    id: "stikstofmonoxide",
    term: "Stikstofmonoxide (NO)",
    short: "Het signaal waarmee een erectie begint",
    body: "Bij seksuele prikkeling geven zenuwuiteinden in de penis stikstofmonoxide af. Dat zet de aanmaak van cGMP in gang, waarna de gladde spieren in de zwellichamen ontspannen en er bloed in stroomt. Beschadigde bloedvaten, bijvoorbeeld door roken of diabetes, maken minder NO aan. Daarom werkt een PDE5-remmer minder goed als de bloedvaten er slecht aan toe zijn.",
    related: ["cgmp", "pde5-remmer"],
  },
  {
    id: "sunrise",
    term: "Sunrise Remedies",
    short: "Indiase fabrikant van onder meer Super P-Force",
    body: "Producent uit Ahmedabad, gespecialiseerd in combinatiepreparaten waarin een PDE5-remmer en dapoxetine samen in een tablet zitten.",
    related: ["super-p-force"],
    link: "/lab",
  },
  {
    id: "super-p-force",
    term: "Super P-Force",
    short: "Sildenafil 100 mg plus dapoxetine 60 mg",
    body: "Combinatietablet van Sunrise Remedies voor wie zowel een erectieprobleem heeft als te snel klaarkomt. Twee werkzame stoffen betekent ook twee bijwerkingenprofielen en twee sets wisselwerkingen, dus begin hier niet mee als je nog nooit een van beide los hebt gebruikt.",
    related: ["sildenafil", "dapoxetine", "sunrise"],
    link: "/winkel/combo-preparaten",
  },
  {
    id: "tadalafil",
    term: "Tadalafil",
    short: "De werkzame stof in Vidalista en Cialis",
    body: "PDE5-remmer met een halfwaardetijd van ongeveer zeventien en een half uur, waardoor het effect tot zo'n 36 uur merkbaar blijft. Vandaar de bijnaam weekendpil: je hoeft de seks niet op het half uur te plannen. Onset 30 minuten tot twee uur, nauwelijks gevoelig voor eten. Gebruikelijke dosering 10 tot 20 mg per keer. Spier- en rugpijn komen bij tadalafil vaker voor dan bij sildenafil.",
    related: ["pde5-remmer", "vidalista", "halfwaardetijd"],
    link: "/winkel?stof=tadalafil",
  },
  {
    id: "titratie",
    term: "Titratie",
    short: "Opbouwen naar de laagste dosering die werkt",
    body: "Begin laag en verhoog pas als het effect tegenvalt. Voor sildenafil betekent dat starten op 50 mg en alleen naar 100 mg gaan als 50 echt te weinig doet. Hoger dan de maximale dosering gaan levert geen betere erectie op, alleen meer bijwerkingen. Dat Cenforce tot 200 mg bestaat betekent niet dat iemand daar moet beginnen.",
    related: ["cenforce", "sildenafil"],
  },
  {
    id: "vardenafil",
    term: "Vardenafil",
    short: "De werkzame stof in Vilitra en Levitra",
    body: "PDE5-remmer die qua timing op sildenafil lijkt: onset 25 tot 60 minuten, werking vier tot acht uur. Hij grijpt iets selectiever aan, waardoor sommige gebruikers minder last hebben van visuele bijwerkingen. Het alternatief om te proberen als sildenafil onvoldoende werkt of te veel bijwerkingen geeft.",
    related: ["pde5-remmer", "vilitra"],
    link: "/winkel?stof=vardenafil",
  },
  {
    id: "viagra",
    term: "Viagra, Cialis en Levitra",
    short: "De merknamen achter de drie werkzame stoffen",
    body: "Viagra van Pfizer bevat sildenafil, Cialis van Lilly bevat tadalafil en Levitra van Bayer bevat vardenafil. Hun patenten zijn verlopen, waarna generieke fabrikanten dezelfde moleculen zijn gaan maken. Wat je bij het merk extra betaalt is de naam en de verpakking, niet een ander molecuul.",
    related: ["generiek", "sildenafil", "tadalafil", "vardenafil"],
    link: "/kennisbank/kamagra-vs-viagra-verschil-uitleg",
  },
  {
    id: "vidalista",
    term: "Vidalista",
    short: "Tadalafil van Centurion Laboratories",
    body: "Tadalafil-lijn in 20, 40, 60 en 80 mg, plus Vidalista Black. Let op de sterktes: de gangbare dosering tadalafil is 10 tot 20 mg, dus de hoge varianten zijn fors en geven navenant meer kans op rug- en hoofdpijn. Super Vidalista combineert tadalafil met dapoxetine.",
    related: ["tadalafil", "centurion", "titratie"],
    link: "/winkel/vidalista",
  },
  {
    id: "vilitra",
    term: "Vilitra",
    short: "Vardenafil van Centurion Laboratories",
    body: "Vardenafil in 20, 40 en 60 mg. De standaarddosering vardenafil is 10 tot 20 mg, dus ook hier geldt: niet bovenaan beginnen.",
    related: ["vardenafil", "centurion"],
    link: "/winkel/vilitra",
  },
  {
    id: "werkingsduur",
    term: "Werkingsduur",
    short: "Hoe lang het middel zijn werk doet",
    body: "Sildenafil vier tot zes uur, vardenafil vier tot acht uur, tadalafil tot ongeveer 36 uur. Een langere werkingsduur betekent geen langere erectie, maar een langer tijdvenster waarin je op seksuele prikkeling kunt reageren. Dat is precies waarom veel mensen tadalafil prettiger vinden: geen klok in je achterhoofd.",
    related: ["halfwaardetijd", "onset"],
  },
  {
    id: "wisselwerking",
    term: "Wisselwerking",
    short: "Andere middelen die de werking beinvloeden",
    body: "De gevaarlijke combinaties zijn nitraten, poppers en riociguat. Oppassen geblazen bij alfablokkers en bij sterke CYP3A4-remmers zoals ketoconazol, claritromycine en ritonavir: die verhogen je bloedspiegel flink, waardoor een halve dosis vaak al genoeg is. Grapefruitsap doet hetzelfde, zij het milder. Alcohol maakt een erectie juist slapper en versterkt de duizeligheid.",
    related: ["nitraten", "alfablokker", "poppers"],
    link: "/kennisbank/wisselwerkingen-ed-medicatie-nitraten-alfablokkers",
  },
  {
    id: "zuigtablet",
    term: "Zuigtablet (Polo)",
    short: "Tablet die je laat oplossen in de mond",
    body: "Kamagra Polo is een tablet met 100 mg sildenafil die je op de tong laat smelten of opzuigt. Je hebt er geen water bij nodig, wat discreet is, en een deel van de stof wordt al via het mondslijmvlies opgenomen.",
    related: ["kamagra", "onset"],
    link: "/winkel/kamagra",
  },
];

export default function BegrippenlijstPage() {
  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Begrippenlijst ED-medicatie",
    url: "https://kamagrasite.nl/begrippenlijst",
    hasDefinedTerm: TERMS.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `https://kamagrasite.nl/begrippenlijst#${t.id}`,
      name: t.term,
      description: t.body,
      inDefinedTermSet: "https://kamagrasite.nl/begrippenlijst",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSet) }}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-soft px-3 py-1 text-xs text-text-muted">
          <BookOpen className="h-3.5 w-3.5" /> Begrippen &middot; ED-medicatie
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl md:text-5xl">
          Begrippenlijst
        </h1>
        <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
          Uitleg van de begrippen die je op deze site en in de kennisbank tegenkomt, van PDE5-remmer
          en onset tot de fabrikanten achter Kamagra en Cenforce. Hover in een artikel over een term
          met stippellijn voor de korte definitie, of lees hieronder de volledige uitleg.
        </p>
      </section>

      <article className="container-x mx-auto max-w-3xl pb-16 md:pb-20">
        <nav aria-label="A-Z navigatie" className="mb-10 flex flex-wrap gap-2 rounded-lg border border-border bg-paper-soft p-4 text-sm">
          {Array.from(new Set(TERMS.map((t) => t.term[0].toUpperCase())))
            .sort()
            .map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="rounded-full bg-background px-3 py-1 font-medium text-text hover:bg-accent hover:text-accent-foreground"
              >
                {letter}
              </a>
            ))}
        </nav>

        <div className="space-y-10">
          {Array.from(new Set(TERMS.map((t) => t.term[0].toUpperCase())))
            .sort()
            .map((letter) => (
              <section key={letter} id={`letter-${letter}`}>
                <h2 className="font-display text-3xl text-accent">{letter}</h2>
                <div className="mt-4 space-y-8">
                  {TERMS.filter((t) => t.term[0].toUpperCase() === letter).map((t) => (
                    <article
                      key={t.id}
                      id={t.id}
                      className="border-b border-border pb-6 last:border-0"
                    >
                      <h3 className="font-display text-xl text-text">{t.term}</h3>
                      <p className="mt-1 text-sm italic text-text-muted">{t.short}</p>
                      <p className="mt-3 text-[15px] leading-relaxed text-text">{t.body}</p>
                      {(t.link || (t.related && t.related.length > 0)) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          {t.link && (
                            <Link
                              href={t.link}
                              className="rounded-full bg-paper-soft px-3 py-1 font-medium text-text hover:bg-accent hover:text-accent-foreground"
                            >
                              → {t.link.slice(1)}
                            </Link>
                          )}
                          {t.related?.map((relId) => {
                            const rel = TERMS.find((x) => x.id === relId);
                            if (!rel) return null;
                            return (
                              <a
                                key={relId}
                                href={`#${relId}`}
                                className="rounded-full border border-border bg-background px-3 py-1 text-text-muted hover:border-accent hover:text-accent"
                              >
                                {rel.term}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
        </div>

        <div className="mt-16 rounded-lg border border-border bg-paper-soft p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-accent font-semibold">Vraag beantwoord?</p>
          <h3 className="mt-2 font-display text-2xl text-text">
            Term nog niet gevonden of niet duidelijk?
          </h3>
          <p className="mt-2 text-sm text-text-muted">
            Stuur ons een berichtje via{" "}
            <Link href="/contact" className="text-accent underline">/contact</Link> - we vullen de
            begrippenlijst continu aan op basis van vragen die binnenkomen.
          </p>
        </div>
      </article>
    </>
  );
}
