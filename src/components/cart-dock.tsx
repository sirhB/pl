"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";

export function CartDock() {
  const cart = useCart();
  if (cart.itemCount === 0) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 px-4">
      <Link
        href="/checkout"
        className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full border border-fusion-amber/30 bg-fusion-gold px-6 py-4 text-fusion-void shadow-glow-gold transition hover:brightness-110 animate-fade-up"
      >
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} ·{" "}
            {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
          </div>
          <div className="font-display text-sm font-extrabold uppercase tracking-wide">
            View cart & pay
          </div>
        </div>
        <div className="rounded-full bg-fusion-void px-4 py-2 font-display text-lg text-fusion-gold">
          {formatMoney(cart.subtotalCents)}
        </div>
      </Link>
    </div>
  );
}
