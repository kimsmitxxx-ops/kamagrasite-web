"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Check, Beaker, Pill } from "lucide-react";
import { STOF_FILTERS, VORM_FILTERS } from "./data";

interface Props {
  /** Laat weg om de stand uit de URL te lezen in plaats van uit de server. */
  stockOnly?: boolean;
  activeStof?: string;
  activeVorm?: string;
  /** Vormen die in deze lijst daadwerkelijk voorkomen; leeg = vorm-filter verbergen. */
  vormen?: string[];
}

export function CatalogFilters({
  stockOnly: stockProp,
  activeStof: stofProp,
  activeVorm: vormProp,
  vormen = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Zonder meegegeven stand leest de component de URL zelf. Dat is nodig op de
  // categoriepagina: die mag searchParams niet server-side lezen, want met de
  // lege generateStaticParams erbij geeft dat in Next 15 een harde fout
  // (DYNAMIC_SERVER_USAGE) en dus een 500. /winkel zelf is wel dynamisch en
  // geeft de stand nog wel mee; beide wegen werken.
  const stockOnly = stockProp ?? sp.get("stock") === "1";
  const activeStof = stofProp ?? (sp.get("stof") || "").toLowerCase();
  const activeVorm = vormProp ?? (sp.get("vorm") || "").toLowerCase();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      if (typeof window === "undefined") return;
      const p = new URLSearchParams(window.location.search);
      if (value === null || value === "") p.delete(key);
      else p.set(key, value);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium border ${
      active
        ? "bg-accent text-accent-foreground border-accent"
        : "bg-background text-text border-border hover:border-accent hover:text-accent"
    }`;

  const zichtbareVormen = VORM_FILTERS.filter((v) => vormen.includes(v.slug));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <h4 className="text-xs uppercase tracking-wider text-accent-muted font-semibold mb-3">
          Beschikbaarheid
        </h4>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <button
            type="button"
            onClick={() => setParam("stock", stockOnly ? null : "1")}
            aria-pressed={stockOnly}
            className={`relative h-4 w-4 rounded border ${
              stockOnly ? "border-accent bg-accent" : "border-border-strong bg-background"
            }`}
          >
            {stockOnly && <Check size={12} strokeWidth={3} className="absolute inset-0 m-auto text-accent-foreground" />}
          </button>
          <span>Alleen op voorraad</span>
        </label>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h4 className="text-xs uppercase tracking-wider text-accent-muted font-semibold mb-3 inline-flex items-center gap-1.5">
          <Beaker size={12} /> Werkzame stof
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setParam("stof", null)} className={chip(!activeStof)}>
            Alle
          </button>
          {STOF_FILTERS.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setParam("stof", s.slug === activeStof ? null : s.slug)}
              className={chip(activeStof === s.slug)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-text-subtle leading-snug">
          Combi-preparaten staan onder twee stoffen, bijvoorbeeld sildenafil en dapoxetine.
        </p>
      </div>

      {zichtbareVormen.length > 1 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-xs uppercase tracking-wider text-accent-muted font-semibold mb-3 inline-flex items-center gap-1.5">
            <Pill size={12} /> Vorm
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setParam("vorm", null)} className={chip(!activeVorm)}>
              Alle
            </button>
            {zichtbareVormen.map((v) => (
              <button
                key={v.slug}
                type="button"
                onClick={() => setParam("vorm", v.slug === activeVorm ? null : v.slug)}
                className={chip(activeVorm === v.slug)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
