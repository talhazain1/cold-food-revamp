import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

const patchSchema = z.object({
  under48h: z.number().nonnegative().max(9_999),
  between48and72h: z.number().nonnegative().max(9_999),
  freeOver: z.number().positive().nullable().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const settings = await prisma.deliverySettings.findFirst();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
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

  const { under48h, between48and72h } = parsed.data;
  const freeOver = parsed.data.freeOver ?? undefined;

  const existing = await prisma.deliverySettings.findFirst();
  if (existing) {
    const updated = await prisma.deliverySettings.update({
      where: { id: existing.id },
      data: {
        under48h,
        between48and72h,
        ...(freeOver === undefined ? {} : { freeOver }),
      },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.deliverySettings.create({
    data: {
      under48h,
      between48and72h,
      freeOver: freeOver ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
