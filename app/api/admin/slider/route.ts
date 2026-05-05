import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const items = await prisma.sliderItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}
