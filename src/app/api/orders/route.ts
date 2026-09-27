import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, withDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateOrderStatus, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withDb(async () => {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board");
    const statuses = board
      ? (["PAID", "RECEIVED", "PREPARING", "READY"] as OrderStatus[])
      : undefined;

    const db = getDb();
    let orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (statuses) {
      orders = orders.filter((o) => statuses.includes(o.status));
    }
    orders = orders.slice(0, 100);

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        items: db.orderItems.filter((i) => i.orderId === o.id),
        qrStation: o.qrStationId
          ? db.qrStations.find((s) => s.id === o.qrStationId) || null
          : null,
      })),
    });
  });
}

const patchSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAID",
    "RECEIVED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().optional(),
  orderId: z.string(),
});

export async function PATCH(req: Request) {
  return withDb(async () => {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = patchSchema.parse(await req.json());
    const order = await updateOrderStatus(body.orderId, body.status, body.note);
    return NextResponse.json(order);
  });
}
