import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderEmail } from "@/lib/mail";
import { notifyAdminsNewOrder } from "@/lib/push";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED", stripeSessionId: session.id },
        include: { user: true, items: { include: { product: true } } },
      });
      await sendOrderEmail(
        order.user.email,
        order.id,
        order.total,
        order.items.map((i) => `${i.product.name} x ${i.quantity}`),
      );
      await notifyAdminsNewOrder(order.id, order.total);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.order.updateMany({
      where: { stripeSessionId: intent.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
