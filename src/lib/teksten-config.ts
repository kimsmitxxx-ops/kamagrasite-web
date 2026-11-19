/**
 * De koppeling tussen deze site en het tekstbeheer in shop-dash.
 *
 * teksten-server.ts komt uit shop-core en is overal gelijk; dit bestand zegt
 * hem welke shop-rij hierbij hoort en welke woordenlijst de bron is.
 */
import { SHOP_ID } from "@/lib/queries";
import { nl } from "@/lib/teksten/nl";

export const TEKSTEN = {
  shopId: SHOP_ID,
  woordenlijst: nl,
};
