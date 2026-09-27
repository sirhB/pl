"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [name, setName] = useState(cart.customerName);
  const [phone, setPhone] = useState(cart.customerPhone);
  const [notes, setNotes] = useState(cart.notes);
  const [redeem, setRedeem] = useState(cart.redeemPoints);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const taxEstimate = useMemo(
    () => Math.round(cart.subtotalCents * 0.075),
    [cart.subtotalCents]
  );
  const redeemDiscount = Math.floor(redeem / 100) * 500;
  const total = Math.max(0, cart.subtotalCents - redeemDiscount) + taxEstimate;

  async function pay() {
    setBusy(true);
    setError(null);
    cart.setCustomer(name, phone);
    cart.setNotes(notes);
    cart.setRedeemPoints(redeem);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: cart.orderType,
          qrStationCode: cart.qrStationCode,
          customerName: name,
          customerPhone: phone,
          notes,
          redeemPoints: redeem,
          lines: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            modifiers: i.modifiers,
            notes: i.notes,
            nameOverride: i.name,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.checkoutUrl) {
        cart.clear();
        window.location.href = data.checkoutUrl;
        return;
      }

      // Demo / Stripe-not-configured path
      setDemoMode(true);
      cart.clear();
      router.push(`/order/status/${data.orderId}?paid=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (cart.items.length === 0 && !demoMode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-white">Cart is empty</h1>
        <Link href="/order" className="mt-6 inline-block text-fusion-yellow underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h1 className="font-display text-4xl text-white">Checkout</h1>
        <p className="mt-1 text-fusion-muted">
          {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
          {cart.qrStationCode ? ` · station ${cart.qrStationCode}` : ""}
        </p>

        <ul className="mt-6 space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div>
                <div className="font-semibold text-white">
                  {item.quantity}× {item.name}
                </div>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-fusion-muted">
                    {item.modifiers.map((m) => m.optionName).join(" · ")}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-white/20 px-2 text-sm"
                    onClick={() => cart.updateQty(item.key, item.quantity - 1)}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="rounded border border-white/20 px-2 text-sm"
                    onClick={() => cart.updateQty(item.key, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-fusion-yellow">
                {formatMoney(item.unitPriceCents * item.quantity)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-fusion-gold/30 bg-fusion-charcoal/80 p-5 h-fit">
        <h2 className="font-display text-2xl text-fusion-yellow">Contact & pay</h2>
        <label className="mt-4 block text-sm">
          <span className="text-fusion-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            placeholder="Your name"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">Mobile (for SMS updates & rewards)</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            placeholder="(555) 555-0100"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">Order notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            rows={2}
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">Redeem reward points (100 pts = $5)</span>
          <input
            type="number"
            min={0}
            step={100}
            value={redeem}
            onChange={(e) => setRedeem(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
          />
        </label>

        <dl className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-fusion-muted">Subtotal</dt>
            <dd>{formatMoney(cart.subtotalCents)}</dd>
          </div>
          {redeemDiscount > 0 && (
            <div className="flex justify-between text-fusion-green">
              <dt>Rewards</dt>
              <dd>−{formatMoney(redeemDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-fusion-muted">Tax (est.)</dt>
            <dd>{formatMoney(taxEstimate)}</dd>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold">
            <dt>Total</dt>
            <dd className="text-fusion-yellow">{formatMoney(total)}</dd>
          </div>
        </dl>

        {error && <p className="mt-3 text-sm text-fusion-red">{error}</p>}

        <button
          type="button"
          disabled={busy || !phone || cart.items.length === 0}
          onClick={pay}
          className="mt-5 w-full rounded-lg bg-fusion-yellow py-3.5 font-bold text-fusion-black disabled:opacity-40"
        >
          {busy ? "Starting checkout…" : "Pay with Stripe"}
        </button>
        <p className="mt-2 text-center text-xs text-fusion-muted">
          Without Stripe keys, payment is simulated for demo.
        </p>
      </div>
    </div>
  );
}
