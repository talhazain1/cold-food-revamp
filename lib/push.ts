import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) return;
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  vapidConfigured = true;
}

export async function notifyAdminsNewOrder(orderId: string, total: number) {
  ensureVapidConfigured();
  if (!vapidConfigured) return;
  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({
    title: "New Order!",
    body: `Order #${orderId} placed — £${total.toFixed(2)}`,
  });

  await Promise.all(
    subscriptions.map((entry) =>
      webpush
        .sendNotification(entry.subscription as unknown as webpush.PushSubscription, payload)
        .catch(() => null),
    ),
  );
}
