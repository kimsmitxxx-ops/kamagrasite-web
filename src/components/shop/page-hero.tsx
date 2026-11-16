import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-wash via-veil to-wash">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl lg:text-5xl text-text leading-tight max-w-3xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 text-base lg:text-lg text-text-muted leading-relaxed max-w-2xl">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export default PageHero;
