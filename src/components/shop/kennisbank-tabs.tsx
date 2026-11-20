"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/supabase";

export type TabKey = "alle" | "kennis" | "onderzoek" | "nieuws";

const TABS: { slug: TabKey; label: string }[] = [
  { slug: "alle", label: "Alle artikelen" },
  { slug: "kennis", label: "Kennis" },
  { slug: "onderzoek", label: "Onderzoek" },
  { slug: "nieuws", label: "Nieuws" },
];

function classify(cat: string | null | undefined): Exclude<TabKey, "alle"> {
  const c = (cat || "").toLowerCase();
  if (c.includes("onderzoek") || c.includes("studie")) return "onderzoek";
  if (c.includes("nieuws")) return "nieuws";
  return "kennis";
}

interface Props {
  articles: BlogPost[];
  initialTab?: TabKey;
}

export function KennisbankTabs({ articles, initialTab = "alle" }: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  // Sync interne tab-state met URL-driven initialTab. Zonder dit blijft de tab
  // hangen op de eerste mount-waarde als de gebruiker via header-submenu
  // navigeert (?cat=kennis → ?cat=onderzoek levert anders geen update).
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  const filtered = tab === "alle" ? articles : articles.filter((a) => classify(a.category) === tab);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count =
            t.slug === "alle"
              ? articles.length
              : articles.filter((a) => classify(a.category) === t.slug).length;
          const active = tab === t.slug;
          return (
            <button
              key={t.slug}
              onClick={() => setTab(t.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                active
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-surface text-text border-border hover:border-accent hover:text-accent"
              }`}
            >
              {t.label} <span className="opacity-60 tabular">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center text-text-muted">
          Nog geen artikelen in deze categorie.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/kennisbank/${a.slug}/`}
              className="group block overflow-hidden rounded-2xl border border-paper-border bg-paper-soft transition hover:shadow-md"
            >
              {a.image_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img loading="lazy" decoding="async" src={a.image_url} alt={a.title} className="aspect-[16/9] w-full object-cover" />
              )}
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-wider text-accent">{a.category || "Kennis"}</p>
                <h2 className="mt-2 font-display text-lg leading-tight group-hover:text-accent">{a.title}</h2>
                {a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-text-muted">{a.excerpt}</p>}
                <p className="mt-3 text-[11px] text-text-subtle">
                  {new Date(a.published_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
