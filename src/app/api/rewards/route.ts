import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/utils";
import { getRewardSettings } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const phone = new URL(req.url).searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }
  const settings = await getRewardSettings();
  const account = await prisma.rewardAccount.findUnique({
    where: { phone: normalizePhone(phone) },
    include: {
      user: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  return NextResponse.json({ account, settings });
}
