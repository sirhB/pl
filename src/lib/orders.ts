import { getDb, saveDb, cuid, nowIso } from "./db";
import type { Order, OrderItem, OrderStatus, OrderType } from "./store/types";
import { earnPointsForOrder } from "./rewards";
import { orderStatusMessage, sendSms } from "./sms";
import { formatMoney } from "./utils";

export type { OrderStatus, OrderType };

export type CartLineInput = {
  menuItemId: string;
  quantity: number;
  modifiers?: Array<{ groupName: string; optionName: string; priceDeltaCents?: number }>;
  notes?: string;
  nameOverride?: string;
};

export async function getTaxRateBps() {
  const db = getDb();
  const tax = [...db.taxSettings].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )[0];
  return tax?.rateBps ?? 750;
}

export function calcTax(subtotalCents: number, taxRateBps: number) {
  return Math.round((subtotalCents * taxRateBps) / 10000);
}

export async function nextOrderNumber() {
  const db = getDb();
  const n = db.orders.length;
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `PF-${stamp}-${String(n + 1).padStart(4, "0")}`;
}

export async function buildOrderTotals(lines: CartLineInput[], discountCents = 0) {
  const db = getDb();
  const byId = Object.fromEntries(db.menuItems.filter((i) => i.isActive).map((i) => [i.id, i]));

  let subtotal = 0;
  let cost = 0;
  const orderItems: Array<Omit<OrderItem, "id" | "orderId">> = [];

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
        (line.modifiers || []).reduce(
          (s, m) => s + Math.round((m.priceDeltaCents || 0) * 0.4),
          0
        )) *
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
  const db = getDb();
  const totals = await buildOrderTotals(opts.lines, opts.discountCents || 0);
  const orderNumber = await nextOrderNumber();
  const stamp = nowIso();
  const orderId = cuid();

  const order: Order = {
    id: orderId,
    orderNumber,
    customerId: opts.customerId || null,
    customerName: opts.customerName || null,
    customerPhone: opts.customerPhone || null,
    orderType: opts.orderType,
    status: "PENDING_PAYMENT",
    qrStationId: opts.qrStationId || null,
    subtotalCents: totals.subtotal,
    taxCents: totals.taxCents,
    discountCents: totals.discountCents,
    tipCents: 0,
    totalCents: totals.totalCents,
    taxRateBps: totals.taxRateBps,
    rewardPointsEarned: 0,
    rewardPointsRedeemed: opts.rewardPointsRedeemed || 0,
    stripeSessionId: null,
    stripePaymentIntentId: null,
    notes: opts.notes || null,
    estimatedReadyAt: new Date(Date.now() + 12 * 60_000).toISOString(),
    paidAt: null,
    readyAt: null,
    completedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  db.orders.push(order);
  for (const line of totals.orderItems) {
    db.orderItems.push({ id: cuid(), orderId, ...line });
  }
  db.orderEvents.push({
    id: cuid(),
    orderId,
    status: "PENDING_PAYMENT",
    note: "Order created",
    createdAt: stamp,
  });
  saveDb(true);

  return {
    ...order,
    items: db.orderItems.filter((i) => i.orderId === orderId),
  };
}

function deductInventoryForOrder(orderId: string) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return;
  const lines = db.orderItems.filter((i) => i.orderId === orderId);

  for (const line of lines) {
    if (!line.menuItemId) continue;
    const recipes = db.recipeComponents.filter((r) => r.menuItemId === line.menuItemId);
    for (const recipe of recipes) {
      const inv = db.inventoryItems.find((i) => i.id === recipe.inventoryItemId);
      if (!inv) continue;
      const delta = -(recipe.quantityUsed * line.quantity);
      inv.quantityOnHand += delta;
      db.inventoryMovements.push({
        id: cuid(),
        inventoryItemId: inv.id,
        delta,
        reason: `Order ${order.orderNumber}`,
        orderId: order.id,
        createdAt: nowIso(),
      });
    }
  }
  saveDb(true);
}

export async function markOrderPaid(
  orderId: string,
  stripeMeta?: { sessionId?: string; paymentIntentId?: string }
) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");

  const stamp = nowIso();
  order.status = "PAID";
  order.paidAt = stamp;
  order.updatedAt = stamp;
  if (stripeMeta?.sessionId) order.stripeSessionId = stripeMeta.sessionId;
  if (stripeMeta?.paymentIntentId) order.stripePaymentIntentId = stripeMeta.paymentIntentId;
  db.orderEvents.push({
    id: cuid(),
    orderId,
    status: "PAID",
    note: "Payment confirmed",
    createdAt: stamp,
  });

  order.status = "RECEIVED";
  order.updatedAt = nowIso();
  db.orderEvents.push({
    id: cuid(),
    orderId,
    status: "RECEIVED",
    note: "Sent to kitchen",
    createdAt: nowIso(),
  });
  saveDb(true);

  deductInventoryForOrder(orderId);

  let points = 0;
  if (order.customerPhone) {
    points = await earnPointsForOrder(
      order.customerPhone,
      order.id,
      order.subtotalCents,
      order.customerName || undefined
    );
    order.rewardPointsEarned = points;
    saveDb(true);
    await sendSms({
      to: order.customerPhone,
      body: orderStatusMessage(order.orderNumber, "RECEIVED"),
      orderId: order.id,
      userId: order.customerId || undefined,
    });
  }

  return {
    ...order,
    items: getDb().orderItems.filter((i) => i.orderId === orderId),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");

  order.status = status;
  order.updatedAt = nowIso();
  if (status === "READY") order.readyAt = nowIso();
  if (status === "COMPLETED") order.completedAt = nowIso();
  db.orderEvents.push({
    id: cuid(),
    orderId,
    status,
    note: note || null,
    createdAt: nowIso(),
  });
  saveDb(true);

  if (
    order.customerPhone &&
    ["PREPARING", "READY", "COMPLETED", "CANCELLED"].includes(status)
  ) {
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

export function getOrderById(id: string) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  return {
    ...order,
    items: db.orderItems.filter((i) => i.orderId === id),
    events: db.orderEvents
      .filter((e) => e.orderId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    qrStation: order.qrStationId
      ? db.qrStations.find((s) => s.id === order.qrStationId) || null
      : null,
  };
}
