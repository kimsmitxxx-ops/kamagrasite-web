"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "kamagrasite.cart.v2";
// Winkelwagen-persistentie: minimaal 48 uur (gedeelde regel over ALLE shops
// binnen deze klant - retakopen, melashop, kamagrasite, peptidehuis en
// alle shops hanteren 30 dagen als bovengrens zodat 48u ruim gehaald
// wordt). Items ouder dan MAX_AGE_MS worden bij hydration genegeerd.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

type Persisted = { items: CartItem[]; savedAt: number };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpenState] = useState(false);
  // Guard tegen race waarin de write-effect draait voordat we localStorage
  // hebben gelezen - dat zou een net-geladen cart met [] overschrijven.
  const [hydrated, setHydrated] = useState(false);

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
          if (age <= MAX_AGE_MS) setItems(parsed.items);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Persisted = { items, savedAt: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {}
  }, [items, hydrated]);

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
  const clear = () => setItems([]);
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
