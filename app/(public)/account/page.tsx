import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: true, orders: { include: { items: true } } },
  });
  if (!user) redirect("/auth/login");
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">My Account</h1>
      <div className="rounded border p-4">
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone || "-"}</p>
      </div>
      <div className="rounded border p-4">
        <h2 className="font-semibold">Saved addresses</h2>
        {user.addresses.map((a: { id: string; line1: string; city: string; postcode: string }) => (
          <p key={a.id}>
            {a.line1}, {a.city}, {a.postcode}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="font-semibold">Order history</h2>
        {user.orders.map((order: { id: string; createdAt: Date; total: number; status: string }) => (
          <details key={order.id} className="rounded border p-3">
            <summary>
              {order.id} - {new Date(order.createdAt).toLocaleDateString()} - £{order.total.toFixed(2)} - {order.status}
            </summary>
            <Link href={`/orders/${order.id}`} className="text-[#006847] underline">
              View full details
            </Link>
          </details>
        ))}
      </div>
    </section>
  );
}
