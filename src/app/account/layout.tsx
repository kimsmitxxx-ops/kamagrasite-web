import type { Metadata } from "next";

/**
 * Accountpagina's horen niet in Google.
 *
 * Ze stonden op "index, follow" terwijl /winkelmand/ en /checkout/ hun
 * noindex wel hadden. Een inlogscherm of een besteloverzicht heeft geen
 * enkele waarde in de zoekresultaten en kan in het ergste geval als kale URL
 * opduiken.
 *
 * Waarom een layout en niet drie keer metadata in de pagina's zelf:
 * account/login is een client-component ("use client") en kan geen metadata
 * exporteren. Een layout dekt alle drie de pagina's en alles wat er later nog
 * onder komt.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
