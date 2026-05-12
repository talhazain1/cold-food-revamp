import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { updateBundleSchema } from "@/lib/bundle-admin-schema";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateBundleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const data: Prisma.BundleUpdateInput = {};
  const u = parsed.data;
  if (u.name !== undefined) data.name = u.name.trim();
  if (u.description !== undefined) data.description = u.description.trim();
  if (u.price !== undefined) data.price = u.price;
  if (u.terms !== undefined) data.terms = u.terms.trim();
  if (u.isActive !== undefined) data.isActive = u.isActive;
  if (u.expiresAt !== undefined) data.expiresAt = u.expiresAt ? new Date(u.expiresAt) : null;
  if (u.productIds !== undefined) {
    const count = await prisma.product.count({ where: { id: { in: u.productIds } } });
    if (count !== u.productIds.length) {
      return NextResponse.json({ error: "One or more products were not found" }, { status: 422 });
    }
    data.products = u.productIds;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 422 });
  }

  try {
    const bundle = await prisma.bundle.update({
      where: { id: ctx.params.id },
      data,
    });
    return NextResponse.json(bundle);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    await prisma.bundle.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    throw e;
  }
}
