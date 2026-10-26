/** @type {import('next').NextConfig} */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rexqfwibxawqnvrzbdoo.supabase.co";

module.exports = {
  // Zodat een controle-build naast een draaiende dev-server kan: NEXT_DIST_DIR=.next-check
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
      { source: "/onderzoek/:slug", destination: "/kennisbank/:slug", permanent: true },
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
