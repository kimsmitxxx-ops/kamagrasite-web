import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/shop/cart-store";
import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { MobileTabBar } from "@/components/shop/mobile-tabbar";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CartAbandonTracker } from "@/components/cart-abandon-tracker";
import { GA4 } from "@/components/ga4";
import { ConsentNotice } from "@/components/consent-notice";
import { hreflangVoor, OG_LOCALE, organisatieJsonLd } from "@/lib/geo-nl";
import { CartDrawer, WhatsAppFab } from "@/components/uitgesteld";

// Measurement-ID per Vercel-project instellen; zonder ID laadt GA4 niet.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";

// Self-hosted fonts via next/font: geen render-blocking verzoek naar Google.
//
// Het paar is bewust niet Manrope + Space Grotesk. Dat is de typografie van
// anabolenpro, waar deze repo een fork van is, en daardoor leek dit ondanks
// een eigen kleurenpalet nog steeds dezelfde winkel. Source Sans leest rustig
// op lange lappen tekst en Source Serif geeft de koppen een redactionele toon,
// wat past bij een site die het vooral van uitleg moet hebben.
//
// De variabelen heten naar hun rol en niet naar het font, zodat een volgende
// wissel hier gebeurt en niet ook in globals.css en tailwind.config.ts.//
// Source Serif en niet Newsreader: next/font kent de metrics van Newsreader
// niet, dus dan krijgt de fallback geen size-adjust en springt de pagina bij
// het laden. Source Serif staat in capsize-font-metrics.json en hoort
// bovendien bij dezelfde superfamilie als Source Sans.
const fontSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});
const fontDisplay = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kamagrasite.nl"),
    // Taal en land expliciet, zie lib/geo-nl.ts.
    alternates: { languages: hreflangVoor("/") },
  title: { default: "Kamagra Site - generieke ED-medicatie zonder recept, snel verzonden", template: "%s · Kamagra Site" },
  description: "Kamagra, Cenforce, Vidalista en Vilitra: sildenafil, tadalafil en vardenafil direct geïmporteerd van gecertificeerde fabrikanten. Discrete verzending vanaf NL, geen recept nodig.",
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
      locale: OG_LOCALE,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" data-shop="kamagrasite" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <head>
        {/* Organization met areaServed NL en BE, inLanguage nl-NL en EUR.
            Staat in de layout en dus op elke pagina: het gaat over de site
            als geheel, niet over een losse pagina. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisatieJsonLd(null, String("https://kamagrasite.nl"))) }}
        />
        {/* Hier stond een regel die alvast verbinding maakte met de host van de
            database. Die stond daarmee in de head van elke pagina en noemde de
            projectnaam in de broncode. Beelden lopen nu via /media, /img en
            /bestand op ons eigen domein, dus valt er niets vooruit te verbinden. */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body>
        <AnalyticsTracker />
        <ConsentNotice />
        <CartProvider>
          <CartAbandonTracker />
          <div className="min-h-screen flex flex-col bg-background text-text overflow-x-hidden">
            <Header />
            <main className="flex-1 pb-16 md:pb-0 min-w-0">{children}</main>
            <Footer />
            <WhatsAppFab />
            <GA4 measurementId={GA4_ID} />
            <CartDrawer />
            <MobileTabBar />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
