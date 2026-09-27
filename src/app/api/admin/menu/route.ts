import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ items, categories });
}

export async function PATCH(req: Request) {
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

  const { id, ...data } = body;
  const item = await prisma.menuItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function POST(req: Request) {
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

  const item = await prisma.menuItem.create({
    data: {
      ...body,
      slug: slugify(body.name) + "-" + Date.now().toString(36),
    },
  });
  return NextResponse.json(item);
}
