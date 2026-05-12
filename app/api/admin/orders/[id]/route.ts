import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  try {
    const order = await prisma.order.update({
      where: { id: ctx.params.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(order);
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    throw e;
  }
}
