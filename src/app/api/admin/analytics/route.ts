import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: since },
      status: { in: ["PAID", "RECEIVED", "PREPARING", "READY", "COMPLETED"] },
    },
    include: { items: true },
  });

  const revenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const taxCollected = orders.reduce((s, o) => s + o.taxCents, 0);
  const discounts = orders.reduce((s, o) => s + o.discountCents, 0);
  const cogs = orders.reduce(
    (s, o) => s + o.items.reduce((is, i) => is + i.costCents, 0),
    0
  );
  const grossMargin = revenue - taxCollected - cogs;
  const marginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

  const itemSales: Record<string, { qty: number; revenue: number; cost: number }> = {};
  for (const o of orders) {
    for (const i of o.items) {
      const key = i.name.split(" · ")[0];
      if (!itemSales[key]) itemSales[key] = { qty: 0, revenue: 0, cost: 0 };
      itemSales[key].qty += i.quantity;
      itemSales[key].revenue += i.totalCents;
      itemSales[key].cost += i.costCents;
    }
  }

  const topItems = Object.entries(itemSales)
    .map(([name, v]) => ({
      name,
      ...v,
      marginCents: v.revenue - v.cost,
      marginPct: v.revenue ? ((v.revenue - v.cost) / v.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12);

  const lowMargin = [...topItems]
    .filter((i) => i.revenue > 0)
    .sort((a, b) => a.marginPct - b.marginPct)
    .slice(0, 5);

  const inventory = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: { quantityOnHand: "asc" },
  });
  const lowStock = inventory.filter((i) => i.quantityOnHand <= i.reorderLevel);

  const menu = await prisma.menuItem.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const costOptimization = menu
    .map((m) => {
      const margin = m.priceCents - m.costCents;
      const marginPctItem = m.priceCents ? (margin / m.priceCents) * 100 : 0;
      let suggestion = "Healthy margin";
      if (marginPctItem < 55) {
        suggestion = `Consider +${formatMoney(
          Math.ceil((m.costCents / 0.4 - m.priceCents) / 100) * 100
        )} price bump to target ~60% margin`;
      } else if (marginPctItem > 75) {
        suggestion = "Strong margin — candidate for promo / bundle traffic";
      }
      return {
        id: m.id,
        name: m.name,
        category: m.category.name,
        priceCents: m.priceCents,
        costCents: m.costCents,
        marginCents: margin,
        marginPct: marginPctItem,
        suggestion,
      };
    })
    .sort((a, b) => a.marginPct - b.marginPct);

  const tax = await prisma.taxSetting.findFirst({ orderBy: { createdAt: "desc" } });

  return NextResponse.json({
    periodDays: 30,
    totals: {
      orderCount: orders.length,
      revenueCents: revenue,
      taxCollectedCents: taxCollected,
      discountCents: discounts,
      cogsCents: cogs,
      grossMarginCents: grossMargin,
      marginPct,
      avgTicketCents: orders.length ? Math.round(revenue / orders.length) : 0,
    },
    topItems,
    lowMargin,
    lowStock,
    costOptimization,
    tax,
    inventoryCount: inventory.length,
    menuCount: menu.length,
  });
}
