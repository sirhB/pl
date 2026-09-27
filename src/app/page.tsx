import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src="/images/menu-flyer.jpg"
          alt="Prime Fusion Jamaican fusion bowls"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-palm-fade" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/30" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:justify-center sm:pb-24">
          <div className="max-w-xl animate-fade-up">
            <div className="mb-3 flex items-center gap-2 text-fusion-gold">
              <span className="text-2xl">♛</span>
              <span className="text-xs font-bold uppercase tracking-[0.28em]">
                Food Truck & Catering
              </span>
            </div>
            <h1 className="font-display text-5xl leading-[0.95] text-fusion-yellow sm:text-7xl">
              PRIME
              <br />
              FUSION
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/85">
              Jamaican Fusion, Your Way. Scan. Build your bowl. Pay. We text you when it&apos;s
              ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/order"
                className="rounded-lg bg-fusion-yellow px-6 py-3.5 font-bold text-fusion-black transition hover:bg-white"
              >
                Start ordering
              </Link>
              <Link
                href="/order?station=truck-window"
                className="rounded-lg border border-white/30 bg-black/40 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:border-fusion-gold"
              >
                Truck window QR
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
        {[
          {
            title: "Scan & order",
            body: "QR codes at the truck and picnic tables open dine-in or to-go instantly.",
          },
          {
            title: "Build your bowl",
            body: "1 or 2 proteins, your sides — fusion priced at $15 / $25, plus the full menu.",
          },
          {
            title: "Pay & get texts",
            body: "Stripe checkout, kitchen board, SMS ready alerts, and loyalty points.",
          },
        ].map((f, i) => (
          <div
            key={f.title}
            className="animate-fade-up"
            style={{ animationDelay: `${0.1 * (i + 1)}s` }}
          >
            <h2 className="font-display text-2xl text-fusion-yellow">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fusion-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
