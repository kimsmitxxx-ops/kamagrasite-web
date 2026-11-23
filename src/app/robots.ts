import { MetadataRoute } from "next";
import { getShop } from "@/lib/queries";

export const revalidate = 600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const shop = await getShop().catch(() => null);
  const noindex = shop?.noindex ?? true;

  if (noindex) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  // /account en /checkout stonden hier op disallow én hadden (of kregen) een
  // noindex-metatag. Dat bijt elkaar: een pagina die robots.txt blokkeert mag
  // Google niet ophalen, dus ziet hij de noindex nooit, en dan kan de URL
  // alsnog kaal in de resultaten verschijnen als iemand ernaar linkt.
  //
  // Noindex is het sterkere en betrouwbaardere signaal, dus die wint en de
  // blokkade gaat eruit. Het crawlbudget dat dit kost is verwaarloosbaar: het
  // gaat om een handvol URL's.
  //
  // /api/ blijft wel geblokkeerd. Dat zijn endpoints, geen pagina's: ze
  // kunnen geen metatag dragen, dus daar is robots.txt het enige middel.
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      // Zoekbots van Google en Bing, plus de AI-antwoordbots die een pagina
      // ophalen als een gebruiker er een vraag over stelt.
      { userAgent: ["Googlebot", "Googlebot-Image", "Bingbot"], allow: "/", disallow: ["/api/"] },
      { userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-User", "Claude-SearchBot", "PerplexityBot"], allow: "/", disallow: ["/api/"] },
      // AI-trainingscrawlers: bewust toegestaan, anders komen we niet in de
      // modellen en dus niet in de AI-antwoorden terecht. robots.txt is
      // hiervoor niet genoeg: Cloudflare geeft GPTBot, ClaudeBot en CCBot
      // een 403 zolang "Block AI bots" bij Security > Bots aanstaat.
      { userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"], allow: "/", disallow: ["/api/"] },
    ],
    sitemap: "https://kamagrasite.nl/sitemap.xml",
    host: "https://kamagrasite.nl",
  };
}
