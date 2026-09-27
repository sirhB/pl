"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { copy } from "@/lib/copy";
import { itemImageBySlug, menuImages, optionImages } from "@/lib/menu-images";
import type { MenuItemDTO } from "@/lib/menu";

type ModGroup = MenuItemDTO["modifierGroups"][number];

export type DealStep = {
  pick: ModGroup;
  extras?: ModGroup;
};

type Props = {
  item: MenuItemDTO;
  onClose: () => void;
  onConfirm: (payload: {
    modifiers: Array<{ groupName: string; optionName: string; priceDeltaCents: number }>;
    unitPriceCents: number;
    label: string;
    notes?: string;
  }) => void;
};

function itemPhoto(item: MenuItemDTO) {
  return item.imageUrl || itemImageBySlug[item.slug] || menuImages.fusionBowl;
}

function optionThumb(name: string) {
  if (optionImages[name]) return optionImages[name];
  if (
    name.includes("Bowl") ||
    name.includes("Oxtail") ||
    name.includes("Salmon") ||
    name.includes("Steak") ||
    name.includes("Fried Rice")
  ) {
    return menuImages.fusionBowl;
  }
  if (name.includes("Empanada")) return menuImages.empanadas;
  if (name.includes("Plantain")) return menuImages.plantains;
  if (name.includes("Mac")) return menuImages.rastaPasta;
  if (
    name.includes("Jerk") ||
    name.includes("Extra") ||
    name.includes("Barbecue") ||
    name.includes("Sauce") ||
    name.includes("Coleslaw") ||
    name.includes("Rice")
  ) {
    return menuImages.jerkChicken;
  }
  return null;
}

/** Build ordered steps: each pick group + its matching "{name} extras" group. */
export function buildDealSteps(item: MenuItemDTO): DealStep[] {
  const extrasByPrefix = new Map<string, ModGroup>();
  const picks: ModGroup[] = [];
  for (const g of item.modifierGroups) {
    if (g.name.endsWith(" extras")) {
      extrasByPrefix.set(g.name.replace(/ extras$/, ""), g);
    } else {
      picks.push(g);
    }
  }
  return picks.map((pick) => ({
    pick,
    extras: extrasByPrefix.get(pick.name),
  }));
}

export function isMultiSlotDeal(item: MenuItemDTO) {
  return (
    item.slug.startsWith("deal-") ||
    item.tags?.includes("deal")
  ) && buildDealSteps(item).length >= 1;
}

