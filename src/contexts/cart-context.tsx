"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartModifier = {
  groupName: string;
  optionName: string;
  priceDeltaCents?: number;
};

export type CartItem = {
  key: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
  imageHint?: string;
};

export type OrderMode = "DINE_IN" | "TOGO";

type CartState = {
  items: CartItem[];
  orderType: OrderMode;
  qrStationCode?: string;
  customerName: string;
  customerPhone: string;
  redeemPoints: number;
  notes: string;
};

type CartContextValue = CartState & {
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, quantity: number) => void;
  clear: () => void;
  setOrderType: (t: OrderMode) => void;
  setQrStationCode: (code?: string) => void;
  setCustomer: (name: string, phone: string) => void;
  setRedeemPoints: (n: number) => void;
  setNotes: (n: string) => void;
  subtotalCents: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "prime-fusion-cart-v1";

function load(): CartState {
  if (typeof window === "undefined") {
    return {
      items: [],
      orderType: "TOGO",
      customerName: "",
      customerPhone: "",
      redeemPoints: 0,
      notes: "",
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartState;
  } catch {
    /* ignore */
  }
  return {
    items: [],
    orderType: "TOGO",
    customerName: "",
    customerPhone: "",
    redeemPoints: 0,
    notes: "",
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(load);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = load();
    setState({ ...loaded, orderType: "TOGO" });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = state.items.reduce(
      (s, i) => s + i.unitPriceCents * i.quantity,
      0
    );
    const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
    return {
      ...state,
      subtotalCents,
      itemCount,
      addItem: (item) => {
        const key = `${item.menuItemId}:${JSON.stringify(item.modifiers)}:${item.notes || ""}`;
        setState((prev) => {
          const existing = prev.items.find((i) => i.key === key);
          if (existing) {
            return {
              ...prev,
              items: prev.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { ...prev, items: [...prev.items, { ...item, key }] };
        });
      },
      removeItem: (key) =>
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.key !== key),
        })),
      updateQty: (key, quantity) =>
        setState((prev) => ({
          ...prev,
          items:
            quantity <= 0
              ? prev.items.filter((i) => i.key !== key)
              : prev.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      clear: () =>
        setState((prev) => ({
          ...prev,
          items: [],
          redeemPoints: 0,
          notes: "",
        })),
      setOrderType: (orderType) => setState((prev) => ({ ...prev, orderType })),
      setQrStationCode: (qrStationCode) =>
        setState((prev) => ({ ...prev, qrStationCode })),
      setCustomer: (customerName, customerPhone) =>
        setState((prev) => ({ ...prev, customerName, customerPhone })),
      setRedeemPoints: (redeemPoints) =>
        setState((prev) => ({ ...prev, redeemPoints })),
      setNotes: (notes) => setState((prev) => ({ ...prev, notes })),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
