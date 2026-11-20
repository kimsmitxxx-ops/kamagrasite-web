"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Search, ArrowRight, X } from "lucide-react";
import { mainCategories, STOF_FILTERS } from "./data";

export interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const POPULAIR = ["Kamagra", "Oral Jelly", "Cenforce", "Vidalista", "Vilitra", "Super P-Force"];

/**
 * Mobiele zoeklade. De catalogus staat in Supabase en niet in de bundel, dus
 * zoeken gebeurt server-side: dit formulier stuurt door naar /winkel?q=...
 */
export function MobileSearchSheet({ open, onOpenChange }: MobileSearchSheetProps) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    onOpenChange(false);
    router.push(`/winkel?q=${encodeURIComponent(t)}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="p-0 flex flex-col max-h-[85vh]">
        <header className="px-4 pt-3 pb-3 pr-12 border-b border-border flex items-center gap-2">
          <SheetTitle className="sr-only">Zoek producten</SheetTitle>
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
          >
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-muted" />
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek producten - bv. kamagra, oral jelly, vidalista"
              className="w-full h-11 pl-10 pr-9 rounded-md border border-accent/40 bg-success-soft text-sm font-medium text-primary placeholder:text-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Wis zoekopdracht"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-primary/70 hover:bg-primary/10"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {q.trim() && (
            <button
              type="button"
              onClick={() => submit(q)}
              className="w-full inline-flex items-center justify-between rounded-md border border-accent bg-accent/10 px-3 py-2.5 text-sm font-medium text-text"
            >
              <span>Zoek op &ldquo;{q.trim()}&rdquo; in de winkel</span>
              <ArrowRight size={14} className="text-accent" />
            </button>
          )}

          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Populair</p>
            <div className="flex flex-wrap gap-2">
              {POPULAIR.map((t) => (
                <button
                  key={t}
                  onClick={() => submit(t)}
                  className="px-3 h-8 rounded-full border border-border bg-surface text-sm text-text hover:border-accent"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Werkzame stof</p>
            <div className="flex flex-wrap gap-2">
              {STOF_FILTERS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/winkel/?stof=${s.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="px-3 h-8 inline-flex items-center rounded-full border border-border bg-surface text-sm text-text hover:border-accent"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Categorieen</p>
            <ul className="divide-y divide-border">
              {mainCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.to}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-between py-3 px-2 rounded hover:bg-muted/40"
                  >
                    <span className="text-sm font-medium text-text">{c.name}</span>
                    <ArrowRight size={14} className="text-text-muted shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileSearchSheet;
