"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type DeliveryRow = {
  id: string;
  under48h: number;
  between48and72h: number;
  freeOver: number | null;
};

export default function AdminDeliveryForm({ initial }: { initial: DeliveryRow | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [under48h, setUnder48h] = useState(String(initial?.under48h ?? 3.5));
  const [between48and72h, setBetween48and72h] = useState(String(initial?.between48and72h ?? 2.5));
  const [freeOver, setFreeOver] = useState(
    initial?.freeOver != null && Number.isFinite(initial.freeOver) ? String(initial.freeOver) : "",
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const u48 = parseFloat(under48h);
    const b48 = parseFloat(between48and72h);
    if (!Number.isFinite(u48) || u48 < 0) return toast.error("Express rate must be zero or more");
    if (!Number.isFinite(b48) || b48 < 0) return toast.error("Standard rate must be zero or more");

    const foRaw = freeOver.trim();
    const payload: {
      under48h: number;
      between48and72h: number;
      freeOver?: number | null;
    } = { under48h: u48, between48and72h: b48 };
    if (foRaw === "") {
      payload.freeOver = null;
    } else {
      const fo = parseFloat(foRaw);
      if (!Number.isFinite(fo) || fo <= 0) return toast.error("Free delivery threshold must be empty or a positive amount");
      payload.freeOver = fo;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not save delivery settings");
        return;
      }
      toast.success("Delivery rates saved — new checkouts will use these amounts");
      if (data.freeOver == null) setFreeOver("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="max-w-xl space-y-4 rounded-xl border bg-white p-5 shadow-sm" onSubmit={save}>
      <p className="text-sm text-neutral-600">
        Rates are read when a customer hits checkout. Orders already in flight keep the delivery fee that was calculated for
        them.
      </p>
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-neutral-800">Express (under 48h) · £</span>
        <input
          className="w-full rounded border p-2"
          type="number"
          min={0}
          step="0.01"
          value={under48h}
          onChange={(e) => setUnder48h(e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-neutral-800">Standard (48–72h) · £</span>
        <input
          className="w-full rounded border p-2"
          type="number"
          min={0}
          step="0.01"
          value={between48and72h}
          onChange={(e) => setBetween48and72h(e.target.value)}
          required
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-neutral-800">Free delivery over · £ (optional)</span>
        <input
          className="w-full rounded border p-2"
          type="number"
          min={0}
          step="0.01"
          placeholder="Leave blank to disable"
          value={freeOver}
          onChange={(e) => setFreeOver(e.target.value)}
        />
        <span className="text-xs text-neutral-500">
          When basket subtotal meets or exceeds this amount, checkout waives delivery (window rate is ignored until the basket
          drops below the threshold again).
        </span>
      </label>
      <button type="submit" disabled={saving} className="rounded-md bg-[#C8102E] px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save delivery settings"}
      </button>
    </form>
  );
}
