"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BowlBuilder } from "@/components/bowl-builder";
import { MenuBrowser } from "@/components/menu-browser";
import { CartDock } from "@/components/cart-dock";
import { useCart } from "@/contexts/cart-context";
import type { MenuCategory } from "@/lib/menu";

export default function OrderPageClient() {
  const search = useSearchParams();
  const cart = useCart();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [stationLabel, setStationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const station = search.get("station");
    async function load() {
      try {
        const [menuRes, stationRes] = await Promise.all([
          fetch("/api/menu"),
          station ? fetch(`/api/stations/${station}`) : Promise.resolve(null),
        ]);
        if (!menuRes.ok) throw new Error("Failed to load menu");
        const menuData = await menuRes.json();
        setMenu(menuData.categories || []);

        if (stationRes && stationRes.ok) {
          const s = await stationRes.json();
          cart.setQrStationCode(s.code);
          cart.setOrderType(s.orderType === "DINE_IN" ? "DINE_IN" : "TOGO");
          setStationLabel(s.label);
        } else if (station) {
          cart.setQrStationCode(station);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load menu");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const byo = menu.find((c) => c.slug === "build-your-bowl");
  const one = byo?.items.find((i) => i.slug === "fusion-bowl-1-protein");
  const two = byo?.items.find((i) => i.slug === "fusion-bowl-2-protein");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fusion-gold">
            Interactive ordering
          </p>
          <h1 className="font-display text-4xl text-white sm:text-5xl">Place your order</h1>
          {stationLabel && (
            <p className="mt-2 inline-flex rounded-full border border-fusion-green/40 bg-fusion-green/15 px-3 py-1 text-sm text-white">
              QR station · {stationLabel} · {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
            </p>
          )}
        </div>
        <div className="flex rounded-lg border border-white/10 bg-black/40 p-1">
          {(["TOGO", "DINE_IN"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => cart.setOrderType(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                cart.orderType === t
                  ? "bg-fusion-yellow text-fusion-black"
                  : "text-fusion-muted hover:text-white"
              }`}
            >
              {t === "TOGO" ? "To-go" : "Dine in"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="animate-pulse-soft text-fusion-muted">Loading the fusion menu…</p>
      )}
      {error && <p className="text-fusion-red">{error}</p>}

      {!loading && !error && one && two && (
        <div className="space-y-12">
          <BowlBuilder oneProtein={one} twoProtein={two} />
          <MenuBrowser categories={menu} />
        </div>
      )}

      <CartDock />
    </div>
  );
}
