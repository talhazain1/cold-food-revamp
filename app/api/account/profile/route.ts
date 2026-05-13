import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    name: z.string().min(2),
    phone: z.string().default("").transform((s) => s.trim()),
  })
  .superRefine((data, ctx) => {
    if (data.phone !== "" && data.phone.length < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone must be at least 7 characters or leave blank",
        path: ["phone"],
      });
    }
  });

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const msg = flat.phone?.[0] ?? flat.name?.[0] ?? "Invalid payload";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
  const phone = parsed.data.phone === "" ? null : parsed.data.phone;
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone },
    select: { id: true, name: true, email: true, phone: true },
  });
  return NextResponse.json(user);
}
