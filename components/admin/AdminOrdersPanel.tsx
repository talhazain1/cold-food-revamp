"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type AdminOrderDetail = {
  id: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  deliveryCost: number;
  deliveryWindow: string;
  createdAt: string;
  notes: string | null;
  user: { id: string; name: string; email: string };
  address: {
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
    country: string;
  } | null;
  items: Array<{ quantity: number; price: number; product: { id: string; name: string } }>;
};

const tabs = [
  { id: "new" as const, label: "New", hint: "Awaiting checkout completion" },
  { id: "pending" as const, label: "In progress", hint: "Paid — not yet marked delivered" },
  { id: "delivered" as const, label: "Delivered", hint: "Completed deliveries" },
  { id: "all" as const, label: "All", hint: "Every order record" },
];

function passesTab(order: AdminOrderDetail, tab: (typeof tabs)[number]["id"]): boolean {
  if (tab === "all") return true;
  if (tab === "new") return order.status === "PENDING";
  if (tab === "pending")
    return order.status === "CONFIRMED" || order.status === "PROCESSING" || order.status === "DISPATCHED";
  return order.status === "DELIVERED";
}

export default function AdminOrdersPanel({ orders: initial }: { orders: AdminOrderDetail[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("new");

  const filtered = useMemo(() => initial.filter((o) => passesTab(o, tab)), [initial, tab]);

  async function patchStatus(orderId: string, status: OrderStatus) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not update order");
      return;
    }
    toast.success("Order updated");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-200 bg-neutral-50/80 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white text-[#C8102E] shadow-sm ring-1 ring-neutral-200"
                : "text-neutral-600 hover:bg-white/60"
            }`}
            title={t.hint}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-neutral-600">
        Showing <span className="font-semibold text-neutral-900">{filtered.length}</span> order
        {filtered.length === 1 ? "" : "s"} in view.
      </p>
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-neutral-600">
            No orders match this tab yet.
          </p>
        ) : (
          filtered.map((order) => (
            <article key={order.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-neutral-500">{order.id}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">£{order.total.toFixed(2)} total</p>
                  <p className="text-sm text-neutral-600">
                    Subtotal £{order.subtotal.toFixed(2)} · Delivery £{order.deliveryCost.toFixed(2)} · Window{" "}
                    {order.deliveryWindow.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-700">
                    <span className="font-medium">{order.user.name}</span> · {order.user.email}
                  </p>
                  {order.address && (
                    <p className="mt-1 max-w-xl text-sm text-neutral-600">
                      {order.address.line1}
                      {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
                      {order.address.postcode}, {order.address.country}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-neutral-400">
                    Placed {new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  <label className="flex flex-col gap-1 text-xs font-medium text-neutral-700">
                    Status
                    <select
                      className="min-w-[200px] rounded border border-neutral-300 bg-white px-2 py-2 text-sm"
                      value={order.status}
                      onChange={(e) => patchStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {Object.values(OrderStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-center text-sm font-semibold text-[#006847] underline-offset-2 hover:underline"
                  >
                    Open customer receipt
                  </Link>
                </div>
              </div>
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Line items</p>
                <ul className="mt-2 space-y-1 text-sm text-neutral-800">
                  {order.items.map((i) => (
                    <li key={`${order.id}-${i.product.id}`}>
                      {i.product.name} × {i.quantity} @ £{i.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <p className="mt-3 text-sm text-neutral-600">
                    <span className="font-medium">Notes:</span> {order.notes}
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
