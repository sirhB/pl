import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import { earnPointsForOrder } from "./rewards";
import { orderStatusMessage, sendSms } from "./sms";
import { formatMoney } from "./utils";

export type OrderType = "DINE_IN" | "TOGO";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "RECEIVED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type CartLineInput = {
  menuItemId: string;
  quantity: number;
  modifiers?: Array<{ groupName: string; optionName: string; priceDeltaCents?: number }>;
  notes?: string;
  nameOverride?: string;
};

export async function getTaxRateBps() {
  const tax = await prisma.taxSetting.findFirst({ orderBy: { createdAt: "desc" } });
  return tax?.rateBps ?? 750;
}

export function calcTax(subtotalCents: number, taxRateBps: number) {
  return Math.round((subtotalCents * taxRateBps) / 10000);
}

export async function nextOrderNumber() {
  const n = await prisma.order.count();
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `PF-${stamp}-${String(n + 1).padStart(4, "0")}`;
}

export async function buildOrderTotals(
  lines: CartLineInput[],
  discountCents = 0
) {
  const ids = lines.map((l) => l.menuItemId);
  const items = await prisma.menuItem.findMany({
    where: { id: { in: ids }, isActive: true },
    include: {
      modifiers: { include: { group: { include: { options: true } } } },
      recipes: true,
    },
  });
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  let subtotal = 0;
  let cost = 0;
  const orderItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
    costCents: number;
    modifiersJson: string;
    notes?: string;
  }> = [];

  for (const line of lines) {
    const item = byId[line.menuItemId];
    if (!item) throw new Error(`Menu item not found: ${line.menuItemId}`);
    const modDelta = (line.modifiers || []).reduce(
      (sum, m) => sum + (m.priceDeltaCents || 0),
      0
    );
    const unit = item.priceCents + modDelta;
    const total = unit * line.quantity;
    const lineCost =
      (item.costCents +
        (line.modifiers || []).reduce((s, m) => {
          // cost already on item; modifier cost approx via price delta * 0.4 if unknown
          return s + Math.round((m.priceDeltaCents || 0) * 0.4);
        }, 0)) *
      line.quantity;
    subtotal += total;
    cost += lineCost;
    const displayName =
      line.nameOverride ||
      (line.modifiers?.length
        ? `${item.name} (${line.modifiers.map((m) => m.optionName).join(", ")})`
        : item.name);
    orderItems.push({
      menuItemId: item.id,
      name: displayName,
      quantity: line.quantity,
      unitPriceCents: unit,
      totalCents: total,
      costCents: lineCost,
      modifiersJson: JSON.stringify(line.modifiers || []),
      notes: line.notes,
    });
  }

  const taxRateBps = await getTaxRateBps();
  const taxable = Math.max(0, subtotal - discountCents);
  const taxCents = calcTax(taxable, taxRateBps);
  const totalCents = taxable + taxCents;

  return { subtotal, discountCents, taxCents, taxRateBps, totalCents, cost, orderItems };
}

export async function createPendingOrder(opts: {
  lines: CartLineInput[];
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  qrStationId?: string;
  notes?: string;
  discountCents?: number;
  rewardPointsRedeemed?: number;
}) {
  const totals = await buildOrderTotals(opts.lines, opts.discountCents || 0);
  const orderNumber = await nextOrderNumber();
  const prepMins = 12;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: opts.customerId,
      customerName: opts.customerName,
      customerPhone: opts.customerPhone,
      orderType: opts.orderType,
      status: "PENDING_PAYMENT",
      qrStationId: opts.qrStationId,
      subtotalCents: totals.subtotal,
      taxCents: totals.taxCents,
      discountCents: totals.discountCents,
      totalCents: totals.totalCents,
      taxRateBps: totals.taxRateBps,
      rewardPointsRedeemed: opts.rewardPointsRedeemed || 0,
      notes: opts.notes,
      estimatedReadyAt: new Date(Date.now() + prepMins * 60_000),
      items: { create: totals.orderItems },
      events: { create: { status: "PENDING_PAYMENT", note: "Order created" } },
    },
    include: { items: true },
  });

  return order;
}

async function deductInventoryForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: { include: { recipes: true } },
        },
      },
    },
  });
  if (!order) return;

  for (const line of order.items) {
    const recipes = line.menuItem?.recipes || [];
    for (const recipe of recipes) {
      const delta = -(recipe.quantityUsed * line.quantity);
      await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: recipe.inventoryItemId },
          data: { quantityOnHand: { increment: delta } },
        }),
        prisma.inventoryMovement.create({
          data: {
            inventoryItemId: recipe.inventoryItemId,
            delta,
            reason: `Order ${order.orderNumber}`,
            orderId: order.id,
          },
        }),
      ]);
    }
  }
}

export async function markOrderPaid(orderId: string, stripeMeta?: {
  sessionId?: string;
  paymentIntentId?: string;
}) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeSessionId: stripeMeta?.sessionId,
      stripePaymentIntentId: stripeMeta?.paymentIntentId,
      events: { create: { status: "PAID", note: "Payment confirmed" } },
    },
  });

  // Advance to kitchen queue
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "RECEIVED",
      events: { create: { status: "RECEIVED", note: "Sent to kitchen" } },
    },
  });

  await deductInventoryForOrder(orderId);

  let points = 0;
  if (order.customerPhone) {
    points = await earnPointsForOrder(
      order.customerPhone,
      order.id,
      order.subtotalCents,
      order.customerName || undefined
    );
    await prisma.order.update({
      where: { id: orderId },
      data: { rewardPointsEarned: points },
    });
    await sendSms({
      to: order.customerPhone,
      body: orderStatusMessage(order.orderNumber, "RECEIVED"),
      orderId: order.id,
      userId: order.customerId || undefined,
    });
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  const data: Prisma.OrderUpdateInput = {
    status,
    events: { create: { status, note } },
  };
  if (status === "READY") data.readyAt = new Date();
  if (status === "COMPLETED") data.completedAt = new Date();

  const order = await prisma.order.update({
    where: { id: orderId },
    data,
  });

  if (order.customerPhone && ["PREPARING", "READY", "COMPLETED", "CANCELLED"].includes(status)) {
    await sendSms({
      to: order.customerPhone,
      body: orderStatusMessage(
        order.orderNumber,
        status,
        status === "COMPLETED" ? formatMoney(order.totalCents) : undefined
      ),
      orderId: order.id,
      userId: order.customerId || undefined,
    });
  }

  return order;
}
