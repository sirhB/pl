import { Suspense } from "react";
import OrderPageClient from "./order-client";

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-fusion-muted">Loading menu…</div>
      }
    >
      <OrderPageClient />
    </Suspense>
  );
}
