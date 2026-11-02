"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * 404-pagina had nog nooit een logregel - geen idee welke kapotte links of
 * verwijderde pagina's bezoekers echt tegenkomen. track() voegt `path`
 * (location.pathname) al automatisch aan elk event toe, dus hier is geen
 * extra prop nodig.
 */
export function NotFoundTrack() {
  useEffect(() => {
    track("page_not_found");
  }, []);
  return null;
}
