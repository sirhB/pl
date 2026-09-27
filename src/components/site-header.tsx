"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";

const links = [
  { href: "/order", label: "Build bowl" },
  { href: "/order#menu", label: "Menu" },
  { href: "/rewards", label: "Rewards" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const ops = pathname?.startsWith("/admin") || pathname?.startsWith("/kitchen");

  if (ops) {
    return (
      <header className="border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-display text-lg text-fusion-ink">
            Prime <span className="text-fusion-green">Fusion</span>
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-fusion-muted">
            <Link href="/order" className="hover:text-fusion-ink">
              Guest order
            </Link>
            <Link href="/admin" className="hover:text-fusion-ink">
              Admin
            </Link>
            <Link href="/kitchen" className="hover:text-fusion-ink">
              Kitchen
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-fusion-gold">♛</span>
          <span className="font-display text-xl tracking-tight text-fusion-ink">
            Prime <span className="text-fusion-green">Fusion</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full bg-fusion-mist p-1 text-sm font-semibold sm:flex">
          {links.slice(0, 3).map((l) => {
            const active =
              l.href === "/order"
                ? pathname === "/order" || pathname?.startsWith("/order/qr")
                : pathname?.startsWith(l.href.replace("#menu", ""));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-fusion-ink text-white shadow-soft"
                    : "text-fusion-muted hover:text-fusion-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/checkout"
          className="rounded-full bg-fusion-ink px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-fusion-green"
        >
          Cart{cart.itemCount ? ` · ${formatMoney(cart.subtotalCents)}` : ""}
        </Link>
      </div>
    </header>
  );
}
