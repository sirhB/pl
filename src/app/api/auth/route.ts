import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSession, destroySession, getSession } from "@/lib/auth";
import { withDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return withDb(async () => {
    const session = await getSession();
    return NextResponse.json({ user: session });
  });
}

export async function POST(req: Request) {
  return withDb(async () => {
    const body = z
      .object({ email: z.string().email(), password: z.string().min(4) })
      .parse(await req.json());
    const user = await authenticate(body.email, body.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
