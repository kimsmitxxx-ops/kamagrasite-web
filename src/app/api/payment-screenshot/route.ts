import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { schoonFetch } from "@/lib/media";

export const dynamic = "force-dynamic";

const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "payment-screenshots";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SHOP_KEY || "";
  if (!url || !key) throw new Error("Supabase env vars ontbreken (URL of service key)");
  // schoonFetch haalt de storage-URL's uit het antwoord; zie lib/media.ts. De
  // ondertekende URL voor de beheerder komt hier niet door: die zet de SDK pas
  // samen na de fetch, want het antwoord van de bron bevat alleen een pad.
  return createClient(url, key, { global: { fetch: (u, init) => schoonFetch(u, init) } });
}

export async function POST(req: NextRequest) {
  const sb = getServiceClient();
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const orderId = String(form.get("order_id") || "").trim();
    const email = String(form.get("email") || "").trim();

    if (!file) return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    if (!orderId) return NextResponse.json({ error: "order_id vereist" }, { status: 400 });
    if (!ACCEPTED.includes(file.type)) return NextResponse.json({ error: "Alleen JPG/PNG/WebP" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Bestand te groot (max 5MB)" }, { status: 400 });

    // Verifieer dat order bestaat + bij deze shop hoort
    const { data: order } = await sb
      .from("orders")
      .select("id, email")
      .eq("id", orderId)
      .eq("shop_id", SHOP_ID)
      .maybeSingle();
    if (!order) return NextResponse.json({ error: "Order niet gevonden" }, { status: 404 });

    // Optionele extra check: email matcht (niet kritiek want we vertrouwen orderId)
    void email; // momenteel alleen voor admin-context

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const ts = Date.now();
    const storagePath = `${SHOP_ID}/${orderId}/${ts}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: file.type,
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
      mime_type: file.type,
      size_bytes: buf.length,
      status: "pending",
    });
    if (insErr) {
      console.error("betaalbewijs opslaan mislukt", insErr);
      return NextResponse.json({ error: "Opslaan lukte niet. Probeer het later opnieuw." }, { status: 500 });
    }

    // Update order status (optioneel) - markeer dat klant heeft betaald
    await sb.from("orders").update({ status: "payment_proof_received" }).eq("id", orderId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("betaalbewijs: onverwachte fout", e);
    return NextResponse.json({ error: "Uploaden lukte niet. Probeer het later opnieuw." }, { status: 500 });
  }
}
