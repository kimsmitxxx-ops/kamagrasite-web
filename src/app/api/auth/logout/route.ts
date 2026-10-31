import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_TOEGANG, COOKIE_VERNIEUW, meldAf } from "@/lib/sessie";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const toegang = cookies().get(COOKIE_TOEGANG)?.value;
  if (toegang) await meldAf(toegang);

  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  for (const naam of [COOKIE_TOEGANG, COOKIE_VERNIEUW]) {
    res.cookies.set({ name: naam, value: "", path: "/", maxAge: 0 });
  }
  return res;
}
