import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="relative overflow-hidden rounded-[32px] bg-fusion-ink text-white shadow-float">
          <div className="absolute inset-0">
            <Image
              src="/images/menu-flyer.jpg"
              alt="Prime Fusion Jamaican fusion bowls"
              fill
              priority
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fusion-ink via-fusion-ink/85 to-fusion-ink/35" />
          </div>
          <div className="relative grid min-h-[78vh] items-end p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-xl animate-fade-up">
              <div className="mb-3 flex items-center gap-2 text-fusion-yellow">
                <span className="text-xl">♛</span>
                <span className="text-xs font-bold uppercase tracking-[0.28em]">
                  Food Truck & Catering
                </span>
              </div>
              <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                Prime
                <span className="text-fusion-green"> Fusion</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-white/80">
                Jamaican Fusion, Your Way. Build your bowl in a smooth flow — scan, customize,
                pay, and we text you when it&apos;s ready.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="rounded-full bg-fusion-green px-6 py-3.5 font-semibold text-white shadow-soft transition hover:bg-fusion-green-dark"
                >
                  Build a bowl
                </Link>
                <Link
                  href="/order?station=truck-window"
                  className="rounded-full bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Truck window QR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-20 sm:grid-cols-3">
        {[
          {
            title: "Smooth builder",
            body: "Size, proteins, and sides with live price — the same flow guests expect from modern ordering apps.",
          },
          {
            title: "Full menu, your way",
            body: "Signature bowls, rasta pasta, wings, and empanadas are all customizable before they hit the cart.",
          },
          {
            title: "Pay & get texts",
            body: "Stripe checkout, kitchen board, SMS ready alerts, and loyalty points on every order.",
          },
        ].map((f, i) => (
          <div
            key={f.title}
            className="rounded-[24px] bg-white p-6 shadow-card animate-fade-up"
            style={{ animationDelay: `${0.08 * (i + 1)}s` }}
          >
            <h2 className="font-display text-2xl text-fusion-ink">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fusion-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
