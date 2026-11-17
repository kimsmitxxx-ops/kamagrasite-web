"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface UspItem {
  icon: LucideIcon;
  title: string;
  sub?: string;
}

export type UspStripVariant = "compact" | "cards";
export type UspStripTone = "default" | "dark";

export interface UspStripProps {
  items: UspItem[];
  variant?: UspStripVariant;
  tone?: UspStripTone;
  className?: string;
}

export function UspStrip({ items, variant = "compact", tone = "default", className }: UspStripProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {items.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-surface p-5 shadow-card"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-accent">
              <Icon size={20} />
            </span>
            <h4 className="mt-3 font-medium text-text">{title}</h4>
            {sub && <p className="mt-1 text-sm text-text-muted leading-relaxed">{sub}</p>}
          </div>
        ))}
      </div>
    );
  }

  const itemText = tone === "dark" ? "text-primary-foreground/85" : "text-text";
  const iconColor = tone === "dark" ? "text-accent-soft" : "text-accent";

  return (
    <>
      {/* Mobile - auto rotating single line */}
      <MobileRotator items={items} itemText={itemText} iconColor={iconColor} className={className} />

      {/* Desktop - evenly distributed */}
      <ul
        className={cn(
          "hidden md:flex flex-wrap items-center justify-between gap-x-8 gap-y-2",
          className,
        )}
      >
        {items.map(({ icon: Icon, title }) => (
          <li
            key={title}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              itemText,
            )}
          >
            <Icon size={16} className={cn("shrink-0", iconColor)} />
            <span>{title}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function MobileRotator({
  items,
  itemText,
  iconColor,
  className,
}: {
  items: UspItem[];
  itemText: string;
  iconColor: string;
  className?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 2800);
    return () => clearInterval(id);
  }, [items.length]);
  const current = items[i];
  if (!current) return null;
  const Icon = current.icon;
  return (
    <div className={cn("md:hidden flex items-center justify-center", className)}>
      <div
        key={i}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-500",
          itemText,
        )}
      >
        <Icon size={16} className={cn("shrink-0", iconColor)} />
        <span>{current.title}</span>
      </div>
    </div>
  );
}

export default UspStrip;
