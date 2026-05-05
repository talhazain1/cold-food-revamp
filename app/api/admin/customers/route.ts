import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: true },
  });
  return NextResponse.json(customers);
}
