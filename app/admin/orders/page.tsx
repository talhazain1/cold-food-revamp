import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>
      {orders.map((order: { id: string; total: number; deliveryWindow: string; status: string; user: { name: string; email: string }; items: { product: { name: string }; quantity: number }[] }) => (
        <div key={order.id} className="rounded border p-3">
          <p>
            {order.id} - {order.user.name} ({order.user.email}) - £{order.total.toFixed(2)}
          </p>
          <p>Delivery: {order.deliveryWindow} | Status: {order.status}</p>
          <p>Items: {order.items.map((item: { product: { name: string }; quantity: number }) => `${item.product.name} x${item.quantity}`).join(", ")}</p>
        </div>
      ))}
    </section>
  );
}
