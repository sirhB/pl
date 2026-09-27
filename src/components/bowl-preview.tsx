"use client";

import Image from "next/image";
import { copy } from "@/lib/copy";
import { menuImages, optionImages, proteinImages } from "@/lib/menu-images";

type Props = {
  bowlKey: number;
  tier: 1 | 2;
  base: string;
  proteins: string[];
  sides: string[];
};

function displayProteinName(name: string) {
  if (name === "BBQ Fried Chicken") return "Barbecue Fried Chicken";
  return name;
}

function proteinSrc(name: string) {
  return proteinImages[name] || proteinImages[displayProteinName(name)] || menuImages.fusionBowl;
}

const SIDE_CHIP_POS = [
  "left-[8%] bottom-[14%]",
  "right-[6%] bottom-[18%]",
  "left-[18%] top-[12%]",
];

export function BowlPreview({ bowlKey, tier, base, proteins, sides }: Props) {
  const baseSrc = optionImages[base] || menuImages.ricePeas;
  const garnishSides = sides.filter((s) => s !== base).slice(0, 3);

  return (
    <div className="bowl-canvas relative flex min-h-[360px] items-center justify-center p-6 sm:min-h-[460px]">
      <div
        key={bowlKey}
        className="relative h-56 w-56 animate-bowl-pop sm:h-72 sm:w-72"
      >
        {/* Vessel */}
        <div className="absolute inset-0 rounded-full border border-fusion-amber/35 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black shadow-[inset_0_0_60px_rgba(0,0,0,0.7),0_12px_40px_rgba(0,0,0,0.55)]" />
        <div className="absolute inset-[10%] overflow-hidden rounded-full border border-white/10 bg-black">
          {/* Base floor */}
          <div
            key={`base-${base}`}
            className="absolute inset-0 animate-layer-crossfade"
          >
            <Image
              src={baseSrc}
              alt={base}
              fill
              className="object-cover object-center opacity-95"
              sizes="288px"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

          {/* Protein layers */}
          {proteins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-fusion-muted backdrop-blur-sm">
                {copy.pickProtein}
              </p>
            </div>
          )}

          {proteins.length === 1 && (
            <div
              key={`p-single-${proteins[0]}-${bowlKey}`}
              className="absolute inset-[12%] overflow-hidden rounded-full shadow-lg animate-ingredient-drop"
              style={{ animationDelay: "0.05s" }}
            >
              <Image
                src={proteinSrc(proteins[0])}
                alt={displayProteinName(proteins[0])}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          )}

          {proteins.length >= 2 && (
            <>
              <div
                key={`p-left-${proteins[0]}-${bowlKey}`}
                className="absolute left-[6%] top-[18%] h-[58%] w-[48%] overflow-hidden rounded-[40%] border border-white/15 shadow-lg animate-ingredient-drop"
                style={{ animationDelay: "0.05s" }}
              >
                <Image
                  src={proteinSrc(proteins[0])}
                  alt={displayProteinName(proteins[0])}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <div
                key={`p-right-${proteins[1]}-${bowlKey}`}
                className="absolute right-[6%] top-[22%] h-[58%] w-[48%] overflow-hidden rounded-[40%] border border-white/15 shadow-lg animate-ingredient-drop"
                style={{ animationDelay: "0.14s" }}
              >
                <Image
                  src={proteinSrc(proteins[1])}
                  alt={displayProteinName(proteins[1])}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
            </>
          )}

          {/* Side garnish chips along the rim */}
          {garnishSides.map((side, i) => (
            <div
              key={`side-${side}-${bowlKey}`}
              className={`absolute ${SIDE_CHIP_POS[i] || SIDE_CHIP_POS[0]} h-12 w-12 overflow-hidden rounded-full border-2 border-fusion-amber/40 shadow-glow-gold animate-ingredient-drop sm:h-14 sm:w-14`}
              style={{ animationDelay: `${0.2 + i * 0.08}s` }}
            >
              <Image
                src={optionImages[side] || menuImages.plantains}
                alt={side}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ))}
        </div>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] flex justify-center px-4">
          <div className="max-w-[85%] rounded-full bg-black/65 px-4 py-2 text-center backdrop-blur-md animate-badge-in">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-fusion-gold">
              {tier === 1 ? copy.oneProteinBowl : copy.twoProteinBowl}
            </p>
            <p className="truncate text-xs font-semibold text-white">
              {proteins.map(displayProteinName).join(" + ") || copy.pickProtein}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-fusion-muted">{base}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
