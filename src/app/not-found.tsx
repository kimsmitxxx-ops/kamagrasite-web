import Link from "next/link";
import { NotFoundTrack } from "@/components/not-found-track";
import { Search, Home, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Pagina niet gevonden",
  description: "Deze pagina bestaat niet (meer). Ga terug naar de homepage of bekijk de winkel.",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <NotFoundTrack />
      <p className="font-display text-7xl text-accent tabular">404</p>
      <h1 className="mt-4 font-display text-3xl">Pagina niet gevonden</h1>
      <p className="mt-3 text-text-muted">
        De pagina die je zocht is verplaatst, verwijderd of bestaat niet meer. Gebruik de
        navigatie hierboven of ga via een van de onderstaande links verder.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-soft"
        >
          <Home className="h-4 w-4" /> Naar home
        </Link>
        <Link
          href="/winkel"
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          <ShoppingBag className="h-4 w-4" /> Naar winkel
        </Link>
        <Link
          href="/kennisbank"
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          <Search className="h-4 w-4" /> Kennisbank
        </Link>
      </div>
    </div>
  );
}
