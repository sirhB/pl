"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { MenuCategory, MenuItemDTO } from "@/lib/menu";

type Props = {
  oneProtein: MenuItemDTO;
  twoProtein: MenuItemDTO;
  menu: MenuCategory[];
  onAdded?: () => void;
};

const PROTEIN_META: Record<string, { blurb: string; hue: string; short: string }> = {
  Oxtails: { blurb: "Slow-braised", hue: "#5c3d2e", short: "OX" },
  Salmon: { blurb: "Mango-glazed", hue: "#c45c3e", short: "SA" },
  "BBQ Fried Chicken": { blurb: "Crispy & sauced", hue: "#d4a017", short: "BBQ" },
  "Jerk Pork": { blurb: "Smoky heat", hue: "#9b2226", short: "JP" },
  "Jerk Chicken": { blurb: "Charred classic", hue: "#16a34a", short: "JC" },
};

const BASES = [
  { name: "Rice & Peas", priceDeltaCents: 0 },
  { name: "Jerk Chicken Fried Rice", priceDeltaCents: 0 },
  { name: "Rasta Pasta", priceDeltaCents: 200 },
  { name: "Mac & Cheese", priceDeltaCents: 150 },
];

const SIDE_OPTIONS = [
  { name: "Jamaican Coleslaw", priceDeltaCents: 0 },
  { name: "Plantains", priceDeltaCents: 0 },
  { name: "Rice & Peas", priceDeltaCents: 0 },
  { name: "Rasta Pasta", priceDeltaCents: 200 },
];

type Addon = {
  key: string;
  name: string;
  priceDeltaCents: number;
  menuItemId?: string;
  group?: string;
};

