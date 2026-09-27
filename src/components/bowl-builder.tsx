"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { MenuItemDTO } from "@/lib/menu";

type Props = {
  oneProtein: MenuItemDTO;
  twoProtein: MenuItemDTO;
  onAdded?: () => void;
};

const PROTEIN_BLURBS: Record<string, string> = {
  Oxtails: "Slow-braised, fall-off-the-bone",
  Salmon: "Mango-kissed & grilled",
  "BBQ Fried Chicken": "Crispy, sauced, loud",
  "Jerk Pork": "Smoky island heat",
  "Jerk Chicken": "Charred & classic",
};

export function BowlBuilder({ oneProtein, twoProtein, onAdded }: Props) {
  const cart = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [proteinCount, setProteinCount] = useState<1 | 2>(1);
  const [proteins, setProteins] = useState<string[]>([]);
  const [sides, setSides] = useState<string[]>(["Rice & Peas"]);
  const [notes, setNotes] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);

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

  function toggleProtein(name: string) {
    setProteins((prev) => {
      if (prev.includes(name)) return prev.filter((p) => p !== name);
      if (prev.length >= maxProteins) {
        return [...prev.slice(1), name];
      }
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

  function canContinueStep2() {
    return proteins.length === maxProteins;
  }

  function addToCart() {
    if (!canContinueStep2() || sides.length < 1) return;
    const modifiers = [
      ...proteins.map((p) => ({
        groupName: "Proteins",
        optionName: p,
        priceDeltaCents: 0,
      })),
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
    setStep(1);
    setProteins([]);
    setSides(["Rice & Peas"]);
    setNotes("");
    onAdded?.();
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-fusion-gold/30 bg-fusion-charcoal/80 shadow-[0_0_0_1px_rgba(212,160,23,0.08)]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(245,197,24,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(31,138,59,0.2), transparent 35%)",
        }}
      />
      <div className="relative p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fusion-gold">
              Jamaican Fusion, Your Way
            </p>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              Build Your Fusion Bowl
            </h2>
            <p className="mt-1 max-w-xl text-sm text-fusion-muted">
              Pick your proteins and sides. One bowl, big flavor.
            </p>
          </div>
          <div className="rounded-lg bg-fusion-yellow px-4 py-2 text-center text-fusion-black">
            <div className="text-[10px] font-bold uppercase tracking-wider">Your bowl</div>
            <div className="font-display text-2xl leading-none">{formatMoney(unitPrice)}</div>
          </div>
        </div>

        {/* Steps */}
        <ol className="mb-6 flex gap-2">
          {[
            { n: 1, label: "Size" },
            { n: 2, label: "Protein" },
            { n: 3, label: "Sides" },
          ].map((s) => (
            <li
              key={s.n}
              className={`flex flex-1 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                step === s.n
                  ? "bg-fusion-yellow text-fusion-black"
                  : step > s.n
                    ? "bg-fusion-green/30 text-white"
                    : "bg-white/5 text-fusion-muted"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-[11px]">
                {s.n}
              </span>
              {s.label}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setProteinCount(n);
                  setProteins([]);
                }}
                className={`group relative overflow-hidden rounded-xl border p-5 text-left transition ${
                  proteinCount === n
                    ? "border-fusion-yellow bg-fusion-yellow/10"
                    : "border-white/10 bg-black/30 hover:border-fusion-gold/50"
                }`}
              >
                <div className="font-display text-2xl text-white">
                  {n} Protein Bowl
                </div>
                <div className="mt-1 text-fusion-yellow">
                  {formatMoney(n === 1 ? oneProtein.priceCents : twoProtein.priceCents)}
                </div>
                <p className="mt-2 text-sm text-fusion-muted">
                  {n === 1
                    ? "One hero protein + your sides."
                    : "Double up — two proteins, same bowl."}
                </p>
              </button>
            ))}
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg bg-fusion-yellow px-6 py-3 font-semibold text-fusion-black transition hover:bg-white"
              >
                Choose protein{proteinCount === 2 ? "s" : ""} →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm text-fusion-muted">
              Select {maxProteins} protein{maxProteins > 1 ? "s" : ""} ({proteins.length}/
              {maxProteins})
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(proteinGroup?.options || []).map((opt) => {
                const selected = proteins.includes(opt.name);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleProtein(opt.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-fusion-green bg-fusion-green/20"
                        : "border-white/10 bg-black/40 hover:border-fusion-gold/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-lg text-white">{opt.name}</span>
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          selected
                            ? "border-fusion-green bg-fusion-green"
                            : "border-white/30"
                        }`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-fusion-muted">
                      {PROTEIN_BLURBS[opt.name] || "Prime Fusion protein"}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-white/20 px-4 py-3 text-sm text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!canContinueStep2()}
                onClick={() => setStep(3)}
                className="rounded-lg bg-fusion-yellow px-6 py-3 font-semibold text-fusion-black disabled:opacity-40"
              >
                Choose sides →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm text-fusion-muted">
              Pick up to {maxSides} sides ({sides.length}/{maxSides})
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(sideGroup?.options || []).map((opt) => {
                const selected = sides.includes(opt.name);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSide(opt.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-fusion-gold bg-fusion-gold/15"
                        : "border-white/10 bg-black/40 hover:border-white/25"
                    }`}
                  >
                    <div className="font-display text-lg text-white">{opt.name}</div>
                    {opt.priceDeltaCents > 0 && (
                      <div className="text-xs text-fusion-yellow">
                        +{formatMoney(opt.priceDeltaCents)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <label className="mt-4 block">
              <span className="text-xs uppercase tracking-wide text-fusion-muted">
                Special requests
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="No coleslaw, extra spice…"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-fusion-gold"
              />
            </label>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-white/20 px-4 py-3 text-sm text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={addToCart}
                className="rounded-lg bg-fusion-red px-6 py-3 font-semibold text-white shadow-lg shadow-fusion-red/20 transition hover:bg-red-700"
              >
                {addedFlash ? "Added to order ✓" : `Add bowl · ${formatMoney(unitPrice)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
