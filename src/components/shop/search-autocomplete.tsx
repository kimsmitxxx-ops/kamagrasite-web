"use client";
import { useEffect, useRef, useState } from "react";
import { preorder } from "@/lib/preorder";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { formatEUR } from "@/lib/format";
import { Afbeelding } from "@/components/afbeelding";

interface Hit {
  name: string;
  slug: string;
  image_url: string | null;
  price_cents: number;
  availability: string | null;
  verwacht_op?: string | null;
}

/**
 * Zoekveld met live suggesties: naam, foto en prijs terwijl je typt, net als
 * op Kuur.is. Debounced fetch naar /api/search, Enter of submit valt terug op
 * de volledige resultatenlijst op /winkel/.
 */
export function SearchAutocomplete({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lopend = useRef<AbortController | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      lopend.current?.abort();
      lopend.current = null;
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      // Een lopend verzoek afbreken voor het volgende start: anders kan het
      // antwoord op een eerdere, kortere zoekterm na een latere binnenkomen en
      // de nieuwere resultaten overschrijven met verouderde.
      lopend.current?.abort();
      const ctrl = new AbortController();
      lopend.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { cache: "no-store", signal: ctrl.signal });
        const j = await res.json();
        if (ctrl.signal.aborted) return;
        setHits(j.results || []);
      } catch {
        if (!ctrl.signal.aborted) setHits([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  useEffect(() => () => lopend.current?.abort(), []);

  function goToProduct(slug: string) {
    setOpen(false);
    router.push(`/product/${slug}/`);
  }

  function goToAll() {
    setOpen(false);
    router.push(q.trim() ? `/winkel/?q=${encodeURIComponent(q.trim())}` : "/winkel/");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    goToAll();
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form action="/winkel/" method="get" onSubmit={submit}>
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-muted" />
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            placeholder={placeholder}
            className="w-full h-10 pl-10 pr-9 rounded-md border border-accent/40 bg-paper-soft text-sm font-medium text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent shadow-sm"
          />
          {loading && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-subtle" />
          )}
        </div>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-md border border-border bg-background shadow-lift z-50 overflow-hidden">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-muted">
              {loading ? "Zoeken…" : `Geen producten gevonden voor "${q}"`}
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-border">
              {hits.map((h) => (
                <li key={h.slug}>
                  <button
                    type="button"
                    onClick={() => goToProduct(h.slug)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-paper-soft"
                  >
                    <Afbeelding
                      src={h.image_url || "/assets/cat-erectie.webp"}
                      alt={h.name}
                      width={44}
                      height={44}
                      sizes="44px"
                      maxBreedte={44}
                      className="h-11 w-11 rounded object-cover shrink-0 bg-muted"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text truncate">{h.name}</span>
                      {h.availability === "OutOfStock" && (
                        <span className="text-[11px] text-danger">Uitverkocht</span>
                      )}
                      {preorder(h) && (
                        <span className="text-[11px] font-medium text-warning">{preorder(h)?.kaartLabel}</span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-accent-ink shrink-0">{formatEUR(h.price_cents)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToAll}
            className="w-full px-4 py-2.5 text-xs font-medium text-accent-ink hover:bg-paper-soft text-left border-t border-border"
          >
            Alle resultaten voor &quot;{q}&quot; bekijken →
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
