"use client";
import { Truck, ShieldCheck, PackageCheck, Headphones } from "lucide-react";
import { UspStrip } from "@/components/usp-strip";

const ITEMS = [
  { icon: ShieldCheck, title: "100% leveringsgarantie" },
  { icon: Truck, title: "Snel verzonden" },
  { icon: PackageCheck, title: "Neutrale verpakking" },
  { icon: Headphones, title: "Live chat en mail, antwoord binnen 48 uur" },
];

export function HomeUspBar() {
  // De balk stond zonder container in de pagina en liep dus van schermrand tot
  // schermrand: het eerste item plakte tegen de linkerrand en het laatste viel
  // half buiten beeld. Hij hoort binnen dezelfde kolombreedte als de rest.
  return (
    <div className="border-y border-border bg-wash">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <UspStrip items={ITEMS} variant="compact" className="text-text" />
      </div>
    </div>
  );
}
