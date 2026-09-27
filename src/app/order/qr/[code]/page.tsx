import { redirect } from "next/navigation";

export default function QrOrderPage({ params }: { params: { code: string } }) {
  redirect(`/order?station=${encodeURIComponent(params.code)}`);
}
