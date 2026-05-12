import DashboardCharts from "@/components/admin/DashboardCharts";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import Link from "next/link";

function money(n: number) {
  return `£${n.toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Business overview</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Every figure below is read live from your orders, customers, and catalogue. Use it to spot demand spikes, stuck
          shipments, and hero products.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Lifetime revenue</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950 tabular-nums">{money(data.totals.revenue)}</p>
          <p className="mt-1 text-sm text-neutral-600">{data.totals.orders} orders all-time</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Average order value</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950 tabular-nums">{money(data.totals.averageOrderValue)}</p>
          <p className="mt-1 text-sm text-neutral-600">Including delivery where charged</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Last 30 days</p>
          <p className="mt-2 text-3xl font-bold text-[#C8102E] tabular-nums">{money(data.last30Days.revenue)}</p>
          <p className="mt-1 text-sm text-neutral-600">{data.last30Days.orders} orders in the window</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Community</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950 tabular-nums">{data.totals.customers}</p>
          <p className="mt-1 text-sm text-neutral-600">{data.totals.activeProducts} live SKUs</p>
        </div>
      </section>

      <DashboardCharts data={data} />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-neutral-900">Top performers</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-[#006847] hover:underline">
              Manage products
            </Link>
          </div>
          <p className="mt-1 text-sm text-neutral-600">Revenue from line items on non-cancelled orders.</p>
          {data.topProducts.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
              Sell through a few orders and your bestsellers will populate here automatically.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-neutral-500">
                    <th className="py-2 pr-4 font-medium">Product</th>
                    <th className="py-2 pr-4 font-medium">Units</th>
                    <th className="py-2 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((row) => (
                    <tr key={row.productId} className="border-b border-neutral-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-neutral-900">{row.name}</td>
                      <td className="py-3 pr-4 tabular-nums text-neutral-700">{row.unitsSold}</td>
                      <td className="py-3 tabular-nums text-neutral-900">{money(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-neutral-900">Recent activity</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-[#006847] hover:underline">
              Open orders
            </Link>
          </div>
          <p className="mt-1 text-sm text-neutral-600">Latest orders with quick context — click through for fulfilment detail.</p>
          <ul className="mt-4 space-y-4">
            {data.recentOrders.map((order) => (
              <li key={order.id} className="rounded-lg border border-neutral-100 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-neutral-500">{order.id}</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {order.customerName}{" "}
                      <span className="font-normal text-neutral-500">({order.customerEmail})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-950 tabular-nums">{money(order.total)}</p>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">{order.status}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                  <span>{order.itemCount} line item{order.itemCount === 1 ? "" : "s"}</span>
                  <span>{new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
