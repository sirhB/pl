import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const station = await prisma.qrStation.findUnique({
    where: { code: params.code },
  });
  if (!station || !station.isActive) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }
  return NextResponse.json(station);
}
