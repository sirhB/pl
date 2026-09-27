import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, withDb, saveDb, cuid, nowIso } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async () => {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();
    const settings = [...db.taxSettings].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString();
    const orders = db.orders.filter(
      (o) =>
        o.createdAt >= sinceIso &&
        !["PENDING_PAYMENT", "CANCELLED"].includes(o.status)
    );
    const taxCollected = orders.reduce((s, o) => s + o.taxCents, 0);
    return NextResponse.json({
      settings,
      report: {
        periodDays: 30,
        orderCount: orders.length,
        taxableSubtotalCents: orders.reduce((s, o) => s + o.subtotalCents, 0),
        taxCollectedCents: taxCollected,
      },
    });
  });
}

export async function POST(req: Request) {
  return withDb(async () => {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = z
      .object({
        name: z.string().default("Sales Tax"),
        ratePercent: z.number().min(0).max(30),
        jurisdiction: z.string().optional(),
      })
      .parse(await req.json());

    const stamp = nowIso();
    const setting = {
      id: cuid(),
      name: body.name,
      rateBps: Math.round(body.ratePercent * 100),
      isInclusive: false,
      jurisdiction: body.jurisdiction || null,
      createdAt: stamp,
      updatedAt: stamp,
    };
    getDb().taxSettings.push(setting);
    saveDb(true);
    return NextResponse.json(setting);
  });
}
