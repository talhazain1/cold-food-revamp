import AdminOrdersPanel, { type AdminOrderDetail } from "@/components/admin/AdminOrdersPanel";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const serialised = JSON.parse(JSON.stringify(orders)) as AdminOrderDetail[];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Orders</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          New captures haven&apos;t cleared Stripe yet; in-progress orders are paid but still moving through your fulfilment
          states. Update statuses as you pack and hand off to couriers.
        </p>
      </div>
      <AdminOrdersPanel orders={serialised} />
    </section>
  );
}
