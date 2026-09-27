"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatMoney } from "@/lib/utils";

const links = [
  { href: "/order", label: "Order" },
  { href: "/rewards", label: "Rewards" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const hide = pathname?.startsWith("/admin") || pathname?.startsWith("/kitchen");

  if (hide) {
    return (
      <header className="border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-display text-lg tracking-wide text-fusion-yellow">
            PRIME FUSION
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/order" className="text-fusion-muted hover:text-white">
              Guest order
            </Link>
            <Link href="/admin" className="text-fusion-muted hover:text-white">
              Admin
            </Link>
            <Link href="/kitchen" className="text-fusion-muted hover:text-white">
              Kitchen
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-fusion-gold transition group-hover:scale-110">♛</span>
          <span className="font-display text-xl tracking-wide text-fusion-yellow">
            PRIME FUSION
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname?.startsWith(l.href)
                  ? "text-fusion-yellow"
                  : "text-fusion-muted hover:text-white"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/checkout"
          className="rounded-full bg-fusion-yellow px-4 py-2 text-sm font-bold text-fusion-black"
        >
          Cart{cart.itemCount ? ` · ${formatMoney(cart.subtotalCents)}` : ""}
        </Link>
      </div>
    </header>
  );
}
