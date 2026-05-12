import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { updateProductSchema } from "@/lib/product-admin-schema";
import { makeSlug } from "@/lib/utils";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const { id } = ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const u = parsed.data;
  const data: Prisma.ProductUpdateInput = {};
  if (u.name !== undefined) data.name = u.name.trim();
  if (u.description !== undefined) data.description = u.description.trim();
  if (u.price !== undefined) data.price = u.price;
  if (u.category !== undefined) data.category = u.category.trim();
  if (u.stock !== undefined) data.stock = u.stock;
  if (u.isActive !== undefined) data.isActive = u.isActive;
  if (u.images !== undefined) data.images = u.images.length > 0 ? u.images : ["/placeholder.svg"];
  if (u.tags !== undefined) data.tags = u.tags.map((t) => t.trim()).filter(Boolean);
  if (u.slug !== undefined) {
    const nextSlug = makeSlug(u.slug.trim());
    const taken = await prisma.product.findFirst({
      where: { slug: nextSlug, NOT: { id } },
    });
    if (taken) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    data.slug = nextSlug;
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (e.code === "P2002") {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
    }
    throw e;
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const { id } = ctx.params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete a product referenced by orders — deactivate it instead." },
        { status: 409 },
      );
    }
    throw e;
  }
}
