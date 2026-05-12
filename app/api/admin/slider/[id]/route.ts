import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const patchSchema = z
  .object({
    text: z.string().min(1).max(500).optional(),
    order: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

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

  const data: Prisma.SliderItemUpdateInput = {};
  if (parsed.data.text !== undefined) data.text = parsed.data.text.trim();
  if (parsed.data.order !== undefined) data.order = parsed.data.order;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  try {
    const item = await prisma.sliderItem.update({
      where: { id: ctx.params.id },
      data,
    });
    return NextResponse.json(item);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Slider item not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    await prisma.sliderItem.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Slider item not found" }, { status: 404 });
    }
    throw e;
  }
}