function ToggleRow({
  label,
  blurb,
  price,
  on,
  disabled,
  hue,
  short,
  onToggle,
}: {
  label: string;
  blurb?: string;
  price?: number;
  on: boolean;
  disabled?: boolean;
  hue?: string;
  short?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled && !on}
      onClick={onToggle}
      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.97] ${
        on
          ? "border-fusion-amber/40 bg-fusion-green/10 shadow-glow-gold/20"
          : "border-transparent hover:bg-white/5"
      } ${disabled && !on ? "opacity-40" : ""}`}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-extrabold tracking-wide text-white shadow-glass"
        style={{ background: hue || "#3f3f46" }}
      >
        {short || label.slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="block text-xs text-fusion-muted">
          {blurb || ""}
          {typeof price === "number" && price > 0 ? ` · +${formatMoney(price)}` : ""}
        </span>
      </span>
      <span
        className="toggle-track"
        data-on={on ? "true" : "false"}
        data-disabled={disabled && !on ? "true" : "false"}
      >
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}

export function BowlBuilder({ oneProtein, twoProtein, menu, onAdded }: Props) {
  const cart = useCart();
  const [tier, setTier] = useState<1 | 2>(1);
  const [base, setBase] = useState(BASES[0].name);
  const [proteins, setProteins] = useState<string[]>(["Jerk Chicken"]);
  const [sides, setSides] = useState<string[]>(["Jamaican Coleslaw", "Plantains"]);
  const [addons, setAddons] = useState<string[]>([]);
  const [bowlKey, setBowlKey] = useState(0);
  const [priceFlash, setPriceFlash] = useState(0);
  const [addedFlash, setAddedFlash] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeItem = tier === 1 ? oneProtein : twoProtein;
  const proteinOptions =
    activeItem.modifierGroups.find((g) => g.name === "Proteins")?.options.map((o) => o.name) ||
    Object.keys(PROTEIN_META);

  const drinks = menu.find((c) => c.slug === "drinks")?.items || [];
  const empanadas = (menu.find((c) => c.slug === "empanadas")?.items || []).filter(
    (i) => i.slug === "chicken-empanada" || i.slug === "beef-empanada"
  );
  const wingItem = menu.find((c) => c.slug === "wings")?.items.find((i) => i.slug === "wings-6");

  const addonCatalog: Addon[] = useMemo(() => {
    const list: Addon[] = [];
    for (const e of empanadas) {
      list.push({
        key: `emp-${e.slug}`,
        name: e.name,
        priceDeltaCents: e.priceCents,
        menuItemId: e.id,
        group: "Empanadas",
      });
    }
    if (wingItem) {
      for (const flavor of ["Jerk", "Mango Jerk", "BBQ Jerk"]) {
        list.push({
          key: `wing-${flavor}`,
          name: `Wings 6pc · ${flavor}`,
          priceDeltaCents: wingItem.priceCents,
          menuItemId: wingItem.id,
          group: "Wings",
        });
      }
    }
    for (const d of drinks) {
      list.push({
        key: `drink-${d.slug}`,
        name: d.name,
        priceDeltaCents: d.priceCents,
        menuItemId: d.id,
        group: "Drinks",
      });
    }
    return list;
  }, [empanadas, wingItem, drinks]);

  const baseDelta = BASES.find((b) => b.name === base)?.priceDeltaCents || 0;
  const sideDelta = sides.reduce((sum, s) => {
    const opt = SIDE_OPTIONS.find((o) => o.name === s);
    return sum + (opt?.priceDeltaCents || 0);
  }, 0);
  const addonDelta = addons.reduce((sum, key) => {
    const a = addonCatalog.find((x) => x.key === key);
    return sum + (a?.priceDeltaCents || 0);
  }, 0);

  const bowlPrice = activeItem.priceCents + baseDelta + sideDelta;
  const totalPrice = bowlPrice + addonDelta;

  useEffect(() => {
    setPriceFlash((n) => n + 1);
  }, [totalPrice]);

  function bumpBowl() {
    setBowlKey((k) => k + 1);
  }

  function setTierSafe(n: 1 | 2) {
    setTier(n);
    setProteins((prev) => prev.slice(0, n));
    bumpBowl();
  }

  function toggleProtein(name: string) {
    setProteins((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev;
        return prev.filter((p) => p !== name);
      }
      if (tier === 1) return [name];
      if (prev.length >= 2) return [...prev.slice(1), name];
      return [...prev, name];
    });
    bumpBowl();
  }

  function toggleSide(name: string) {
    setSides((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== name);
      }
      if (prev.length >= 3) return [...prev.slice(1), name];
      return [...prev, name];
    });
    bumpBowl();
  }

  function toggleAddon(key: string) {
    setAddons((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const proteinCapReached = proteins.length >= tier;

  function addToOrder() {
    if (proteins.length !== tier || sides.length < 1) return;
    const modifiers = [
      { groupName: "Base", optionName: base, priceDeltaCents: baseDelta },
      ...proteins.map((p) => ({
        groupName: "Proteins",
        optionName: p,
        priceDeltaCents: 0,
      })),
      ...sides.map((s) => ({
        groupName: "Sides",
        optionName: s,
        priceDeltaCents: SIDE_OPTIONS.find((o) => o.name === s)?.priceDeltaCents || 0,
      })),
    ];
    cart.addItem({
      menuItemId: activeItem.id,
      name: `${tier} Protein Bowl · ${proteins.join(" + ")}`,
      unitPriceCents: bowlPrice,
      quantity: 1,
      modifiers,
    });
    for (const key of addons) {
      const a = addonCatalog.find((x) => x.key === key);
      if (!a?.menuItemId) continue;
      cart.addItem({
        menuItemId: a.menuItemId,
        name: a.name,
        unitPriceCents: a.priceDeltaCents,
        quantity: 1,
        modifiers: a.group === "Wings"
          ? [{ groupName: "Wing Flavor", optionName: a.name.split(" · ")[1] || "Jerk" }]
          : [],
      });
    }
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1600);
    onAdded?.();
  }

  const badges = [
    ...proteins.map((p) => ({ label: p, tone: "gold" as const })),
    { label: base, tone: "green" as const },
    ...sides.filter((s) => s !== base).map((s) => ({ label: s, tone: "green" as const })),
  ];

  const togglePanel = (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-fusion-gold">
            Select protein
          </h3>
          <span className="rounded-full bg-fusion-red/20 px-2.5 py-0.5 text-[11px] font-bold text-fusion-red-hot">
            {proteins.length}/{tier}
          </span>
        </div>
        <div className="space-y-1.5">
          {proteinOptions.map((name) => {
            const on = proteins.includes(name);
            const meta = PROTEIN_META[name];
            return (
              <ToggleRow
                key={name}
                label={name}
                blurb={meta?.blurb}
                hue={meta?.hue}
                short={meta?.short}
                on={on}
                disabled={proteinCapReached}
                onToggle={() => toggleProtein(name)}
              />
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-fusion-emerald">
            Select sides
          </h3>
          <span className="rounded-full bg-fusion-emerald/15 px-2.5 py-0.5 text-[11px] font-bold text-fusion-emerald">
            {sides.length}/3
          </span>
        </div>
        <div className="space-y-1.5">
          {SIDE_OPTIONS.map((opt) => (
            <ToggleRow
              key={opt.name}
              label={opt.name}
              blurb="Fresh daily"
              price={opt.priceDeltaCents}
              hue="#166534"
              on={sides.includes(opt.name)}
              onToggle={() => toggleSide(opt.name)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-fusion-red-hot">
          Add-ons & extras
        </h3>
        <div className="space-y-1.5">
          {addonCatalog.map((a) => (
            <ToggleRow
              key={a.key}
              label={a.name}
              blurb={a.group}
              price={a.priceDeltaCents}
              hue={a.group === "Drinks" ? "#b45309" : a.group === "Wings" ? "#dc2626" : "#854d0e"}
              on={addons.includes(a.key)}
              onToggle={() => toggleAddon(a.key)}
            />
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <section className="relative animate-fade-up">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-brush text-lg text-fusion-amber">Jamaican Fusion, Your Way</p>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl">
            Build Your Fusion Bowl
          </h1>
        </div>
        <button
          type="button"
          className="rounded-full border border-fusion-line bg-white/5 px-4 py-2 text-sm font-semibold text-white lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          Customize · {proteins.length}P
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.15fr_0.95fr]">
        {/* LEFT */}
        <aside className="glass-panel order-2 flex flex-col rounded-[28px] p-5 shadow-glass xl:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-fusion-muted">
            Configuration
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTierSafe(n)}
                className={`rounded-2xl border px-3 py-4 text-left transition active:scale-[0.97] ${
                  tier === n
                    ? "border-fusion-gold bg-fusion-gold/10 shadow-glow-gold"
                    : "border-white/10 bg-black/30 hover:border-fusion-amber/30"
                }`}
              >
                <div className="font-display text-sm font-bold uppercase tracking-wide">
                  {n} Protein{n > 1 ? "s" : ""}
                </div>
                <div className="mt-1 font-display text-2xl text-fusion-gold">
                  {formatMoney(n === 1 ? oneProtein.priceCents : twoProtein.priceCents)}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fusion-muted">
              Select base
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BASES.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => {
                    setBase(b.name);
                    bumpBowl();
                  }}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
                    base === b.name
                      ? "bg-fusion-gold text-fusion-void"
                      : "bg-white/5 text-fusion-muted hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {b.name}
                  {b.priceDeltaCents > 0 ? ` +${formatMoney(b.priceDeltaCents)}` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-fusion-line/40 pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fusion-muted">
                  Total
                </p>
                <p
                  key={priceFlash}
                  className="font-display text-4xl font-extrabold text-white animate-price-flash"
                >
                  {formatMoney(totalPrice)}
                </p>
              </div>
              <p className="pb-1 text-xs text-fusion-muted">
                Bowl {formatMoney(bowlPrice)}
                {addonDelta > 0 ? ` + extras` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={addToOrder}
              disabled={proteins.length !== tier}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-fusion-green px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-fusion-emerald disabled:cursor-not-allowed disabled:opacity-40"
            >
              {addedFlash ? "Added ✓" : "Add to Order"}
              <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold normal-case tracking-normal">
                ~{activeItem.prepMinutes} min pickup
              </span>
            </button>
          </div>
        </aside>

        {/* CENTER */}
        <div className="order-1 xl:order-2">
          <div className="glass-panel relative overflow-hidden rounded-[28px] shadow-glass">
            <div className="bowl-canvas relative flex min-h-[360px] items-center justify-center p-6 sm:min-h-[460px]">
              <div
                key={bowlKey}
                className="relative h-56 w-56 animate-bowl-pop sm:h-72 sm:w-72"
              >
                <div className="absolute inset-0 rounded-full border border-fusion-amber/30 bg-gradient-to-b from-zinc-800 to-black shadow-[inset_0_0_60px_rgba(0,0,0,0.65)]" />
                <div className="absolute inset-6 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src="/images/menu-flyer.jpg"
                    alt="Fusion bowl preview"
                    fill
                    className="object-cover object-center opacity-90"
                    sizes="288px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/55 px-3 py-1 text-center backdrop-blur-sm">
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fusion-gold">
                      {tier}P Bowl
                    </p>
                    <p className="text-xs font-semibold text-white">
                      {proteins.join(" + ") || "Pick protein"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="pointer-events-none absolute inset-0">
                {badges.slice(0, 5).map((b, i) => {
                  const positions = [
                    "left-[6%] top-[18%]",
                    "right-[5%] top-[22%]",
                    "left-[8%] bottom-[22%]",
                    "right-[6%] bottom-[18%]",
                    "left-1/2 top-[8%] -translate-x-1/2",
                  ];
                  return (
                    <span
                      key={`${b.label}-${i}-${bowlKey}`}
                      className={`absolute ${positions[i]} animate-badge-in rounded-full border border-fusion-line bg-black/60 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md ${
                        b.tone === "gold" ? "text-fusion-gold" : "text-fusion-emerald"
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {b.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT desktop */}
        <aside className="glass-panel order-3 hidden max-h-[720px] overflow-y-auto rounded-[28px] p-5 shadow-glass xl:block">
          <p className="mb-4 font-brush text-base text-fusion-amber">Toggle your way</p>
          {togglePanel}
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close customizer"
            onClick={() => setSheetOpen(false)}
          />
          <div className="glass-panel absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[28px] p-5 pb-8 shadow-glass animate-fade-up">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                Customize
              </h2>
              <button
                type="button"
                className="text-sm font-semibold text-fusion-gold"
                onClick={() => setSheetOpen(false)}
              >
                Done
              </button>
            </div>
            {togglePanel}
          </div>
        </div>
      )}
    </section>
  );
}
