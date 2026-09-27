"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  qrStation?: { label: string } | null;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("kitchen@primefusion.com");
  const [password, setPassword] = useState("kitchen-2024");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/orders?board=1");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setOrders(data.orders || []);
    setAuthed(true);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Login failed");
      return;
    }
    setAuthed(true);
    refresh();
  }

  async function setStatus(orderId: string, status: string) {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    refresh();
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl text-fusion-yellow">Kitchen login</h1>
        <form onSubmit={login} className="mt-6 space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {error && <p className="text-sm text-fusion-red">{error}</p>}
          <button className="w-full rounded-lg bg-fusion-yellow py-3 font-bold text-fusion-black">
            Enter kitchen board
          </button>
        </form>
      </div>
    );
  }

  const columns: Array<{ key: string; label: string; next?: string }> = [
    { key: "RECEIVED", label: "New", next: "PREPARING" },
    { key: "PREPARING", label: "Cooking", next: "READY" },
    { key: "READY", label: "Ready", next: "COMPLETED" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-fusion-yellow">Kitchen board</h1>
          <p className="text-sm text-fusion-muted">Auto-refreshes · SMS fires on status changes</p>
        </div>
        <button
          type="button"
          onClick={() => fetch("/api/auth", { method: "DELETE" }).then(() => setAuthed(false))}
          className="text-sm text-fusion-muted hover:text-white"
        >
          Log out
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <h2 className="mb-3 font-display text-xl text-white">
              {col.label}{" "}
              <span className="text-fusion-muted">
                ({orders.filter((o) => o.status === col.key || (col.key === "RECEIVED" && o.status === "PAID")).length})
              </span>
            </h2>
            <div className="space-y-3">
              {orders
                .filter(
                  (o) =>
                    o.status === col.key || (col.key === "RECEIVED" && o.status === "PAID")
                )
                .map((o) => (
                  <article
                    key={o.id}
                    className="rounded-lg border border-fusion-gold/20 bg-fusion-charcoal p-3"
                  >
                    <div className="flex justify-between gap-2">
                      <div className="font-display text-lg text-fusion-yellow">
                        {o.orderNumber}
                      </div>
                      <div className="text-xs text-fusion-muted">
                        {o.orderType === "DINE_IN" ? "Dine in" : "To-go"}
                      </div>
                    </div>
                    <p className="text-xs text-fusion-muted">
                      {o.customerName || "Guest"}
                      {o.qrStation ? ` · ${o.qrStation.label}` : ""}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          <span className="font-semibold text-white">{i.quantity}×</span>{" "}
                          {i.name}
                        </li>
                      ))}
                    </ul>
                    {o.notes && (
                      <p className="mt-2 text-xs text-fusion-red">Note: {o.notes}</p>
                    )}
                    {col.next && (
                      <button
                        type="button"
                        onClick={() => setStatus(o.id, col.next!)}
                        className="mt-3 w-full rounded-md bg-fusion-green py-2 text-sm font-semibold text-white"
                      >
                        Mark {col.next.toLowerCase()}
                      </button>
                    )}
                  </article>
                ))}
            </div>
          </div>
        ))}
      </div>
      {/* silence unused formatMoney if no totals shown */}
      <span className="hidden">{formatMoney(0)}</span>
    </div>
  );
}
