import { permanentRedirect } from "next/navigation";

/**
 * Oude plek van de categorieweergave.
 *
 * Sinds 19 november 2026 staat die op het schone adres /<categorie>, bij de
 * rest van de site: /cenforce-200 en /cobra-120-mg staan ook gewoon op de
 * hoofdmap, net als op de oude WordPress-site. Deze route blijft bestaan en
 * stuurt permanent door, zodat gedeelde links en bladwijzers blijven werken.
 *
 * Dit kostte geen posities: /winkel/<categorie> was een adres van onszelf en
 * had geen historie. De oude site had /product-category/<categorie>, en die
 * redirect wijst nu rechtstreeks naar het nieuwe adres.
 */
export default async function OudeCategorieRoute(
  props: { params: Promise<{ categorie: string }> }
) {
  const { categorie } = await props.params;
  permanentRedirect(`/${categorie}/`);
}
