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
        className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full bg-fusion-ink px-6 py-4 text-white shadow-float transition hover:bg-fusion-green animate-fade-up"
      >
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} ·{" "}
            {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
          </div>
          <div className="font-semibold leading-none">View cart & pay</div>
        </div>
        <div className="rounded-full bg-white px-4 py-2 font-display text-lg text-fusion-ink">
          {formatMoney(cart.subtotalCents)}
        </div>
      </Link>
    </div>
  );
}
