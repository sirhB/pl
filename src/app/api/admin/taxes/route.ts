import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await prisma.taxSetting.findMany({ orderBy: { createdAt: "desc" } });
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] },
    },
    select: { taxCents: true, subtotalCents: true, totalCents: true, createdAt: true },
  });
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
}

export async function POST(req: Request) {
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

  const setting = await prisma.taxSetting.create({
    data: {
      name: body.name,
      rateBps: Math.round(body.ratePercent * 100),
      jurisdiction: body.jurisdiction,
    },
  });
  return NextResponse.json(setting);
}
