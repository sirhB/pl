import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  return NextResponse.json({ items });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = z
    .object({
      id: z.string(),
      quantityOnHand: z.number().optional(),
      reorderLevel: z.number().optional(),
      costPerUnitCents: z.number().int().min(0).optional(),
      adjustBy: z.number().optional(),
      reason: z.string().optional(),
    })
    .parse(await req.json());

  if (typeof body.adjustBy === "number") {
    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { id: body.id },
        data: { quantityOnHand: { increment: body.adjustBy! } },
      });
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: body.id,
          delta: body.adjustBy!,
          reason: body.reason || "Manual adjustment",
        },
      });
      return updated;
    });
    return NextResponse.json(item);
  }

  const { id, adjustBy: _a, reason: _r, ...data } = body;
  const item = await prisma.inventoryItem.update({ where: { id }, data });
  return NextResponse.json(item);
}
