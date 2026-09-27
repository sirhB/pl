import { NextResponse } from "next/server";
import { getDb, withDb } from "@/lib/db";
import { normalizePhone } from "@/lib/utils";
import { getRewardSettings } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withDb(async () => {
    const phone = new URL(req.url).searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }
    const settings = await getRewardSettings();
    const account = getDb().rewardAccounts.find(
      (a) => a.phone === normalizePhone(phone)
    );
    if (!account) {
      return NextResponse.json({ account: null, settings });
    }
    const user = getDb().users.find((u) => u.id === account.userId) || null;
    const transactions = getDb()
      .rewardTransactions.filter((t) => t.accountId === account.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);
    return NextResponse.json({
      account: { ...account, user, transactions },
      settings,
    });
  });
}
