import type { Metadata } from "next";
import { teksten } from "@/lib/teksten-server";
import { CheckoutClient } from "./checkout-client";

/**
 * Afrekenen. Het formulier leeft in de browser, dus het scherm is een
 * client-component; de teksten komen van de server.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await teksten();
  return { title: t.afrekenen.titel, robots: { index: false, follow: false } };
}

export default async function CheckoutPage() {
  return <CheckoutClient t={await teksten()} />;
}
