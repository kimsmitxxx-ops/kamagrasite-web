import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, listBlogPosts } from "@/lib/queries";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { MedicalDisclaimer } from "@/components/medical-disclaimer";
import { highlightGlossary } from "@/lib/glossary-highlight";

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await listBlogPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getBlogPost(params.slug);
  if (!p) return { title: "Niet gevonden" };
  return {
    title: p.meta_title || p.title,
    description: p.meta_description || p.excerpt || undefined,
    alternates: { canonical: `/kennisbank/${p.slug}/` },
    openGraph: {
      title: p.title,
      description: p.excerpt || undefined,
      type: "article",
      publishedTime: p.published_at,
      images: p.image_url ? [{ url: p.image_url }] : undefined,
    },
  };
}

export default async function KennisbankDetail({ params }: { params: { slug: string } }) {
  const p = await getBlogPost(params.slug);
  if (!p) notFound();

  const authorInfo = (p as any).author_info as
    | { id: string; slug: string; name: string; role: string | null; bio_short: string | null; bio_long: string | null; avatar_url: string | null; expertise: string[] | null; credentials: string[] | null }
    | null;
  const authorName = authorInfo?.name || p.author || null;
  const authorPersonLd = authorInfo
    ? {
        "@type": "Person",
        name: authorInfo.name,
        jobTitle: authorInfo.role || undefined,
        description: authorInfo.bio_short || undefined,
        image: authorInfo.avatar_url || undefined,
        url: `https://kamagrasite.nl/over-ons#${authorInfo.slug}`,
        knowsAbout: authorInfo.expertise || undefined,
      }
    : authorName
      ? { "@type": "Person", name: authorName }
      : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt,
    image: p.image_url ? [p.image_url] : undefined,
    datePublished: p.published_at,
    dateModified: p.published_at,
    author: authorPersonLd,
    publisher: {
      "@type": "Organization",
      name: "Kamagra Site",
      url: "https://kamagrasite.nl",
      logo: { "@type": "ImageObject", url: "https://kamagrasite.nl/assets/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://kamagrasite.nl/kennisbank/${p.slug}` },
  };
  // ProfilePage als losse JSON-LD voor de auteur (versterkt E-E-A-T signaal)
  const profileJsonLd = authorInfo
    ? {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: authorInfo.name,
          jobTitle: authorInfo.role,
          description: authorInfo.bio_short,
          image: authorInfo.avatar_url || undefined,
          knowsAbout: authorInfo.expertise || undefined,
          award: authorInfo.credentials || undefined,
          url: `https://kamagrasite.nl/over-ons#${authorInfo.slug}`,
        },
      }
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {profileJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }} />
      )}
      <Link href="/kennisbank" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
        <ArrowLeft className="h-3 w-3" /> Kennisbank
      </Link>

      {p.category && <p className="mt-6 text-[10px] uppercase tracking-wider text-accent">{p.category}</p>}
      <h1 className="mt-2 font-display text-3xl md:text-5xl leading-tight">{p.title}</h1>

      {/* Byline-row met auteur + credentials + datum */}
      <div className="mt-5 flex items-center gap-3 text-sm text-text-muted">
        {authorInfo?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authorInfo.avatar_url}
            alt={`Profielfoto ${authorInfo.name}`}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-paper-border"
          />
        ) : authorName ? (
          <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold">
            {authorName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          {authorName && (
            <p className="flex items-center gap-1.5 text-text">
              <span className="font-semibold">{authorName}</span>
              {authorInfo?.role && (
                <>
                  <BadgeCheck size={13} className="text-accent" />
                  <span className="text-xs text-text-muted">{authorInfo.role}</span>
                </>
              )}
            </p>
          )}
          {p.published_at && (
            <time className="text-xs text-text-subtle">
              Gepubliceerd op{" "}
              {new Date(p.published_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </div>

      {p.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={p.image_url} alt={p.image_alt || p.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
      )}

      {p.excerpt && <p className="mt-8 text-lg text-text-muted leading-relaxed">{p.excerpt}</p>}

      <div
        className="prose prose-lg mt-10 max-w-none leading-relaxed
                   [&>h2]:font-display [&>h2]:text-2xl [&>h2]:mt-10 [&>h2]:mb-4
                   [&>h3]:font-display [&>h3]:text-xl [&>h3]:mt-8 [&>h3]:mb-3
                   [&>p]:my-4 [&>p]:text-text
                   [&>ul]:my-4 [&>ul]:pl-6 [&>ul]:list-disc
                   [&>ol]:my-4 [&>ol]:pl-6 [&>ol]:list-decimal
                   [&>a]:text-accent [&>a]:underline
                   [&_a]:text-accent [&_a]:underline
                   [&>blockquote]:border-l-4 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: highlightGlossary(p.body || "") }}
      />

      {/* Author bio-blok onderaan voor extra E-E-A-T signaal */}
      {authorInfo && (
        <aside className="mt-14 rounded-xl border border-paper-border bg-paper-soft p-6">
          <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">Over de schrijver</p>
          <div className="mt-3 flex items-start gap-4">
            {authorInfo.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorInfo.avatar_url}
                alt={`Profielfoto ${authorInfo.name}`}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-paper-border shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold text-xl shrink-0">
                {authorInfo.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-lg text-text">{authorInfo.name}</p>
              {authorInfo.role && (
                <p className="text-xs text-text-muted">{authorInfo.role}</p>
              )}
              {authorInfo.bio_long && (
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{authorInfo.bio_long}</p>
              )}
              {authorInfo.credentials && authorInfo.credentials.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {authorInfo.credentials.map((c) => (
                    <li
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-text-muted border border-border"
                    >
                      <BadgeCheck size={10} className="text-accent" /> {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* YMYL: medical disclaimer onderaan iedere blog */}
      <MedicalDisclaimer />
    </article>
  );
}
