import Link from "next/link";
import { redirect } from "next/navigation";
import { huidigeKlant } from "@/lib/sessie";
import { formatEUR } from "@/lib/queries";
import { User, Package, MapPin, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const klant = await huidigeKlant();
  if (!klant) redirect("/account/login");
  const { sb } = klant;

  const { data: customer } = await sb.from("customers").select("*").eq("auth_user_id", klant.id).maybeSingle();
  const orders = customer?.id
    ? (await sb.from("orders")
        .select("id, order_number, total_cents, status, created_at")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(5)).data
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl">Hi {customer?.name?.split(" ")[0] || "daar"}</h1>
      <p className="mt-2 text-sm text-text-muted">Ingelogd als <strong>{klant.email}</strong></p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/account/orders" className="rounded-2xl border border-paper-border bg-paper-soft p-5 hover:border-accent">
          <Package className="h-5 w-5 text-accent" />
          <p className="mt-2 font-medium">Bestellingen</p>
          <p className="mt-1 text-xs text-text-muted">{orders?.length || 0} recente</p>
        </Link>
        <Link href="/account" className="rounded-2xl border border-paper-border bg-paper-soft p-5 hover:border-accent">
          <MapPin className="h-5 w-5 text-accent" />
          <p className="mt-2 font-medium">Adressen</p>
          <p className="mt-1 text-xs text-text-muted">Beheer verzendadressen</p>
        </Link>
        <form action="/api/auth/logout" method="POST" className="contents">
          <button className="rounded-2xl border border-paper-border bg-paper-soft p-5 text-left hover:border-danger">
            <LogOut className="h-5 w-5 text-danger" />
            <p className="mt-2 font-medium">Uitloggen</p>
            <p className="mt-1 text-xs text-text-muted">Eind sessie</p>
          </button>
        </form>
      </div>

      <h2 className="mt-12 font-display text-2xl">Recente bestellingen</h2>
      {orders && orders.length > 0 ? (
        <div className="mt-4 space-y-2">
          {orders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-paper-border bg-paper-soft p-4 text-sm">
              <div>
                <p className="font-medium">#{o.order_number || o.id.slice(0, 8)}</p>
                <p className="text-xs text-text-muted">{new Date(o.created_at).toLocaleDateString("nl-NL")} · {o.status}</p>
              </div>
              <span className="font-display text-lg">{formatEUR(o.total_cents)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-paper-border p-6 text-center text-text-muted">Nog geen bestellingen</p>
      )}
    </div>
  );
}
