import { NextResponse } from "next/server";
import { getDb, withDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async () => {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const stations = [...getDb().qrStations].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    const withQr = await Promise.all(
      stations.map(async (s) => {
        const url = `${appUrl}/order/qr/${s.code}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 320,
          margin: 1,
          color: { dark: "#0a0a0a", light: "#f5c518" },
        });
        return { ...s, url, qrDataUrl: dataUrl };
      })
    );
    return NextResponse.json({ stations: withQr });
  });
}
