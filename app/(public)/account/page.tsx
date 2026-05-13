import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AccountDashboard from "@/components/account/AccountDashboard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: { orderBy: { id: "asc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!user) redirect("/auth/login?callbackUrl=/account");

  const initialOrders = user.orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    subtotal: o.subtotal,
    deliveryCost: o.deliveryCost,
    deliveryWindow: o.deliveryWindow,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      price: i.price,
      productName: i.product.name,
    })),
  }));

  const initialAddresses = user.addresses.map((a) => ({
    id: a.id,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    postcode: a.postcode,
    country: a.country,
  }));

  return (
    <AccountDashboard
      email={user.email}
      initialName={user.name}
      initialPhone={user.phone ?? ""}
      initialAddresses={initialAddresses}
      initialOrders={initialOrders}
    />
  );
}
