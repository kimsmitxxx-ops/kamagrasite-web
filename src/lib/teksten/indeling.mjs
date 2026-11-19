/**
 * Waar de teksten van Kamagrasite in het dashboard terechtkomen.
 *
 * De motor staat in tools/teksten-registratie.mjs (uit shop-core); dit
 * bestand is het enige dat per site verschilt.
 */

export const PAGINAS = {
  mand: { pagina: "winkelmand", label: "Winkelmand", pad: "/winkelmand", volgorde: 50 },
  afrekenen: { pagina: "afrekenen", label: "Afrekenen", pad: "/checkout", volgorde: 60 },
  contact: { pagina: "contact", label: "Contact", pad: "/contact", volgorde: 100 },
};

export const BLOKKEN = {
  mand: [
    [/^(subtotaal|bulkKorting|verzending|totaal|verzendkosten)/, "Prijsoverzicht"],
    [null, "De mand"],
  ],
  afrekenen: [
    [/^(fout|verbindingsfout|legeMand)/, "Foutmeldingen"],
    [/^naBestellen/, "Na het bestellen"],
    [null, "Afrekenen"],
  ],
  contact: [
    [/^(chat|bericht)/, "Hoe iemand ons bereikt"],
    [/^(tijden|vestiging)/, "Openingstijden en vestiging"],
    [null, "Contact"],
  ],
};

export const SYSTEEM = {
  mand: (naam) => ["naarCheckout", "overzicht"].includes(naam),
  afrekenen: (naam) => ["naarWinkel", "overzicht", "bezig"].includes(naam),
};

export const OVERSLAAN = [];
export const WOORDEN = { tijden: "Openingstijden" };
export const VELD_LABELS = {};
