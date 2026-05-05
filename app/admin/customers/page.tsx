import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: true },
  });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      {users.map((user: { id: string; name: string; email: string; orders: { id: string; total: number; status: string }[] }) => {
        const totalSpend = user.orders.reduce((sum, order) => sum + order.total, 0);
        return (
          <details key={user.id} className="rounded border p-3">
            <summary>
              {user.name} - {user.email} - Orders: {user.orders.length} - Spend: £{totalSpend.toFixed(2)}
            </summary>
            {user.orders.map((order: { id: string; total: number; status: string }) => (
              <p key={order.id}>
                {order.id}: £{order.total.toFixed(2)} ({order.status})
              </p>
            ))}
          </details>
        );
      })}
    </section>
  );
}
