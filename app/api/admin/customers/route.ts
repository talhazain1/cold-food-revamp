import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: {
        include: {
          address: true,
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}
