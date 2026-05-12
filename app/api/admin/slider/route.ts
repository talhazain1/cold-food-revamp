import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const postSchema = z.object({
  text: z.string().min(1).max(500),
  order: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const items = await prisma.sliderItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
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
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const highest = await prisma.sliderItem.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = parsed.data.order ?? ((highest?.order ?? -1) + 1);

  const item = await prisma.sliderItem.create({
    data: {
      text: parsed.data.text.trim(),
      order,
      isActive: parsed.data.isActive ?? true,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
