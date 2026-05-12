import { DeliveryWindow } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const schema = z.object({
  line1: z.string().min(3),
  city: z.string().min(2),
  postcode: z.string().min(3),
  deliveryWindow: z.nativeEnum(DeliveryWindow),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });

  const settings = await prisma.deliverySettings.findFirst();
  const windowRate =
    parsed.data.deliveryWindow === DeliveryWindow.UNDER_48H
      ? settings?.under48h ?? 3.5
      : settings?.between48and72h ?? 2.5;
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeThreshold = settings?.freeOver ?? null;
  const qualifiesFree = freeThreshold != null && freeThreshold > 0 && subtotal >= freeThreshold;
  const deliveryCost = qualifiesFree ? 0 : windowRate;
  const total = subtotal + deliveryCost;

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      line1: parsed.data.line1,
      city: parsed.data.city,
      postcode: parsed.data.postcode,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
      subtotal,
      deliveryCost,
      total,
      deliveryWindow: parsed.data.deliveryWindow,
      addressId: address.id,
      items: {
        create: parsed.data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      ...parsed.data.items.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Delivery" },
          unit_amount: Math.round(deliveryCost * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
}
