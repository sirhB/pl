"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";

export function CartDock() {
  const cart = useCart();
  if (cart.itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <Link
        href="/checkout"
        className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl bg-fusion-yellow px-5 py-4 text-fusion-black shadow-2xl shadow-black/50 transition hover:bg-white animate-fade-up"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} · {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
          </div>
          <div className="font-display text-xl leading-none">View cart & pay</div>
        </div>
        <div className="font-display text-2xl">{formatMoney(cart.subtotalCents)}</div>
      </Link>
    </div>
  );
}
