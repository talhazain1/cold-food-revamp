import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [ordersCount, revenue, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">Total Orders: {ordersCount}</div>
        <div className="rounded border p-4">Revenue: £{(revenue._sum.total || 0).toFixed(2)}</div>
      </div>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        {recentOrders.map((order: { id: string; total: number; status: string; user: { name: string } }) => (
          <div className="rounded border p-3" key={order.id}>
            {order.id} - {order.user.name} - £{order.total.toFixed(2)} - {order.status}
          </div>
        ))}
      </section>
    </div>
  );
}
