import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="relative min-h-[82vh] overflow-hidden rounded-[32px] border border-fusion-line/30 shadow-glass">
          <Image
            src="/images/menu-flyer.jpg"
            alt="Prime Fusion Jamaican fusion bowls"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fusion-void via-fusion-void/85 to-fusion-void/25" />
          <div className="relative flex min-h-[82vh] flex-col justify-end p-8 sm:justify-center sm:p-12">
            <div className="max-w-xl animate-fade-up">
              <div className="mb-3 flex items-center gap-2 text-fusion-gold">
                <span className="text-2xl">♛</span>
                <span className="text-xs font-bold uppercase tracking-[0.28em]">
                  Food Truck & Catering
                </span>
              </div>
              <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-wide text-white sm:text-7xl">
                Prime
                <br />
                <span className="text-fusion-gold">Fusion</span>
              </h1>
              <p className="mt-3 font-brush text-xl text-fusion-amber">
                Jamaican Fusion, Your Way
              </p>
              <p className="mt-4 max-w-md text-base text-white/75">
                Build your bowl on a dark luxury customizer — tier, base, proteins, sides, and
                extras with live pricing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="rounded-full bg-fusion-green px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-glow transition hover:bg-fusion-emerald"
                >
                  Build a bowl
                </Link>
                <Link
                  href="/order?station=truck-window"
                  className="rounded-full border border-fusion-line bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-fusion-gold"
                >
                  Truck window QR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
