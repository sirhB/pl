"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { copy } from "@/lib/copy";
import { itemImageBySlug, menuImages, optionImages } from "@/lib/menu-images";
import type { MenuCategory, MenuItemDTO } from "@/lib/menu";

type Props = {
  categories: MenuCategory[];
};

function itemPhoto(item: MenuItemDTO) {
  return item.imageUrl || itemImageBySlug[item.slug] || menuImages.fusionBowl;
}

export function MenuBrowser({ categories }: Props) {
  const cart = useCart();
  const visible = useMemo(
    () => categories.filter((c) => c.slug !== "build-your-bowl"),
    [categories]
  );
  const [activeSlug, setActiveSlug] = useState(
    visible.find((c) => c.slug === "deals")?.slug ||
      visible.find((c) => c.slug === "signature-bowls")?.slug ||
      visible[0]?.slug
  );
  const [customizing, setCustomizing] = useState<MenuItemDTO | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [flashId, setFlashId] = useState<string | null>(null);

  const active = visible.find((c) => c.slug === activeSlug) || visible[0];

  function openCustomize(item: MenuItemDTO) {
    const defaults: Record<string, string[]> = {};
    for (const g of item.modifierGroups) {
      const def = g.options.filter((o) => o.isDefault).map((o) => o.name);
      defaults[g.id] =
        def.length > 0
          ? def.slice(0, g.maxSelect)
          : g.isRequired
            ? g.options.slice(0, Math.max(g.minSelect, 1)).map((o) => o.name)
            : [];
    }
    setSelectedMods(defaults);
    setNotes("");
    setQty(1);
    setCustomizing(item);
  }

  function toggleMod(groupId: string, optionName: string, maxSelect: number, minSelect: number) {
    setSelectedMods((prev) => {
      const cur = prev[groupId] || [];
      if (cur.includes(optionName)) {
        if (cur.length <= minSelect) return prev;
        return { ...prev, [groupId]: cur.filter((n) => n !== optionName) };
      }
      if (maxSelect <= 1) return { ...prev, [groupId]: [optionName] };
      if (cur.length >= maxSelect) return { ...prev, [groupId]: [...cur.slice(1), optionName] };
      return { ...prev, [groupId]: [...cur, optionName] };
    });
  }

  const previewPrice = useMemo(() => {
    if (!customizing) return 0;
    let delta = 0;
    for (const g of customizing.modifierGroups) {
      for (const name of selectedMods[g.id] || []) {
        delta += g.options.find((o) => o.name === name)?.priceDeltaCents || 0;
      }
    }
    return (customizing.priceCents + delta) * qty;
  }, [customizing, selectedMods, qty]);

  function confirmCustomize() {
    if (!customizing) return;
    for (const g of customizing.modifierGroups) {
      const picks = selectedMods[g.id] || [];
      if (g.isRequired && picks.length < g.minSelect) return;
    }
    const modifiers: Array<{
      groupName: string;
      optionName: string;
      priceDeltaCents: number;
    }> = [];
    let delta = 0;
    const labelParts: string[] = [];
    for (const g of customizing.modifierGroups) {
      const picks = selectedMods[g.id] || [];
      for (const name of picks) {
        const opt = g.options.find((o) => o.name === name);
        const priceDeltaCents = opt?.priceDeltaCents || 0;
        delta += priceDeltaCents;
        modifiers.push({ groupName: g.name, optionName: name, priceDeltaCents });
      }
      if (g.name === "Wing Flavor" && picks.length === 2) {
        labelParts.push(copy.wingHalfLabel(picks[0], picks[1]));
      } else if (picks.length > 0) {
        labelParts.push(...picks);
      }
    }
    const label =
      labelParts.length > 0
        ? `${customizing.name} · ${labelParts.join(", ")}`
        : customizing.name;
    cart.addItem({
      menuItemId: customizing.id,
      name: label,
      unitPriceCents: customizing.priceCents + delta,
      quantity: qty,
      modifiers,
      notes: notes || undefined,
    });
    setFlashId(customizing.id);
    setCustomizing(null);
    setTimeout(() => setFlashId(null), 1200);
  }

  return (
    <section id="menu" className="space-y-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div>
        <p className="font-brush text-lg text-fusion-amber">{copy.streetLine}</p>
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-white">
          {copy.fullMenuTitle}
        </h2>
        <p className="mt-1 text-sm text-fusion-muted">{copy.fullMenuSub}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveSlug(cat.slug)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              active?.slug === cat.slug
                ? "bg-fusion-gold text-fusion-void"
                : "border border-fusion-line/30 bg-white/5 text-fusion-muted hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {active && (
        <div className="grid gap-3 sm:grid-cols-2">
          {active.items
            .filter((i) => !i.isBuildYourOwn)
            .map((item) => (
              <article
                key={item.id}
                className="glass-panel overflow-hidden rounded-[22px] transition hover:border-fusion-amber/40"
              >
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={itemPhoto(item)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-fusion-void/90 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 rounded-full bg-fusion-gold/90 px-3 py-1 text-sm font-bold text-fusion-void">
                    {formatMoney(item.priceCents)}
                  </span>
                </div>
                <div className="flex flex-col justify-between p-5 pt-4">
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-fusion-muted">
                        {item.description}
                      </p>
                    )}
                    {item.modifierGroups.length > 0 && (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-fusion-emerald">
                        {copy.customizable}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openCustomize(item)}
                    className="mt-5 rounded-full border border-fusion-line/50 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-fusion-gold hover:bg-fusion-gold hover:text-fusion-void"
                  >
                    {flashId === item.id
                      ? copy.added
                      : item.modifierGroups.length
                        ? copy.customize
                        : copy.addToCart}
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}

      {customizing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="glass-panel max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] p-6 shadow-glass animate-fade-up">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[20px]">
              <Image
                src={itemPhoto(customizing)}
                alt={customizing.name}
                fill
                className="object-cover"
                sizes="512px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-brush text-fusion-amber">{copy.makeItYours}</p>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  {customizing.name}
                </h3>
                {customizing.description && (
                  <p className="mt-1 text-sm text-fusion-muted">{customizing.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-fusion-muted hover:text-white"
              >
                {copy.close}
              </button>
            </div>

            {(customizing.slug.startsWith("deal-") ||
              customizing.tags?.includes("deal")) && (
              <p className="mt-3 rounded-2xl border border-fusion-gold/20 bg-fusion-gold/10 px-3 py-2 text-xs text-fusion-amber">
                {copy.dealCustomizeHint}
              </p>
            )}

            {customizing.modifierGroups.length > 0 && (
              <div className="mt-6 space-y-5">
                {customizing.modifierGroups.map((g) => {
                  const picks = selectedMods[g.id] || [];
                  const isWingFlavor = g.name === "Wing Flavor";
                  return (
                  <div key={g.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-fusion-muted">
                        {g.name}
                      </p>
                      <span className="text-xs text-fusion-muted">
                        {picks.length} of {g.maxSelect}
                      </span>
                    </div>
                    {isWingFlavor && (
                      <p className="mb-2 text-xs text-fusion-muted">{copy.wingFlavorHint}</p>
                    )}
                    {isWingFlavor && picks.length === 2 && (
                      <p className="mb-2 text-xs font-semibold text-fusion-gold">
                        {copy.wingHalfLabel(picks[0], picks[1])}
                      </p>
                    )}
                    <ul className="space-y-2">
                      {g.options.map((o) => {
                        const on = picks.includes(o.name);
                        const thumb =
                          optionImages[o.name] ||
                          (o.name.includes("Bowl") ||
                          o.name.includes("Oxtail") ||
                          o.name.includes("Salmon") ||
                          o.name.includes("Steak") ||
                          o.name.includes("Fried Rice")
                            ? menuImages.fusionBowl
                            : o.name.includes("Empanada")
                              ? menuImages.empanadas
                              : o.name.includes("Plantain")
                                ? menuImages.plantains
                                : o.name.includes("Mac")
                                  ? menuImages.rastaPasta
                                  : o.name.includes("Jerk") ||
                                      o.name.includes("Extra") ||
                                      o.name.includes("Barbecue") ||
                                      o.name.includes("Mango") ||
                                      o.name.includes("Sweet")
                                    ? menuImages.wings
                                    : null);
                        return (
                          <li key={o.id}>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMod(g.id, o.name, g.maxSelect, g.minSelect)
                              }
                              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.97] ${
                                on
                                  ? "border-fusion-emerald/40 bg-fusion-green/15"
                                  : "border-white/10 hover:bg-white/5"
                              }`}
                            >
                              {thumb && (
                                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                                  <Image
                                    src={thumb}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-white">{o.name}</span>
                                  {o.priceDeltaCents > 0 && (
                                    <span className="rounded-full bg-fusion-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fusion-gold">
                                      {copy.upgrade}
                                    </span>
                                  )}
                                </span>
                                {o.priceDeltaCents !== 0 && (
                                  <span className="text-xs font-semibold text-fusion-gold">
                                    {o.priceDeltaCents > 0 ? "+" : ""}
                                    {formatMoney(o.priceDeltaCents)}
                                  </span>
                                )}
                              </span>
                              <span className="toggle-track" data-on={on ? "true" : "false"}>
                                <span className="toggle-thumb" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  );
                })}
              </div>
            )}

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-fusion-muted">
                {copy.notes}
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.notesPlaceholder}
                className="mt-2 w-full rounded-2xl border border-fusion-line/40 bg-black/40 px-4 py-3 text-sm outline-none focus:border-fusion-gold"
              />
            </label>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white/10 font-bold"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white/10 font-bold"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <div className="font-display text-2xl font-bold text-fusion-gold">
                {formatMoney(previewPrice)}
              </div>
            </div>

            <button
              type="button"
              onClick={confirmCustomize}
              className="mt-5 flex w-full flex-col items-center justify-center gap-1 rounded-full bg-fusion-green px-6 py-4 font-bold uppercase tracking-wide text-white shadow-glow"
            >
              <span>{copy.addToCart}</span>
              <span className="text-[11px] font-semibold normal-case tracking-normal opacity-90">
                {copy.pickupEta(customizing.prepMinutes)}
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
