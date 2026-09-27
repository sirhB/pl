import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, withDb, saveDb, cuid, nowIso } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async () => {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getDb();
    const categories = [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const catOrder = Object.fromEntries(categories.map((c, i) => [c.id, i]));
    const items = [...db.menuItems]
      .sort(
        (a, b) =>
          (catOrder[a.categoryId] ?? 0) - (catOrder[b.categoryId] ?? 0) ||
          a.sortOrder - b.sortOrder
      )
      .map((item) => ({
        ...item,
        category: db.categories.find((c) => c.id === item.categoryId) || null,
      }));
    return NextResponse.json({ items, categories });
  });
}

export async function PATCH(req: Request) {
  return withDb(async () => {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = z
      .object({
        id: z.string(),
        priceCents: z.number().int().positive().optional(),
        costCents: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
      .parse(await req.json());

    const item = getDb().menuItems.find((i) => i.id === body.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.priceCents !== undefined) item.priceCents = body.priceCents;
    if (body.costCents !== undefined) item.costCents = body.costCents;
    if (body.isActive !== undefined) item.isActive = body.isActive;
    if (body.name !== undefined) item.name = body.name;
    if (body.description !== undefined) item.description = body.description;
    saveDb(true);
    return NextResponse.json(item);
  });
}

export async function POST(req: Request) {
  return withDb(async () => {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = z
      .object({
        categoryId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        priceCents: z.number().int().positive(),
        costCents: z.number().int().min(0).default(0),
      })
      .parse(await req.json());

    const item = {
      id: cuid(),
      categoryId: body.categoryId,
      name: body.name,
      slug: slugify(body.name) + "-" + Date.now().toString(36),
      description: body.description || null,
      priceCents: body.priceCents,
      costCents: body.costCents,
      imageUrl: null,
      isActive: true,
      isBuildYourOwn: false,
      allowsModifiers: true,
      prepMinutes: 12,
      sortOrder: 99,
      tags: "[]",
    };
    getDb().menuItems.push(item);
    saveDb(true);
    return NextResponse.json(item);
  });
}
