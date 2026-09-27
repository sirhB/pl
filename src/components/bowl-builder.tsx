"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { MenuItemDTO } from "@/lib/menu";

type Props = {
  oneProtein: MenuItemDTO;
  twoProtein: MenuItemDTO;
  guestName?: string;
  onAdded?: () => void;
};

const PROTEIN_META: Record<string, { blurb: string; hue: string; emoji: string }> = {
  Oxtails: { blurb: "Slow-braised, rich", hue: "#5c3d2e", emoji: "🍲" },
  Salmon: { blurb: "Mango-glazed", hue: "#e07a5f", emoji: "🐟" },
  "BBQ Fried Chicken": { blurb: "Crispy & sauced", hue: "#d4a017", emoji: "🍗" },
  "Jerk Pork": { blurb: "Smoky island heat", hue: "#9b2226", emoji: "🌶️" },
  "Jerk Chicken": { blurb: "Charred classic", hue: "#1faa4a", emoji: "🔥" },
};

const SIDE_META: Record<string, { blurb: string; hue: string }> = {
  "Rice & Peas": { blurb: "Coconut rice staple", hue: "#2d6a4f" },
  "Jamaican Coleslaw": { blurb: "Bright & crisp", hue: "#95d5b2" },
  "Rasta Pasta": { blurb: "Creamy Caribbean", hue: "#c1121f" },
};

