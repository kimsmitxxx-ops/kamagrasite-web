"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { calcTotals } from "./bulk-discount";
import { GEEN_COUPON, schoonCode, type CouponResultaat } from "./coupon";

export type CartItem = {
  id: string;
  sku: string;
  name: string;
  price_cents: number;
  image: string | null;
  qty: number;
  /** "ut" voor UT-tagged producten, "rest" voor alle overige (default). */
};

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (v: boolean) => void;
  /** Ingevulde kortingscode, of null. Blijft staan over een refresh heen. */
  couponCode: string | null;
  /** Wat de server van die code vindt; discount_cents is 0 zolang hij niet geldig is. */
  coupon: CouponResultaat;
  couponBusy: boolean;
  setCouponCode: (code: string) => void;
  clearCoupon: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "kamagrasite.cart.v2";
// Winkelwagen-persistentie: minimaal 48 uur (gedeelde regel over ALLE shops
// binnen deze klant - retakopen, melashop, kamagrasite, peptidehuis en
// alle shops hanteren 30 dagen als bovengrens zodat 48u ruim gehaald
// wordt). Items ouder dan MAX_AGE_MS worden bij hydration genegeerd.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

type Persisted = { items: CartItem[]; savedAt: number; coupon?: string | null };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpenState] = useState(false);
  // Guard tegen race waarin de write-effect draait voordat we localStorage
  // hebben gelezen - dat zou een net-geladen cart met [] overschrijven.
  const [hydrated, setHydrated] = useState(false);
  // Kortingscode. Wat hier staat is wat de bezoeker typte; of hij geldig is
  // en wat hij oplevert zegt alleen de server (coupon).
  const [couponCode, setCouponCodeState] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<CouponResultaat>(GEEN_COUPON);
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: Persisted | CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Legacy v1 payload zonder timestamp - bewaar zoals is.
          setItems(parsed);
        } else if (parsed?.items && Array.isArray(parsed.items)) {
          const age = Date.now() - (parsed.savedAt || 0);
          if (age <= MAX_AGE_MS) {
            setItems(parsed.items);
            if (parsed.coupon) setCouponCodeState(schoonCode(parsed.coupon));
          }
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Persisted = { items, savedAt: Date.now(), coupon: couponCode };
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {}
  }, [items, couponCode, hydrated]);

  // Het subtotaal waar de code over rekent: na de staffelkorting, voor
  // verzending. Verandert de mand, dan verandert de korting mee - een code
  // met een minimumbestelbedrag mag niet blijven staan nadat de klant een
  // product weghaalt.
  const couponBasis = calcTotals(items).subtotal;

  // Elke controle krijgt een nummer; alleen het antwoord van de laatste mag
  // in de state landen. Zonder dat kan een langzaam antwoord op een oude mand
  // een nieuw, juist antwoord overschrijven.
  const controleRonde = useRef(0);
  useEffect(() => {
    if (!hydrated) return;
    if (!couponCode || couponBasis <= 0) {
      setCoupon(GEEN_COUPON);
      setCouponBusy(false);
      return;
    }
    const ronde = ++controleRonde.current;
    setCouponBusy(true);
    fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal_cents: couponBasis }),
    })
      .then((r) => r.json())
      .then((j: CouponResultaat) => {
        if (ronde !== controleRonde.current) return;
        setCoupon({ ...GEEN_COUPON, ...j, discount_cents: j?.ok ? j.discount_cents || 0 : 0 });
      })
      .catch(() => {
        if (ronde !== controleRonde.current) return;
        setCoupon({ ...GEEN_COUPON, melding: "Controleren lukte even niet.", reason: "netwerk" });
      })
      .finally(() => {
        if (ronde === controleRonde.current) setCouponBusy(false);
      });
  }, [couponCode, couponBasis, hydrated]);

  const setCouponCode = (code: string) => {
    const schoon = schoonCode(code);
    setCouponCodeState(schoon || null);
    if (!schoon) setCoupon(GEEN_COUPON);
  };
  const clearCoupon = () => {
    setCouponCodeState(null);
    setCoupon(GEEN_COUPON);
  };

  const add: Ctx["add"] = (it, qty = 1) => {
    setItems((p) => {
      const ex = p.find((x) => x.id === it.id);
      if (ex) return p.map((x) => x.id === it.id ? { ...x, qty: x.qty + qty } : x);
      return [...p, { ...it, qty }];
    });
    setOpenState(true);
  };
  const remove = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => qty <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => x.id === id ? { ...x, qty } : x));
  const clear = () => {
    setItems([]);
    clearCoupon();
  };
  const total = items.reduce((s, x) => s + x.price_cents * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);

  return (
    <CartCtx.Provider value={{
      items, add, remove, setQty, clear, total, count,
      isOpen,
      open: () => setOpenState(true),
      close: () => setOpenState(false),
      openCart: () => setOpenState(true),
      closeCart: () => setOpenState(false),
      setOpen: setOpenState,
      couponCode, coupon, couponBusy, setCouponCode, clearCoupon,
    }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart buiten CartProvider");
  return c;
}
