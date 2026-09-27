import { getDb, saveDb, cuid, nowIso } from "./db";
import { normalizePhone } from "./utils";

export async function getOrCreateRewardAccount(phone: string, name?: string) {
  const db = getDb();
  const normalized = normalizePhone(phone);
  let user = db.users.find((u) => u.phone === normalized);
  if (!user) {
    const stamp = nowIso();
    user = {
      id: cuid(),
      phone: normalized,
      name: name || "Guest",
      role: "CUSTOMER",
      createdAt: stamp,
      updatedAt: stamp,
    };
    db.users.push(user);
  }
  let account = db.rewardAccounts.find((a) => a.phone === normalized);
  if (!account) {
    const stamp = nowIso();
    account = {
      id: cuid(),
      userId: user.id,
      phone: normalized,
      points: 0,
      lifetimePts: 0,
      createdAt: stamp,
      updatedAt: stamp,
    };
    db.rewardAccounts.push(account);
  }
  saveDb(true);
  return { user, account };
}

export async function getRewardSettings() {
  const db = getDb();
  const map = Object.fromEntries(db.appSettings.map((r) => [r.key, r.value]));
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
  account.points += points;
  account.lifetimePts += points;
  account.updatedAt = nowIso();
  getDb().rewardTransactions.push({
    id: cuid(),
    accountId: account.id,
    points,
    reason: "Order earn",
    orderId,
    createdAt: nowIso(),
  });
  saveDb(true);
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

  const db = getDb();
  const account = db.rewardAccounts.find((a) => a.phone === normalizePhone(phone));
  if (!account || account.points < points) {
    throw new Error("Insufficient reward points");
  }

  account.points -= points;
  account.updatedAt = nowIso();
  db.rewardTransactions.push({
    id: cuid(),
    accountId: account.id,
    points: -points,
    reason: "Redeem discount",
    orderId: orderId || null,
    createdAt: nowIso(),
  });
  saveDb(true);

  return { points, discountCents };
}
