import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  postcode: z.string().min(3),
  country: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      line1: parsed.data.line1,
      line2: parsed.data.line2?.trim() || null,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
      country: parsed.data.country?.trim() || "UK",
    },
  });
  return NextResponse.json(address, { status: 201 });
}