export function DealCustomizer({ item, onClose, onConfirm }: Props) {
  const steps = useMemo(() => buildDealSteps(item), [item]);
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>(() => {
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
    return defaults;
  });
  const [notes, setNotes] = useState("");

  const step = steps[stepIdx];
  const totalSteps = steps.length;
  const isLast = stepIdx >= totalSteps - 1;

  function toggleMod(group: ModGroup, optionName: string) {
    setSelectedMods((prev) => {
      const cur = prev[group.id] || [];
      if (cur.includes(optionName)) {
        if (cur.length <= group.minSelect) return prev;
        return { ...prev, [group.id]: cur.filter((n) => n !== optionName) };
      }
      if (group.maxSelect <= 1) return { ...prev, [group.id]: [optionName] };
      if (cur.length >= group.maxSelect) {
        return { ...prev, [group.id]: [...cur.slice(1), optionName] };
      }
      return { ...prev, [group.id]: [...cur, optionName] };
    });
  }

  function stepValid() {
    if (!step) return false;
    const picks = selectedMods[step.pick.id] || [];
    if (step.pick.isRequired && picks.length < step.pick.minSelect) return false;
    return true;
  }

  const runningDelta = useMemo(() => {
    let delta = 0;
    for (const g of item.modifierGroups) {
      for (const name of selectedMods[g.id] || []) {
        delta += g.options.find((o) => o.name === name)?.priceDeltaCents || 0;
      }
    }
    return delta;
  }, [item.modifierGroups, selectedMods]);

  function finish() {
    if (!stepValid()) return;
    const modifiers: Array<{
      groupName: string;
      optionName: string;
      priceDeltaCents: number;
    }> = [];
    let delta = 0;
    const labelParts: string[] = [];

    for (const s of steps) {
      const pickName = (selectedMods[s.pick.id] || [])[0];
      if (pickName) {
        modifiers.push({
          groupName: s.pick.name,
          optionName: pickName,
          priceDeltaCents: 0,
        });
        const extras = s.extras ? selectedMods[s.extras.id] || [] : [];
        const extraBits: string[] = [];
        for (const ex of extras) {
          const opt = s.extras?.options.find((o) => o.name === ex);
          const priceDeltaCents = opt?.priceDeltaCents || 0;
          delta += priceDeltaCents;
          modifiers.push({
            groupName: s.extras!.name,
            optionName: ex,
            priceDeltaCents,
          });
          extraBits.push(ex);
        }
        labelParts.push(
          extraBits.length > 0 ? `${pickName} (${extraBits.join(", ")})` : pickName
        );
      }
    }

    onConfirm({
      modifiers,
      unitPriceCents: item.priceCents + delta,
      label: `${item.name} · ${labelParts.join(" + ")}`,
      notes: notes || undefined,
    });
  }

  function next() {
    if (!stepValid()) return;
    if (isLast) {
      finish();
      return;
    }
    setStepIdx((i) => i + 1);
  }

  function back() {
    if (stepIdx === 0) {
      onClose();
      return;
    }
    setStepIdx((i) => i - 1);
  }

  if (!step) return null;

  const pickSelected = selectedMods[step.pick.id] || [];
  const extrasSelected = step.extras ? selectedMods[step.extras.id] || [] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="glass-panel max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] p-6 shadow-glass animate-fade-up">
        <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[20px]">
          <Image
            src={itemPhoto(item)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div>
              <p className="font-brush text-fusion-amber">{copy.makeItYours}</p>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                {item.name}
              </h3>
            </div>
            <span className="rounded-full bg-fusion-gold px-3 py-1 text-xs font-bold text-fusion-void">
              {stepIdx + 1} of {totalSteps}
            </span>
          </div>
        </div>

        <div className="mb-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= stepIdx ? "bg-fusion-gold" : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fusion-muted">
          {step.pick.name}
        </p>
        <p className="mt-1 text-sm text-fusion-muted">
          Choose this item, then add any extras for it before continuing.
        </p>

        <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1 sm:max-h-56">
          {step.pick.options.map((o) => {
            const on = pickSelected.includes(o.name);
            const thumb = optionThumb(o.name);
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => toggleMod(step.pick, o.name)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition active:scale-[0.97] ${
                    on
                      ? "border-fusion-gold bg-fusion-gold/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  {thumb && (
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                      <Image src={thumb} alt="" fill className="object-cover" sizes="36px" />
                    </span>
                  )}
                  <span className="flex-1 text-sm font-semibold text-white">{o.name}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                      on
                        ? "border-fusion-emerald bg-fusion-green text-white"
                        : "border-white/20 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {step.extras && (
          <div className="mt-5 rounded-2xl border border-fusion-emerald/25 bg-fusion-green/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-fusion-emerald">
              Extras & swaps
            </p>
            <p className="mt-1 text-xs text-fusion-muted">
              Applied only to this {step.pick.name.toLowerCase()} — not the rest of the deal.
            </p>
            <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
              {step.extras.options.map((o) => {
                const on = extrasSelected.includes(o.name);
                const thumb = optionThumb(o.name);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => toggleMod(step.extras!, o.name)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition active:scale-[0.97] ${
                        on
                          ? "border-fusion-emerald/40 bg-fusion-green/15"
                          : "border-white/10 bg-black/20 hover:bg-white/5"
                      }`}
                    >
                      {thumb && (
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                          <Image src={thumb} alt="" fill className="object-cover" sizes="36px" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">{o.name}</span>
                          {o.priceDeltaCents > 0 && (
                            <span className="rounded-full bg-fusion-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fusion-gold">
                              {copy.upgrade}
                            </span>
                          )}
                        </span>
                        {o.priceDeltaCents !== 0 && (
                          <span className="text-xs font-semibold text-fusion-gold">
                            +{formatMoney(o.priceDeltaCents)}
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
        )}

        {isLast && (
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
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            className="rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-fusion-muted hover:text-white"
          >
            {stepIdx === 0 ? copy.close : "Back"}
          </button>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-fusion-gold">
              {formatMoney(item.priceCents + runningDelta)}
            </p>
            {runningDelta > 0 && (
              <p className="text-[11px] text-fusion-muted">
                Deal {formatMoney(item.priceCents)} + extras
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!stepValid()}
          onClick={next}
          className="mt-4 w-full rounded-full bg-fusion-green py-4 font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-40"
        >
          {isLast ? copy.addToCart : `Continue to ${steps[stepIdx + 1]?.pick.name || "next"}`}
        </button>
      </div>
    </div>
  );
}
