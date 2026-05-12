"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type BundleRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  terms: string;
  discount: number;
  products: string[];
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
};

function formatIsoDate(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 16);
}

function ToggleProduct({
  id,
  checked,
  label,
  subtitle,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  subtitle: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={`b-${id}`}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
        checked ? "border-[#006847] bg-[#006847]/5" : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <input id={`b-${id}`} type="checkbox" checked={checked} className="mt-1" onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-medium text-neutral-900">{label}</span>
        <span className="block text-xs text-neutral-500">{subtitle}</span>
      </span>
    </label>
  );
}

function BundleEditor({
  bundle,
  catalog,
}: {
  bundle: BundleRow;
  catalog: ProductOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [name, setName] = useState(bundle.name);
  const [description, setDescription] = useState(bundle.description);
  const [price, setPrice] = useState(String(bundle.price));
  const [terms, setTerms] = useState(bundle.terms);
  const [isActive, setIsActive] = useState(bundle.isActive);
  const [expiresAt, setExpiresAt] = useState(formatIsoDate(bundle.expiresAt));
  const selected = useMemo(() => new Set(bundle.products), [bundle.products]);
  const [selection, setSelection] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(catalog.map((p) => [p.id, selected.has(p.id)])),
  );

  useEffect(() => {
    setName(bundle.name);
    setDescription(bundle.description);
    setPrice(String(bundle.price));
    setTerms(bundle.terms);
    setIsActive(bundle.isActive);
    setExpiresAt(formatIsoDate(bundle.expiresAt));
    setSelection(Object.fromEntries(catalog.map((p) => [p.id, bundle.products.includes(p.id)])));
  }, [bundle, catalog]);

  const productIds = useMemo(
    () => catalog.filter((p) => selection[p.id]).map((p) => p.id),
    [catalog, selection],
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p <= 0) return toast.error("Bundle price must be a positive number");
    if (productIds.length === 0) return toast.error("Pick at least one product");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: p,
          terms,
          isActive,
          productIds,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not save bundle");
        return;
      }
      toast.success("Bundle updated");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete bundle "${bundle.name}"?`)) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not delete");
        return;
      }
      toast.success("Bundle deleted");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  const includedLabels = bundle.products
    .map((id) => catalog.find((c) => c.id === id)?.name ?? id)
    .join(", ");

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">{bundle.name}</p>
          <p className="text-sm text-neutral-600">
            £{Number(bundle.price).toFixed(2)} bundle ·{" "}
            <span className={bundle.isActive ? "text-[#006847]" : "text-neutral-400"}>
              {bundle.isActive ? "Active" : "Hidden"}
            </span>
            {bundle.discount ? (
              <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                Legacy discount {bundle.discount}%
              </span>
            ) : null}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-neutral-600">
            Included: <span className="text-neutral-800">{includedLabels || "None linked"}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            onClick={() => setOpen(!open)}
          >
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
        <form className="mt-4 space-y-4 border-t border-neutral-100 pt-4" onSubmit={save}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-700">Name</span>
              <input className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-700">Bundle price (£)</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-700">Description</span>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-700">Terms &amp; conditions</span>
            <textarea
              className="w-full rounded border p-2"
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Shown to staff and can be copied into customer comms when you sell this bundle."
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-700">Expires (optional, local time)</span>
            <input
              className="w-full rounded border p-2"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <span className="text-xs text-neutral-500">Clear the field to remove an expiry.</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Bundle is available for merchandising
          </label>
          <div>
            <p className="text-sm font-medium text-neutral-700">Products in this bundle</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {catalog.map((p) => (
                <ToggleProduct
                  key={p.id}
                  id={`${bundle.id}-${p.id}`}
                  checked={!!selection[p.id]}
                  label={p.name}
                  subtitle={`£${p.price.toFixed(2)} · ${p.isActive ? "Live" : "Hidden"}`}
                  onChange={(next) => setSelection((prev) => ({ ...prev, [p.id]: next }))}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#006847] px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save bundle"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminBundlesManager({
  bundles,
  catalog,
}: {
  bundles: BundleRow[];
  catalog: ProductOption[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [terms, setTerms] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selection, setSelection] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(catalog.map((p) => [p.id, false])),
  );

  const productIds = useMemo(
    () => catalog.filter((p) => selection[p.id]).map((p) => p.id),
    [catalog, selection],
  );

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!Number.isFinite(p) || p <= 0) return toast.error("Bundle price must be a positive number");
    if (productIds.length === 0) return toast.error("Pick at least one product");

    setCreating(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: p,
          terms,
          isActive,
          productIds,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not create bundle");
        return;
      }
      toast.success("Bundle created");
      setName("");
      setDescription("");
      setPrice("");
      setTerms("");
      setExpiresAt("");
      setIsActive(true);
      setSelection(Object.fromEntries(catalog.map((prod) => [prod.id, false])));
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-[#006847]/40 bg-[#006847]/5 p-5">
        <h2 className="text-lg font-semibold text-[#006847]">Create bundle</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Compose a curated offer by selecting catalogue items and setting how it should appear on invoices or campaigns.
          Checkout still sells individual SKU lines today — this record keeps bundle pricing and fulfilment clarity aligned.
        </p>
        <form className="mt-4 space-y-4" onSubmit={create}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Bundle name</span>
              <input className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-neutral-800">Bundle price (£)</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-800">Description</span>
            <textarea className="w-full rounded border p-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-800">Terms &amp; conditions</span>
            <textarea className="w-full rounded border p-2" rows={4} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-neutral-800">Expires (optional)</span>
            <input className="w-full rounded border p-2" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active bundle
          </label>
          <div>
            <p className="text-sm font-medium text-neutral-800">Included products</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((p) => (
                <ToggleProduct
                  key={p.id}
                  id={`new-${p.id}`}
                  checked={!!selection[p.id]}
                  label={p.name}
                  subtitle={`£${p.price.toFixed(2)} · ${p.isActive ? "Live" : "Hidden"}`}
                  onChange={(next) => setSelection((prev) => ({ ...prev, [p.id]: next }))}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || catalog.length === 0}
            className="rounded-md bg-[#C8102E] px-4 py-2 text-white disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create bundle"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Saved bundles ({bundles.length})</h2>
          <p className="text-sm text-neutral-600">Edit pricing, copy, or product membership at any time.</p>
        </div>
        {bundles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-neutral-600">
            No bundles yet — create one above.
          </p>
        ) : (
          <div className="space-y-3">
            {bundles.map((b) => (
              <BundleEditor key={b.id} bundle={b} catalog={catalog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
