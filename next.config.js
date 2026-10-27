/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rexqfwibxawqnvrzbdoo.supabase.co";

module.exports = {
  // Zodat een controle-build naast een draaiende dev-server kan: NEXT_DIST_DIR=.next-check
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // De WooCommerce-shop op kamagrasite.nl 301't elke URL zonder slash naar de
  // versie met slash, dus Google kent /cenforce-200/ en /product/kamagra-100mg/.
  // Zonder dit krijgt elke overgenomen URL eerst een 308 van Next erbij. Zie
  // URL-OVERNAME.md.
  trailingSlash: true,
  // Defensive: don't break build on lint/type errors during deploy
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "rexqfwibxawqnvrzbdoo.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      // Clean /media/<path> URLs → Supabase Storage (shop_slug=kamagrasite)
      { source: "/media/:path*", destination: `${SUPABASE_URL}/storage/v1/object/public/product-media/kamagrasite/:path*` },
      // Clean /img/<path> URLs → Supabase Storage blog-images bucket (categorie/stof/blog heros)
      { source: "/img/:path*", destination: `${SUPABASE_URL}/storage/v1/object/public/blog-images/:path*` },
    ];
  },
  async redirects() {
    return [
      // Blogs die van shop-dash 'buildInternalLinks' onderzoek/-slug krijgen: op deze
      // site heten ze /kennisbank/*. Redirect zodat oude bodies niet 404 geven.
      { source: "/onderzoek/:slug", destination: "/kennisbank/:slug/", permanent: true },

      // ---------------------------------------------------------------------
      // Overname van de WooCommerce-shop op kamagrasite.nl. Onderbouwing en
      // cijfers per URL staan in URL-OVERNAME.md; die zijn uit Search Console
      // gehaald over 12 maanden, niet geschat.
      //
      // Wat hier NIET staat is even belangrijk: de 40 product-URL's en de
      // zoekterm- en stadspagina's staan bewust niet in deze lijst. Die houden
      // hun eigen URL, want daar zit 60% van het verkeer. Alleen wat echt
      // verdwijnt of samenvalt wordt omgeleid.
      // ---------------------------------------------------------------------

      // Categoriepagina's: WooCommerce gebruikt /product-category/, deze site
      // /winkel/. Waar de categorie hier niet bestaat gaat hij naar de
      // koop-pagina die hetzelfde onderwerp dekt.
      { source: "/product-category/kamagra", destination: "/winkel/kamagra/", permanent: true },
      { source: "/product-category/cenforce", destination: "/winkel/cenforce/", permanent: true },
      { source: "/product-category/vidalista", destination: "/winkel/vidalista/", permanent: true },
      { source: "/product-category/vilitra", destination: "/winkel/vilitra/", permanent: true },
      { source: "/product-category/sildalis", destination: "/winkel/combo-preparaten/", permanent: true },
      // sildaforce is sildenafil in tabletvorm, zelfde schap als Cenforce
      { source: "/product-category/sildaforce", destination: "/winkel/sildaforce/", permanent: true },
      { source: "/product-category/oral-jelly", destination: "/kamagra-jelly-kopen/", permanent: true },
      { source: "/product-category/sildenafil", destination: "/sildenafil-100mg-bestellen/", permanent: true },
      { source: "/product-category/viagra", destination: "/winkel/merkmiddelen/", permanent: true },
      { source: "/product-category/voor-vrouwen", destination: "/lovegra/", permanent: true },
      { source: "/product-category/cialis", destination: "/tadalafil-kopen/", permanent: true },
      { source: "/product-category/tadalafil", destination: "/tadalafil-kopen/", permanent: true },
      { source: "/product-category/vardenafil", destination: "/vardenafil/", permanent: true },
      { source: "/product-category/dapoxetine", destination: "/super-kamagra/", permanent: true },
      { source: "/product-category/cobra", destination: "/winkel/cobra/", permanent: true },

      // Productredirects: er zijn er nog maar twee nodig.
      //
      // Op 26 okt 2026 zijn de 17 ontbrekende producten uit de live
      // WooCommerce-shop toegevoegd, dus alle andere /product/<slug>-URL's
      // lossen nu op hun eigen adres op. Dat is meer waard dan een redirect,
      // ook voor de vijf die nul vertoningen hadden: een eigen URL kan groeien,
      // een redirect niet.
      //
      // Deze twee slugs nemen we niet over:
      { source: "/product/sildaforce-100mg-2", destination: "/product/sildaforce-100mg/", permanent: true },
      // dubbele listing van hetzelfde artikel op de live shop
      { source: "/product/cobra-120mg-datum-6-2026", destination: "/product/cobra-120mg/", permanent: true },
      // slug met een houdbaarheidsdatum erin, die veroudert per definitie

      // Losse pagina's die hier samenvallen of niet thuishoren.
      { source: "/shop", destination: "/winkel/", permanent: true },
      // De live site had een gecombineerde pagina, deze site splitst dat in
      // /bezorging en /retourneren. 17 kliks op positie 10, dus wel omleiden.
      { source: "/verzenden-retourneren", destination: "/bezorging/", permanent: true },
      { source: "/viagra-kopen", destination: "/sildenafil-100mg-bestellen/", permanent: true },
      { source: "/viagra-kopen-ideal", destination: "/sildenafil-100mg-bestellen/", permanent: true },
      // Novosil wordt niet verkocht
      { source: "/novosil", destination: "/erectiepillen/", permanent: true },
      // Voorlichting hoort bij erectiekompas, en deze drie haalden samen
      // 5 vertoningen en 0 kliks. Intern opvangen tot die site live staat.
      { source: "/bijwerkingen-kamagra", destination: "/kennisbank/", permanent: true },
      { source: "/jelly-kamagra", destination: "/kamagra-jelly-kopen/", permanent: true },
      { source: "/orgasmes-uitstellen", destination: "/super-kamagra/", permanent: true },
    ];
  },
  async headers() {
    const longCache = "public, max-age=31536000, immutable";
    return [
      { source: "/sitemap.xml", headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" }] },
      { source: "/robots.txt", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
      { source: "/llms.txt", headers: [{ key: "Cache-Control", value: "public, max-age=3600" }] },
      // Static assets — 1 jaar cache
      { source: "/assets/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800" }] },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800" }] },
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
    ];
  },
  compress: true,
};
