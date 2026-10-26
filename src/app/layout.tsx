import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/shop/cart-store";
import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { MobileTabBar } from "@/components/shop/mobile-tabbar";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CartAbandonTracker } from "@/components/cart-abandon-tracker";
import { GA4 } from "@/components/ga4";
import { ConsentNotice } from "@/components/consent-notice";

// Measurement-ID per Vercel-project instellen; zonder ID laadt GA4 niet.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";

// CartDrawer is alleen zichtbaar als gebruiker op cart-icoon klikt -> defer hydratie
const CartDrawer = dynamic(
  () => import("@/components/shop/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false },
);

// Self-hosted fonts via next/font: elimineert render-blocking Google Fonts request
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// Defer chat-widget - niet kritiek voor FCP/LCP; pas hydrateren na main content
const WhatsAppFab = dynamic(
  () => import("@/components/whatsapp-fab").then((m) => m.WhatsAppFab),
  { ssr: false },
);

export const metadata: Metadata = {
  metadataBase: new URL("https://kamagrasite.nl"),
  title: { default: "Kamagra Site - generieke ED-medicatie zonder recept, snel verzonden", template: "%s · Kamagra Site" },
  description: "Kamagra, Cenforce, Vidalista en Vilitra: sildenafil, tadalafil en vardenafil direct geïmporteerd van gecertificeerde fabrikanten. Discrete verzending vanaf NL, geen recept nodig.",
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" data-shop="kamagrasite" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://rexqfwibxawqnvrzbdoo.supabase.co" />
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
