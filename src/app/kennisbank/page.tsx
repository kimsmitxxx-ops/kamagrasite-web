import Link from "next/link";
import { listBlogPosts } from "@/lib/queries";
import { KennisbankTabs } from "@/components/shop/kennisbank-tabs";
import type { Metadata } from "next";
import { alternatesNL } from "@/lib/geo-nl";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Welk merk, welke stof: vergelijkingen · Kamagra Site",
  description:
    "Kamagra of Cenforce, en welke werkzame stof past bij jou: korte vergelijkingen die je helpen kiezen voordat je bestelt.",
  alternates: alternatesNL("/kennisbank/"),
};

/**
 * Deze pagina heette een kennisbank met een kennis/onderzoek/nieuws-indeling.
 * De oude site had nooit een blog, en van de vijf artikelen die hier stonden
 * waren er maar drie die echt een aankoopbeslissing sturen (welk merk, welke
 * stof); de andere twee waren puur klinisch en staan nu op is_published=false
 * in plaats van hier te blijven staan. Vandaar de smallere titel en het
 * ontbreken van searchParams/tabs: met drie artikelen die allemaal hetzelfde
 * doel dienen heeft een categorie-filter geen functie meer.
 */
export default async function KennisbankPage() {
  const articles = await listBlogPosts(50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 text-xs text-text-muted">
        <Link href="/" className="hover:underline">Home</Link> / <span>Vergelijkingen</span>
      </div>

      <h1 className="font-display text-4xl md:text-5xl leading-tight">
        Welk merk, welke stof: <span className="text-accent">vergelijkingen</span>
      </h1>
      <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
        Kamagra of Cenforce, sildenafil of tadalafil: korte vergelijkingen die je
        helpen kiezen voordat je bestelt.
      </p>

      <KennisbankTabs articles={articles} />
    </div>
  );
}
