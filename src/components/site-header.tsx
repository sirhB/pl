"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";
import { copy } from "@/lib/copy";

const links = [
  { href: "/order", label: copy.navBuild },
  { href: "/order#menu", label: copy.navMenu },
  { href: "/rewards", label: copy.navRewards },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const ops = pathname?.startsWith("/admin") || pathname?.startsWith("/kitchen");

  if (ops) {
    return (
      <header className="border-b border-fusion-line/30 bg-fusion-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-display text-sm font-bold uppercase tracking-widest text-fusion-gold">
            ♛ Prime Fusion
          </Link>
          <nav className="flex gap-4 text-sm text-fusion-muted">
            <Link href="/order" className="hover:text-white">
              {copy.guestOrder}
            </Link>
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
            <Link href="/kitchen" className="hover:text-white">
              Kitchen
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-fusion-line/30 bg-fusion-void/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-fusion-gold">♛</span>
          <span className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white sm:text-base">
            Prime <span className="text-fusion-gold">Fusion</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-fusion-line/40 bg-white/5 p-1 text-sm font-semibold md:flex">
          {links.map((l) => {
            const active = l.href === "/order" && pathname?.startsWith("/order");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-fusion-gold text-fusion-void"
                    : "text-fusion-muted hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/checkout"
          className="rounded-full border border-fusion-amber/40 bg-fusion-gold/10 px-4 py-2 text-sm font-bold text-fusion-gold transition hover:bg-fusion-gold hover:text-fusion-void"
        >
          {copy.cart}
          {cart.itemCount
            ? ` ${formatMoney(cart.subtotalCents)} (${cart.itemCount})`
            : ""}
        </Link>
      </div>
    </header>
  );
}
