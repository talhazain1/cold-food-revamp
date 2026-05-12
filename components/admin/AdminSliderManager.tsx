"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type SliderRow = {
  id: string;
  text: string;
  order: number;
  isActive: boolean;
};

function SliderCard({ item }: { item: SliderRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [text, setText] = useState(item.text);
  const [order, setOrder] = useState(String(item.order));
  const [isActive, setIsActive] = useState(item.isActive);

  useEffect(() => {
    setText(item.text);
    setOrder(String(item.order));
    setIsActive(item.isActive);
  }, [item]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const o = parseInt(order, 10);
    if (!Number.isFinite(o) || o < 0) return toast.error("Order must be a positive integer");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/slider/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, order: o, isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not update");
        return;
      }
      toast.success("Slider line saved");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove this slider message?`)) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/slider/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not delete");
        return;
      }
      toast.success("Removed");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Priority {item.order}</p>
          <p className="mt-1 text-sm font-medium text-neutral-900">{item.text}</p>
          <p className="mt-2 text-xs text-neutral-500">{item.isActive ? "Showing in banner" : "Hidden"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            disabled={removing}
            className="rounded-md border border-neutral-400 px-3 py-1.5 text-sm text-neutral-700 disabled:opacity-50"
            onClick={remove}
          >
            Delete
          </button>
        </div>
      </div>
      {open && (
        <form className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm" onSubmit={save}>
          <label className="block space-y-1">
            <span className="font-medium text-neutral-700">Text</span>
            <textarea className="w-full rounded border p-2" rows={2} value={text} onChange={(e) => setText(e.target.value)} required />
          </label>
          <label className="block space-y-1">
            <span className="font-medium text-neutral-700">Order (lower appears first)</span>
            <input className="w-full rounded border p-2" type="number" min={0} value={order} onChange={(e) => setOrder(e.target.value)} required />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <button type="submit" disabled={saving} className="rounded-md bg-[#006847] px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminSliderManager({ items }: { items: SliderRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [text, setText] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/slider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not add line");
        return;
      }
      toast.success("Slider line added");
      setText("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  const preview =
    items
      .filter((i) => i.isActive)
      .sort((a, b) => a.order - b.order)
      .map((i) => i.text)
      .join("  •  ") || "No active messages yet";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-[#C8102E] py-3 text-white">
        <p className="px-4 text-xs uppercase tracking-[0.2em] text-white/75">Live preview</p>
        <div className="whitespace-nowrap px-4 py-1 text-sm">
          <span className="mx-4">{preview}</span>
        </div>
      </div>
      <form className="space-y-3 rounded-xl border border-[#006847]/40 bg-[#006847]/5 p-5" onSubmit={create}>
        <h2 className="text-lg font-semibold text-[#006847]">Add announcement</h2>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-neutral-800">Text</span>
          <textarea className="w-full rounded border bg-white p-2" rows={2} value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <button type="submit" disabled={creating} className="rounded-md bg-[#C8102E] px-4 py-2 text-white disabled:opacity-50">
          {creating ? "Adding…" : "Add to banner"}
        </button>
      </form>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-neutral-600">
            No lines yet.
          </p>
        ) : (
          items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item) => <SliderCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
