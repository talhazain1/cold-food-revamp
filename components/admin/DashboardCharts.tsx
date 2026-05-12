import type { AdminDashboardData } from "@/lib/admin-dashboard";

function maxBar(values: number[]): number {
  const m = Math.max(...values, 1);
  return m;
}

const BAR_MAX_PX = 176;

export default function DashboardCharts({ data }: { data: AdminDashboardData }) {
  const daily = data.daily;
  const maxRev = maxBar(daily.map((d) => d.revenue));

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;
  const statusLabels: Record<(typeof statusOrder)[number], string> = {
    PENDING: "Awaiting payment",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    DISPATCHED: "Dispatched",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">Revenue · last {daily.length} days</h2>
          <span className="text-xs text-neutral-500">From paid & unpaid orders captured in this period</span>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Each bar shows total order value booked on that day (UTC midnight buckets).
        </p>
        <div className="mt-6 flex h-52 gap-1 md:gap-1.5" role="img" aria-label="Daily revenue bars">
          {daily.map((d) => {
            const hPx = Math.max((d.revenue / maxRev) * BAR_MAX_PX, 4);
            const label = d.date.slice(5);
            return (
              <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-medium text-neutral-500 tabular-nums">
                  {d.orderCount ? `${d.orderCount}` : ""}
                </span>
                <div className="flex w-full justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t bg-[#006847]"
                    style={{ height: `${hPx}px` }}
                    title={`${d.date}: £${d.revenue.toFixed(2)}`}
                  />
                </div>
                <span className="hidden truncate text-[10px] text-neutral-500 sm:block">{label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Orders by status</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Operational snapshot across your fulfilment stages (lifetime counts).
        </p>
        <ul className="mt-6 space-y-4">
          {statusOrder.map((key) => {
            const count = data.statusCounts[key] ?? 0;
            const share = data.totals.orders > 0 ? Math.round((count / data.totals.orders) * 100) : 0;
            return (
              <li key={key}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-medium text-neutral-800">{statusLabels[key]}</span>
                  <span className="tabular-nums text-neutral-600">
                    {count} <span className="text-neutral-400">({share}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-[#C8102E]" style={{ width: `${share}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
