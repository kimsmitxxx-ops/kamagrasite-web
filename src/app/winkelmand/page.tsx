import type { Metadata } from "next";
import { teksten } from "@/lib/teksten-server";
import { WinkelmandClient } from "./winkelmand-client";

/**
 * De winkelmand. De mand zelf leeft in de browser, dus het scherm is een
 * client-component; de teksten komen van de server, zodat een wijziging in
 * shop-dash meteen meekomt.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await teksten();
  return { title: t.mand.titel, robots: { index: false, follow: true } };
}

export default async function WinkelmandPage() {
  return <WinkelmandClient t={await teksten()} />;
}
