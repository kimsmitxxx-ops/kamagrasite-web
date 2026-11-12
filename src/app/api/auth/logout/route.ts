import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_TOEGANG, COOKIE_VERNIEUW, meldAf } from "@/lib/sessie";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  const toegang = cookies().get(COOKIE_TOEGANG)?.value;
  if (toegang) await meldAf(toegang);

  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  for (const naam of [COOKIE_TOEGANG, COOKIE_VERNIEUW]) {
    res.cookies.set({ name: naam, value: "", path: "/", maxAge: 0 });
  }
  return res;
}
