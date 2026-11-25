import { cn } from "@/lib/utils";
import { Bitcoin, Building2, Smartphone } from "lucide-react";

export type PaymentRowVariant = "full" | "compact";

export interface PaymentRowProps {
  variant?: PaymentRowVariant;
  className?: string;
}

const wrapper =
  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 text-[11px] font-semibold tracking-wide text-text";

function Bank() {
  return (
    <span className={wrapper}>
      <Building2 size={12} className="text-accent" /> Bankoverboeking
    </span>
  );
}
function BankApp() {
  return (
    <span className={wrapper}>
      <Smartphone size={12} className="text-accent" /> Bank-app
    </span>
  );
}
function Crypto() {
  return (
    <span className={wrapper}>
      <Bitcoin size={12} className="text-accent" /> Crypto
    </span>
  );
}
function CryptoCoin({ label, color }: { label: string; color: string }) {
  return (
    <span className={cn(wrapper, "tabular")} style={{ color }}>
      {label}
    </span>
  );
}

export function PaymentRow({ variant = "full", className }: PaymentRowProps) {
  // Alleen wat deze winkel echt aanneemt. Hier stonden ook Crypto, BTC, ETH en
  // USDT, terwijl er in shops.payment_instructions geen enkel crypto-adres
  // staat: wie daarop klikte kreeg nooit een adres te zien. De bedankt-pagina
  // toont het crypto-blok wel zodra die adressen er zijn, dus dan horen deze
  // merktekens ook terug - op dezelfde voorwaarde.
  const items = [<Bank key="b" />, <BankApp key="a" />];
  void variant;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Betaalmethoden">
      {items}
    </div>
  );
}

export default PaymentRow;
