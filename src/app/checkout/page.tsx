"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";
import { copy } from "@/lib/copy";

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
          orderType: "TOGO",
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
        <h1 className="font-display text-3xl font-bold uppercase text-white">
          {copy.emptyCart}
        </h1>
        <Link href="/order" className="mt-6 inline-block font-semibold text-fusion-gold">
          {copy.backToBuilder}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide text-white">
          {copy.checkout}
        </h1>
        <p className="mt-1 text-fusion-muted">
          {copy.takeout}
          {cart.qrStationCode ? ` · ${cart.qrStationCode}` : ""}
        </p>
        <ul className="mt-6 space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.key}
              className="glass-panel flex items-start justify-between gap-3 rounded-[22px] p-4"
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
                    className="h-8 w-8 rounded-full bg-white/10 font-bold"
                    onClick={() => cart.updateQty(item.key, item.quantity - 1)}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-white/10 font-bold"
                    onClick={() => cart.updateQty(item.key, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="font-bold text-fusion-gold">
                {formatMoney(item.unitPriceCents * item.quantity)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-panel h-fit rounded-[28px] p-6 shadow-glass">
        <h2 className="font-display text-2xl font-bold uppercase text-fusion-gold">
          {copy.contactPay}
        </h2>
        <label className="mt-4 block text-sm">
          <span className="text-fusion-muted">{copy.name}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-fusion-line/40 bg-black/40 px-3 py-2.5 outline-none focus:border-fusion-gold"
            placeholder="Your name"
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">{copy.mobile}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-fusion-line/40 bg-black/40 px-3 py-2.5 outline-none focus:border-fusion-gold"
            placeholder="(555) 555-0100"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">{copy.orderNotes}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            className="mt-1 w-full rounded-2xl border border-fusion-line/40 bg-black/40 px-3 py-2.5 outline-none focus:border-fusion-gold"
            rows={2}
          />
        </label>
        <label className="mt-3 block text-sm">
          <span className="text-fusion-muted">{copy.redeemPoints}</span>
          <input
            type="number"
            min={0}
            step={100}
            value={redeem}
            onChange={(e) => setRedeem(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-2xl border border-fusion-line/40 bg-black/40 px-3 py-2.5 outline-none focus:border-fusion-gold"
          />
        </label>

        <dl className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-fusion-muted">{copy.subtotal}</dt>
            <dd>{formatMoney(cart.subtotalCents)}</dd>
          </div>
          {redeemDiscount > 0 && (
            <div className="flex justify-between text-fusion-emerald">
              <dt>{copy.rewards}</dt>
              <dd>−{formatMoney(redeemDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-fusion-muted">{copy.tax}</dt>
            <dd>{formatMoney(taxEstimate)}</dd>
          </div>
          <div className="flex justify-between border-t border-fusion-line/40 pt-2 text-lg font-bold">
            <dt>{copy.total}</dt>
            <dd className="text-fusion-gold">{formatMoney(total)}</dd>
          </div>
        </dl>

        {error && <p className="mt-3 text-sm text-fusion-red-hot">{error}</p>}

        <button
          type="button"
          disabled={busy || !phone || cart.items.length === 0}
          onClick={pay}
          className="mt-5 w-full rounded-full bg-fusion-green py-3.5 font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-40"
        >
          {busy ? copy.paying : copy.payStripe}
        </button>
      </div>
    </div>
  );
}
