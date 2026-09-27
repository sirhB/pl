import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, withDb, saveDb } from "@/lib/db";
import { createPendingOrder, markOrderPaid } from "@/lib/orders";
import { getOrCreateRewardAccount, redeemPoints } from "@/lib/rewards";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderType: z.enum(["DINE_IN", "TOGO"]),
  qrStationCode: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().min(7),
  notes: z.string().optional(),
  redeemPoints: z.number().int().min(0).optional(),
  lines: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        modifiers: z
          .array(
            z.object({
              groupName: z.string(),
              optionName: z.string(),
              priceDeltaCents: z.number().optional(),
            })
          )
          .optional(),
        notes: z.string().optional(),
        nameOverride: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    return await withDb(async () => {
      const body = schema.parse(await req.json());
      const { user } = await getOrCreateRewardAccount(
        body.customerPhone,
        body.customerName
      );

      let discountCents = 0;
      let rewardPointsRedeemed = 0;
      const intendedRedeem = body.redeemPoints || 0;
      if (intendedRedeem >= 100) {
        const multiples = Math.floor(intendedRedeem / 100);
        discountCents = multiples * 500;
        rewardPointsRedeemed = multiples * 100;
      }

      let qrStationId: string | undefined;
      if (body.qrStationCode) {
        const station = getDb().qrStations.find((s) => s.code === body.qrStationCode);
        qrStationId = station?.id;
      }

      const order = await createPendingOrder({
        lines: body.lines,
        orderType: body.orderType,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerId: user.id,
        qrStationId,
        notes: body.notes,
        discountCents,
        rewardPointsRedeemed,
      });

      if (!isStripeConfigured()) {
        if (rewardPointsRedeemed > 0) {
          await redeemPoints(body.customerPhone, rewardPointsRedeemed, order.id);
        }
        await markOrderPaid(order.id);
        return NextResponse.json({
          orderId: order.id,
          orderNumber: order.orderNumber,
          demo: true,
          message: "Stripe not configured — order marked paid for demo",
        });
      }

      const stripe = getStripe();
      if (!stripe) {
        await markOrderPaid(order.id);
        return NextResponse.json({
          orderId: order.id,
          orderNumber: order.orderNumber,
          demo: true,
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${appUrl}/order/status/${order.id}?paid=1`,
        cancel_url: `${appUrl}/checkout?cancelled=1`,
        phone_number_collection: { enabled: true },
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: order.totalCents,
              product_data: {
                name: `Prime Fusion ${order.orderNumber}`,
                description: order.items
                  .map((i) => `${i.quantity}× ${i.name}`)
                  .join(", "),
              },
            },
          },
        ],
      });

      const stored = getDb().orders.find((o) => o.id === order.id);
      if (stored) {
        stored.stripeSessionId = session.id;
        saveDb(true);
      }

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutUrl: session.url,
        total: formatMoney(order.totalCents),
      });
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
