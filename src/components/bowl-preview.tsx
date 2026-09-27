"use client";

import Image from "next/image";
import { copy } from "@/lib/copy";
import { menuImages } from "@/lib/menu-images";

type Props = {
  bowlKey: number;
};

/** Static marketing bowl photo — soft settle when selections change. */
export function BowlPreview({ bowlKey }: Props) {
  return (
    <div className="bowl-canvas relative flex min-h-[360px] items-center justify-center p-6 sm:min-h-[460px]">
      <div
        key={bowlKey}
        className="relative h-56 w-56 overflow-hidden rounded-full border border-fusion-amber/35 shadow-[0_12px_40px_rgba(0,0,0,0.55)] animate-bowl-pop sm:h-72 sm:w-72"
      >
        <Image
          src={menuImages.fusionBowl}
          alt="Prime Fusion bowl"
          fill
          className="object-cover object-center"
          sizes="288px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-3">
          <p className="rounded-full bg-black/60 px-3 py-1.5 font-brush text-sm text-fusion-amber backdrop-blur-sm">
            {copy.brandTag}
          </p>
        </div>
      </div>
    </div>
  );
}
