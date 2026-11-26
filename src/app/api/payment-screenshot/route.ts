import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SB_URL } from "@/lib/supabase-config";
import { schoonFetch } from "@/lib/media";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "payment-screenshots";

/**
 * Welke beeldsoorten we aannemen, met de bytes waarmee ze beginnen.
 *
 * Dit is de echte controle. `file.type` komt van de browser en is dus van de
 * uploader; die mag niet bepalen wat er in onze opslag belandt. Een JPEG
 * begint met FF D8 FF, een PNG met de vaste reeks van acht bytes, en een WebP
 * met "RIFF" plus "WEBP" op plek 8. Alles wat daar niet aan voldoet gaat
 * terug, hoe het bestand ook heet of wat de header beweert.
 */
const BEELDSOORTEN = [
  { type: "image/jpeg", ext: "jpg", past: (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: "image/png",
    ext: "png",
    past: (b: Buffer) =>
      b.length > 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    type: "image/webp",
    ext: "webp",
    past: (b: Buffer) =>
      b.length > 12 &&
      b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
];

/** Hoeveel bewijzen er per bestelling bij mogen. Zonder grens kon iemand met
 *  een geldig order-id onze opslag vol blijven zetten. */
const MAX_PER_ORDER = 5;

function getServiceClient() {
  // SB_URL en niet alleen de env-variabele: NEXT_PUBLIC_SUPABASE_URL staat niet
  // in de Vercel-omgeving van de shops (de rest van de code heeft daarom een
  // vaste terugval). Zonder dit gooide deze functie, en die throw stond
  // buiten de try-catch: elke upload kreeg een leeg 500-antwoord.
  const url = SB_URL;
  const key = process.env.SUPABASE_SHOP_KEY || "";
  if (!url || !key) throw new Error("Supabase env vars ontbreken (URL of service key)");
  // schoonFetch haalt de storage-URL's uit het antwoord; zie lib/media.ts. De
  // ondertekende URL voor de beheerder komt hier niet door: die zet de SDK pas
  // samen na de fetch, want het antwoord van de bron bevat alleen een pad.
  return createClient(url, key, { global: { fetch: (u, init) => schoonFetch(u, init) } });
}

export async function POST(req: NextRequest) {
  let sb;
  try {
    sb = getServiceClient();
  } catch (e) {
    // Een ontbrekende sleutel is onze fout, niet die van de bezoeker, maar
    // hij moet wel een antwoord krijgen dat zijn upload niet lukte.
    console.error("betaalbewijs: server-config onvolledig", e);
    return NextResponse.json({ error: "Uploaden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const orderId = String(form.get("order_id") || "").trim();
    const email = String(form.get("email") || "").trim();

    if (!file) return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    if (!orderId) return NextResponse.json({ error: "order_id vereist" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Bestand te groot (max 5MB)" }, { status: 400 });
    // Eerst de goedkope controles hierboven, dan het bestand inlezen: wat de
    // browser als type meestuurt zegt niets, dus de bytes moeten het zeggen.
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_BYTES) return NextResponse.json({ error: "Bestand te groot (max 5MB)" }, { status: 400 });
    const soort = BEELDSOORTEN.find((s) => s.past(buf));
    if (!soort) {
      return NextResponse.json(
        { error: "Dit is geen JPG, PNG of WebP. Maak een screenshot en probeer het daarmee." },
        { status: 400 },
      );
    }
    // ACCEPTED blijft meedoen als tweede zeef, want de bucket zelf laat ook
    // alleen deze drie content-types door.
    if (!ACCEPTED.includes(soort.type)) {
      return NextResponse.json({ error: "Alleen JPG/PNG/WebP" }, { status: 400 });
    }

    // Verifieer dat order bestaat + bij deze shop hoort
    const { data: order, error: orderFout } = await sb
      .from("orders")
      // customer_email, niet email: die kolom bestaat niet op orders. PostgREST
      // gaf daardoor een fout in plaats van een rij, en omdat alleen `data`
      // werd gelezen kreeg elke klant "Order niet gevonden" te zien.
      .select("id, customer_email")
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID)
      .maybeSingle();
    if (orderFout) {
      console.error("betaalbewijs: bestelling opzoeken mislukte", orderFout);
      return NextResponse.json({ error: "Uploaden lukte niet. Probeer het later opnieuw." }, { status: 500 });
    }
    if (!order) return NextResponse.json({ error: "Order niet gevonden" }, { status: 404 });

    // Als het formulier een e-mailadres meestuurt, moet het bij de bestelling
    // horen. Dit stond er als `void email` en deed dus niets, terwijl het
    // eruitzag als een controle. Het is geen zwaar slot (wie het order-id
    // heeft, heeft meestal ook het adres) maar het kost niets en het
    // formulier stuurt altijd de juiste waarde.
    if (email && order.customer_email && email.toLowerCase() !== String(order.customer_email).toLowerCase()) {
      return NextResponse.json({ error: "Order niet gevonden" }, { status: 404 });
    }

    // Niet eindeloos. Zonder deze grens kon iemand met een geldig order-id
    // onze opslag blijven vullen, vijf megabyte per keer.
    const { count: alGeupload } = await sb
      .from("payment_screenshots")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId);
    if ((alGeupload || 0) >= MAX_PER_ORDER) {
      return NextResponse.json(
        { error: `Er zijn al ${MAX_PER_ORDER} bewijzen bij deze bestelling. Mail ons als er iets niet goed ging.` },
        { status: 429 },
      );
    }

    // Extensie en content-type komen uit de gelezen bytes, niet uit wat de
    // browser beweerde. Zo kan een bestand nooit onder een ander type worden
    // weggezet dan het werkelijk is.
    const ts = Date.now();
    const storagePath = `${SHOP_ID}/${orderId}/${ts}.${soort.ext}`;

    const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: soort.type,
      upsert: false,
    });
    // Alleen een eigen tekst naar buiten: de melding van de opslaglaag noemt
    // bucketnamen en de host, en dat verraadt waar we zitten.
    if (upErr) {
      console.error("betaalbewijs uploaden mislukt", upErr);
      return NextResponse.json({ error: "Uploaden lukte niet. Probeer het later opnieuw." }, { status: 500 });
    }

    // Privé bucket - genereer signed URL voor admin (valid 30 dagen)
    const { data: signed } = await sb.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 30);
    const publicUrl = signed?.signedUrl || "";

    const { error: insErr } = await sb.from("payment_screenshots").insert({
      order_id: orderId,
      shop_id: SHOP_ID,
      storage_path: storagePath,
      public_url: publicUrl,
      filename: file.name,
      mime_type: soort.type,
      size_bytes: buf.length,
      status: "pending",
    });
    if (insErr) {
      console.error("betaalbewijs opslaan mislukt", insErr);
      return NextResponse.json({ error: "Opslaan lukte niet. Probeer het later opnieuw." }, { status: 500 });
    }

    // Bewust geen statuswijziging. Een screenshot is een bewering van de
    // klant, geen betaling: "processing" heet in het dashboard "Betaald, nog
    // verzenden" en telt in de omzet mee, en zo zijn op 24 november 2026 twee
    // bestellingen verzonden zonder dat iemand geld had gezien. Het bewijs
    // staat nu in shop-dash bij de bestelling, met een eigen tab erboven, en
    // een mens vinkt de betaling af tegen het bankafschrift. De database
    // weigert deze update sinds migratie 125 trouwens ook.
    //
    // De betaalherinnering blijft bewust aan staan: die gaat pas na vijf
    // dagen, en als een geupload bewijs zo lang blijft liggen is een
    // herinnering precies wat er moet gebeuren.

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("betaalbewijs: onverwachte fout", e);
    return NextResponse.json({ error: "Uploaden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }
}
