/**
 * De woordenlijst van Kamagrasite: de losse teksten van de site op één plek.
 *
 * Dit is de bron zolang niemand in shop-dash iets aanpast; wat daar wordt
 * gewijzigd komt er bij het renderen overheen (zie lib/teksten-server.ts uit
 * shop-core). Nieuwe tekst hoort hier en niet in een component.
 *
 * Wat hier NIET in hoort: hele pagina's (die staan in buy_pages en worden in
 * het dashboard onder Pagina's beheerd), producttekst, blogs en mails.
 */
export const nl = {
  mand: {
    titel: "Winkelmand",
    leeg: "Je mand is leeg",
    overzicht: "Overzicht",
    subtotaal: "Subtotaal",
    bulkKorting: "Bulk-korting",
    verzending: "Verzending",
    totaal: "Totaal",
    naarCheckout: "Naar checkout",
    verzendkosten: "Verzending €10 per bestelling, ongeacht het aantal items.",
  },

  afrekenen: {
    titel: "Afrekenen",
    legeMand: "Lege mand.",
    naarWinkel: "Naar winkel",
    overzicht: "Overzicht",
    plaatsBestelling: "Plaats bestelling",
    bezig: "Bezig…",
    naBestellen: "Direct op de volgende pagina krijg je de bankgegevens.",
    naBestellenVerzending: "Pakket verzonden zodra betaling binnen is.",
    naBestellenPreorder: "Je bestelling gaat de deur uit zodra het artikel dat nog onderweg is binnen is.",
    fout: "Bestelling kon niet worden aangemaakt",
    verbindingsfout: "Verbindingsfout - probeer opnieuw",
  },

  contact: {
    kop: "Snelle antwoorden van ons team",
    intro:
      "Vraag over je bestelling, over het verschil tussen twee middelen of over een levering die niet klopt: ons team reageert elke dag tussen 09:00 en 21:00.",
    chatKop: "Online chat",
    berichtKop: "Stuur ons een bericht",
    tijdenKop: "Openingstijden support",
    tijdenWeek: "Ma t/m vr · 09:00 - 21:00",
    tijdenWeekend: "Za & zo · 10:00 - 18:00",
    vestigingKop: "Vestiging (geen bezoek)",
  },
};

export type Teksten = typeof nl;
