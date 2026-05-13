"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type AccountAddress = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
};

export type AccountOrderItem = {
  id: string;
  quantity: number;
  price: number;
  productName: string;
};

export type AccountOrder = {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryCost: number;
  deliveryWindow: string;
  createdAt: string;
  items: AccountOrderItem[];
};

function formatStatus(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDeliveryWindow(w: string) {
  if (w === "UNDER_48H") return "Under 48 hours";
  if (w === "BETWEEN_48_72H") return "48–72 hours";
  return w.replaceAll("_", " ");
}

function orderPreview(items: AccountOrderItem[]) {
  if (items.length === 0) return "No items";
  const parts = items.slice(0, 3).map((i) => `${i.productName} ×${i.quantity}`);
  const extra = items.length > 3 ? `, +${items.length - 3} more` : "";
  return parts.join(", ") + extra;
}

type Props = {
  email: string;
  initialName: string;
  initialPhone: string;
  initialAddresses: AccountAddress[];
  initialOrders: AccountOrder[];
};

export default function AccountDashboard({
  email,
  initialName,
  initialPhone,
  initialAddresses,
  initialOrders,
}: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [profileSaving, setProfileSaving] = useState(false);

  const [addresses, setAddresses] = useState<AccountAddress[]>(initialAddresses);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "UK",
  });
  const [newSaving, setNewSaving] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; name?: string; phone?: string | null };
      if (!res.ok) {
        toast.error(body.error || "Could not update profile");
        return;
      }
      if (body.name != null) setName(body.name);
      setPhone(body.phone ?? "");
      toast.success("Profile updated");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveAddress(id: string, row: AccountAddress) {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line1: row.line1,
        line2: row.line2 || "",
        city: row.city,
        postcode: row.postcode,
        country: row.country,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string } & Partial<AccountAddress>;
    if (!res.ok) {
      toast.error(body.error || "Could not save address");
      return;
    }
    const next: AccountAddress = {
      id: body.id ?? id,
      line1: body.line1 ?? row.line1,
      line2: body.line2 ?? null,
      city: body.city ?? row.city,
      postcode: body.postcode ?? row.postcode,
      country: body.country ?? row.country,
    };
    setAddresses((prev) => prev.map((a) => (a.id === id ? next : a)));
    toast.success("Address saved");
  }

  async function removeAddress(id: string) {
    if (!window.confirm("Remove this address?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(body.error || "Could not remove address");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  }

  async function createAddress(e: React.FormEvent) {
    e.preventDefault();
    setNewSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line1: newAddr.line1,
          line2: newAddr.line2 || undefined,
          city: newAddr.city,
          postcode: newAddr.postcode,
          country: newAddr.country || "UK",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string } & Partial<AccountAddress>;
      if (!res.ok) {
        toast.error(body.error || "Could not add address");
        return;
      }
      if (!body.id || !body.line1 || !body.city || !body.postcode) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      const created: AccountAddress = {
        id: body.id,
        line1: body.line1,
        line2: body.line2 ?? null,
        city: body.city,
        postcode: body.postcode,
        country: body.country ?? "UK",
      };
      setAddresses((prev) => [...prev, created]);
      setNewAddr({ line1: "", line2: "", city: "", postcode: "", country: "UK" });
      setShowNewAddress(false);
      toast.success("Address added");
    } finally {
      setNewSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-[#0f172a]">My account</h1>

      <section className="rounded-xl border border-[#006847]/15 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0f172a]">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Update your name and phone. Email cannot be changed here.</p>
        <form onSubmit={saveProfile} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="acc-name">
              Full name
            </label>
            <input
              id="acc-name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#006847]/30 focus:border-[#006847] focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="acc-email">
              Email
            </label>
            <input
              id="acc-email"
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
              value={email}
              readOnly
              aria-readonly="true"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="acc-phone">
              Phone
            </label>
            <input
              id="acc-phone"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#006847]/30 focus:border-[#006847] focus:ring-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional — at least 7 digits if provided"
            />
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-lg bg-[#C8102E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a50d26] disabled:opacity-60"
          >
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#006847]/15 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Addresses</h2>
            <p className="mt-1 text-sm text-slate-600">Edit saved addresses or add a new one for checkout.</p>
          </div>
          {!showNewAddress && (
            <button
              type="button"
              onClick={() => setShowNewAddress(true)}
              className="rounded-lg border border-[#006847] px-3 py-2 text-sm font-semibold text-[#006847] transition hover:bg-[#006847]/8"
            >
              Add address
            </button>
          )}
        </div>

        <div className="mt-4 space-y-6">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              initial={addr}
              onSave={(row) => saveAddress(addr.id, row)}
              onDelete={() => removeAddress(addr.id)}
            />
          ))}

          {showNewAddress && (
            <form onSubmit={createAddress} className="space-y-3 rounded-lg border border-dashed border-[#006847]/35 bg-[#fafdfb] p-4">
              <p className="text-sm font-medium text-[#0f172a]">New address</p>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Address line 1"
                value={newAddr.line1}
                onChange={(e) => setNewAddr((s) => ({ ...s, line1: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Address line 2 (optional)"
                value={newAddr.line2}
                onChange={(e) => setNewAddr((s) => ({ ...s, line2: e.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr((s) => ({ ...s, city: e.target.value }))}
                />
                <input
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Postcode"
                  value={newAddr.postcode}
                  onChange={(e) => setNewAddr((s) => ({ ...s, postcode: e.target.value }))}
                />
              </div>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Country"
                value={newAddr.country}
                onChange={(e) => setNewAddr((s) => ({ ...s, country: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={newSaving}
                  className="rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {newSaving ? "Adding…" : "Save address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAddress(false);
                    setNewAddr({ line1: "", line2: "", city: "", postcode: "", country: "UK" });
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[#006847]/15 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0f172a]">Past orders</h2>
        <p className="mt-1 text-sm text-slate-600">Orders you have placed on this account.</p>
        {initialOrders.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">You have not placed any orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {initialOrders.map((order) => (
              <li key={order.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-[#006847]/30">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#0f172a]">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Order ref · {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#0f172a]">£{order.total.toFixed(2)}</p>
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDeliveryWindow(order.deliveryWindow)} · Subtotal £{order.subtotal.toFixed(2)} · Delivery £
                  {order.deliveryCost.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{orderPreview(order.items)}</p>
                <Link
                  href={`/orders/${order.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-[#006847] underline-offset-2 hover:underline"
                >
                  View order details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddressCard({
  initial,
  onSave,
  onDelete,
}: {
  initial: AccountAddress;
  onSave: (row: AccountAddress) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [row, setRow] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRow(initial);
  }, [initial.line1, initial.line2, initial.city, initial.postcode, initial.country, initial.id]);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Address line 1"
        value={row.line1}
        onChange={(e) => setRow((r) => ({ ...r, line1: e.target.value }))}
      />
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Address line 2 (optional)"
        value={row.line2 ?? ""}
        onChange={(e) => setRow((r) => ({ ...r, line2: e.target.value || null }))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="City"
          value={row.city}
          onChange={(e) => setRow((r) => ({ ...r, city: e.target.value }))}
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Postcode"
          value={row.postcode}
          onChange={(e) => setRow((r) => ({ ...r, postcode: e.target.value }))}
        />
      </div>
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2"
        placeholder="Country"
        value={row.country}
        onChange={(e) => setRow((r) => ({ ...r, country: e.target.value }))}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(row);
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={() => onDelete()}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
