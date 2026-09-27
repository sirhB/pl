import { prisma } from "./db";
import { normalizePhone } from "./utils";

export async function getOrCreateRewardAccount(phone: string, name?: string) {
  const normalized = normalizePhone(phone);
  let user = await prisma.user.findUnique({ where: { phone: normalized } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: normalized,
        name: name || "Guest",
        role: "CUSTOMER",
      },
    });
  }
  let account = await prisma.rewardAccount.findUnique({
    where: { phone: normalized },
  });
  if (!account) {
    account = await prisma.rewardAccount.create({
      data: {
        userId: user.id,
        phone: normalized,
        points: 0,
        lifetimePts: 0,
      },
    });
  }
  return { user, account };
}

export async function getRewardSettings() {
  const rows = await prisma.appSetting.findMany({
    where: {
      key: {
        in: [
          "reward_points_per_dollar",
          "reward_redeem_points",
          "reward_redeem_dollars",
        ],
      },
    },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    pointsPerDollar: parseFloat(map.reward_points_per_dollar || "1"),
    redeemPoints: parseInt(map.reward_redeem_points || "100", 10),
    redeemDollars: parseFloat(map.reward_redeem_dollars || "5"),
  };
}

export async function earnPointsForOrder(
  phone: string,
  orderId: string,
  subtotalCents: number,
  name?: string
) {
  const settings = await getRewardSettings();
  const points = Math.floor((subtotalCents / 100) * settings.pointsPerDollar);
  if (points <= 0) return 0;
  const { account } = await getOrCreateRewardAccount(phone, name);
  await prisma.$transaction([
    prisma.rewardAccount.update({
      where: { id: account.id },
      data: {
        points: { increment: points },
        lifetimePts: { increment: points },
      },
    }),
    prisma.rewardTransaction.create({
      data: {
        accountId: account.id,
        points,
        reason: "Order earn",
        orderId,
      },
    }),
  ]);
  return points;
}

export async function redeemPoints(
  phone: string,
  pointsToRedeem: number,
  orderId?: string
) {
  const settings = await getRewardSettings();
  if (pointsToRedeem < settings.redeemPoints) {
    throw new Error("Not enough points to redeem");
  }
  const multiples = Math.floor(pointsToRedeem / settings.redeemPoints);
  const points = multiples * settings.redeemPoints;
  const discountCents = multiples * Math.round(settings.redeemDollars * 100);

  const account = await prisma.rewardAccount.findUnique({
    where: { phone: normalizePhone(phone) },
  });
  if (!account || account.points < points) {
    throw new Error("Insufficient reward points");
  }

  await prisma.$transaction([
    prisma.rewardAccount.update({
      where: { id: account.id },
      data: { points: { decrement: points } },
    }),
    prisma.rewardTransaction.create({
      data: {
        accountId: account.id,
        points: -points,
        reason: "Redeem discount",
        orderId,
      },
    }),
  ]);

  return { points, discountCents };
}
