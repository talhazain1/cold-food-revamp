import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { createProductSchema } from "@/lib/product-admin-schema";
import { makeSlug } from "@/lib/utils";

async function uniqueSlug(base: string) {
  let slug = base;
  let n = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const images =
    parsed.data.images && parsed.data.images.length > 0 ? parsed.data.images : ["/placeholder.svg"];

  const baseSlug = parsed.data.slug?.trim()
    ? makeSlug(parsed.data.slug.trim())
    : makeSlug(parsed.data.name.trim());
  const slug = await uniqueSlug(baseSlug.length > 0 ? baseSlug : "product");

  const tags = (parsed.data.tags ?? []).map((t) => t.trim()).filter(Boolean);

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description.trim(),
        price: parsed.data.price,
        category: parsed.data.category.trim(),
        stock: parsed.data.stock,
        images,
        slug,
        isActive: parsed.data.isActive ?? true,
        tags,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
