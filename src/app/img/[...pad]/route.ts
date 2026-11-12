import { proxyStorage } from "@/lib/media-proxy";

export const dynamic = "force-dynamic";
// Hoort bij force-dynamic: de gedeelde Supabase-client cachet sinds de
// TTFB-ronde standaard, en hier moet elke lees juist vers zijn.
export const fetchCache = "force-no-store";

export async function GET(_req: Request, { params }: { params: { pad: string[] } }) {
  return proxyStorage("blog-images", params.pad);
}