export function BowlBuilder({ oneProtein, twoProtein, guestName, onAdded }: Props) {
  const cart = useCart();
  const [proteinCount, setProteinCount] = useState<1 | 2>(1);
  const [proteins, setProteins] = useState<string[]>(["Jerk Chicken"]);
  const [sides, setSides] = useState<string[]>(["Rice & Peas", "Jamaican Coleslaw"]);
  const [notes, setNotes] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);
  const [panel, setPanel] = useState<"proteins" | "sides">("proteins");

  const activeItem = proteinCount === 1 ? oneProtein : twoProtein;
  const proteinGroup = activeItem.modifierGroups.find((g) => g.name === "Proteins");
  const sideGroup = activeItem.modifierGroups.find((g) => g.name === "Sides");
  const maxProteins = proteinCount;
  const maxSides = sideGroup?.maxSelect ?? 3;

  const sideDelta = useMemo(() => {
    if (!sideGroup) return 0;
    return sides.reduce((sum, name) => {
      const opt = sideGroup.options.find((o) => o.name === name);
      return sum + (opt?.priceDeltaCents || 0);
    }, 0);
  }, [sides, sideGroup]);

  const unitPrice = activeItem.priceCents + sideDelta;
  const ready =
    proteins.length === maxProteins && sides.length >= (sideGroup?.minSelect || 1);

  function setSize(n: 1 | 2) {
    setProteinCount(n);
    setProteins((prev) => prev.slice(0, n));
    setPanel("proteins");
  }

  function toggleProtein(name: string) {
    setProteins((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev;
        return prev.filter((p) => p !== name);
      }
      if (maxProteins === 1) return [name];
      if (prev.length >= maxProteins) return [...prev.slice(1), name];
      return [...prev, name];
    });
  }

  function toggleSide(name: string) {
    setSides((prev) => {
      if (prev.includes(name)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== name);
      }
      if (prev.length >= maxSides) return [...prev.slice(1), name];
      return [...prev, name];
    });
  }

  function addToCart() {
    if (!ready) return;
    const modifiers = [
      ...proteins.map((p) => ({ groupName: "Proteins", optionName: p, priceDeltaCents: 0 })),
      ...sides.map((s) => {
        const opt = sideGroup?.options.find((o) => o.name === s);
        return {
          groupName: "Sides",
          optionName: s,
          priceDeltaCents: opt?.priceDeltaCents || 0,
        };
      }),
    ];
    cart.addItem({
      menuItemId: activeItem.id,
      name: `${proteinCount} Protein Bowl · ${proteins.join(" + ")}`,
      unitPriceCents: unitPrice,
      quantity: 1,
      modifiers,
      notes: notes || undefined,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1600);
    onAdded?.();
  }

  const hello = guestName ? `Hello, ${guestName}` : "Jamaican Fusion, Your Way";

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white shadow-float animate-fade-up">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left: guided workflow */}
        <div className="relative z-10 flex flex-col p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-semibold text-fusion-green">{hello}</p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-fusion-ink sm:text-4xl lg:text-[2.6rem]">
            What kind of bowl
            <br />
            do you want today?
          </h1>

          {/* Size */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fusion-muted">
              Select size
            </p>
            <div className="mt-3 flex gap-3">
              {([1, 2] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSize(n)}
                  className={`flex h-14 min-w-[4.5rem] flex-col items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${
                    proteinCount === n
                      ? "bg-fusion-ink text-white shadow-soft"
                      : "bg-fusion-mist text-fusion-muted hover:bg-fusion-line"
                  }`}
                >
                  <span className="text-lg leading-none">{n === 1 ? "1P" : "2P"}</span>
                  <span className="mt-0.5 text-[10px] opacity-80">
                    {formatMoney(n === 1 ? oneProtein.priceCents : twoProtein.priceCents)}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-fusion-muted">
              {proteinCount === 1
                ? "One hero protein + your sides"
                : "Double protein — full fusion"}
            </p>
          </div>

          {/* Step chips */}
          <div className="mt-7 flex gap-2">
            {(
              [
                { id: "proteins" as const, label: "Proteins", count: `${proteins.length}/${maxProteins}` },
                { id: "sides" as const, label: "Sides", count: `${sides.length}/${maxSides}` },
              ]
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPanel(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  panel === s.id
                    ? "bg-fusion-green text-white"
                    : "bg-fusion-mist text-fusion-ink hover:bg-fusion-line"
                }`}
              >
                {s.label}
                <span className="ml-2 opacity-70">{s.count}</span>
              </button>
            ))}
          </div>

          {/* Compact selected summary on left for mobile flow continuity */}
          <div className="mt-6 space-y-2 lg:hidden">
            {(panel === "proteins" ? proteinGroup?.options : sideGroup?.options)?.map((opt) => {
              const on =
                panel === "proteins"
                  ? proteins.includes(opt.name)
                  : sides.includes(opt.name);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    panel === "proteins" ? toggleProtein(opt.name) : toggleSide(opt.name)
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    on
                      ? "border-fusion-green/40 bg-fusion-green/5"
                      : "border-fusion-line bg-fusion-mist/60"
                  }`}
                >
                  <span className="font-semibold">{opt.name}</span>
                  <span
                    className="toggle-track"
                    data-on={on ? "true" : "false"}
                    aria-hidden
                  >
                    <span className="toggle-thumb" />
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-6 block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fusion-muted">
              Special requests
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="No coleslaw, extra jerk…"
              className="mt-2 w-full rounded-2xl border border-fusion-line bg-fusion-mist/50 px-4 py-3 text-sm outline-none transition focus:border-fusion-green focus:bg-white"
            />
          </label>

          <div className="mt-auto pt-8">
            <div className="mb-3 font-display text-4xl text-fusion-ink">
              {formatMoney(unitPrice)}
            </div>
            <button
              type="button"
              disabled={!ready}
              onClick={addToCart}
              className="flex w-full items-center justify-between rounded-full bg-fusion-green px-6 py-4 text-left font-semibold text-white shadow-soft transition hover:bg-fusion-green-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{addedFlash ? "Added to cart ✓" : "Add to cart"}</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                ~{activeItem.prepMinutes} min
              </span>
            </button>
            {!ready && (
              <p className="mt-2 text-xs text-fusion-muted">
                Pick {maxProteins} protein{maxProteins > 1 ? "s" : ""} and at least one side.
              </p>
            )}
          </div>
        </div>

        {/* Right: visual selector panel */}
        <div className="relative hidden min-h-[560px] bg-fusion-mist/70 p-6 lg:block lg:p-8">
          <div className="relative z-10 rounded-[24px] bg-white p-5 shadow-card animate-slide-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-fusion-ink">
                {panel === "proteins" ? "Select protein:" : "Select sides:"}
              </h2>
              <span className="rounded-full bg-fusion-mist px-3 py-1 text-xs font-semibold text-fusion-muted">
                {panel === "proteins"
                  ? `${proteins.length} added`
                  : `${sides.length} added`}
              </span>
            </div>

            <ul className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {panel === "proteins" &&
                (proteinGroup?.options || []).map((opt, i) => {
                  const on = proteins.includes(opt.name);
                  const meta = PROTEIN_META[opt.name];
                  return (
                    <li key={opt.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-fade-up">
                      <button
                        type="button"
                        onClick={() => toggleProtein(opt.name)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          on
                            ? "border-fusion-green/30 bg-fusion-green/5"
                            : "border-transparent hover:bg-fusion-mist"
                        }`}
                      >
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-soft"
                          style={{ background: meta?.hue || "#ddd", color: "#fff" }}
                        >
                          {meta?.emoji || "•"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-fusion-ink">{opt.name}</span>
                          <span className="block text-xs text-fusion-muted">
                            {meta?.blurb || "Prime Fusion protein"}
                          </span>
                        </span>
                        <span className="toggle-track" data-on={on ? "true" : "false"}>
                          <span className="toggle-thumb" />
                        </span>
                      </button>
                    </li>
                  );
                })}

              {panel === "sides" &&
                (sideGroup?.options || []).map((opt, i) => {
                  const on = sides.includes(opt.name);
                  const meta = SIDE_META[opt.name];
                  return (
                    <li key={opt.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-fade-up">
                      <button
                        type="button"
                        onClick={() => toggleSide(opt.name)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          on
                            ? "border-fusion-green/30 bg-fusion-green/5"
                            : "border-transparent hover:bg-fusion-mist"
                        }`}
                      >
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-soft"
                          style={{ background: meta?.hue || "#888" }}
                        >
                          {opt.name.slice(0, 1)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-fusion-ink">{opt.name}</span>
                          <span className="block text-xs text-fusion-muted">
                            {meta?.blurb || "Side"}
                            {opt.priceDeltaCents > 0
                              ? ` · +${formatMoney(opt.priceDeltaCents)}`
                              : ""}
                          </span>
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] overflow-hidden">
            <Image
              src="/images/menu-flyer.jpg"
              alt="Prime Fusion bowl"
              fill
              className="object-cover object-top opacity-95"
              sizes="(max-width: 1024px) 0px, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fusion-mist via-fusion-mist/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
