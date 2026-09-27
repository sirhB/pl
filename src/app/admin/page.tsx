"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";

type Tab = "overview" | "menu" | "inventory" | "taxes" | "qr" | "orders";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@primefusion.com");
  const [password, setPassword] = useState("fusion-admin-2024");
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [taxes, setTaxes] = useState<any>(null);
  const [qr, setQr] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState("7.5");

  async function checkAuth() {
    const res = await fetch("/api/auth");
    const data = await res.json();
    if (data.user && (data.user.role === "ADMIN" || data.user.role === "STAFF")) {
      setAuthed(true);
      setRole(data.user.role);
      return true;
    }
    setAuthed(false);
    return false;
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "overview") {
      fetch("/api/admin/analytics")
        .then((r) => r.json())
        .then(setAnalytics)
        .catch(console.error);
    }
    if (tab === "menu") {
      fetch("/api/admin/menu")
        .then((r) => r.json())
        .then(setMenu)
        .catch(console.error);
    }
    if (tab === "inventory") {
      fetch("/api/admin/inventory")
        .then((r) => r.json())
        .then(setInventory)
        .catch(console.error);
    }
    if (tab === "taxes") {
      fetch("/api/admin/taxes")
        .then((r) => r.json())
        .then((d) => {
          setTaxes(d);
          if (d.settings?.[0]) setTaxRate(String(d.settings[0].rateBps / 100));
        })
        .catch(console.error);
    }
    if (tab === "qr") {
      fetch("/api/admin/qr")
        .then((r) => r.json())
        .then(setQr)
        .catch(console.error);
    }
    if (tab === "orders") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders || []))
        .catch(console.error);
    }
  }, [authed, tab]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError("Invalid login");
      return;
    }
    await checkAuth();
  }

  async function savePrice(id: string, priceCents: number, costCents: number) {
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, priceCents, costCents }),
    });
    const r = await fetch("/api/admin/menu");
    setMenu(await r.json());
  }

  async function adjustInventory(id: string, adjustBy: number) {
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adjustBy, reason: "Admin adjustment" }),
    });
    const r = await fetch("/api/admin/inventory");
    setInventory(await r.json());
  }

  async function saveTax(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/taxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratePercent: parseFloat(taxRate), jurisdiction: "Local" }),
    });
    const r = await fetch("/api/admin/taxes");
    setTaxes(await r.json());
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl text-fusion-yellow">Admin login</h1>
        <form onSubmit={login} className="mt-6 space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-fusion-red">{error}</p>}
          <button className="w-full rounded-lg bg-fusion-yellow py-3 font-bold text-fusion-black">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Analytics" },
    { id: "menu", label: "Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "taxes", label: "Taxes" },
    { id: "qr", label: "QR Codes" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-fusion-yellow">Ops console</h1>
          <p className="text-sm text-fusion-muted">Signed in as {role}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/kitchen" className="text-fusion-muted hover:text-white">
            Kitchen
          </Link>
          <button
            type="button"
            onClick={() =>
              fetch("/api/auth", { method: "DELETE" }).then(() => setAuthed(false))
            }
            className="text-fusion-muted hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id
                ? "bg-fusion-yellow text-fusion-black"
                : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && analytics?.totals && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Revenue (30d)", formatMoney(analytics.totals.revenueCents)],
              ["Orders", String(analytics.totals.orderCount)],
              ["Tax collected", formatMoney(analytics.totals.taxCollectedCents)],
              ["Gross margin", `${analytics.totals.marginPct.toFixed(1)}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-black/40 p-4"
              >
                <div className="text-xs uppercase tracking-wide text-fusion-muted">
                  {label}
                </div>
                <div className="mt-1 font-display text-2xl text-fusion-yellow">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h2 className="font-display text-xl text-white">Top sellers</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {(analytics.topItems || []).map((i: any) => (
                  <li key={i.name} className="flex justify-between gap-3">
                    <span>
                      {i.name}{" "}
                      <span className="text-fusion-muted">×{i.qty}</span>
                    </span>
                    <span className="text-fusion-yellow">{formatMoney(i.revenue)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h2 className="font-display text-xl text-white">Cost optimization</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {(analytics.costOptimization || []).slice(0, 8).map((i: any) => (
                  <li key={i.id} className="border-b border-white/5 pb-2">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{i.name}</span>
                      <span
                        className={
                          i.marginPct < 55 ? "text-fusion-red" : "text-fusion-green"
                        }
                      >
                        {i.marginPct.toFixed(0)}% margin
                      </span>
                    </div>
                    <p className="text-xs text-fusion-muted">{i.suggestion}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {analytics.lowStock?.length > 0 && (
            <section className="rounded-xl border border-fusion-red/40 bg-fusion-red/10 p-4">
              <h2 className="font-display text-xl text-white">Low stock alerts</h2>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {analytics.lowStock.map((i: any) => (
                  <li
                    key={i.id}
                    className="rounded-full bg-black/40 px-3 py-1 text-fusion-cream"
                  >
                    {i.name}: {i.quantityOnHand} left
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {tab === "menu" && menu?.items && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-fusion-muted">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Cost</th>
                <th className="px-3 py-2">Margin</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {menu.items.map((item: any) => (
                <MenuPriceRow key={item.id} item={item} onSave={savePrice} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "inventory" && inventory?.items && (
        <ul className="space-y-2">
          {inventory.items.map((item: any) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-xs text-fusion-muted">
                  On hand: {item.quantityOnHand} · Reorder at {item.reorderLevel} · Cost{" "}
                  {formatMoney(item.costPerUnitCents)}/{item.unit.toLowerCase()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border border-white/20 px-3 py-1 text-sm"
                  onClick={() => adjustInventory(item.id, -1)}
                >
                  −1
                </button>
                <button
                  type="button"
                  className="rounded border border-white/20 px-3 py-1 text-sm"
                  onClick={() => adjustInventory(item.id, 5)}
                >
                  +5
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "taxes" && taxes && (
        <div className="max-w-lg space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="font-display text-xl text-white">30-day tax report</h2>
            <p className="mt-2 text-sm text-fusion-muted">
              Orders: {taxes.report.orderCount}
            </p>
            <p className="text-2xl text-fusion-yellow">
              {formatMoney(taxes.report.taxCollectedCents)} collected
            </p>
            <p className="text-sm text-fusion-muted">
              On {formatMoney(taxes.report.taxableSubtotalCents)} taxable sales
            </p>
          </div>
          <form onSubmit={saveTax} className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="font-display text-xl text-white">Update tax rate</h2>
            <label className="mt-3 block text-sm">
              Rate (%)
              <input
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2"
              />
            </label>
            <button className="mt-3 rounded-lg bg-fusion-yellow px-4 py-2 font-bold text-fusion-black">
              Save rate
            </button>
            {taxes.settings?.[0] && (
              <p className="mt-2 text-xs text-fusion-muted">
                Current: {taxes.settings[0].rateBps / 100}% ({taxes.settings[0].name})
              </p>
            )}
          </form>
        </div>
      )}

      {tab === "qr" && qr?.stations && (
        <div className="grid gap-4 sm:grid-cols-2">
          {qr.stations.map((s: any) => (
            <div
              key={s.id}
              className="rounded-xl border border-white/10 bg-black/30 p-4 text-center"
            >
              <img
                src={s.qrDataUrl}
                alt={`QR for ${s.label}`}
                className="mx-auto h-48 w-48 rounded-lg"
              />
              <h3 className="mt-3 font-display text-lg text-fusion-yellow">{s.label}</h3>
              <p className="text-xs text-fusion-muted">{s.orderType}</p>
              <a
                href={s.url}
                className="mt-2 inline-block break-all text-xs text-white underline"
              >
                {s.url}
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
            >
              <div>
                <Link href={`/order/status/${o.id}`} className="font-semibold text-fusion-yellow">
                  {o.orderNumber}
                </Link>
                <div className="text-fusion-muted">
                  {o.status} · {o.orderType} · {o.customerName || "Guest"}
                </div>
              </div>
              <div className="font-semibold">{formatMoney(o.totalCents)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MenuPriceRow({
  item,
  onSave,
}: {
  item: any;
  onSave: (id: string, price: number, cost: number) => void;
}) {
  const [price, setPrice] = useState((item.priceCents / 100).toFixed(2));
  const [cost, setCost] = useState((item.costCents / 100).toFixed(2));
  const priceCents = Math.round(parseFloat(price || "0") * 100);
  const costCents = Math.round(parseFloat(cost || "0") * 100);
  const margin = priceCents ? ((priceCents - costCents) / priceCents) * 100 : 0;

  return (
    <tr className="border-t border-white/5">
      <td className="px-3 py-2 font-medium text-white">{item.name}</td>
      <td className="px-3 py-2 text-fusion-muted">{item.category?.name}</td>
      <td className="px-3 py-2">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 rounded border border-white/10 bg-black/50 px-2 py-1"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-24 rounded border border-white/10 bg-black/50 px-2 py-1"
        />
      </td>
      <td className="px-3 py-2">
        <span className={margin < 55 ? "text-fusion-red" : "text-fusion-green"}>
          {margin.toFixed(0)}%
        </span>
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => onSave(item.id, priceCents, costCents)}
          className="rounded bg-fusion-yellow px-3 py-1 text-xs font-bold text-fusion-black"
        >
          Save
        </button>
      </td>
    </tr>
  );
}
