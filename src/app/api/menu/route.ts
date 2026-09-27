import { NextResponse } from "next/server";
import { withDb, getDb, isDbSeeded } from "@/lib/db";
import { getFullMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await withDb(() => getFullMenu());
    if (!categories.length) {
      return NextResponse.json(
        {
          error: "Menu is empty — run npm run db:setup",
          seeded: isDbSeeded(),
          itemCount: getDb().menuItems.length,
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("[api/menu]", e);
    const message = e instanceof Error ? e.message : "Failed to load menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
