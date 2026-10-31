import Link from "next/link";
import { redirect } from "next/navigation";
import { huidigeKlant } from "@/lib/sessie";
import { formatEUR } from "@/lib/queries";
import { Package, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const klant = await huidigeKlant();
  if (!klant) redirect("/account/login");
  const { sb } = klant;

  const { data: customer } = await sb.from("customers").select("id").eq("auth_user_id", klant.id).maybeSingle();
  const orders = customer?.id
    ? (await sb.from("orders")
        .select("id, order_number, total_cents, status, created_at, shipping_city")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(50)).data
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/account" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
        <ArrowLeft className="h-3 w-3" /> Terug naar account
      </Link>
      <h1 className="mt-3 font-display text-3xl">Bestellingen</h1>
      <p className="mt-2 text-sm text-text-muted">Alle bestellingen die je ooit hebt geplaatst.</p>

      {orders && orders.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-paper-border bg-paper-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Datum</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4 font-medium">#{o.order_number || o.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-text-muted tabular">
                    {new Date(o.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-accent-soft/30 px-2.5 py-0.5 text-xs font-medium text-accent-muted">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-display text-base tabular">{formatEUR(o.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-paper-border bg-paper-soft p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-text-subtle" />
          <p className="mt-3 text-text-muted">Nog geen bestellingen geplaatst.</p>
          <Link href="/winkel" className="mt-5 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-soft">
            Naar de winkel
          </Link>
        </div>
      )}
    </div>
  );
}
