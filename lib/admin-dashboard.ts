import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardDay = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type AdminDashboardData = {
  totals: {
    orders: number;
    revenue: number;
    averageOrderValue: number;
    customers: number;
    activeProducts: number;
  };
  last30Days: {
    orders: number;
    revenue: number;
  };
  statusCounts: Record<OrderStatus, number>;
  daily: DashboardDay[];
  topProducts: TopProductRow[];
  recentOrders: Array<{
    id: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
    customerName: string;
    customerEmail: string;
    itemCount: number;
  }>;
};

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatUtcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const fourteenDayRangeStart = startOfUtcDay(new Date(now.getTime() - 13 * 86400000));

  const [
    ordersCount,
    revenueAgg,
    customersCount,
    activeProductsCount,
    last30,
    recentOrdersRows,
    statusGroups,
    seriesOrders,
    orderItemsAgg,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { total: true },
    }),
    prisma.order.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: fourteenDayRangeStart } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: OrderStatus.CANCELLED } } },
      select: {
        quantity: true,
        price: true,
        productId: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;
  const last30Revenue = last30.reduce((s, o) => s + o.total, 0);

  const statusCounts = Object.values(OrderStatus).reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );
  for (const row of statusGroups) {
    statusCounts[row.status] = row._count._all;
  }

  const dayTotals = new Map<string, { revenue: number; orderCount: number }>();
  for (let i = 13; i >= 0; i -= 1) {
    const d = startOfUtcDay(new Date(now.getTime() - i * 86400000));
    dayTotals.set(formatUtcDay(d), { revenue: 0, orderCount: 0 });
  }
  for (const o of seriesOrders) {
    const key = formatUtcDay(startOfUtcDay(new Date(o.createdAt)));
    const bucket = dayTotals.get(key);
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orderCount += 1;
    }
  }
  const daily: DashboardDay[] = [...dayTotals.entries()].map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orderCount: v.orderCount,
  }));

  const byProduct = new Map<string, TopProductRow>();
  for (const row of orderItemsAgg) {
    const lineRev = row.price * row.quantity;
    const prev = byProduct.get(row.productId);
    if (prev) {
      prev.unitsSold += row.quantity;
      prev.revenue += lineRev;
    } else {
      byProduct.set(row.productId, {
        productId: row.productId,
        name: row.product.name,
        unitsSold: row.quantity,
        revenue: lineRev,
      });
    }
  }
  const topProducts = [...byProduct.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const recentOrders = recentOrdersRows.map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    customerName: o.user.name,
    customerEmail: o.user.email,
    itemCount: o.items.length,
  }));

  return {
    totals: {
      orders: ordersCount,
      revenue,
      averageOrderValue,
      customers: customersCount,
      activeProducts: activeProductsCount,
    },
    last30Days: {
      orders: last30.length,
      revenue: last30Revenue,
    },
    statusCounts,
    daily,
    topProducts,
    recentOrders,
  };
}
