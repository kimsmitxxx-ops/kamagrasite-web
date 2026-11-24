// Komt uit shop-core (src/components/afbeelding.tsx). Niet hier wijzigen: de volgende
// `node tools/sync.mjs --schrijf` in shop-core overschrijft dit bestand.
import { srcSet } from "@/lib/afbeelding-maten";

/**
 * Een `<img>` die de juiste maat laat kiezen door de browser.
 *
 * Geen `next/image`: zie de uitleg in `lib/afbeelding-maten.ts`. Dit is een
 * gewone img met srcset, en de maten staan klaar in Storage.
 *
 * GEBRUIK
 *   <Afbeelding src={p.image_url} alt={p.name} width={400} height={400}
 *               sizes="(max-width: 640px) 50vw, 300px" />
 *
 * `sizes` is het enige dat je per plek moet invullen, want alleen jij weet hoe
 * breed het beeld in die layout staat. Vul je het niet in, dan gaat de browser
 * uit van de volle viewportbreedte en kiest hij structureel te groot; dan kun
 * je de srcset net zo goed weglaten.
 *
 * BOVEN DE VOUW
 * Zet `boven` op true voor een hero of de eerste productkaart. Dat zet
 * `loading="eager"` en `fetchPriority="high"`. Dit is geen detail: op
 * anabolenpro kostte een lazy geladen LCP-beeld 8,1 seconden op /winkel en 6,6
 * op /anavar. De standaard hieronder is lazy, want alles behalve het eerste
 * beeld hoort dat te zijn.
 *
 * WIDTH EN HEIGHT
 * Altijd meegeven. Zonder die twee weet de browser de verhouding niet en
 * springt de pagina bij het laden; dat is precies de layout shift die we op
 * alle shops op nul hebben staan.
 */
export function Afbeelding({
  src,
  alt,
  width,
  height,
  sizes,
  boven = false,
  className,
  maxBreedte,
  title,
}: {
  src: string;
  /** Leeg alleen voor puur decoratieve beelden; dan ook echt alt="" laten staan. */
  alt: string;
  width: number;
  height: number;
  /** Hoe breed dit beeld in de layout staat, bijvoorbeeld "(max-width: 640px) 50vw, 300px". */
  sizes?: string;
  boven?: boolean;
  className?: string;
  /** De breedste weergave in pixels; maten daarboven worden niet aangeboden. */
  maxBreedte?: number;
  /**
   * De tooltip. Staat hier omdat een aantal plekken die al had als kale <img>
   * (productgalerij, zoeksuggesties) en zonder deze prop niet om te zetten was.
   * Geen vervanging voor alt: alt is wat een screenreader voorleest, title is
   * wat je ziet als je blijft hangen met de muis.
   */
  title?: string;
}) {
  const set = srcSet(src, maxBreedte);
  return (
    <img
      src={src}
      {...(set ? { srcSet: set } : {})}
      {...(set && sizes ? { sizes } : {})}
      alt={alt}
      {...(title ? { title } : {})}
      width={width}
      height={height}
      className={className}
      loading={boven ? "eager" : "lazy"}
      fetchPriority={boven ? "high" : undefined}
      decoding={boven ? "sync" : "async"}
    />
  );
}
