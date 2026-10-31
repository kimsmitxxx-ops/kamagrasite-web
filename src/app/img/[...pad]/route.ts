import { proxyStorage } from "@/lib/media-proxy";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { pad: string[] } }) {
  return proxyStorage("blog-images", params.pad);
}
