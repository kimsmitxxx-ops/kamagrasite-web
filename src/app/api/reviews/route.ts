import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role insert - bypasst RLS zodat status='pending' geschreven kan worden.
// Geen auth check: publieke endpoint, anti-bot via honeypot + basic validation.
// Admin keurt elke nieuwe review goed via shop-dash voordat hij zichtbaar wordt.

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rexqfwibxawqnvrzbdoo.supabase.co";
const SB_SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPA_SECRET ||
  process.env.SUPABASE_SECRET ||
  "";

const KAMAGRASITE_SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  // Honeypot - bots vullen 'website' in; mensen niet (veld is hidden)
  if (body?.website && String(body.website).trim().length > 0) {
    return NextResponse.json({ ok: true }); // stilletjes negeren
  }

  const productId = String(body?.product_id || "").trim();
  const rating = Number(body?.rating);
  const authorName = String(body?.author_name || "").trim();
  const text = String(body?.body || "").trim();

  if (!productId) return NextResponse.json({ error: "product_id verplicht" }, { status: 400 });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating moet 1-5 zijn" }, { status: 400 });
  }
  if (authorName.length < 2 || authorName.length > 80) {
    return NextResponse.json({ error: "naam ontbreekt of te lang" }, { status: 400 });
  }
  if (text.length < 5 || text.length > 2000) {
    return NextResponse.json({ error: "review moet 5-2000 tekens zijn" }, { status: 400 });
  }

  if (!SB_SERVICE) {
    return NextResponse.json({ error: "server-config ontbreekt" }, { status: 500 });
  }

  const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } });

  // Verify product exists + zit in kamagrasite shop scope (geen cross-shop submissions)
  const { data: product } = await sb
    .from("products")
    .select("id, shop_id")
    .eq("id", productId)
    .eq("shop_id", KAMAGRASITE_SHOP_ID)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: "product niet gevonden" }, { status: 404 });

  const { error } = await sb.from("product_reviews").insert({
    shop_id: KAMAGRASITE_SHOP_ID,
    product_id: productId,
    rating: Math.round(rating),
    author_name: authorName,
    body: text,
    status: "pending",
    is_published: false,
  });

  if (error) {
    console.error("[reviews] insert error", error);
    return NextResponse.json({ error: "kon review niet opslaan" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
