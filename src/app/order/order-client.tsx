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
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {stationLabel ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-fusion-ink shadow-card">
            <span className="h-2 w-2 rounded-full bg-fusion-green" />
            {stationLabel} · {cart.orderType === "DINE_IN" ? "Dine in" : "To-go"}
          </p>
        ) : (
          <p className="text-sm text-fusion-muted">Order for pickup at the truck</p>
        )}
        <div className="flex rounded-full bg-white p-1 shadow-card">
          {(["TOGO", "DINE_IN"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => cart.setOrderType(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cart.orderType === t
                  ? "bg-fusion-ink text-white"
                  : "text-fusion-muted hover:text-fusion-ink"
              }`}
            >
              {t === "TOGO" ? "To-go" : "Dine in"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="rounded-[24px] bg-white p-10 text-fusion-muted shadow-card">
          Loading your fusion menu…
        </p>
      )}
      {error && <p className="text-fusion-red">{error}</p>}

      {!loading && !error && one && two && (
        <div className="space-y-10">
          <BowlBuilder oneProtein={one} twoProtein={two} />
          <MenuBrowser categories={menu} />
        </div>
      )}

      <CartDock />
    </div>
  );
}
