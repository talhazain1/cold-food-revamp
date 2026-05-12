import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: {
        include: {
          address: true,
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Customers</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Full commercially useful profile: identifiers, saved addresses, consolidated spend, and the item mix from every
          historic order.
        </p>
      </div>
      <div className="space-y-4">
        {users.map((user) => {
          const totalSpend = user.orders.reduce((sum, order) => sum + order.total, 0);
          return (
            <details
              key={user.id}
              className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm open:ring-2 open:ring-[#006847]/20"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-neutral-950">{user.name}</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                    {user.phone && <p className="text-sm text-neutral-600">{user.phone}</p>}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-[#C8102E] tabular-nums">£{totalSpend.toFixed(2)} lifetime</p>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">{user.orders.length} orders</p>
                  </div>
                </div>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#006847] group-open:hidden">
                  View full profile
                  <span aria-hidden>▾</span>
                </p>
              </summary>

              <div className="mt-4 space-y-4 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Saved addresses</p>
                  {user.addresses.length === 0 ? (
                    <p className="mt-2 text-neutral-500">No addresses on file yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {user.addresses.map((addr) => (
                        <li key={addr.id} className="rounded-lg border border-neutral-100 px-3 py-2">
                          <p>
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ""}
                          </p>
                          <p>
                            {addr.city}, {addr.postcode}
                          </p>
                          <p className="text-xs text-neutral-500">{addr.country}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Order history</p>
                  {user.orders.length === 0 ? (
                    <p className="mt-2 text-neutral-500">No orders yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {user.orders.map((order) => (
                        <li key={order.id} className="rounded-lg border border-neutral-100 bg-neutral-50/60 px-3 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-mono text-xs text-neutral-500">{order.id}</p>
                              <p className="text-base font-semibold text-neutral-950">£{order.total.toFixed(2)} total</p>
                              <p className="text-xs uppercase tracking-wide text-neutral-500">{order.status}</p>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(order.createdAt).toLocaleString("en-GB", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </div>
                          </div>
                          {order.address && (
                            <p className="mt-3 text-xs text-neutral-600">
                              Shipped to: {order.address.line1}, {order.address.city}, {order.address.postcode}
                            </p>
                          )}
                          <ul className="mt-3 space-y-1 text-neutral-700">
                            {order.items.map((item) => (
                              <li key={item.id}>
                                {item.product.name} × {item.quantity}{" "}
                                <span className="tabular-nums text-neutral-500">@ £{item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
