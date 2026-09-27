import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Prime Fusion | Jamaican Fusion, Your Way",
  description:
    "QR-enabled ordering for Prime Fusion food truck — bowls, rasta pasta, wings, and more. Pay with Stripe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
