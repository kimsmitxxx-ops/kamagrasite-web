import Link from "next/link";
import type { BlogPost } from "@/lib/supabase";
import { Afbeelding } from "@/components/afbeelding";

/**
 * Het grid met vergelijkingsartikelen.
 *
 * Stond hier eerder met een tab-wisselaar (Alle/Kennis/Onderzoek/Nieuws).
 * Die had zin bij een brede kennisbank, maar de oude site had nooit een blog
 * en de inhoud is nu teruggebracht tot alleen artikelen met koopintentie:
 * welk merk, welke stof, wat is het verschil. Met drie artikelen die allemaal
 * hetzelfde doel dienen is een categorie-indeling overbodige complexiteit, dus
 * die is eruit. Geen "use client" meer nodig: er is geen interactie meer om
 * client-side te doen.
 */
export function KennisbankTabs({ articles }: { articles: BlogPost[] }) {
  if (articles.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center text-text-muted">
        Nog geen artikelen.
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <Link
          key={a.id}
          href={`/kennisbank/${a.slug}/`}
          className="group block overflow-hidden rounded-2xl border border-paper-border bg-paper-soft transition hover:shadow-md"
        >
          {a.image_url && (
            <Afbeelding
              src={a.image_url}
              alt={a.title}
              width={400}
              height={225}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="aspect-[16/9] w-full object-cover"
            />
          )}
          <div className="p-5">
            <h2 className="font-display text-lg leading-tight group-hover:text-accent">{a.title}</h2>
            {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-text-muted">{a.excerpt}</p>}
            <p className="mt-3 text-[11px] text-text-subtle">
              {new Date(a.published_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
