import Link from "next/link";
import Image from "next/image";
import { copy } from "@/lib/copy";
import { menuImages } from "@/lib/menu-images";

export default function HomePage() {
  return (
    <div>
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="relative min-h-[88vh] overflow-hidden rounded-[32px] border border-fusion-line/30 shadow-glass">
          <Image
            src={menuImages.hero}
            alt="Prime Fusion Jamaican fusion bowl"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fusion-void via-fusion-void/80 to-fusion-void/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-fusion-void/70 via-transparent to-black/25" />
          <div className="relative flex min-h-[88vh] flex-col justify-end p-8 sm:justify-center sm:p-12 lg:p-16">
            <div className="max-w-xl animate-fade-up">
              <div className="mb-3 flex items-center gap-2 text-fusion-gold">
                <span className="text-2xl">♛</span>
                <span className="text-xs font-bold uppercase tracking-[0.28em]">
                  {copy.foodTruckLine}
                </span>
              </div>
              <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-wide text-white sm:text-7xl">
                Prime
                <br />
                <span className="text-fusion-gold">Fusion</span>
              </h1>
              <p className="mt-3 font-brush text-xl text-fusion-amber sm:text-2xl">
                {copy.brandTag}
              </p>
              <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
                {copy.homeSupport}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="rounded-full bg-fusion-green px-7 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-fusion-emerald"
                >
                  {copy.homeCta}
                </Link>
                <Link
                  href="/order?station=truck-window"
                  className="rounded-full border border-white/25 bg-black/30 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition hover:border-fusion-gold"
                >
                  {copy.homeQr}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
