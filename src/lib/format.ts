/**
 * Opmaak-helpers zonder afhankelijkheden.
 *
 * formatEUR stond in lib/queries.ts, en dat bestand maakt de Supabase-client
 * aan. De winkelmand-drawer in de root-layout importeerde alleen dit ene
 * functietje daaruit, waardoor de hele Supabase-client inclusief URL en sleutel
 * in de JS-bundle van elke pagina belandde. Vandaar een eigen bestand: wat de
 * browser nodig heeft, hoort niets van de database te weten.
 *
 * lib/queries.ts exporteert het door, zodat server-code niets hoeft te wijzigen.
 */

export const formatEUR = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
