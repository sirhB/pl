"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  rewardPointsEarned: number;
  customerName?: string;
  estimatedReadyAt?: string;
  items: Array<{ name: string; quantity: number; totalCents: number }>;
};

const STEPS = ["RECEIVED", "PREPARING", "READY", "COMPLETED"];

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const res = await fetch(`/api/orders/${params.id}`);
      if (!res.ok) {
        if (alive) setError("Order not found");
        return;
      }
      const data = await res.json();
      if (alive) setOrder(data);
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-fusion-red-hot">{error}</p>
        <Link href="/order" className="mt-4 inline-block text-fusion-gold">
          Order again
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-fusion-muted">Loading receipt…</div>;
  }

  const stepIdx = Math.max(
    0,
    STEPS.indexOf(order.status === "PAID" ? "RECEIVED" : order.status)
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="font-brush text-fusion-amber">Order receipt</p>
      <h1 className="font-display text-4xl font-extrabold text-fusion-gold">
        {order.orderNumber}
      </h1>
      <p className="mt-1 text-fusion-muted">
        {order.orderType === "DINE_IN" ? "Dine in" : "To-go"}
        {order.customerName ? ` · ${order.customerName}` : ""}
      </p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="text-center">
            <div
              className={`mx-auto h-2 rounded-full ${
                i <= stepIdx ? "bg-fusion-emerald" : "bg-white/10"
              }`}
            />
            <div className="mt-1 text-[10px] uppercase tracking-wide text-fusion-muted">
              {s.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6 rounded-[28px] p-6">
        <p className="font-display text-2xl text-white">
          Status:{" "}
          <span className="text-fusion-emerald">{order.status.replace("_", " ")}</span>
        </p>
        <ul className="mt-4 space-y-2 border-t border-fusion-line/30 pt-4 text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span className="text-fusion-gold">{formatMoney(i.totalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-fusion-line/30 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-fusion-muted">Subtotal</dt>
            <dd>{formatMoney(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-fusion-emerald">
              <dt>Discounts</dt>
              <dd>−{formatMoney(order.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-fusion-muted">Tax</dt>
            <dd>{formatMoney(order.taxCents)}</dd>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <dt>Total</dt>
            <dd className="text-fusion-gold">{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 text-center">
        <Link href="/order" className="font-semibold text-fusion-gold">
          Build another bowl
        </Link>
      </div>
    </div>
  );
}
