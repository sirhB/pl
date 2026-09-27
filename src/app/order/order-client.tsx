"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BowlBuilder } from "@/components/bowl-builder";
import { MenuBrowser } from "@/components/menu-browser";
import { CartDock } from "@/components/cart-dock";
import { useCart } from "@/contexts/cart-context";
import { copy } from "@/lib/copy";
import type { MenuCategory } from "@/lib/menu";

export default function OrderPageClient() {
  const search = useSearchParams();
  const cart = useCart();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [stationLabel, setStationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const station = search.get("station");
    setLoading(true);
    setError(null);
    try {
      const [menuRes, stationRes] = await Promise.all([
        fetch("/api/menu", { cache: "no-store" }),
        station
          ? fetch(`/api/stations/${station}`, { cache: "no-store" })
          : Promise.resolve(null),
      ]);
      const menuData = await menuRes.json().catch(() => ({}));
      if (!menuRes.ok) {
        throw new Error(menuData.error || `Failed to load menu (${menuRes.status})`);
      }
      if (!Array.isArray(menuData.categories) || menuData.categories.length === 0) {
        throw new Error("Menu returned empty — try seeding with npm run db:setup");
      }
      setMenu(menuData.categories);

      // Takeout only — no dine in
      cart.setOrderType("TOGO");
      if (stationRes && stationRes.ok) {
        const s = await stationRes.json();
        cart.setQrStationCode(s.code);
        setStationLabel(s.label);
      } else if (station) {
        cart.setQrStationCode(station);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load menu");
      setMenu([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    cart.setOrderType("TOGO");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byo = menu.find((c) => c.slug === "build-your-bowl");
  const one = byo?.items.find((i) => i.slug === "fusion-bowl-1-protein");
  const two = byo?.items.find((i) => i.slug === "fusion-bowl-2-protein");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {stationLabel ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-fusion-emerald/30 bg-fusion-emerald/10 px-4 py-2 text-sm font-medium text-fusion-emerald">
            <span className="h-2 w-2 rounded-full bg-fusion-emerald" />
            {copy.stationReady} {stationLabel}
          </p>
        ) : (
          <p className="font-brush text-sm text-fusion-amber">{copy.streetLine}</p>
        )}
        <p className="rounded-full border border-fusion-line/40 bg-white/5 px-4 py-2 text-sm font-semibold text-fusion-muted">
          {copy.takeout} · {copy.pickupAtTruck}
        </p>
      </div>

      {loading && (
        <p className="glass-panel rounded-[28px] p-10 text-fusion-muted">
          {copy.loadingMenu}
        </p>
      )}

      {error && (
        <div className="glass-panel rounded-[28px] border-fusion-red/40 p-6">
          <p className="font-semibold text-fusion-red-hot">{copy.menuErrorTitle}</p>
          <p className="mt-1 text-sm text-fusion-muted">{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 rounded-full bg-fusion-gold px-5 py-2.5 text-sm font-bold text-fusion-void"
          >
            {copy.tryAgain}
          </button>
        </div>
      )}

      {!loading && !error && one && two && (
        <div className="space-y-12">
          <BowlBuilder oneProtein={one} twoProtein={two} menu={menu} />
          <div id="sides">
            <MenuBrowser categories={menu} />
          </div>
        </div>
      )}

      {!loading && !error && menu.length > 0 && (!one || !two) && (
        <MenuBrowser categories={menu} />
      )}

      <CartDock />
    </div>
  );
}
