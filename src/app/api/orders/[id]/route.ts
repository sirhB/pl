import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { getOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return withDb(async () => {
    const order = getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  });
}
