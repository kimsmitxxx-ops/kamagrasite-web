import "server-only";
import { cookies } from "next/headers";

import { COOKIE_TOEGANG, klantBijToken } from "./sessie-kern";

export * from "./sessie-kern";

/**
 * De ingelogde klant van dit verzoek, of null. Het token wordt bij de bron
 * nagekeken: een zelf verzonnen cookie levert dus geen sessie op.
 *
 * Verversen gebeurt in middleware.ts, want een server component mag geen
 * cookies zetten.
 */
export async function huidigeKlant() {
  const toegang = cookies().get(COOKIE_TOEGANG)?.value;
  if (!toegang) return null;
  return klantBijToken(toegang);
}
