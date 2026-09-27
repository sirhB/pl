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
  const visible = useMemo(
    () => categories.filter((c) => c.slug !== "build-your-bowl"),
    [categories]
  );
  const [activeSlug, setActiveSlug] = useState(
    visible.find((c) => c.slug === "signature-bowls")?.slug || visible[0]?.slug
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
    for (const g of customizing.modifierGroups) {
      for (const name of selectedMods[g.id] || []) {
        const opt = g.options.find((o) => o.name === name);
        const priceDeltaCents = opt?.priceDeltaCents || 0;
        delta += priceDeltaCents;
        modifiers.push({ groupName: g.name, optionName: name, priceDeltaCents });
      }
    }
    const label =
      modifiers.length > 0
        ? `${customizing.name} · ${modifiers.map((m) => m.optionName).join(", ")}`
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
    <section id="menu" className="space-y-5 animate-fade-up" style={{ animationDelay: "0.12s" }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fusion-green">
            Full menu
          </p>
          <h2 className="font-display text-3xl text-fusion-ink sm:text-4xl">
            Customize anything
          </h2>
          <p className="mt-1 text-sm text-fusion-muted">
            Signature bowls, pasta, wings, empanadas — tap to make it yours.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveSlug(cat.slug)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              active?.slug === cat.slug
                ? "bg-fusion-ink text-white shadow-soft"
                : "bg-white text-fusion-muted shadow-card hover:text-fusion-ink"
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
                className="flex flex-col justify-between rounded-[22px] bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl leading-snug text-fusion-ink">
                      {item.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-fusion-mist px-3 py-1 text-sm font-bold text-fusion-ink">
                      {formatMoney(item.priceCents)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-fusion-muted">
                      {item.description}
                    </p>
                  )}
                  {item.modifierGroups.length > 0 && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-fusion-green">
                      Customizable
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openCustomize(item)}
                  className="mt-5 rounded-full bg-fusion-mist px-4 py-2.5 text-sm font-semibold text-fusion-ink transition hover:bg-fusion-green hover:text-white"
                >
                  {flashId === item.id
                    ? "Added ✓"
                    : item.modifierGroups.length
                      ? "Customize"
                      : "Add to cart"}
                </button>
              </article>
            ))}
        </div>
      )}

      {customizing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-fusion-ink/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-float animate-pop">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fusion-green">
                  Make it yours
                </p>
                <h3 className="font-display text-2xl text-fusion-ink">{customizing.name}</h3>
                {customizing.description && (
                  <p className="mt-1 text-sm text-fusion-muted">{customizing.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(null)}
                className="rounded-full bg-fusion-mist px-3 py-1 text-sm font-semibold text-fusion-muted hover:text-fusion-ink"
              >
                Close
              </button>
            </div>

            {customizing.modifierGroups.length === 0 ? (
              <p className="mt-6 text-sm text-fusion-muted">
                No extras on this item — add as-is or leave a note.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {customizing.modifierGroups.map((g) => (
                  <div key={g.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fusion-muted">
                        {g.name}
                        {g.isRequired ? " · required" : ""}
                      </p>
                      <span className="text-xs text-fusion-muted">
                        {(selectedMods[g.id] || []).length} / {g.maxSelect}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {g.options.map((o) => {
                        const on = (selectedMods[g.id] || []).includes(o.name);
                        return (
                          <li key={o.id}>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMod(g.id, o.name, g.maxSelect, g.minSelect)
                              }
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                on
                                  ? "border-fusion-green/35 bg-fusion-green/5"
                                  : "border-fusion-line hover:bg-fusion-mist"
                              }`}
                            >
                              <span>
                                <span className="block font-semibold text-fusion-ink">
                                  {o.name}
                                </span>
                                {o.priceDeltaCents !== 0 && (
                                  <span className="text-xs text-fusion-muted">
                                    {o.priceDeltaCents > 0 ? "+" : ""}
                                    {formatMoney(o.priceDeltaCents)}
                                  </span>
                                )}
                              </span>
                              <span
                                className="toggle-track"
                                data-on={on ? "true" : "false"}
                              >
                                <span className="toggle-thumb" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fusion-muted">
                Notes
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, extra sauce…"
                className="mt-2 w-full rounded-2xl border border-fusion-line bg-fusion-mist/40 px-4 py-3 text-sm outline-none focus:border-fusion-green focus:bg-white"
              />
            </label>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-full bg-fusion-mist p-1">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white font-bold shadow-card"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{qty}</span>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-white font-bold shadow-card"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <div className="font-display text-2xl text-fusion-ink">
                {formatMoney(previewPrice)}
              </div>
            </div>

            <button
              type="button"
              onClick={confirmCustomize}
              className="mt-5 flex w-full items-center justify-between rounded-full bg-fusion-green px-6 py-4 font-semibold text-white shadow-soft hover:bg-fusion-green-dark"
            >
              <span>Add to cart</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                ~{customizing.prepMinutes} min
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
