import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SB_URL, SB_ANON } from "@/lib/supabase-config";
import {
  COOKIE_TOEGANG,
  COOKIE_TOEGANG_OPTIES,
  COOKIE_VERNIEUW,
  COOKIE_VERNIEUW_OPTIES,
  restgeldigheid,
  vernieuwTokens,
} from "@/lib/sessie-kern";

const SHOP_SLUG = "kamagrasite";

// Onderhoudsmodus wordt per shop geschakeld via shops.maintenance_mode in
// Supabase, zodat aanzetten en uitzetten geen deploy kost. Zelfde patroon als
// retalab-webshop, met twee verschillen:
//
//  1. We lezen met de anon key, niet met de service role. De shops-rij is via
//     RLS (migratie 051) publiek leesbaar, dus de service role hoeft hier niet
//     in de edge runtime te liggen.
//  2. De vlag wordt kort in het geheugen gehouden. Zonder cache staat er een
//     DB-round-trip voor elke pagina-request, en dat kost op elke pagina
//     latency terwijl de vlag dagenlang hetzelfde blijft.
const FLAG_TTL_MS = 30_000;
let flagCache: { at: number; on: boolean; message: string | null } | null = null;

async function readMaintenanceFlag(): Promise<{ on: boolean; message: string | null }> {
  if (flagCache && Date.now() - flagCache.at < FLAG_TTL_MS) {
    return { on: flagCache.on, message: flagCache.message };
  }
  try {
    const sb = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await sb
      .from("shops")
      .select("maintenance_mode, maintenance_message")
      .eq("slug", SHOP_SLUG)
      .maybeSingle();
    const next = {
      at: Date.now(),
      on: data?.maintenance_mode === true,
      message: (data?.maintenance_message as string) || null,
    };
    flagCache = next;
    return { on: next.on, message: next.message };
  } catch {
    // Bij een DB-storing liever de site tonen dan iedereen buitensluiten.
    return { on: false, message: null };
  }
}

// Previewsleutel: met ?preview=<token> zet je een cookie en zie je de site
// gewoon, ook als onderhoud aanstaat. Zonder dit kun je een site die nog niet
// af is ook zelf niet nakijken, en daar is de onderhoudsmodus juist voor.
const BYPASS_COOKIE = "ke_preview";

// Zet MAINTENANCE_BYPASS_TOKEN op Vercel om dit te overschrijven. De
// constante is de terugval: Vercel heeft hier geen env-vars, en zonder
// terugval zou niemand de staging-site kunnen bekijken zodra onderhoud
// aanstaat. Hij beschermt alleen een noindex-stagingsite, geen klantdata.
const FALLBACK_BYPASS = "ke-preview-2026";

function bypassToken(): string {
  return process.env.MAINTENANCE_BYPASS_TOKEN || process.env.REVALIDATE_TOKEN || FALLBACK_BYPASS;
}

function maintenancePage(message: string | null): string {
  const msg = message || "We zijn bezig met de laatste voorbereidingen.";
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Binnenkort open | Kamagra Site</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:rgb(22 62 58);color:rgb(240 250 248);font-family:system-ui,-apple-system,sans-serif;padding:24px}
.c{max-width:460px;text-align:center}
.logo{width:52px;height:52px;border-radius:50%;background:rgb(55 173 155);color:rgb(12 34 30);display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700}
h1{margin-top:24px;font-size:26px;font-weight:600;letter-spacing:-0.01em;line-height:1.3}
p{margin-top:14px;color:rgb(240 250 248 / 0.72);font-size:15px;line-height:1.65}
.bar{margin:28px auto 0;height:2px;width:160px;background:linear-gradient(to right,transparent,rgb(110 209 191),transparent);border-radius:1px}
a{color:rgb(110 209 191)}
</style></head>
<body><div class="c">
<div class="logo">K</div>
<h1>${msg}</h1>
<p>Kamagra Site gaat binnenkort open. Vragen in de tussentijd? Mail naar <a href="mailto:info@kamagrasite.nl">info@kamagrasite.nl</a>.</p>
<div class="bar"></div>
</div></body></html>`;
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Previewsleutel uit de URL halen en in een cookie zetten, zodat je daarna
  // gewoon door de site kunt klikken zonder hem overal aan te plakken.
  const token = bypassToken();
  const asked = request.nextUrl.searchParams.get("preview");
  const hasBypass = request.cookies.get(BYPASS_COOKIE)?.value === token;

  if (asked === token) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("preview");
    const redirect = NextResponse.redirect(clean);
    redirect.cookies.set({
      name: BYPASS_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return redirect;
  }

  if (!hasBypass) {
    const { on, message } = await readMaintenanceFlag();
    if (on) {
      // 503 met Retry-After, niet 200: zo weet Google dat dit tijdelijk is en
      // gaat hij de onderhoudspagina niet als inhoud van de site indexeren.
      return new NextResponse(maintenancePage(message), {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Retry-After": "3600",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
  }

  // Refresht Supabase sessie-cookie bij elke request → users blijven ingelogd
  // zolang refresh-token geldig is. Defensive: crash NOOIT op missende env of
  // Supabase fout - geeft altijd NextResponse.next() terug zodat de site
  // overeind blijft als auth-laag offline is.
  try {
    const toegang = request.cookies.get(COOKIE_TOEGANG)?.value;
    const vernieuw = request.cookies.get(COOKIE_VERNIEUW)?.value;
    if (vernieuw && (!toegang || restgeldigheid(toegang) < 300)) {
      const tokens = await vernieuwTokens(vernieuw);
      if (tokens) {
        res.cookies.set({ name: COOKIE_TOEGANG, value: tokens.access_token, ...COOKIE_TOEGANG_OPTIES });
        res.cookies.set({ name: COOKIE_VERNIEUW, value: tokens.refresh_token, ...COOKIE_VERNIEUW_OPTIES });
      } else {
        res.cookies.set({ name: COOKIE_TOEGANG, value: "", path: "/", maxAge: 0 });
        res.cookies.set({ name: COOKIE_VERNIEUW, value: "", path: "/", maxAge: 0 });
      }
    }
  } catch {}
  return res;
}

export const config = {
  // robots.txt, sitemap.xml en llms.txt blijven bewust buiten de onderhouds-
  // pagina: robots.txt moet juist tijdens onderhoud zijn Disallow blijven
  // uitserveren.
  matcher: ["/((?!_next/|api/|favicon|robots.txt|sitemap.xml|llms.txt|media/|.*\\..*).*)"],
};
