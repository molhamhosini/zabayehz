'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartLine = {
  key: string; // product id + chosen options
  productId: number;
  name: string;
  image: string | null;
  unitPrice: number; // after discount
  qty: number;
  options: { title: string; value: string }[];
  selections: Record<string, string>; // single-choice title -> option (used to place the order)
  multi: Record<string, string[]>;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<Ctx | null>(null);
const STORE = 'zj-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      // Lines saved before checkout existed have no selections; drop them.
      if (raw) setLines((JSON.parse(raw) as CartLine[]).filter((l) => l && typeof l.selections === 'object'));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify(lines)); } catch {}
  }, [lines, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.key === line.key);
      if (i < 0) return [...prev, line];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + line.qty, unitPrice: line.unitPrice };
      return next;
    });
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, qty) } : l)));
  }, []);
  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => ({
    lines, ready, add, setQty, remove, clear,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + l.qty * l.unitPrice, 0),
  }), [lines, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart outside CartProvider');
  return c;
}
