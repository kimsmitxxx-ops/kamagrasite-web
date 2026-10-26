/**
 * Shared static data voor kamagrasite-web.
 * Product-catalog + blogs komen uit Supabase; deze file bevat de vaste
 * navigatie-vocabulaire (categorieen, werkzame stoffen, toedieningsvormen)
 * en de fallback-beelden voor de homepage-tegels.
 */

const catErectie = "/assets/cat-erectie.webp";

export interface MainCategory {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  to: string;
}

export const mainCategories: MainCategory[] = [
  {
    slug: "kamagra",
    name: "Kamagra",
    tagline: "Sildenafil 100 mg van Ajanta Pharma, als tablet, jelly, kauwtablet of bruistablet.",
    image: catErectie,
    to: "/winkel/kamagra",
  },
  {
    slug: "cenforce",
    name: "Cenforce",
    tagline: "Sildenafil van 50 tot 200 mg, zodat je de dosering precies kunt opbouwen.",
    image: catErectie,
    to: "/winkel/cenforce",
  },
  {
    slug: "vidalista",
    name: "Vidalista",
    tagline: "Tadalafil met een werkingsduur tot 36 uur, geen strakke timing nodig.",
    image: catErectie,
    to: "/winkel/vidalista",
  },
  {
    slug: "vilitra",
    name: "Vilitra",
    tagline: "Vardenafil, het alternatief voor wie slecht reageert op sildenafil.",
    image: catErectie,
    to: "/winkel/vilitra",
  },
  {
    slug: "combo-preparaten",
    name: "Combo-preparaten",
    tagline: "Sildenafil of tadalafil met dapoxetine in een tablet: erectie en uitstel in een.",
    image: catErectie,
    to: "/winkel/combo-preparaten",
  },
];

/** Werkzame stoffen. Slug = waarde van de ?stof= filter en van products.stof_slugs. */
export const STOF_FILTERS: { slug: string; label: string }[] = [
  { slug: "sildenafil", label: "Sildenafil" },
  { slug: "tadalafil", label: "Tadalafil" },
  { slug: "vardenafil", label: "Vardenafil" },
  { slug: "dapoxetine", label: "Dapoxetine" },
];

/** Toedieningsvormen. Slug = waarde van de ?vorm= filter en van products.package_type. */
export const VORM_FILTERS: { slug: string; label: string }[] = [
  { slug: "tablet", label: "Tablet" },
  { slug: "oral-jelly", label: "Oral jelly" },
  { slug: "kauwtablet", label: "Kauwtablet" },
  { slug: "bruistablet", label: "Bruistablet" },
];

export function stofLabel(slug: string): string {
  return STOF_FILTERS.find((s) => s.slug === slug)?.label || slug;
}

export function vormLabel(slug: string): string {
  return VORM_FILTERS.find((v) => v.slug === slug)?.label || slug;
}
