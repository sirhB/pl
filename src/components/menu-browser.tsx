"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { MenuCategory, MenuItemDTO } from "@/lib/menu";

type Props = {
  categories: MenuCategory[];
};

export function MenuBrowser({ categories }: Props) {
  const cart = useCart();
  const [activeSlug, setActiveSlug] = useState(
    categories.find((c) => c.slug === "signature-bowls")?.slug || categories[0]?.slug
  );
  const [customizing, setCustomizing] = useState<MenuItemDTO | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>({});
  const [flashId, setFlashId] = useState<string | null>(null);

  const visible = useMemo(
    () => categories.filter((c) => !["build-your-bowl"].includes(c.slug)),
    [categories]
  );
  const active = visible.find((c) => c.slug === activeSlug) || visible[0];

  function openCustomize(item: MenuItemDTO) {
    if (!item.modifierGroups.length) {
      addSimple(item);
      return;
    }
    const defaults: Record<string, string[]> = {};
    for (const g of item.modifierGroups) {
      const def = g.options.filter((o) => o.isDefault).map((o) => o.name);
      defaults[g.id] = def.length ? def.slice(0, g.maxSelect) : [];
    }
    setSelectedMods(defaults);
    setCustomizing(item);
  }

  function toggleMod(groupId: string, optionName: string, maxSelect: number) {
    setSelectedMods((prev) => {
      const cur = prev[groupId] || [];
      if (cur.includes(optionName)) {
        return { ...prev, [groupId]: cur.filter((n) => n !== optionName) };
      }
      if (maxSelect <= 1) return { ...prev, [groupId]: [optionName] };
      if (cur.length >= maxSelect) return { ...prev, [groupId]: [...cur.slice(1), optionName] };
      return { ...prev, [groupId]: [...cur, optionName] };
    });
  }

  function addSimple(item: MenuItemDTO) {
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      unitPriceCents: item.priceCents,
      quantity: 1,
      modifiers: [],
    });
    setFlashId(item.id);
    setTimeout(() => setFlashId(null), 1200);
  }

  function confirmCustomize() {
    if (!customizing) return;
    const modifiers: Array<{
      groupName: string;
      optionName: string;
      priceDeltaCents: number;
    }> = [];
    let delta = 0;
    for (const g of customizing.modifierGroups) {
      const picks = selectedMods[g.id] || [];
      if (g.isRequired && picks.length < g.minSelect) return;
      for (const name of picks) {
        const opt = g.options.find((o) => o.name === name);
        const priceDeltaCents = opt?.priceDeltaCents || 0;
        delta += priceDeltaCents;
        modifiers.push({ groupName: g.name, optionName: name, priceDeltaCents });
      }
    }
    cart.addItem({
      menuItemId: customizing.id,
      name:
        modifiers.length > 0
          ? `${customizing.name} · ${modifiers.map((m) => m.optionName).join(", ")}`
          : customizing.name,
      unitPriceCents: customizing.priceCents + delta,
      quantity: 1,
      modifiers,
    });
    setFlashId(customizing.id);
    setCustomizing(null);
    setTimeout(() => setFlashId(null), 1200);
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fusion-gold">
          Full menu
        </p>
        <h2 className="font-display text-3xl text-white">Order the favorites</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveSlug(cat.slug)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              active?.slug === cat.slug
                ? "bg-fusion-yellow text-fusion-black"
                : "bg-white/5 text-white hover:bg-white/10"
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
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/35 p-4 transition hover:border-fusion-gold/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl text-white">{item.name}</h3>
                    <span className="shrink-0 font-semibold text-fusion-yellow">
                      {formatMoney(item.priceCents)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-fusion-muted">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openCustomize(item)}
                  className="mt-4 rounded-lg border border-fusion-gold/40 bg-fusion-gold/10 px-3 py-2 text-sm font-semibold text-fusion-yellow transition hover:bg-fusion-yellow hover:text-fusion-black"
                >
                  {flashId === item.id
                    ? "Added ✓"
                    : item.modifierGroups.length
                      ? "Customize & add"
                      : "Add to order"}
                </button>
              </article>
            ))}
        </div>
      )}

      {customizing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-fusion-charcoal p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl text-white">{customizing.name}</h3>
                <p className="text-fusion-yellow">{formatMoney(customizing.priceCents)}</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(null)}
                className="text-fusion-muted hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {customizing.modifierGroups.map((g) => (
                <div key={g.id}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fusion-muted">
                    {g.name}
                    {g.isRequired ? " · required" : ""} · pick up to {g.maxSelect}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((o) => {
                      const on = (selectedMods[g.id] || []).includes(o.name);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => toggleMod(g.id, o.name, g.maxSelect)}
                          className={`rounded-full px-3 py-1.5 text-sm ${
                            on
                              ? "bg-fusion-green text-white"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {o.name}
                          {o.priceDeltaCents > 0
                            ? ` (+${formatMoney(o.priceDeltaCents)})`
                            : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={confirmCustomize}
              className="mt-6 w-full rounded-lg bg-fusion-yellow py-3 font-semibold text-fusion-black"
            >
              Add to order
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
