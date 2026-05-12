"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  images: string[];
  tags: string[];
};

function parseImages(text: string): string[] {
  const lines = text
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : ["/placeholder.svg"];
}

function parseTags(text: string): string[] {
  const raw = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(raw)].slice(0, 50);
}

function ProductRow({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [category, setCategory] = useState(product.category);
  const [stock, setStock] = useState(String(product.stock));
  const [isActive, setIsActive] = useState(product.isActive);
  const [imagesText, setImagesText] = useState(product.images.join("\n"));
  const [tagsText, setTagsText] = useState(() => (product.tags ?? []).join(", "));

  useEffect(() => {
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setStock(String(product.stock));
    setIsActive(product.isActive);
    setImagesText(product.images.join("\n"));
    setTagsText((product.tags ?? []).join(", "));
  }, [product]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    const s = parseInt(stock, 10);
    if (!Number.isFinite(p) || p <= 0) return toast.error("Invalid price");
    if (!Number.isFinite(s) || s < 0) return toast.error("Invalid stock");

    setSaving(true);
    try {
      const images = parseImages(imagesText);
      const tags = parseTags(tagsText);
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: p,
          category,
          stock: s,
          isActive,
          images,
          tags,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not save");
        return;
      }
      toast.success("Product updated");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${product.name}" permanently? Orders that reference this product will block deletion.`))
      return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not delete");
        return;
      }
      toast.success("Product removed");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-neutral-600">
            £{Number(product.price).toFixed(2)} · Stock {product.stock} ·{" "}
            <span className={product.isActive ? "text-[#006847]" : "text-neutral-400"}>
              {product.isActive ? "Active" : "Hidden"}
            </span>
            {(product.tags ?? []).length > 0 ? (
              <span className="ml-2 text-xs text-neutral-500">· Tags: {(product.tags ?? []).join(", ")}</span>
            ) : null}
          </p>
          <p className="font-mono text-xs text-neutral-500">/{product.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="rounded border border-[#006847] px-3 py-1.5 text-sm text-[#006847]"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded bg-[#C8102E] px-3 py-1.5 text-sm text-white"
          >
            {open ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={remove}
            className="rounded border border-neutral-400 px-3 py-1.5 text-sm text-neutral-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {open && (
        <form className="mt-4 space-y-3 border-t pt-4" onSubmit={save}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Name</span>
              <input
                className="w-full rounded border p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">URL slug</span>
              <input
                className="w-full rounded border p-2 font-mono text-sm"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">Description</span>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Price (£)</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Stock</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Category</span>
              <input
                className="w-full rounded border p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">
              Images (one URL per line; use /placeholder.svg if you have no image yet)
            </span>
            <textarea
              className="w-full rounded border p-2 font-mono text-sm"
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">Tags (comma or line separated)</span>
            <input
              className="w-full rounded border p-2"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. bestseller, vegetarian, frozen"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Show on storefront
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#006847] px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminProductsManager({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [slug, setSlug] = useState("");
  const [imagesText, setImagesText] = useState("/placeholder.svg\n");
  const [tagsText, setTagsText] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    const s = parseInt(stock, 10);
    if (!Number.isFinite(p) || p <= 0) return toast.error("Invalid price");
    if (!Number.isFinite(s) || s < 0) return toast.error("Invalid stock");

    setCreating(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: p,
          category,
          stock: s,
          isActive,
          slug: slug.trim() || undefined,
          images: parseImages(imagesText),
          tags: parseTags(tagsText),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not create product");
        return;
      }
      toast.success("Product created");
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setSlug("");
      setImagesText("/placeholder.svg\n");
      setTagsText("");
      setIsActive(true);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[#006847]/30 bg-[#006847]/5 p-4">
        <h2 className="mb-3 text-lg font-semibold text-[#006847]">Add product</h2>
        <form className="space-y-3" onSubmit={createProduct}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Name</span>
              <input className="w-full rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">URL slug (optional)</span>
              <input
                className="w-full rounded border p-2 font-mono text-sm"
                placeholder="auto from name"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">Description</span>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Price (£)</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Stock</span>
              <input
                className="w-full rounded border p-2"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-neutral-700">Category</span>
              <input
                className="w-full rounded border p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">
              Images (one URL per line; default placeholder if empty)
            </span>
            <textarea
              className="w-full rounded border p-2 font-mono text-sm"
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-neutral-700">Tags (comma or line separated)</span>
            <input
              className="w-full rounded border p-2"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Optional — used for merchandising labels"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Show on storefront
          </label>
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-[#C8102E] px-4 py-2 text-white disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create product"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">Existing products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-neutral-600">No products yet. Add one above to appear on the shop.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
