import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateOrderStatus, type OrderStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const board = searchParams.get("board");
  const statuses = board
    ? (["PAID", "RECEIVED", "PREPARING", "READY"] as OrderStatus[])
    : undefined;

  const orders = await prisma.order.findMany({
    where: statuses ? { status: { in: statuses } } : undefined,
    include: { items: true, qrStation: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ orders });
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
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = patchSchema.extend({ orderId: z.string() }).parse(await req.json());
  const order = await updateOrderStatus(body.orderId, body.status, body.note);
  return NextResponse.json(order);
}
