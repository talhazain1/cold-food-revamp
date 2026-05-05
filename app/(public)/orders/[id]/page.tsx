import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.userId !== session.user.id) notFound();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      <p>Status: {order.status}</p>
      <p>Total: £{order.total.toFixed(2)}</p>
      <div className="space-y-2">
        {order.items.map((item: { id: string; quantity: number; price: number; product: { name: string } }) => (
          <div key={item.id} className="rounded border p-2">
            {item.product.name} x {item.quantity} - £{item.price.toFixed(2)}
          </div>
        ))}
      </div>
    </section>
  );
}
