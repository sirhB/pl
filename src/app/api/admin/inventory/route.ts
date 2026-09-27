import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, withDb, saveDb, cuid, nowIso } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async () => {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();
    const items = [...db.inventoryItems]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        ...item,
        movements: db.inventoryMovements
          .filter((m) => m.inventoryItemId === item.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 5),
      }));
    return NextResponse.json({ items });
  });
}

export async function PATCH(req: Request) {
  return withDb(async () => {
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

    const item = getDb().inventoryItems.find((i) => i.id === body.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (typeof body.adjustBy === "number") {
      item.quantityOnHand += body.adjustBy;
      getDb().inventoryMovements.push({
        id: cuid(),
        inventoryItemId: item.id,
        delta: body.adjustBy,
        reason: body.reason || "Manual adjustment",
        orderId: null,
        createdAt: nowIso(),
      });
      saveDb(true);
      return NextResponse.json(item);
    }

    if (body.quantityOnHand !== undefined) item.quantityOnHand = body.quantityOnHand;
    if (body.reorderLevel !== undefined) item.reorderLevel = body.reorderLevel;
    if (body.costPerUnitCents !== undefined) item.costPerUnitCents = body.costPerUnitCents;
    saveDb(true);
    return NextResponse.json(item);
  });
}
