import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Afbeelding } from "@/components/afbeelding";

export type CategoryTileVariant = "default" | "featured";

export interface CategoryTileProps {
  name: string;
  count?: number;
  icon?: LucideIcon;
  image?: string;
  href?: string;
  variant?: CategoryTileVariant;
  className?: string;
}

export function CategoryTile({
  name,
  count,
  icon: Icon,
  image,
  href = "#",
  variant = "default",
  className,
}: CategoryTileProps) {
  if (variant === "featured") {
    return (
      <a
        href={href}
        className={cn(
          "relative block overflow-hidden rounded-lg border border-border shadow-card hover:shadow-lift transition-shadow",
          "aspect-[3/2]",
          className,
        )}
      >
        {image && (
          <Afbeelding
            src={image}
            alt={name}
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <h3 className="font-display text-2xl text-text">{name}</h3>
          {count != null && (
            <p className="text-sm text-text-muted mt-1 tabular">{count} producten</p>
          )}
        </div>
      </a>
    );
  }
  return (
    <a
      href={href}
      className={cn(
        "flex flex-col items-start gap-3 p-5 rounded-lg border border-primary-muted bg-primary text-primary-foreground shadow-card hover:shadow-lift hover:border-accent transition-all",
        className,
      )}
    >
      {Icon && (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-accent/15 text-accent ring-1 ring-accent/30">
          <Icon size={20} />
        </span>
      )}
      <div>
        <h3 className="font-display text-lg text-primary-foreground leading-tight">{name}</h3>
        {count != null && (
          <p className="text-sm text-primary-foreground/65 mt-0.5 tabular">{count} producten</p>
        )}
      </div>
    </a>
  );
}

export default CategoryTile;
