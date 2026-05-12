import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { createBundleSchema } from "@/lib/bundle-admin-schema";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const bundles = await prisma.bundle.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(bundles);
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
  const parsed = createBundleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const count = await prisma.product.count({
    where: { id: { in: parsed.data.productIds } },
  });
  if (count !== parsed.data.productIds.length) {
    return NextResponse.json({ error: "One or more products were not found" }, { status: 422 });
  }

  const bundle = await prisma.bundle.create({
    data: {
      name: parsed.data.name.trim(),
      description: (parsed.data.description ?? "").trim(),
      price: parsed.data.price,
      terms: (parsed.data.terms ?? "").trim(),
      products: parsed.data.productIds,
      discount: 0,
      isActive: parsed.data.isActive ?? true,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  return NextResponse.json(bundle, { status: 201 });
}
