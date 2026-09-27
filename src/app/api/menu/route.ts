import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { getFullMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await withDb(() => getFullMenu());
    return NextResponse.json({ categories });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
