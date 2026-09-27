import { NextResponse } from "next/server";
import { getDb, withDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  return withDb(async () => {
    const station = getDb().qrStations.find((s) => s.code === params.code && s.isActive);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    return NextResponse.json(station);
  });
}
