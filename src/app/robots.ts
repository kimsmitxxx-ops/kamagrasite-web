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
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/account", "/api/", "/checkout"] },
      // Zoekbots van Google en Bing, plus de AI-antwoordbots die een pagina
      // ophalen als een gebruiker er een vraag over stelt.
      { userAgent: ["Googlebot", "Googlebot-Image", "Bingbot"], allow: "/", disallow: ["/account", "/api/", "/checkout"] },
      { userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-User", "Claude-SearchBot", "PerplexityBot"], allow: "/", disallow: ["/account", "/api/", "/checkout"] },
      // AI-trainingscrawlers: bewust toegestaan, anders komen we niet in de
      // modellen en dus niet in de AI-antwoorden terecht. robots.txt is
      // hiervoor niet genoeg: Cloudflare geeft GPTBot, ClaudeBot en CCBot
      // een 403 zolang "Block AI bots" bij Security > Bots aanstaat.
      { userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"], allow: "/", disallow: ["/account", "/api/", "/checkout"] },
    ],
    sitemap: "https://kamagrasite.nl/sitemap.xml",
    host: "https://kamagrasite.nl",
  };
}
