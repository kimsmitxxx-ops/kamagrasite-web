import { cn } from "@/lib/utils";
import { Afbeelding } from "@/components/afbeelding";
import { Tag } from "./tag";

export type ArticleCardVariant = "sm" | "md" | "featured";

export interface ArticleAuthor {
  name: string;
  avatar?: string;
  credentials?: string;
}

export interface ArticleCardProps {
  image: string;
  kindTag: string;
  title: string;
  excerpt?: string;
  publishedAt: string; // formatted nl-NL
  updatedAt?: string;
  author: ArticleAuthor;
  href?: string;
  variant?: ArticleCardVariant;
  className?: string;
}

function Meta({ author, publishedAt, updatedAt }: Pick<ArticleCardProps, "author" | "publishedAt" | "updatedAt">) {
  const showUpdated = updatedAt && updatedAt !== publishedAt;
  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      {author.avatar && (
        <img loading="lazy" decoding="async" src={author.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
      )}
      <span className="font-medium text-text">{author.name}</span>
      {author.credentials && <span className="text-text-subtle">· {author.credentials}</span>}
      <span className="text-text-subtle">·</span>
      <span className="tabular">
        {showUpdated ? `Laatst bijgewerkt ${updatedAt}` : publishedAt}
      </span>
    </div>
  );
}

export function ArticleCard({
  image,
  kindTag,
  title,
  excerpt,
  publishedAt,
  updatedAt,
  author,
  href = "#",
  variant = "md",
  className,
}: ArticleCardProps) {
  if (variant === "sm") {
    return (
      <a
        href={href}
        className={cn(
          "flex gap-4 items-start rounded border border-border bg-surface p-3 hover:border-border-strong transition-colors",
          className,
        )}
      >
        <Afbeelding
          src={image}
          alt={title}
          width={112}
          height={80}
          /* Vast vakje van 112 pixels; hier zat de grootste verspilling. */
          sizes="112px"
          maxBreedte={112}
          className="h-20 w-28 rounded object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <Tag>{kindTag}</Tag>
          <h3 className="mt-1.5 font-display text-base text-text leading-snug line-clamp-2">{title}</h3>
          <p className="mt-1 text-xs text-text-muted tabular">
            {updatedAt && updatedAt !== publishedAt ? `Bijgewerkt ${updatedAt}` : publishedAt}
          </p>
        </div>
      </a>
    );
  }
  if (variant === "featured") {
    return (
      <a
        href={href}
        className={cn(
          "relative block overflow-hidden rounded-lg border border-border shadow-card hover:shadow-lift transition-shadow aspect-[16/9]",
          className,
        )}
      >
        <img loading="lazy" decoding="async" src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-text/85 via-text/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-surface">
          <span className="inline-block rounded-sm border border-surface/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
            {kindTag}
          </span>
          <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight max-w-2xl">{title}</h3>
          {excerpt && <p className="mt-2 text-sm text-surface/80 max-w-xl line-clamp-2">{excerpt}</p>}
        </div>
      </a>
    );
  }
  return (
    <a
      href={href}
      className={cn(
        "block overflow-hidden rounded-lg border border-primary-muted bg-primary text-primary-foreground shadow-card hover:shadow-lift transition-shadow",
        className,
      )}
    >
      <div className="aspect-[16/9] bg-primary-soft">
        <img loading="lazy" decoding="async" src={image} alt={title} className="h-full w-full object-cover opacity-95" />
      </div>
      <div className="p-5 space-y-3">
        <Tag>{kindTag}</Tag>
        <h3 className="font-display text-xl text-primary-foreground leading-snug">{title}</h3>
        {excerpt && <p className="text-sm text-primary-foreground/70 line-clamp-3">{excerpt}</p>}
        <div className="flex items-center gap-2 text-xs text-primary-foreground/60">
          {author.avatar && (
            <img loading="lazy" decoding="async" src={author.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
          )}
          <span className="font-medium text-primary-foreground/90">{author.name}</span>
          {author.credentials && <span>· {author.credentials}</span>}
          <span>·</span>
          <span className="tabular">
            {updatedAt && updatedAt !== publishedAt ? `Bijgewerkt ${updatedAt}` : publishedAt}
          </span>
        </div>
      </div>
    </a>
  );
}

export default ArticleCard;
