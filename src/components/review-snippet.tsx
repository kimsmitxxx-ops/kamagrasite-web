import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Stars } from "./stars";
import { Afbeelding } from "@/components/afbeelding";

export type ReviewSnippetVariant = "compact" | "full";

export interface ReviewSnippetProps {
  name: string;
  avatar?: string;
  rating: number;
  date?: string;
  body: string;
  verified?: boolean;
  variant?: ReviewSnippetVariant;
  className?: string;
}

function VerifiedPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
      <Check size={12} />
      {label}
    </span>
  );
}

export function ReviewSnippet({
  name,
  avatar,
  rating,
  date,
  body,
  verified,
  variant = "full",
  className,
}: ReviewSnippetProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 text-sm", className)}>
        <Stars value={rating} size="sm" />
        <span className="font-medium text-text">{name}</span>
        <span className="text-text-muted truncate">- {body}</span>
      </div>
    );
  }
  return (
    <article className={cn("rounded-lg border border-primary-muted bg-primary p-5 shadow-card text-primary-foreground", className)}>
      <header className="flex items-start gap-3">
        {avatar ? (
          <Afbeelding src={avatar} alt="" width={40} height={40} sizes="40px" maxBreedte={40} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30 font-medium">
            {name.charAt(0)}
          </span>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-primary-foreground">{name}</span>
            {verified && <VerifiedPill label="Geverifieerd" />}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-primary-foreground/65">
            <Stars value={rating} size="sm" />
            {date && <span className="tabular">{date}</span>}
          </div>
        </div>
      </header>
      <p className="mt-3 text-sm text-primary-foreground/85 leading-relaxed">{body}</p>
      {verified && (
        <p className="mt-3">
          <VerifiedPill label="Geverifieerde aankoop" />
        </p>
      )}
    </article>
  );
}

export default ReviewSnippet;
